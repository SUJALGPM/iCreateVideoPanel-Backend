const AdminModel = require("../models/adminmodel");
const { User, userTrackUsage } = require("../models/userModel");
const mrModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const xlsx = require("xlsx");
const SECRET = process.env.SECRET;


const handleAdminCreateAccounts = async (req, res) => {

    try {
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        // Log incoming data
        const admin = "";
        try {
            admin = await AdminModel.findOne({ AdminId });
            console.log('Existing Admin:', admin);

            if (admin) {
                return res.json({ msg: "Admin Already Exists" })
            }
        } catch (error) {
            console.error('Error in findOne:', error);
        }
        if (admin) {
            // Log if the condition is met
            console.log('AdminId Already Exists');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Pragma', 'no-cache');
            return res.status(400).json({
                msg: "AdminId Already Exists",
                success: false
            });
        }
        const newAdmin = new AdminModel({
            Name: Name,
            AdminId: AdminId,
            Password: Password,
            Gender: Gender,
            MobileNumber: MobileNumber
        });
        // Log the new admin data before saving
        await newAdmin.save();
        // Log success response
        return res.status(200).json({
            success: true,
            newAdmin
        });
    } catch (error) {
        const errMsg = error.message;
        // Log the error message
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }

}

const handleAdminLogin = async (req, res) => {
    try {
        const { AdminId, Password } = req.body;
        console.log(SECRET);
        const admin = await AdminModel.findOne({ AdminId });
        if (admin) {
            if (admin.Password === Password) {
                const token = jwt.sign({ id: admin._id, role: admin.role }, SECRET);
                return res.status(200).json({
                    msg: "Login",
                    success: true,
                    admin,
                    token
                })
                console.log("Login success..");
            } else {
                return res.status(400).json({
                    msg: "Password is Incorrect",
                    success: false,
                })
            }
        } else {
            return res.status(400).json({
                msg: "Admin Not Found",
                success: false
            })
        }
    } catch (error) {
        const errMsg = error.message;
        // Log the error message
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}

const verifyJwtForClient = async (req, res) => {
    try {
        const token = req.params.token;
        if (token) {
            const decodedToken = await jwt.verify(token, process.env.SECRET);
            const userRole = decodedToken.role;
            const userId = decodedToken.id;

            return res.json({ userRole, userId })
        } else {
            return res.json({ msg: "token not found" })
        }
    } catch (error) {
        console.error('Error decoding JWT:', error.message);
        const errMessage = error.message
        return res.json({ msg: errMessage })
    }
}

const handleSuperAdminCount = async (req, res, next) => {
    const superAdminCount = await AdminModel.countDocuments({ Admin_TYPE: 'SUPER_ADMIN' });
    if (superAdminCount >= 3) {
        return req.status(403).json({
            msg: "Can't create more than 3 super admin"
        })
    }
    next();
}

const handleSuperAdminCreate = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];

        const admin1 = await AdminModel.findById({ _id: userId });
        if (!admin1) return res.json({ msg: "Main Admin Not Found" })
        if (role !== '1') {
            return res.json("You are not Default admin");
        }
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        console.log(req.body);
        const admin = await AdminModel.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "AdminId Already Exitsts",
                success: false,
            })
        }

        const newAdmin = new AdminModel({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "SUPER_ADMIN"
        })

        if (newAdmin.role === 'SUPER_ADMIN') {
            const superAdminCount = await AdminModel.countDocuments({ role: 'SUPER_ADMIN' });
            if (superAdminCount >= 3) {
                return res.status(403).json({
                    msg: "Can't create more than 3 super admin",
                });
            }
            newAdmin.SUPER_ADMIN_COUNT += 1;
        }
        await newAdmin.save();
        return res.status(200).json({
            success: true,
            newAdmin
        });

    } catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}

const handleCreateContentAdmin = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];

        let adminCheck = await AdminModel.findById({ _id: userId });
        if (!adminCheck) return res.json({ msg: "No Admin Type Found" });

        if (role !== 'SUPER_ADMIN') return res.json({ msg: "Only SuperAdmin Create Content Admin" });


        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        console.log({ Name, AdminId, Password, Gender, MobileNumber })
        const admin = await AdminModel.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "Content Admin Already Exitsts",
                success: false,
            })
        }

        const contentAdmin = new AdminModel({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "CONTENT_ADMIN"
        })
        await contentAdmin.save();
        return res.status(200).json({
            success: true,
            contentAdmin
        });
    }
    catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error",
            errMsg
        });
    }
}

const handleReportAdminCreate = async (req, res) => {
    try {
        const userId = req.headers['userId'];
        const role = req.headers['userRole'];
        let adminCheck = await AdminModel.findById({ _id: userId });
        if (!adminCheck) return res.json({ msg: "No Admin Type Found" });
        if (role !== 'SUPER_ADMIN') return res.json({ msg: "Only SuperAdmin Create Report Admin" });
        const { Name, AdminId, Password, Gender, MobileNumber } = req.body;
        const admin = await AdminModel.findOne({ AdminId: AdminId });
        if (admin) {
            return res.status(400).json({
                msg: "Report Admin Already Exitsts",
                success: false,
            })
        }
        const reportAdmin = new AdminModel({
            Name,
            AdminId,
            Password,
            Gender,
            MobileNumber,
            role: "REPORT_ADMIN"
        })
        await reportAdmin.save();
        return res.status(200).json({
            success: true,
            reportAdmin
        });
    }
    catch (error) {
        const errMsg = error.message;
        console.log({ errMsg });
        return res.status(500).json({
            msg: "Internal Server Error in Report Admin creation ",
            errMsg
        });
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatTime(dateString) {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${amOrPm}`;
}

const getAllDetailReport = async (req, res) => {
    try {
        // Get admin ID params...
        const adminID = req.params.id;

        // Check if admin exists...
        const adminExist = await AdminModel.findById(adminID).populate('Mrs');
        if (!adminExist) {
            return res.status(404).send({ message: "Admin not found..!!", success: false });
        }

        // Extract MRs from admin...
        const mrs = adminExist.Mrs;

        // Array to store the final report...
        const detailReport = [];

        // Iterate over each MR...
        for (const mrId of mrs) {
            const mrDetails = await mrModel.User.findById(mrId);
            if (mrDetails.cardCategories.length > 0) {
                const cardCategories = mrDetails.cardCategories.map(category => ({
                    MRID: mrDetails.MRID,
                    USERNAME: mrDetails.USERNAME,
                    ROLE: mrDetails.ROLE,
                    HQ: mrDetails.HQ,
                    REGION: mrDetails.REGION,
                    BUSINESSUNIT: mrDetails.BUSINESSUNIT,
                    DOJ: mrDetails.DOJ,
                    TYPE: category.type,
                    DOCTORNAME: category.doctorName,
                    VIDEONAME: category.videoname,
                    FILENAME: category.fileName,
                    PROCESSTIME: category.processTime,
                    DOC: formatDate(category.dateOfCreation),
                    DOT: formatTime(category.dateOfCreation),
                }));
                detailReport.push(...cardCategories);
            } else {
                // If MR has no card categories, include MR details with an empty card categories array
                detailReport.push({
                    MRID: mrDetails.MRID,
                    USERNAME: mrDetails.USERNAME,
                    ROLE: mrDetails.ROLE,
                    HQ: mrDetails.HQ,
                    REGION: mrDetails.REGION,
                    BUSINESSUNIT: mrDetails.BUSINESSUNIT,
                    DOJ: mrDetails.DOJ,
                    TYPE: "",
                    DOCTORNAME: "",
                    VIDEONAME: "",
                    FILENAME: "",
                    DOC: "",
                    DOT: ""
                });
            }
        }

        // Send response in JSON...
        res.status(201).json(detailReport);

    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to load final Usage Report..!!!", success: false });
    }
}

const uploadSheetAdmin = async (req, res) => {
    try {
        // Admin Exist or not checking......
        const AdminId = req.params.id;
        const admin = await AdminModel.findById(AdminId);
        if (!admin) {
            return res.status(400).json({
                msg: "Admin Not Found"
            });
        }

        // EXCEL SHEET Upload file....
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // For loop the sheet data to store in various collections
        for (const row of sheetData) {
            console.log('Sheet Data:', row);


            // Check the MR exists or not
            let existingMr = await User.findOne({ MRID: row.MRID });
            if (!existingMr) {
                // MR doesn't exist, create new MR
                existingMr = new User({
                    USERNAME: row.USERNAME,
                    MRID: row.MRID,
                    EMAIL: row.EMAIL,
                    Password: row.PASSWORD,
                    ROLE: row.ROLE,
                    HQ: row.HQ,
                    REGION: row.REGION,
                    BUSINESSUNIT: row.BUSINESSUNIT,
                    DOJ: row.DOJ,
                });
                await existingMr.save();

                // Add the created MR to the admin's Mrs array
                admin.Mrs.push(existingMr._id);
                await admin.save();
            }
        }

        res.status(200).json({ message: "MR Excel Sheet Data uploaded successfully...", success: true });
    } catch (err) {
        console.log(err);
        res.status(501).send({ message: "Failed to upload sheet..!!", success: false });
    }
}

const getMostPopularTemplate = async (req, res) => {
    try {

        // Aggregate to get the count of each type and its most popular template
        const fetchMostUsed = await userTrackUsage.aggregate([
            { $group: { _id: { type: '$type', template: '$videoname' }, count: { $sum: 1 } } },
            { $sort: { '_id.type': 1, count: -1 } },
            {
                $group: {
                    _id: '$_id.type',
                    mostPopularTemplate: { $first: '$_id.template' },
                    count: { $first: '$count' },
                },
            },
            { $project: { _id: 0, type: '$_id', mostPopularTemplate: 1, count: 1 } },
        ]);

        // Fetch remaining fields for each most popular template
        const fetchCompleteDocuments = await Promise.all(
            fetchMostUsed.map(async ({ type, mostPopularTemplate }) => {
                const completeDocument = await userTrackUsage.findOne({ type, videoname: mostPopularTemplate });
                return completeDocument;
            })
        );

        console.log("Before data :", fetchCompleteDocuments);

        //Fetch 3 record from minined data...
        const FinalRecords = await fetchCompleteDocuments.slice(0, 3);

        //Send the most popular design template....
        res.status(201).json(FinalRecords);

    } catch (err) {
        console.log(err);
        res.status(501).send({ message: "Failed to load most popular templates..!!!", success: false });
    }
}




module.exports = {
    handleAdminCreateAccounts,
    handleAdminLogin,
    handleSuperAdminCreate,
    handleSuperAdminCount,
    verifyJwtForClient,
    handleCreateContentAdmin,
    handleReportAdminCreate,
    getAllDetailReport,
    uploadSheetAdmin,
    getMostPopularTemplate
}


