
const { default: axios } = require("axios");
const datetime = require("node-datetime");



const generatepassword = ()=>{
    const dtime = datetime.create()
    const formated = dtime.format("YmdHMS");
    console.log("timestamp", formated);

    const passwordString = Buffer.from(process.env.SHORTCODE + process.env.PASSKEY + formated)
    .toString("base64");
    return { passwordString, formated };
    // res.json({
    //     status: "success",
    //     message: "password created successfully ",
    //     password: passwordString
    // })
}
const mpesaPassword = (req,res) =>{
    res.json({
        status: "success",
        message: "password created successfully " 
    })
}
let cachedToken = null;
let tokenExpiry = 0;

const token = async (req, res, next) => {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) {
    req.access_token = cachedToken;
    return next();
  }

  try {
    const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = "Basic " + Buffer.from(process.env.CONSUMER_KEY + ":" + process.env.CONSUMER_SECRET).toString('base64');

    const response = await axios.get(url, { headers: { Authorization: auth } });

    cachedToken = response.data.access_token;
    tokenExpiry = now + 3500 * 1000;
    req.access_token = cachedToken;
    console.log("Access token generated:", cachedToken);
    return next();
  } catch (error) {
    console.error("Token error:", error.response?.data || error.message);
    return res.status(500).json({ error: "Failed to generate token", details: error.response?.data || error.message });
  }
};


const stkpush = async (req, res) => {
  const { phone, amount } = req.body;
  if (!phone || !amount) 
    return res.status(400).json({ error: "Phone and amount are required" });

  if (!req.access_token) {
    return res.status(401).json({ error: "Access token not found. Token middleware may have failed." });
  }

  try {
    const accessToken = req.access_token;
    console.log("Token in stkpush:", accessToken);

    const { passwordString, formated } = generatepassword();

    const headers = {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json"
    };

    const data = {
      BusinessShortCode: process.env.SHORTCODE,
      Password: passwordString,
      Timestamp: formated,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: "funder account",
      TransactionDesc: "payments for funding"
    };
    
    console.log("STK Push payload:", data);

    let response;
    const axiosConfig = {
      headers,
      timeout: 30000 // 30 second timeout to handle M-Pesa sandbox slowness
    };
    
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", data, axiosConfig);
        break; // Success, exit retry loop
      } catch (err) {
        retries++;
        if ((err.code === "ECONNRESET" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT") && retries <= maxRetries) {
          console.log(`Connection error (${err.code}), retry ${retries}/${maxRetries}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        } else {
          throw err;
        }
      }
    }

    return res.json({
      status: "success",
      message: "STK Push initiated",
      response: response.data
    });
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    return res.status(500).json({ 
      error: "STK Push failed", 
      details: error.response?.data || error.message 
    });
  }
};
const callback = (req, res) => {
  console.log("Callback received:", req.body);
  res.json({ status: "success", message: "Callback received" });
};


module.exports = {
  generatepassword,
  token,
  stkpush
};