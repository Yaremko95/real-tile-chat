const express = require("express");
const socket = require("socket.io");
require("dotenv").config();
const mongoose = require("mongoose");
const ActiveUser = require("./models/UserModel");
const app = express();
const server = app.listen(process.argv[2], async function () {
  console.log(`Listening on port ${process.argv[2]}`);
});

mongoose
  .connect("mongodb://localhost:27017/chat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(server)
  .catch((err) => console.log(err));
const io = socket(server);
const socketio_redis = require("socket.io-redis");
io.adapter(socketio_redis({ host: "localhost", port: 6379 }));

const redis = require("redis");
const redisClient = redis.createClient();

io.on("connection", function (socket) {
  console.log("connection");
  socket.on("new user", async (options) => {
    socket.username = options.username;
    redisClient.lpush("users", socket.username);
    try {
      if (!(await ActiveUser.findOne({ username: options.username }))) {
        const user = await new ActiveUser({
          socketId: socket.id,
          username: options.username,
        });
        user.save();
      } else {
        await ActiveUser.findOneAndUpdate(
          { username: options.username },
          { username: options.username, socketId: socket.id }
        );
      }
      const activeUsers = await ActiveUser.find();
      redisClient.lrange("users", 0, -1, function (err, users) {
        console.log(users);
        io.emit("login", { username: socket.username, users: users });
      });
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("sendMsg", (data) => {
    io.to(data.id).emit("receiveMsg", data);
  });
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
  socket.on("disconnect", async (options) => {
    await ActiveUser.findOneAndDelete({ socketId: socket.id }, function (err) {
      if (err) console.log(err);
      redisClient.lrem("users", 0, socket.username, function (err, res) {
        redisClient.lrange("users", 0, -1, async function (err, res) {
          const activeUsers = await ActiveUser.find();
          io.emit("leave", { username: socket.username, users: res });
        });
      });
    });
  });
});
