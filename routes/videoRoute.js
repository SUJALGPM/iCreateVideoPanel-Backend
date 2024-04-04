const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { videoController, videoFetch,allvideByname,allvideByname2,videoConvertor } = require('../controllers/videoController');

//Multer configure....
const videosDirectory = 'videos';




if (!fs.existsSync(videosDirectory)) {
    fs.mkdirSync(videosDirectory);
}
const fullPath = path.resolve(__dirname, videosDirectory);
//console.log(fullPath);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, videosDirectory)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage });


const storage1 = multer.memoryStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.originalname + '-' + uniqueSuffix);
    }
});
const upload2 = multer({ storage: storage1 });
//Video Convertor route....
router.post("/videoCon", upload2.single('video'), videoConvertor);













// Add this line after your other middleware and before your routes
router.use('/videos', express.static(path.join(__dirname, 'videos')));

//Upload Video to database...
router.post("/upload", upload.single('file'), videoController);

//Fetch Video from database...
router.get("/pullVideo", videoFetch);

router.get("/all-video-name" , allvideByname);
router.get("/checkvideoaccess/:COMPANYNAME" , allvideByname2);

module.exports = router;