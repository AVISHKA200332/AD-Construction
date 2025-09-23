import React, { useState } from "react";
import "./PaymentUpload.css";   // Import CSS file

function PaymentUpload() {
  const [bankSlip, setBankSlip] = useState(null);

  const handleFileChange = (e) => {
    setBankSlip(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2 className="payment-title">Upload Bank Slip & Pay Budget</h2>

        <form>
          {/* Read-only fields (will be filled from DB in future) */}
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

          {/* Payment method fixed to Bank Transfer */}
          <select className="payment-select" disabled>
            <option selected>Bank Transfer</option>
          </select>

          {/* Still editable field */}
          <textarea placeholder="Additional Notes" className="payment-textarea"></textarea>

          {/* File upload for bank slip */}
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
            <button type="reset" className="payment-btn payment-btn-reset">Reset</button>
            <button type="submit" className="payment-btn payment-btn-submit">Submit Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentUpload;
