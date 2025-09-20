# AD Construction Project Management - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Start MongoDB (make sure MongoDB is running)
# On Windows: net start MongoDB
# On Mac/Linux: brew services start mongodb-community

# Start the backend server
npm start
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

### 3. Database Setup

The system will automatically create the database and collections when you first run it. No manual database setup is required.

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file in the Backend directory:

```env
MONGODB_URI=mongodb://localhost:27017/ad-construction
PORT=5000
NODE_ENV=development
```

### Default Settings

- **Database**: `ad-construction`
- **Backend Port**: 5000
- **Frontend Port**: 3000
- **API Base URL**: `http://localhost:5000/projects`

## 📱 Usage

### 1. Access the Application
Open your browser and go to `http://localhost:3000`

### 2. Create Your First Project
1. Click the "Add Project" button
2. Fill in the required fields:
   - Project Name (3-100 characters, no special characters)
   - Client Name (2-100 characters, no special characters)
   - Start Date (today or later)
   - End Date (after start date)
   - Budget (Rs. 1,000,000 to Rs. 1,000,000,000)
   - Completion (0-100%)

### 3. Explore Features
- **Search & Filter**: Use the search bar and filters to find projects
- **View Statistics**: Check the dashboard for project statistics
- **Monitor Compliance**: View 60-30-10 rule compliance
- **Audit Logs**: Click "Logs" on any project to view change history

## 🎯 Key Features to Try

### Validation Features
- Try entering special characters (`!`, `#`, `$`, `%`) - they'll be automatically removed
- Enter a budget outside the range - you'll get validation errors
- Try setting a start date in the past - it won't be allowed
- Enter an age under 18 for project manager - it will be rejected

### Business Rules
- Create projects with different statuses to see the 60-30-10 rule in action
- The dashboard will show compliance status
- Visual indicators will show if you're following the business rules

### Audit Logging
- Create, edit, or delete projects
- Click "Logs" on any project to see the complete change history
- Every action is tracked with timestamps and user information

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- Make sure MongoDB is running
- Check if port 5000 is available
- Verify all dependencies are installed

#### Frontend won't start
- Check if port 3000 is available
- Verify all dependencies are installed
- Try clearing npm cache: `npm cache clean --force`

#### Database connection issues
- Ensure MongoDB is running
- Check the connection string in your environment variables
- Verify MongoDB is accessible on the default port (27017)

#### Validation errors
- Check the browser console for detailed error messages
- Ensure all required fields are filled
- Verify data formats (dates, numbers, etc.)

### Getting Help

1. Check the browser console for error messages
2. Check the backend console for server errors
3. Verify all prerequisites are installed
4. Ensure MongoDB is running
5. Check that all ports are available

## 📊 Sample Data

### Creating Test Projects

Here are some sample projects you can create to test the system:

#### Project 1: Office Building
- **Name**: Downtown Office Complex
- **Client**: ABC Corporation
- **Status**: In Progress
- **Priority**: High
- **Start Date**: Today
- **End Date**: 6 months from today
- **Budget**: 50,000,000
- **Completion**: 25%

#### Project 2: Residential Complex
- **Name**: Luxury Apartments
- **Client**: XYZ Developers
- **Status**: Planning
- **Priority**: Medium
- **Start Date**: Next week
- **End Date**: 1 year from today
- **Budget**: 100,000,000
- **Completion**: 0%

#### Project 3: Shopping Mall
- **Name**: City Center Mall
- **Client**: Retail Group
- **Status**: Completed
- **Priority**: High
- **Start Date**: 1 year ago
- **End Date**: 6 months ago
- **Budget**: 200,000,000
- **Completion**: 100%

## 🎉 Success!

Once everything is running, you should see:
- A modern project management interface
- Real-time validation as you type
- Comprehensive project statistics
- 60-30-10 rule compliance monitoring
- Complete audit logging
- Responsive design that works on all devices

The system is now ready for managing AD Construction projects with all the enhanced features and validation rules implemented!
