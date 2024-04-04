
const express = require("express");
const router = express.Router();



const { createvideocard} = require('../controllers/createVideo');


router.post("/create-videocard", createvideocard)

module.exports = router