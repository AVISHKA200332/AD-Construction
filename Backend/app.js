//pass: 3KzKmzJ6QFuLjCBA

const express = require("express");
const mongoose = require("mongoose");
const financeRouter = require("./Route/FinanceRoutes");
const projectRouter = require("./Route/ProjectRoute");

const app = express();
const cors = require("cors");

//Middleware
app.use(express.json());
app.use(cors());
app.use("/projects", projectRouter);
app.use("/finance", financeRouter);

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(()=> console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err)=> console.log((err)));