

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const noty = require('../models/noty')
const cloudinary = require("cloudinary").v2;

const { Kafka } = require("../client");

const group = process.argv[2];



const init =  async ()=>{

  const consumer = Kafka.consumer({ groupId: "group1" });
  await consumer.connect();

  await consumer.subscribe({ topics: ["post-topic"], fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      
        // try {
            const notification = new noty({
                // topic:topic,
                // partition:partition,
                messageFromKafka:message.value.toString()
            });
        
            const saveNotification = await notification.save();
        
            if (saveNotification) {
                console.log(
                    `${group}: [${topic}]: PART:${partition}:`,
                    message.value.toString()  
                )
             }
        }
     
});
}



module.exports = { 
    init
};