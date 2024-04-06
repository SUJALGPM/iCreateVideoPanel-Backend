const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const { verifyJwtForClient, handleAdminCreateAccounts, handleAdminLogin, handleSuperAdminCount, handleSuperAdminCreate, handleCreateContentAdmin, handleReportAdminCreate, getAllDetailReport, uploadSheetAdmin, getMostPopularTemplate } = require('../controllers/admins');
const { isAuthenticated } = require("../middleware/auth")


//Multer configure....
const ExcelDirectory = 'sheetFolder';

if (!fs.existsSync(ExcelDirectory)) {
    fs.mkdirSync(ExcelDirectory);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ExcelDirectory)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage }).single('file');



router.post('/admin-create-account', handleAdminCreateAccounts)
router.post("/admin-login", handleAdminLogin);
router.get("/verify-jwt/:token", verifyJwtForClient);
router.post("/create-super-admin", isAuthenticated, handleSuperAdminCount, handleSuperAdminCreate);
router.post("/create-content-admin", isAuthenticated, handleCreateContentAdmin);
router.post("/create-report-admin", isAuthenticated, handleReportAdminCreate);
router.get("/all-detail-report/:id", getAllDetailReport);
router.post("/upload-sheet-admin/:id", upload, uploadSheetAdmin);
router.get("/get-most-popular-template", getMostPopularTemplate);



module.exports = router