//pass : 1jRinOK59GDesfiB

const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const messageRouter = require('./Route/MessageRoute');
const serviceRouter = require('./Route/ServiceRoute');

const app = express();
app.use(cors());
app.use(express.json()); // always include this for JSON body parsing

// Middleware
app.use("/messages", messageRouter);
app.use("/services", serviceRouter);

mongoose.connect("mongodb+srv://Admin:1jRinOK59GDesfiB@cluster0.pmkuy4i.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch((err) => console.log(err));
