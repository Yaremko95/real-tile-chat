const {Schema} = require('mongoose')
const mongoose = require('mongoose')

const ActiveUser = new Schema ({
    socketId:String,
    username:String
})


module.exports =mongoose.model("user", ActiveUser);