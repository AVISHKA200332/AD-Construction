const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Routers (declare each only once)
const projectRouter = require('./Route/ProjectRoute');
const signupRouter = require('./Route/SignupRoutes');
const loginRouter = require('./Route/LoginRoutes');
const userRouter = require('./Route/UserRoutes');
const messageRouter = require('./Route/MessageRoute');
const serviceRouter = require('./Route/ServiceRoute');
const financeRouter = require('./Route/FinanceRoutes');
const clientFinanceRouter = require('./Route/ClientFinanceRoutes');
const roleRouter = require('./Route/RoleRoutes');
const profileRouter = require('./Route/ProfileRoutes');
const inventoryRouter = require('./Route/inventoryItemRoute');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());
// Static for uploaded images
const path = require('path');
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/projects', projectRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/users', userRouter);
app.use('/messages', messageRouter);
app.use('/services', serviceRouter);
app.use('/finances', financeRouter);
app.use('/client-finance', clientFinanceRouter);
app.use('/role', roleRouter);
app.use('/profile', profileRouter);
app.use('/inventory', inventoryRouter);

// Database and server
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
