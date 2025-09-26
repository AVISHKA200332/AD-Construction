import React, { useState } from "react";
import "../css-resources/PaymentUpload.css";   // Import CSS file

function PaymentUpload() {
  const [bankSlip, setBankSlip] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setBankSlip(URL.createObjectURL(e.target.files[0]));
      setMessage({ type: "", text: "" }); // clear error when file chosen
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!bankSlip) {
      setMessage({ type: "error", text: "Please upload your bank slip before submitting." });
      return;
    }

    // Simulate successful payment
    setMessage({ type: "success", text: "✅ Payment Successful! Your bank slip has been uploaded." });
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Upload Bank Slip & Pay Budget</h2>

        {/* Show messages */}
        {message.text && (
          <div className={message.type === "success" ? "success-message" : "error-message"}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Read-only fields */}
          <input
            type="text"
            value="Client123 / Project456"
            readOnly
            className="payment-input"
          />

          <input
            type="number"
            value="50000"
            readOnly
            className="payment-input"
          />

          <select className="payment-select" disabled>
            <option selected>Bank Transfer</option>
          </select>

          {/* Notes field */}
          <textarea placeholder="Additional Notes" className="payment-textarea"></textarea>

          {/* File upload */}
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="payment-file"
          />

          {/* Preview */}
          {bankSlip && (
            <div className="payment-preview">
              <p><strong>Preview:</strong></p>
              <img src={bankSlip} alt="Bank Slip Preview" />
            </div>
          )}

          {/* Buttons */}
          <div className="payment-buttons">
            <button type="reset" className="payment-btn payment-btn-reset" onClick={() => {setBankSlip(null); setMessage({type:"", text:""});}}>Reset</button>
            <button type="submit" className="payment-btn payment-btn-submit">Submit Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentUpload;
