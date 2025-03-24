import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io =new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
})

io.on("connection",(socket)=>{
    console.log("A User Connected",socket.id);
    
    socket.on("disconnect",()=>{
        console.log("A User Disconnected",socket.id);
    })
})

export {io,app,server};