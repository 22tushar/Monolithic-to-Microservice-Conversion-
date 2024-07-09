

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
                topic:"Post",
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





const init1 =  async ()=>{

    const consumer = Kafka.consumer({ groupId: "group2" });
    await consumer.connect();
  
    await consumer.subscribe({ topics: ["comment-topic"], fromBeginning: true });
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        
          // try {
              const notification = new noty({
                  topic:"Comment",
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

  const getNoty = async (req, res) => {

   console.log("notyserver")
    try{
      const not = await noty.find();
  
      if(not){
        res.status(200).json({not : not});
      }
      else{
        res.json({msg : "noty not found"});
      }
    }catch(error){
      console.log(error.message);
      res.json({msg : error.message});
    }
  };

module.exports = { 
    init,
    init1,
    getNoty
};