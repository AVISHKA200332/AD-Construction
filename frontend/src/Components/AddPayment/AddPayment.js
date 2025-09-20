import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddPayment() {
    const history = useNavigate();
    const [inputs,setInputs] = useState({
        project_Id:"",
        record_Type:"",
        party_Name:"",
        amount:"",
        date:"",
        status:"",
        description:"",
        bank_Slip_Ref_No:"",
    });
const handleChange =(e)=>{
    setInputs((prevState)=> ({
        ...prevState,
        [e.target.name]: e.target.value,
    }));
};

const handleSubmit =(e)=>{
    e.preventDefault();
    console.log(inputs);
    sendRequest().then(()=>history('finance'))
}

const sendRequest = async()=>{
    await axios.post("http://localhost:5000/finance",{
        project_Id: String (inputs.project_Id),
        record_Type: String (inputs.record_Type),
        party_Name: String (inputs.party_Name),
        amount: Number (inputs.amount),
        date: (inputs.date),
        status: String (inputs.status),
        description: String (inputs.description),
        bank_Slip_Ref_No: String (inputs.bank_Slip_Ref_No),
    }).then(res => res.date);
}

  return (
    <div>
      <h1>Add Payment</h1>
      <form onSubmit={handleSubmit}>
        <label>Project ID</label><br />
        <input type="text" name="project_Id" onChange={handleChange} value={inputs.project_Id} required></input>
        <br></br>
        <br></br>
        <label>Record Type</label><br />
        <select name="record_Type" onChange={handleChange} value={inputs.record_Type} required>
          <option value="">-- Select Record Type --</option>
          <option value="Payment">Payment</option>
          <option value="Invoice">Invoice</option>
          <option value="Receipt">Receipt</option>
          <option value="Other">Other</option>
        </select>
        <br /><br />
        <br></br>
        <label>Party Name</label><br />
        <input type="text" name="party_Name" onChange={handleChange} value={inputs.party_Name} required></input>
        <br></br>
        <br></br>
        <label>Amount</label><br />
        <input type="number" name="amount" onChange={handleChange} value={inputs.amount} required></input>
        <br></br>
        <br></br>
        <label>Date</label><br />
        <input type="date" name="date" onChange={handleChange} value={inputs.date} required></input>
        <br></br>
        <br></br>
        <label>Status</label><br />
        <input type="text" name="status" onChange={handleChange} value={inputs.status} required></input>
        <br></br>
        <br></br>
        <label>Description</label><br />
        <input type="text" name="description" onChange={handleChange} value={inputs.description} required></input>
        <br></br>
        <br></br>
        <label>Bank Slip Ref. No</label><br />
        <input type="text" name="bank_Slip_Ref_No" onChange={handleChange} value={inputs.bank_Slip_Ref_No} required></input>
        <br></br>
        <br></br>
        <button>Submit</button>
      </form>
    </div>
  );
}

export default AddPayment;
