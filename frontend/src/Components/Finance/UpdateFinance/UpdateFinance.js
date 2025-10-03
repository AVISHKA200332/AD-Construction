import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './UpdateFinance.css';

const MAX_BANK_SLIP_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_BANK_SLIP_TYPES = ["pdf", "jpg", "jpeg", "png"];

function UpdateFinance() {

    const [inputs, setInputs] = useState({
        Project_Name: "",
        category: "",
        amount: "",
        date: "",
        status: "",
        description: ""
    });
    const [bankSlip, setBankSlip] = useState(null);
    const [bankSlipError, setBankSlipError] = useState("");
    const history = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    useEffect(() => {
        console.log("UpdateFinance mounted with ID:", id);
        console.log("Location state:", location.state);
        if (location.state && location.state.finance) {
            console.log("Setting inputs from location state:", location.state.finance);
            setInputs(location.state.finance);
        } else {
            console.log("No finance data in location state");
        }
    }, [location, id]);

    const sendRequest = async () => {
        const formData = new FormData();
        formData.append("Project_Name", String(inputs.Project_Name));
        formData.append("category", String(inputs.category));
        formData.append("amount", Number(inputs.amount));
        formData.append("date", inputs.date);
        formData.append("status", String(inputs.status));
        formData.append("description", String(inputs.description));
        formData.append("source", inputs.source || "manual");

        if (bankSlip) {
            formData.append("bankSlip", bankSlip);
        } else if (inputs.bankSlipPath) {
            formData.append("bankSlipPath", inputs.bankSlipPath);
        }

        await axios
            .put(`http://localhost:5000/finances/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            .then((res) => res.data);
    };

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleBankSlipChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setBankSlip(null);
            setBankSlipError("");
            return;
        }

        const extension = file.name.split(".").pop()?.toLowerCase();
        const isAllowedType = extension && ALLOWED_BANK_SLIP_TYPES.includes(extension);

        if (!isAllowedType) {
            setBankSlip(null);
            setBankSlipError("Bank slip must be a PDF, JPG, JPEG, or PNG file.");
            event.target.value = "";
            return;
        }

        if (file.size > MAX_BANK_SLIP_SIZE) {
            setBankSlip(null);
            setBankSlipError("Bank slip size cannot exceed 2 MB.");
            event.target.value = "";
            return;
        }

        setBankSlipError("");
        setBankSlip(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        setBankSlipError("");

        // Project Name
        if (!/^[a-zA-Z0-9\s]{3,100}$/.test(inputs.Project_Name)) {
            alert("Project name must be 3–100 characters and contain only letters, numbers, and spaces.");
            return;
        }

        // Category
        const allowedCategories = ["Income", "Expense"];
        if (!allowedCategories.includes(inputs.category)) {
            alert("Please select a valid category (Income or Expense).");
            return;
        }

        // Amount
        if (inputs.amount <= 0) {
            alert("Amount must be greater than zero.");
            return;
        }
        if (!/^\d+(\.\d{1,2})?$/.test(inputs.amount)) {
            alert("Amount must be a valid number with up to 2 decimal places.");
            return;
        }
        if (inputs.amount > 1000000) {
            alert("Amount cannot exceed 1,000,000.");
            return;
        }

        // Date
        const today = new Date().toISOString().split("T")[0];
        if (inputs.date < today) {
            alert("Date cannot be in the past.");
            return;
        }

        // Status
        const allowedStatuses = ["Paid", "Unpaid"];
        if (!allowedStatuses.includes(inputs.status)) {
            alert("Please select a valid status (Paid or Unpaid).");
            return;
        }

        // Description
        if (inputs.description.length < 10) {
            alert("Description must be at least 10 characters.");
            return;
        }
        if (inputs.description.length > 500) {
            alert("Description cannot exceed 500 characters.");
            return;
        }

        if (bankSlipError) {
            alert(bankSlipError);
            return;
        }

        if (inputs.status === "Paid" && !bankSlip && !inputs.bankSlipPath) {
            const message = "Please upload a bank slip when marking the record as Paid.";
            setBankSlipError(message);
            alert(message);
            return;
        }

        console.log(inputs);
        sendRequest().then(() => history("/financeRecords"));
    };

    return (
        <div className="update-finance-container">
            <div className="update-finance-form-wrapper">
                <div className="update-finance-header">
                    <h1 className="update-finance-title">Update Finance Record</h1>
                    <p className="update-finance-subtitle">Modify your finance record information</p>
                </div>

                <form onSubmit={handleSubmit} className="update-finance-form">
                    <div className="form-field-group">
                        <label className="form-label">Project Name</label>
                        <input
                            type="text"
                            name="Project_Name"
                            onChange={handleChange}
                            value={inputs.Project_Name}
                            required
                            className="form-input"
                            placeholder="Enter project name"
                        />
                    </div>

                    <div className="form-field-group">
                        <label className="form-label">Category</label>
                        <select
                            name="category"
                            onChange={handleChange}
                            value={inputs.category}
                            required
                            className="form-select"
                        >
                            <option value="">-- Select Category --</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                    </div>


                    <div className="form-field-group amount-field">
                        <label className="form-label">Amount</label>
                        <input
                            type="number"
                            name="amount"
                            onChange={handleChange}
                            value={inputs.amount}
                            required
                            className="form-input"
                            placeholder="Enter amount"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-field-group date-field">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            name="date"
                            onChange={handleChange}
                            value={inputs.date}
                            required
                            className="form-input"
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    <div className="form-field-group">
                        <label className="form-label">Status</label>
                        <select
                            name="status"
                            value={inputs.status}
                            required
                            className="form-select"
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>


                    <div className="form-field-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            onChange={handleChange}
                            value={inputs.description}
                            required
                            className="form-textarea"
                            placeholder="Enter description"
                            rows="4"
                        />
                    </div>

                    <div className="form-field-group">
                        <label className="form-label">Bank Slip (optional)</label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleBankSlipChange}
                            className="form-input"
                        />
                        {bankSlipError && <p className="form-error-text">{bankSlipError}</p>}
                    </div>

                    <div className="button-group">
                        <button
                            type="submit"
                            className="update-finance-button"
                        >
                            Update Finance Record
                        </button>
                        <button
                            type="button"
                            onClick={() => history("/financeRecords")}
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateFinance;
