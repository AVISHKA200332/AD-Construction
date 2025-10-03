import React, { useEffect, useMemo, useState } from "react";
import clientFinanceService from "../../services/clientFinanceService";
import "../css-resources/ClientFinance.css";

const STATUS_COLORS = {
  Paid: "text-green-600",
  Unpaid: "text-red-500"
};

const MAX_BANK_SLIP_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_SLIP_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

function ClientFinancial() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [bankSlip, setBankSlip] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await clientFinanceService.getProjects();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (err) {
        console.error("Error loading projects for client invoices:", err);
        setError("Unable to load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const handleBankSlipChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setBankSlip(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidExtension = extension && ALLOWED_SLIP_EXTENSIONS.includes(extension);

    if (!isValidExtension) {
      setError("Bank slip must be a PDF, JPG, JPEG, or PNG file.");
      setBankSlip(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_BANK_SLIP_SIZE) {
      setError("Bank slip size cannot exceed 2 MB.");
      setBankSlip(null);
      event.target.value = "";
      return;
    }

    setError("");
    setBankSlip(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedProjectId) {
      setError("Please choose a project before submitting.");
      return;
    }

    try {
      setLoading(true);
      const payload = await clientFinanceService.createInvoice({
        projectId: selectedProjectId,
        description,
        bankSlip
      });

      setSubmission(payload.finance);
      setSuccess("Invoice submitted successfully.");

      if (payload.finance?.status === "Paid") {
        window.alert("Payment successful");
      } else {
        window.alert("Payment unsuccessful");
      }

      setDescription("");
      setBankSlip(null);
      setSelectedProjectId("");
    } catch (err) {
      console.error("Failed to submit invoice:", err);
      setError(err.response?.data?.message || "Failed to submit invoice. Please try again.");
      window.alert("Payment unsuccessful");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-finance-container">
      <div className="client-finance-header">
        <h1 className="client-finance-title">Client Finance</h1>
        <p className="client-finance-subtitle">Submit invoices and track your project payments.</p>
      </div>

      <div className="client-finance-card">
        <h2 className="client-finance-card-title">Submit Invoice for Payment</h2>
        <p className="client-finance-card-subtitle">
          Select your project, review the invoice details, and upload a bank slip to mark the payment as Paid.
        </p>

        {error && (
          <div className="client-finance-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="client-finance-alert success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="client-finance-form">
          <div className="client-finance-field">
            <label className="client-finance-label">Project</label>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={loading}
              className="client-finance-select"
              required
            >
              <option value="" disabled>
                {projects.length > 0 ? "Select project" : "No projects available"}
              </option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <div className="client-finance-summary">
              <h3>Invoice Details</h3>
              <div className="client-finance-summary-list">
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Project Name</span>
                  <span className="client-finance-summary-value">{selectedProject.name}</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Category</span>
                  <span className="client-finance-summary-value">Income</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Budget</span>
                  <span className="client-finance-summary-value">Rs. {Number(selectedProject.budget || 0).toLocaleString()}</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Status</span>
                  <span className="client-finance-status unpaid">Unpaid</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Date</span>
                  <span className="client-finance-summary-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="client-finance-field">
            <label className="client-finance-label">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add a note for the finance team"
              rows={3}
              className="client-finance-textarea"
            />
          </div>
          <div className="client-finance-field">
            <label className="client-finance-label">Upload Bank Slip</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleBankSlipChange}
              className="client-finance-file-input"
            />
            {error && (
              <p className="client-finance-error-inline">{error}</p>
            )}
          </div>

          <div className="client-finance-actions">
            <button
              type="button"
              onClick={() => {
                setSelectedProjectId("");
                setDescription("");
                setBankSlip(null);
                setSubmission(null);
                setError("");
                setSuccess("");
              }}
              className="client-finance-button outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="client-finance-button secondary"
            >
              {loading ? "Submitting..." : "Submit Invoice"}
            </button>
          </div>
        </form>

        {submission && (
          <div className="client-finance-result-card">
            <h3>Invoice Summary</h3>
            <div className="client-finance-result-list">
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Project</span>
                <span className="client-finance-summary-value">{submission.Project_Name}</span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Category</span>
                <span className="client-finance-summary-value">{submission.category}</span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Amount</span>
                <span className="client-finance-summary-value">Rs. {Number(submission.amount || 0).toLocaleString()}</span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Status</span>
                <span className={`client-finance-status ${submission.status === "Paid" ? "paid" : "unpaid"}`}>
                  {submission.status}
                </span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Date</span>
                <span className="client-finance-summary-value">{new Date(submission.date).toLocaleDateString()}</span>
              </div>
              {submission.bankSlipPath && (
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Bank Slip</span>
                  <span className="client-finance-summary-value">Bank Slip Uploaded</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientFinancial;
