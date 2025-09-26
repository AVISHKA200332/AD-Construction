const express = require("express");
const mongoose = require("mongoose");
const router = require("./Route/FinanceRoutes");
const projectRouter = require("./Route/ProjectRoute");

const app = express();
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());
app.use("/projects", projectRouter);
app.use("/finance", router);

// Basic health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start server only after DB connection succeeds
const PORT = process.env.PORT || 5000;

mongoose
  .connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    // Optional: exit so container/process managers can restart
    // process.exit(1);
  });