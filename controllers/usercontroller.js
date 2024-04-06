const { User, UsageModel, userTrackUsage } = require('../models/userModel');
const adminModel = require('../models/adminmodel');
const bcrypt = require("bcrypt");
const async = require('async');
const nodemailer = require("nodemailer");

const userRegistration = async (req, res) => {
    try {
        const {
            MRID,
            USERNAME,
            PASSWORD,
            EMAIL,
            ROLE,
            HQ,
            REGION,
            BUSINESSUNIT,
            DOJ
        } = req.body;

        // Find the admin by ID or some unique identifier
        const AdminId = req.params.AdminId;
        console.log(AdminId);
        console.log("req.params:", req.params);


        const admin = await adminModel.findOne({ AdminId: AdminId });
        console.log(admin);

        if (!admin) {
            return res.status(400).json({ msg: "Admin not found" });
        }

        // Check if the username is already taken
        const user = await User.findOne({ USERNAME: USERNAME });
        if (user) {
            return res.status(400).json({ msg: "Username is taken" });
        }

        // Create a new MR
        const userToSave = await new User({
            MRID,
            USERNAME,
            PASSWORD,
            EMAIL,
            ROLE,
            HQ,
            REGION,
            BUSINESSUNIT,
            DOJ
        }).save();

        // Add the created MR to the admin's Mrs array
        admin.Mrs.push(userToSave._id);
        await admin.save();

        console.log(userToSave);

        return res.status(200).json({
            msg: "User created and linked to admin",
            userToSave
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Internal Server Error"
        });
    }
};

const userLogin = async (req, res) => {
    try {
        const { MRID, PASSWORD } = req.body;
        const user = await User.findOne({ MRID: MRID });

        if (user) {
            // Check the password (you may want to compare the hashed password)
            const isPasswordValid = PASSWORD === user.PASSWORD
            console.log(PASSWORD, user.PASSWORD);

            if (isPasswordValid) {
                // User exists, increment login count
                user.loginLogs.push({
                    timestamp: new Date(),
                    cnt: user.loginLogs.length + 1
                });

                // Save the updated user document
                await user.save();

                return res.status(200).json({
                    msg: "Login Successful",
                    success: true,
                    user
                });
            } else {
                return res.status(401).json({
                    msg: "Incorrect Password",
                    success: false,
                });
            }
        } else {



            return res.status(200).json({
                msg: "Login Successful",
                success: true,
                newUser
            });
        }
    } catch (error) {
        console.error("Internal Server Error:", error);
        const errorMessage = error.message;
        return res.status(500).json({
            msg: "Internal Server Error",
            success: false,
            errorMessage,
        });
    }
}

// const submitController = async (req, res) => {
//     try {

//         console.log("UpComing Data :", req.body);
//         const { type, doctorName, videoname, fileName, processTime } = req.body;
//         const mrId = req.params.id;

//         //Check the MR is present or not...
//         const existMr = await User.findById(mrId).populate('cardCategories');

//         if (!existMr) {
//             res.status(404).send({ message: "Mr not found..!!!", success: false });
//         }

//         //Check the doctor name is presen or not...
//         if (!doctorName) {
//             res.status(404).send({ message: "Doctor Name not found..!!!", success: false });
//         }

//         //Format Data before store...
//         const formatedData = {
//             type: type,
//             doctorName: doctorName,
//             videoname: videoname,
//             fileName: fileName,
//             processTime: processTime,
//         }

//         //Store the database in server....
//         const newUsage = new UsageModel(formatedData);
//         const saveUsage = await newUsage.save();

//         //After save push in userSchema Also...
//         existMr.cardCategories.push(saveUsage);
//         await existMr.save();

//         res.status(201).send({ message: "Usage successfully tracked.....", success: true });
//     } catch (err) {
//         console.log(err);
//         res.status(500).send({ message: "Failed to track the Usage..!!!", success: false });
//     }
// }

const submitController = async (req, res) => {
    try {
        console.log("UpComing Data :", req.body);
        const { type, doctorName, videoname, fileName, processTime, MRID } =
            req.body;
        //   const mrId = req.params.id;

        //Check the MR is present or not...
        const existMr = await User.findOne({ MRID: MRID }).populate(
            "cardCategories"
        );

        if (!existMr) {
            return res
                .status(404)
                .send({ message: "Mr not found..!!!", success: false });
        }

        // Check if the doctor name is present or not...
        if (!doctorName) {
            return res.status(404).send({ message: "Doctor Name not found..!!!", success: false });
        }

        // Format Data before storing...
        const formatedData = {
            type: type,
            doctorName: doctorName,
            videoname: videoname,
            fileName: fileName,
            processTime: processTime,
        };

        // Track the user(MR) Usage...
        const TrackUsageData = {
            mrName: existMr.USERNAME,
            templateType: type,
            doctorName: doctorName,
            videoname: videoname,
            fileName: fileName,
            processTime: processTime,
        }

        // Store the data in the database...
        const newUsage = new UsageModel(formatedData);
        await newUsage.save();
        existMr.cardCategories.push(newUsage);
        await existMr.save();

        //Store the track usage data...
        const newUsageTrack = new userTrackUsage(TrackUsageData);
        await newUsageTrack.save();
        existMr.userTrackUsage.push(newUsageTrack);
        await existMr.save();


        // // Run the saving operations in parallel with a limit of 2 (adjust as needed)
        // const saveOperations = [
        //     async () => await newUsage.save(),
        //     async () => {
        //         existMr.cardCategories.push(newUsage);
        //         await existMr.save();
        //     },
        //     async () => await newUsageTrack.save(),
        //     async () => {
        //         existMr.userTrackUsage.push(newUsageTrack);
        //         await existMr.save();
        //     }
        // ];

        // await async.parallelLimit(saveOperations, 10);


        res.status(201).send({ message: "Usage successfully tracked.....", success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to track the Usage..!!!", success: false });
    }
};

const forgetPassword = async (req, res) => {
    try {

        const { MRID } = req.body;
        const mrExist = await User.findOne({ MRID: MRID });

        if (!mrExist) {
            return res.status(404).send({ message: "MR Not found...!!!", success: false });
        }

        // Send the password directly via email
        const mrEmail = mrExist.EMAIL;
        const mrPassword = mrExist.PASSWORD;

        // NodeMailer Configuration
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'digilateraldev@gmail.com',
                pass: 'aekm bxbe duvs vyzx'
            }
        });

        // Email content
        var mailOptions = {
            from: 'digiLateraliCreateVideoPanel@gmail.com',
            to: mrEmail,
            subject: 'Restore forget Password👍',
            html: `
              <div style="border: 1px solid #000; padding: 10px; text-align: center;">
                <h3 style="text-align: center;">Dear : ${mrExist.USERNAME}</h3>
                <p> Your Password For <span style="background-color: blue; color: white; padding: 3px;">iCreateVideo Panel </span> : ${mrPassword}</p>
                <p>Please keep this information secure.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            `
        };

        // Send the email
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return res.status(500).send({ message: "Error sending email", success: false });
            } else {
                console.log('Email sent: ' + info.response);
                return res.status(200).send({ message: "Password sent successfully", success: true });
            }
        });

    } catch (err) {
        console.log(err);
    }
}

const getRecentUsedData = async (req, res) => {
    try {
        const mrId = req.params.id;

        const mrExist = await User.findById(mrId);
        if (!mrExist) {
            return res.status(404).send({ message: "MR NOT FOUND...!!!", success: false });
        }

        // Filter out duplicates based on the "type" field
        const recentTemplates = mrExist.userTrackUsage.reverse();
        const filteredRecent = recentTemplates.filter(
            (template, index, self) => index === self.findIndex(t => t.videoname === template.videoname)
        );

        const [lastRecent] = filteredRecent;

        res.status(201).send({ message: "Recently used MR templates...", data: lastRecent, success: true });
    } catch (err) {
        return res.status(501).send({ message: "Failed to load recently used templates..!!" });
    }
}



module.exports = {
    userRegistration,
    userLogin,
    submitController,
    forgetPassword,
    getRecentUsedData
}