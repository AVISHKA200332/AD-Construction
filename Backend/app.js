//pass : 1jRinOK59GDesfiB

const express = require('express');
const mongoose = require("mongoose");
const router = require("./Route/ProjectRoute");

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());
app.use("/projects", router);

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));
