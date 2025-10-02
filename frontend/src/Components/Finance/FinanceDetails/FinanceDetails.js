import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Finance from '../Finance';
import './FinanceDetails.css';

const URL = `http://localhost:5000/finances`; 

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function FinanceDetails() {
  const [finances, setFinance] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    fetchHandler().then((data) => {
      console.log("API response:", data); 
      setFinance(data.finance || []); 
    });
  }, []);

  // Remove a finance item from local state after deletion
  const handleDeleted = (id) => {
    setFinance((prev) => Array.isArray(prev) ? prev.filter((f) => f._id !== id) : []);
  };

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
          filteredFinances.map((finance) => (
            <div key={finance._id} className="finance-item">
              <Finance finance={finance} onDeleted={handleDeleted} />
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
