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
import logo from '../../assets/logo.png';
import '../css-resources/FinanceDashboard.css';
import inventoryService from '../../services/inventoryService';
import projectService from '../../services/projectService';

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

// Helper to add logo
function addLogo(pdf, x, y, w, h) {
  pdf.addImage(logo, 'PNG', x, y, w, h);
}

function FinanceDashboard() {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, budget, expenses, payments
  const [inventoryValue, setInventoryValue] = useState(0);
  const [projectBudget, setProjectBudget] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFinanceData();
    fetchInventoryStats();
    fetchProjectStats();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/finances');
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

  const fetchInventoryStats = async () => {
    try {
      const stats = await inventoryService.getInventoryStats();
      setInventoryValue(stats?.totalValue || 0);
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      setInventoryValue(0);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const stats = await projectService.getProjectStats();
      setProjectBudget(stats?.totalBudget || 0);
    } catch (error) {
      console.error('Error fetching project stats:', error);
      setProjectBudget(0);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const data = Array.isArray(financeData) ? financeData : [];

    const financeExpenses = data
      .filter(item => item.category === 'Expense')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const financeIncome = data
      .filter(item => item.category === 'Income')
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    const aggregatedProjectBudget = Number(projectBudget) || 0;
    const totalIncome = financeIncome + aggregatedProjectBudget;
    const inventoryExpenses = Number(inventoryValue) || 0;
    const totalExpenses = financeExpenses + inventoryExpenses;
    const netBalance = totalIncome - totalExpenses;

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      inventoryExpenses,
      financeExpenses,
      financeIncome,
      aggregatedProjectBudget
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
    const summary = calculateSummary();
    const categoryTotals = {};

    filteredData.forEach(item => {
      const category = item.category || 'Other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (item.amount || 0);
    });

    if (filter !== 'income' && summary.inventoryExpenses > 0) {
      categoryTotals['Expense'] =
        (categoryTotals['Expense'] || 0) + summary.inventoryExpenses;
    }

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const baseColors = [
      '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
    ];
    const colors = labels.map((label, index) => {
      if (label === 'Income') return '#FF6384';
      if (label === 'Expense') return '#36A2EB';
      return baseColors[index % baseColors.length];
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  };

  const getStatusChartData = () => {
    const filteredData = getFilteredData();
    const summary = calculateSummary();
    const statusTotals = {};

    filteredData.forEach(item => {
      const status = item.status || 'Unknown';
      statusTotals[status] = (statusTotals[status] || 0) + (item.amount || 0);
    });

    if (filter !== 'expenses' && summary.aggregatedProjectBudget > 0) {
      statusTotals['Unpaid'] =
        (statusTotals['Unpaid'] || 0) + summary.aggregatedProjectBudget;
    }

    if (filter !== 'income' && summary.inventoryExpenses > 0) {
      statusTotals['Paid'] =
        (statusTotals['Paid'] || 0) + summary.inventoryExpenses;
    }

    const labels = Object.keys(statusTotals);
    const data = Object.values(statusTotals);
    const baseColors = ['#28a745', '#ffc107', '#dc3545', '#17a2b8'];
    const colors = labels.map((label, index) => {
      if (label === 'Paid') return '#28a745';
      if (label === 'Unpaid') return '#ffc107';
      return baseColors[index % baseColors.length];
    });

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: colors.map(color => color + '80'),
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

    // --- Cover Page ---
    addLogo(pdf, 80, 30, 50, 50); 
    pdf.setFontSize(28);
    pdf.setTextColor(59, 130, 246);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AD Construction', 105, 95, { align: 'center' });
    pdf.setFontSize(18);
    pdf.setTextColor('#333');
    pdf.text('Financial Report', 105, 110, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setTextColor('#666');
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })}`,
      105,
      120,
      { align: 'center' }
    );
    pdf.addPage();

    // Capture Pie Chart
    const chartElement = document.querySelector("#finance-dashboard .chart-wrapper canvas");
    if (chartElement) {
      const canvas = await html2canvas(chartElement);
      const chartImage = canvas.toDataURL("image/png");
      pdf.addImage(chartImage, "PNG", 14, 40, 180, 90);
    }

    // Income Statement as a table
    pdf.setFontSize(14);
    pdf.text("Income Statement", 14, 145);
    pdf.setFontSize(11);
    pdf.text("For the year ended March 31", 14, 153);

    const startY = 170;
    const rowHeight = 12;
    const lightYellow = [255, 255, 225];

    // Create table headers (optional)
    pdf.setFillColor(lightYellow[0], lightYellow[1], lightYellow[2]);
    pdf.rect(14, startY - 5, 140, rowHeight, 'F');
    pdf.setDrawColor(150, 150, 150);
    pdf.rect(14, startY - 5, 140, rowHeight);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Description", 20, startY);
    pdf.text("Amount", 110, startY);

    // Table rows function
    const drawTableRow = (y, label, value, isTotal = false) => {
        const bgColor = isTotal ? [255, 255, 200] : lightYellow; // Darker yellow for total
        
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(14, y, 140, rowHeight, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(14, y, 140, rowHeight);
        
        if (isTotal) {
            pdf.setFont(undefined, 'bold');
        }
        
        pdf.text(label, 20, y + 8);
        pdf.text(`Rs. ${value.toLocaleString()}`, 110, y + 8);
        
        if (isTotal) {
            pdf.setFont(undefined, 'normal');
        }
        
        return y + rowHeight;
    };

    let currentY = startY + 10;

    currentY = drawTableRow(currentY, "Revenue", summary.totalIncome);
    currentY = drawTableRow(currentY, "Cost of Services", summary.totalExpenses);
    currentY = drawTableRow(currentY, "Gross Profit", summary.netBalance, true);

    // use currentY
    pdf.setFontSize(10);
    pdf.text("* Values are in Sri Lankan Rupees", 14, currentY + 15);

    // --- Footer ---
    const pageHeight = pdf.internal.pageSize.height;
    pdf.setFontSize(10);
    pdf.setTextColor('#666');
    pdf.text(
      'Generated by AD Construction Project Management System',
      20,
      pageHeight - 20
    );
    pdf.text(
      'Contact: info@adconstruction.com | +94 70 103 8400',
      20,
      pageHeight - 12
    );

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
            <p className="card-amount">Rs. {summary.financeIncome.toLocaleString()}</p>
          </div>
        </div>

        <div className="summary-card expense-card">
          <div className="card-icon">💸</div>
          <div className="card-content">
            <h3>Total Expenses</h3>
            <p className="card-amount">Rs. {summary.totalExpenses.toLocaleString()}</p>
            <p className="card-subtext">Includes inventory value Rs. {summary.inventoryExpenses.toLocaleString()}</p>
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
          onClick={() => navigate('/financeRecords')}
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

      
      {/* Data Summary 
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
      */}
    </div>
  );
}

export default FinanceDashboard;
