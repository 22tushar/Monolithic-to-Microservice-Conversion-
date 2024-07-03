
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect( MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log("DB Connected Successfully on server-1");
})
.catch((error)=>{
    console.log(error);
});

module.exports = mongoose;