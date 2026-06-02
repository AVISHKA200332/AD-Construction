import React from 'react';
import { useNavigate } from 'react-router-dom';
import financeService from '../../services/financeService';
import './Finance.css';

function Finance(props) {
  const { Project_Name, category, amount, date, status, description, _id, bankSlipPath } = props.finance;

  const resolveBankSlipUrl = () => {
    if (!bankSlipPath) return null;
    if (bankSlipPath.startsWith('http://') || bankSlipPath.startsWith('https://')) {
      return bankSlipPath;
    }
    if (bankSlipPath.startsWith('/')) {
      return `http://localhost:5000${bankSlipPath}`;
    }
    return `http://localhost:5000/${bankSlipPath}`;
  };

  const formatDate = (date) => {
    if (!date) return 'Invalid Date';
    const d = new Date(date);
    if (isNaN(d)) return 'Invalid Date'; 
    return d.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigate = useNavigate();
  const isPaid = status?.toLowerCase() === 'paid';

  const deleteHandler = async () => {
    if (isPaid) return;

    await financeService.remove(_id).then(() => {
        navigate("/financeRecords");
        window.location.reload();
      });
  };

  return (
    <div className="finance-card">
      
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
          <div className="finance-detail-value" title={date ? formatDate(date) : 'Invalid Date'}>{formatDate(date)}</div>
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

        {resolveBankSlipUrl() && (
          <div className="finance-detail-item">
            <div className="finance-detail-label">Bank Slip</div>
            <div className="finance-detail-value">
              <a
                href={resolveBankSlipUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="finance-bank-slip-link"
              >
                View Bank Slip
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="finance-actions">
        <button
          className={`finance-button update-button ${isPaid ? 'disabled' : ''}`}
          onClick={() => {
            if (!isPaid) {
              navigate(`/updateFinance/${props.finance._id}`, { state: { finance: props.finance } });
            }
          }}
          disabled={isPaid}
        >
          Update Record
        </button>

        <button
          className={`finance-button delete-button ${isPaid ? 'disabled' : ''}`}
          onClick={deleteHandler}
          disabled={isPaid}
        >
          Delete Record
        </button>
      </div>
    </div>
  )
}

export default Finance;
