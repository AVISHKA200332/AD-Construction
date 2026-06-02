import React, { useEffect, useState } from 'react';
import Finance from '../Finance';
import financeService from '../../../services/financeService';
import './FinanceDetails.css';

const fetchHandler = async () => financeService.getAll();

function FinanceDetails() {
  const [finances, setFinance] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    fetchHandler().then((data) => {
      console.log("API response:", data); 
      setFinance(data.finance || []); 
    });
  }, []);

  // Filter finances based on search term
  const filteredFinances = finances.filter((finance) =>
    finance.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    finance.Project_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (finance.category && finance.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (finance.status && finance.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="finance-details-container">
      
      <div className="finance-header">
        <h1 className="finance-title">Finance Records</h1>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search finance records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="finance-list">
        {filteredFinances.length > 0 ? (
          filteredFinances.map((finance, i) => (
            <div key={i} className="finance-item">
              <Finance finance={finance} />
            </div>
          ))
        ) : (
          <p>No finance records found.</p>
        )}
      </div>
    </div>
  );
}

export default FinanceDetails;
