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
const buyerInventoryRouter = require('./Route/BuyerInventoryRoute');

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
app.use('/buyer-inventory', buyerInventoryRouter);

// Database and server
const PORT = process.env.PORT || 5000;

// Prefer env var; fall back to local MongoDB to avoid Atlas SRV/DNS issues by default
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ad_construction';

// Use TLS only for Atlas/SRV URIs
const isAtlas = MONGODB_URI.startsWith('mongodb+srv://') || /\.mongodb\.net/i.test(MONGODB_URI);

const connectOptions = {
  serverSelectionTimeoutMS: 8000,
  // Set dbName if not provided in URI
  dbName: process.env.DB_NAME || undefined,
  ...(isAtlas ? { tls: true } : {}),
};

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));
