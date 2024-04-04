const express = require("express");
const router = express.Router();

const { userRegistration, userLogin, submitController, forgetPassword } = require("../controllers/usercontroller");

router.post("/create-account/:AdminId", userRegistration);
router.post("/login", userLogin);
router.post("/submitUsage/:id", submitController);
router.post("/forget-password-user", forgetPassword);

module.exports = router;
