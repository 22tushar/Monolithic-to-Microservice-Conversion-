const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const cors = require("cors");

require("dotenv").config();

const fileUpload = require("express-fileupload");

const {init} = require('./controllers/authControllers')
const PORT = process.env.PORT || 8000;


// ########################################################################


// database
const mongoose = require("./db/database");

// ########################################################################
// middlewares
app.use(express.json());
app.use(express.urlencoded({
    extended : false
}))
app.use(cors());
app.use(fileUpload({
    useTempFiles : true
}))


// ########################################################################
// routes
app.use("/api/auth/", require("./routes/authRoutes"));


// ########################################################################
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})
