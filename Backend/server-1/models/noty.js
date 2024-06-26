
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    messageFromKafka : {
        type : String,
        // required : true,
    },
    
    // topic : {
    //     type : String,
    //     // required : true,
    // },
    // partition : {
    //     type : String,
    //     // required : true,
    // },
}, {timestamps : true});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;



