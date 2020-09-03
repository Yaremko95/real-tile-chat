const express = require("express");
const socket = require("socket.io");
require('dotenv').config()
const mongoose = require('mongoose')
const ActiveUser = require('./models/UserModel')
const app = express();
const server = app.listen(process.env.PORT, async function () {
    console.log(`Listening on port ${process.env.PORT}`);
    const activeUsers = await ActiveUser.find()
    console.log(activeUsers)
});

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(server).catch((err) => console.log(err))


const io = socket(server);



io.on("connection", function (socket) {
    console.log("Made socket connection");
    socket.on("online", async (options) => {
     try {
         if (!await ActiveUser.findOne({username:options.username})) {
             const user = await new ActiveUser({socketId:socket.id, username:options.username})
             user.save()
         } else {
             await ActiveUser.findOneAndUpdate({username:options.username, socketId:socket.id})
         }
         const activeUsers = await ActiveUser.find()

         console.log(activeUsers)
         io.emit("online", activeUsers);
     }catch (e) {
         console.log(e)
     }
    });
    socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("disconnected", socket.userId);
    });
});