const axios = require("axios");

const testSTK = async () => {
  try {
    const response = await axios.post("http://127.0.0.1:5000/mpesa/callback", {
      phone: "254115995080", 
      amount: 1
    });

    console.log("STK Response:", response.data);
  } catch (error) {
    console.error(
      "STK Error:",
      error.response?.data || error.message
    );
  }
};

testSTK();
