//pass : 1jRinOK59GDesfiB

const express = require('express');
const mongoose = require("mongoose");
const router = require('./Route/UserRoute');
const report_router = require("./Routes/ReportRoutes");

const app = express();
app.use(express.json()); // always include this for JSON body parsing

// Middleware
app.use("/users", router);
app.use("/reports", report_router);

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));
