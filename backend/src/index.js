// const express = require("express") //first type of import
import express from 'express';//second type of importing
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import bodyParser from "body-parser";
import { connectDB } from './lib/db.js';
import { app, server } from './lib/socket.js';

import path from "path";
// const app= express(); //delete

const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// If using body-parser separately
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

dotenv.config()

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

const port = process.env.PORT


if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
}
    
server.listen(port,()=>{
    console.log("server is running on the PORT: "+port);
    connectDB()
})