const express = require("express");
const socket = require("socket.io");
require('dotenv').config()
const mongoose = require('mongoose')
const ActiveUser = require('./models/UserModel')
const app = express();
const server = app.listen(process.env.PORT, async function () {
    console.log(`Listening on port ${process.env.PORT}`);


});

mongoose.connect('mongodb://localhost:27017/chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(server).catch((err) => console.log(err))


const io = socket(server);



io.on("connection", function (socket) {
    console.log("connection");
    socket.on("new user", async (options) => {
     try {
         if (!await ActiveUser.findOne({username:options.username})) {
             const user = await new ActiveUser({socketId:socket.id, username:options.username})
             user.save()
         } else {
             await ActiveUser.findOneAndUpdate({username:options.username},{username:options.username, socketId:socket.id})
         }
         const activeUsers = await ActiveUser.find()
         io.emit("new user", activeUsers);
     }catch (e) {
         console.log(e)
     }
    });
    socket.on("disconnect", async (options) => {
       const user = await ActiveUser.findOneAndDelete({socketId:socket.id}, function (err) {
            if(err) console.log(err);
            console.log("Successful deletion");
        })
        console.log(user)
        // io.emit(user disconnected");
    });
});