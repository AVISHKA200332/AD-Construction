//pass : 1jRinOK59GDesfiB
const express = require('express');
const mongoose = require("mongoose");
const projectRouter = require("./Route/ProjectRoute");
const signupRouter = require("./Route/SignupRoutes");
const loginRouter = require("./Route/LoginRoutes");
const userRouter = require("./Route/UserRoutes");
const messageRouter = require('./Route/MessageRoute');
const serviceRouter = require('./Route/ServiceRoute');

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(cors());
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