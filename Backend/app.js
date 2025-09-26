const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

//pass : 1jRinOK59GDesfiB
const express = require('express');
const mongoose = require("mongoose");
const projectRouter = require("./Route/ProjectRoute");
const signupRouter = require("./Route/SignupRoutes");
const loginRouter = require("./Route/LoginRoutes");
const userRouter = require("./Route/UserRoutes");

const app = express();
const messageRouter = require('./Route/MessageRoute');
const serviceRouter = require('./Route/ServiceRoute');

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use("/projects", projectRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/users", userRouter);

// Database and server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
app.use("/projects", projectRouter);
app.use("/signup", signupRouter);
app.use("/login", loginRouter);
app.use("/users", userRouter);
app.use("/messages", messageRouter);
app.use("/services", serviceRouter);

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));
