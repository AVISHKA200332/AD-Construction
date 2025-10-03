import React, { useEffect, useMemo, useState } from "react";
import clientFinanceService from "../../services/clientFinanceService";
import "../css-resources/ClientFinance.css";

const STATUS_COLORS = {
  Paid: "text-green-600",
  Pending: "text-yellow-500",
  Overdue: "text-red-500",
  Unpaid: "text-red-500"
};

const STAGE_LABELS = {
  deposit: "60% Deposit Payment",
  balance: "40% Balance Payment"
};

const MAX_BANK_SLIP_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_SLIP_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

function ClientFinancial() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [bankSlip, setBankSlip] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bankSlipError, setBankSlipError] = useState("");

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

  const selectedEntry = useMemo(
    () => projects.find((entry) => entry.project?._id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const selectedProject = selectedEntry?.project || null;

  const expectedFromBudget = useMemo(() => {
    if (!selectedProject?.budget) {
      return { deposit: 0, balance: 0 };
    }
    const budget = Number(selectedProject.budget) || 0;
    const deposit = Math.round(budget * 0.6);
    const balance = budget - deposit;
    return { deposit, balance };
  }, [selectedProject]);

  const depositSummary = selectedEntry?.payments?.deposit || null;
  const balanceSummary = selectedEntry?.payments?.balance || null;

  const depositExpected = depositSummary?.expectedAmount ?? expectedFromBudget.deposit;
  const balanceExpected = balanceSummary?.expectedAmount ?? expectedFromBudget.balance;

  const depositStatus = depositSummary?.status || (depositSummary?.paidAmount ? "Paid" : "Pending");
  const balanceStatus = balanceSummary?.status || (balanceSummary?.paidAmount ? "Paid" : "Pending");

  const depositPaid = depositStatus === "Paid";
  const balancePaid = balanceStatus === "Paid";

  const nextStage = useMemo(() => {
    if (!selectedProject) return null;
    if (!depositPaid) return "deposit";
    if (!balancePaid) return "balance";
    return null;
  }, [selectedProject, depositPaid, balancePaid]);

  const upcomingAmount = nextStage === "deposit"
    ? depositExpected
    : nextStage === "balance"
      ? balanceExpected
      : 0;

  const handleBankSlipChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setBankSlip(null);
      setBankSlipError("");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    const isValidExtension = extension && ALLOWED_SLIP_EXTENSIONS.includes(extension);

    if (!isValidExtension) {
      setBankSlipError("Bank slip must be a PDF, JPG, JPEG, or PNG file.");
      setBankSlip(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_BANK_SLIP_SIZE) {
      setBankSlipError("Bank slip size cannot exceed 2 MB.");
      setBankSlip(null);
      event.target.value = "";
      return;
    }

    setBankSlipError("");
    setBankSlip(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBankSlipError("");

    if (!selectedProjectId) {
      setError("Please choose a project before submitting.");
      return;
    }

    if (!nextStage) {
      setError("All payments for this project are already completed.");
      return;
    }

    if (!bankSlip) {
      setBankSlipError("Please upload a bank slip to confirm the payment.");
      return;
    }

    try {
      setLoading(true);
      const payload = await clientFinanceService.submitInstallment({
        projectId: selectedProjectId,
        stage: nextStage,
        description,
        bankSlip
      });

      setSubmission(payload.finance);
      setSuccess(`${STAGE_LABELS[nextStage]} submitted successfully.`);

      setProjects((prev) =>
        prev.map((entry) =>
          entry.project?._id === selectedProjectId
            ? { ...entry, payments: payload.payments }
            : entry
        )
      );

      setDescription("");
      setBankSlip(null);
      const form = event.target;
      if (form && typeof form.reset === "function") {
        form.reset();
      }
    } catch (err) {
      console.error("Failed to submit invoice:", err);
      setError(err.response?.data?.message || "Failed to submit invoice. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const depositStatusClass = STATUS_COLORS[depositStatus] || "";
  const balanceStatusClass = STATUS_COLORS[balanceStatus] || "";

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

        {loading && (
          <div className="client-finance-alert info">Loading project payments...</div>
        )}

        {!loading && projects.length === 0 && (
          <div className="client-finance-alert info">No projects available for payment yet.</div>
        )}

        {error && (
          <div className="client-finance-alert error">{error}</div>
        )}

        {success && (
          <div className="client-finance-alert success">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="client-finance-form">
          <div className="client-finance-field">
            <label className="client-finance-label">Project</label>
            <select
              value={selectedProjectId}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setSubmission(null);
                setSuccess("");
                setError("");
                setBankSlipError("");
              }}
              disabled={loading}
              className="client-finance-select"
              required
            >
              <option value="" disabled>
                {projects.length > 0 ? "Select project" : "No projects available"}
              </option>
              {projects.map((entry) => (
                <option key={entry.project?._id} value={entry.project?._id}>
                  {entry.project?.name || "Unnamed Project"}
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
                  <span className="client-finance-summary-value">{formatCurrency(selectedProject.budget)}</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Date</span>
                  <span className="client-finance-summary-value">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {selectedEntry && (
            <div className="client-finance-summary">
              <h3>Payment Progress</h3>
              <div className="client-finance-summary-list">
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Deposit (60%)</span>
                  <span className={`client-finance-summary-value ${depositStatusClass}`}>
                    {depositSummary?.paidAmount
                      ? formatCurrency(depositSummary.paidAmount)
                      : formatCurrency(depositExpected)}
                    {` • ${depositStatus}`}
                  </span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Balance (40%)</span>
                  <span className={`client-finance-summary-value ${balanceStatusClass}`}>
                    {balanceSummary?.paidAmount
                      ? formatCurrency(balanceSummary.paidAmount)
                      : formatCurrency(balanceExpected)}
                    {` • ${balanceStatus}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedEntry && nextStage && (
            <div className="client-finance-summary">
              <h3>Upcoming Payment</h3>
              <div className="client-finance-summary-list">
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Stage</span>
                  <span className="client-finance-summary-value">{STAGE_LABELS[nextStage]}</span>
                </div>
                <div className="client-finance-summary-row">
                  <span className="client-finance-summary-label">Amount Due</span>
                  <span className="client-finance-summary-value">{formatCurrency(upcomingAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {selectedEntry && !nextStage && (
            <div className="client-finance-alert success">
              All payments for this project have been completed. Thank you!
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
            {bankSlipError && (
              <p className="client-finance-error-inline">{bankSlipError}</p>
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
                setBankSlipError("");
              }}
              className="client-finance-button outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projects.length === 0 || !nextStage}
              className="client-finance-button secondary"
            >
              {loading ? "Submitting..." : nextStage ? `Submit ${STAGE_LABELS[nextStage]}` : "Fully Paid"}
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
                <span className="client-finance-summary-label">Stage</span>
                <span className="client-finance-summary-value">{STAGE_LABELS[submission.stage] || submission.stage}</span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Category</span>
                <span className="client-finance-summary-value">{submission.category}</span>
              </div>
              <div className="client-finance-summary-row">
                <span className="client-finance-summary-label">Amount</span>
                <span className="client-finance-summary-value">{formatCurrency(submission.amount)}</span>
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
