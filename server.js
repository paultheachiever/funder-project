const express = require("express");
const axios = require("axios");
const connectDB = require("./config/db")
const dotenv = require("dotenv");
const mpesaRouter = require("./Routes/mpesa");

dotenv.config();
const app = express();



app.use(express.json());
app.use("/mpesa", mpesaRouter);
const port = process.env.PORT || 5000;


/* =================== HOME =================== */



app.listen(port, () => console.log(`Server running on port ${port}`));
