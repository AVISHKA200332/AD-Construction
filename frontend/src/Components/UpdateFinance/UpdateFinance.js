import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './UpdateFinance.css';

function UpdateFinance() {

    const [inputs, setInputs] = useState({
        Project_Name: "",
        category: "",
        amount: "",
        date: "",
        status: "",
        description: ""
    });
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
        await axios
            .put(`http://localhost:5000/finance/${id}`, {
                Project_Name: String(inputs.Project_Name),
                category: String(inputs.category),
                amount: Number(inputs.amount),
                date: inputs.date,
                status: String(inputs.status),
                description: String(inputs.description),
            })
            .then((res) => res.data);
    };

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(inputs);
        sendRequest().then(() => history("/finance"));
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
                            <option value="Payment">Payment</option>
                            <option value="Budget">Budget</option>
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
                        />
                    </div>

                    <div className="form-field-group">
                        <label className="form-label">Status</label>
                        <select
                            name="status"
                            onChange={handleChange}
                            value={inputs.status}
                            required
                            className="form-select"
                        >
                            <option value="">-- Select Status --</option>
                            <option value="Pending">Pending</option>
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

                    <div className="button-group">
                        <button
                            type="submit"
                            className="update-finance-button"
                        >
                            Update Finance Record
                        </button>
                        <button
                            type="button"
                            onClick={() => history("/finance")}
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
