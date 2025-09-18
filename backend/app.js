//pass: 3KzKmzJ6QFuLjCBA

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/FinanceRoutes");

const app = express();

//Middleware
app.use(express.json());
app.use("/finance",router);

mongoose.connect("mongodb+srv://admin:3KzKmzJ6QFuLjCBA@cluster0.i1f9ioi.mongodb.net/")
.then(()=> console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err)=> console.log((err)));