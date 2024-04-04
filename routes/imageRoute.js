const express = require('express');
const multer = require('multer');
const router = express.Router();
const { imageController } = require('../controllers/imageController');
// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

//Fetch image dynamic...
router.post("/image", upload.single('image'), imageController);

module.exports = router;