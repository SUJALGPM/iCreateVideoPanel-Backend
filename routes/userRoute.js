const express = require("express");
const router = express.Router();

const { userRegistration, userLogin, submitController, forgetPassword, getRecentUsedData } = require("../controllers/usercontroller");

router.post("/create-account/:AdminId", userRegistration);
router.post("/login", userLogin);
router.post("/submitUsage/:id", submitController);
router.post("/forget-password-user", forgetPassword);
router.get("/get-recentlyUsage/:id", getRecentUsedData);

module.exports = router;
