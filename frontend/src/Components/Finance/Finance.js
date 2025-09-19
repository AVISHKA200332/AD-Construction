import React from 'react';

function Finance(props) {
  const { project_Id, record_Type, party_Name, amount, date, status, description, bank_Slip_Ref_No } = props.finance;
  
  return (
    <div>
      <h1>Finance Table</h1>
      <br />
      <h3>Project: {project_Id}</h3>
      <h3>Record: {record_Type}</h3>
      <h3>Party Name: {party_Name}</h3>
      <h3>Amount: {amount}</h3>
      <h3>Date: {date}</h3>
      <h3>Status: {status}</h3>
      <h3>Description: {description}</h3>
      <h3>Bank Slip No: {bank_Slip_Ref_No}</h3>
    </div>
  )
}

export default Finance;
