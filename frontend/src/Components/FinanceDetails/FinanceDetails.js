import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Finance from '../Finance/Finance';
import './FinanceDetails.css';

const URL = `http://localhost:5000/finance`; 

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function FinanceDetails() {
  const [finances, setFinance] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      console.log("API response:", data); 
      setFinance(data.finance || []); 
    });
  }, []);

  return (
    <div>
      
      <div className="finance-header">
        <h1 className="finance-title">Finance Record</h1>
      </div>

      <div>
        {finances.length > 0 ? (
          finances.map((finance, i) => (
            <div key={i}>
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
