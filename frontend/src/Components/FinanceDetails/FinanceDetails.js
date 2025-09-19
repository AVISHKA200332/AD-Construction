import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import Finance from '../Finance/Finance';

const URL = "http://localhost:5000/finance"; // ✅ lowercase

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function FinanceDetails() {
  const [finances, setFinance] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => {
      console.log("API response:", data); 
      setFinance(data.finance || []); // ✅ use the correct key
    });
  }, []);

  return (
    <div>
      
      <h1>Finance Details Display Page</h1>
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
