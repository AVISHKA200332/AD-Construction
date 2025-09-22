import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Finance.css';

function Finance(props) {
  const { Project_Name, category, amount, date, status, description, _id } = props.finance;
  
  const navigate = useNavigate();

  const deleteHandler = async()=>{
    await axios.delete(`http://localhost:5000/finance/${_id}`)
    .then(res=>res.data)
    .then(() => {
      navigate("/finance");
      window.location.reload();
    });
  }

  return (
    <div className="finance-card">
      <div className="finance-header">
        <h1 className="finance-title">Finance Record</h1>
      </div>
      
      <div className="finance-details">
        <div className="finance-detail-item">
          <div className="finance-detail-label">Project Name</div>
          <div className="finance-detail-value">{Project_Name}</div>
        </div>
        
        <div className="finance-detail-item">
          <div className="finance-detail-label">Category</div>
          <div className="finance-detail-value">{category}</div>
        </div>
        
        <div className="finance-detail-item amount-item">
          <div className="finance-detail-label">Amount</div>
          <div className="finance-detail-value">${amount}</div>
        </div>
        
        <div className="finance-detail-item date-item">
          <div className="finance-detail-label">Date</div>
          <div className="finance-detail-value">{new Date(date).toLocaleDateString()}</div>
        </div>
        
        <div className="finance-detail-item status-item">
          <div className="finance-detail-label">Status</div>
          <div className="finance-detail-value">
            <span className={`status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`}>
              {status}
            </span>
          </div>
        </div>
        
        <div className="finance-detail-item">
          <div className="finance-detail-label">Description</div>
          <div className="finance-detail-value">{description}</div>
        </div>
      </div>

      <div className="finance-actions">
        <button 
          className="finance-button update-button"
          onClick={() => navigate(`/updateFinance/${props.finance._id}`, { state: { finance: props.finance } })}
        >
          Update Record
        </button>

        <button className="finance-button delete-button"
          onClick={deleteHandler}>
          Delete Record
        </button>
      </div>
    </div>
  )
}

export default Finance;
