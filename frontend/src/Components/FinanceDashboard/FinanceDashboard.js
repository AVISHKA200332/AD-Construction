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
import { Pie, Bar } from 'react-chartjs-2';
import jsPDF from "jspdf";
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
    // Ensure financeData is always an array
    const data = Array.isArray(financeData) ? financeData : [];
    
    const totalExpenses = data
      .filter(item => item.category === 'Expense')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalIncome = data
      .filter(item => item.category === 'Income')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalPayments = data
      .filter(item => item.category === 'Payment')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const totalBudget = data
      .filter(item => item.category === 'Budget')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const netBalance = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      totalPayments,
      totalBudget,
      netBalance
    };
  };

  // Get filtered data based on current filter
  const getFilteredData = () => {
    // Ensure financeData is always an array
    const data = Array.isArray(financeData) ? financeData : [];
    
    switch (filter) {
      case 'budget':
        return data.filter(item => item.category === 'Budget');
      case 'expenses':
        return data.filter(item => item.category === 'Expense');
      case 'payments':
        return data.filter(item => item.category === 'Payment');
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
  const generatePDF = () => {
    const input = document.getElementById("finance-dashboard");
    
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Finance_Report.pdf");
    });
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
            <p className="card-amount">${summary.totalIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-amount">${summary.totalExpenses.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card payment-card">
          <div className="card-icon">💳</div>
          <div className="card-content">
            <h3>Total Payments</h3>
            <p className="card-amount">${summary.totalPayments.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card budget-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Budget</h3>
            <p className="card-amount">${summary.totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className={`summary-card balance-card ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="card-icon">{summary.netBalance >= 0 ? '📈' : '📉'}</div>
          <div className="card-content">
            <h3>Net Balance</h3>
            <p className="card-amount">${summary.netBalance.toLocaleString()}</p>
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
            className={`filter-btn ${filter === 'budget' ? 'active' : ''}`}
            onClick={() => setFilter('budget')}
          >
            Budget
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
          <button 
            className={`filter-btn ${filter === 'payments' ? 'active' : ''}`}
            onClick={() => setFilter('payments')}
          >
            Payments
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
              ${getFilteredData().length > 0 
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
