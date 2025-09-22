import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddFinance.css';

function AddFinance() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        Project_Name: "",
        category: "",
        amount: "",
        date: "",
        status: "",
        description: "",
    });

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

    const sendRequest = async () => {
        await axios.post(`http://localhost:5000/finance`, {
            Project_Name: String(inputs.Project_Name),
            category: String(inputs.category),
            amount: Number(inputs.amount),
            date: inputs.date,
            status: String(inputs.status),
            description: String(inputs.description),
        }).then(res => res.data);
    };

    return (
        <div className="add-finance-container">
            <div className="add-finance-form-wrapper">
                <div className="add-finance-header">
                    <h1 className="add-finance-title">Add Finance Record</h1>
                    <p className="add-finance-subtitle">Create a new finance record</p>
                </div>

                <form onSubmit={handleSubmit} className="add-finance-form">
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
                            className="add-finance-button"
                        >
                            Add Finance Record
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
    );
}

export default AddFinance;
