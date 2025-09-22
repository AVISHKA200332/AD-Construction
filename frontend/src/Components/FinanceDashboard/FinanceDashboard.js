import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie} from 'react-chartjs-2';
import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import './FinanceDashboard.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function FinanceDashboard() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, budget, expenses, payments
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/finance');
      // Ensure response.data is an array
      const data = Array.isArray(response.data.finance) ? response.data.finance : [];
      setFinanceData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching finance data:', error);
      // Set empty array on error to prevent filter errors
      setFinanceData([]);
      setLoading(false);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const data = Array.isArray(financeData) ? financeData : [];

    const totalExpenses = data
      .filter(item => item.category === 'Expense')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalIncome = data
      .filter(item => item.category === 'Income')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const netBalance = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      netBalance
    };
  };

  // Get filtered data based on current filter
  const getFilteredData = () => {
    const data = Array.isArray(financeData) ? financeData : [];

    switch (filter) {
      case 'expenses':
        return data.filter(item => item.category === 'Expense');
      case 'income':
        return data.filter(item => item.category === 'Income');
      default:
        return data;
    }
  };

  // Prepare data for category pie chart
  const getCategoryChartData = () => {
    const filteredData = getFilteredData();
    const categoryTotals = {};

    filteredData.forEach(item => {
      const category = item.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (item.amount || 0);
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  };

  // Prepare data for status pie chart
  const getStatusChartData = () => {
    const filteredData = getFilteredData();
    const statusTotals = {};

    filteredData.forEach(item => {
      const status = item.status || 'Unknown';
      statusTotals[status] = (statusTotals[status] || 0) + (item.amount || 0);
    });

    const labels = Object.keys(statusTotals);
    const data = Object.values(statusTotals);
    const colors = ['#28a745', '#ffc107', '#dc3545', '#17a2b8'];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: colors.slice(0, labels.length).map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  const summary = calculateSummary();

  // generate PDF
  const generatePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Title
    pdf.setFontSize(18);
    pdf.text("Finance Report", 14, 20);
    pdf.setFontSize(11);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // Step 1: Capture Pie Chart
    const chartElement = document.querySelector("#finance-dashboard .chart-wrapper canvas");
    if (chartElement) {
      const canvas = await html2canvas(chartElement);
      const chartImage = canvas.toDataURL("image/png");
      pdf.addImage(chartImage, "PNG", 14, 40, 180, 90);
    }

    // Step 2: Income Statement
    pdf.setFontSize(14);
    pdf.text("Income Statement", 14, 145);
    pdf.setFontSize(11);
    pdf.text("For the year ended March 31", 14, 153);
    pdf.text("(in Rs.)", 14, 160);

    const startY = 170;
    pdf.setFontSize(12);
    pdf.text("Revenue", 14, startY);
    pdf.text(`Rs. ${summary.totalIncome.toLocaleString()}`, 60, startY);

    pdf.text("Cost of Services", 14, startY + 10);
    pdf.text(`Rs. ${summary.totalExpenses.toLocaleString()}`, 60, startY + 10);

    pdf.text("Gross Profit", 14, startY + 20);
    pdf.text(`Rs. ${summary.netBalance.toLocaleString()}`, 60, startY + 20);

    pdf.save("Finance_Report.pdf");
  };


  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" id="finance-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Finance Dashboard</h1>
        <p className="dashboard-subtitle">Overview of your financial data</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Total Income</h3>
            <p className="card-amount">Rs. {summary.totalIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-amount">Rs. {summary.totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className={`summary-card balance-card ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{summary.netBalance >= 0 ? '📈' : '📉'}</div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="card-amount">Rs. {summary.netBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-section">
        <h3>Filter by Category</h3>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Data
          </button>
          <button 
            className={`filter-btn ${filter === 'income' ? 'active' : ''}`}
            onClick={() => setFilter('income')}
          >
            Income
          </button>
          <button 
            className={`filter-btn ${filter === 'expenses' ? 'active' : ''}`}
            onClick={() => setFilter('expenses')}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Category Distribution</h3>
          <div className="chart-wrapper">
            <Pie data={getCategoryChartData()} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Status Distribution</h3>
          <div className="chart-wrapper">
            <Pie data={getStatusChartData()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button 
          className="action-btn primary"
          onClick={() => navigate('/addFinance')}
        >
          Add New Transaction
        </button>
        <button 
          className="action-btn secondary"
          onClick={() => navigate('/finance')}
        >
          View All Records
        </button>
        <button 
          className="action-btn tertiary"
          onClick={fetchFinanceData}
        >
          Refresh Data
        </button>
        <button className="generate-report-btn" onClick={generatePDF}>
          <i className="fas fa-file-pdf"></i> Generate Report (PDF)
        </button>
      </div>

      {/* Data Summary */}
      <div className="data-summary">
        <h3>Data Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Records:</span>
            <span className="stat-value">{Array.isArray(financeData) ? financeData.length : 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Filtered Records:</span>
            <span className="stat-value">{getFilteredData().length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Amount:</span>
            <span className="stat-value">
              Rs. {getFilteredData().length > 0 
                ? (getFilteredData().reduce((sum, item) => sum + (item.amount || 0), 0) / getFilteredData().length).toFixed(2)
                : '0.00'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinanceDashboard;
