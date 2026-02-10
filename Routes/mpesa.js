const express = require("express");
const router = express.Router();

const {
  generatepassword,
  token,
  stkpush
} = require("../controllers/mpesaController");

router.get("/", (req, res) => {
  res.send("Welcome to the M-Pesa API");
});

// router.get("/password", generatepassword);
// router.get("/token", token);
router.post("/stkpush", token, stkpush)

module.exports = router;
