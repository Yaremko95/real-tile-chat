const express = require("express");
const socket = require("socket.io");
require('dotenv').config()
const mongoose = require('mongoose')

const app = express();
const server = app.listen(process.env.PORT, function () {
    console.log(`Listening on port ${process.env.PORT}`);

});

mongoose.connect(process.env.MONGOHOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(server)


const io = socket(server);

io.on("connection", function (socket) {
    console.log("Made socket connection");
});