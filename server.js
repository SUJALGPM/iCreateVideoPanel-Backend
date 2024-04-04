const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const cors = require('cors');
const dotenv = require("dotenv");
const connectDB = require("./config/db");

//dotenv config
dotenv.config();

//Mongodb connection
connectDB();

//Rest object...
const app = express();

//Middlewares...
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static('videos'));

//const route2 = require('./combo/videoController');
const route2 = require('./routes/videoRoute');
const route1 = require('./routes/imageRoute');
const route3 = require('./routes/userRoute');
const route4 = require('./routes/createCard');
const route5 = require('./routes/adminRoute');
app.use("/api/auth", route2);
app.use("/api/auth", route1);
app.use("/api/auth", route3);
app.use("/api/auth", route4);
app.use("/api/auth", route5);


//Test purpose...
app.get('/', (req, res) => {
    res.send("hellooooo")

    // res.sendFile(
    //     path.join(__dirname,"../iCreateVideoClient/build/index.html"),
    //     function(err){
    //         if(err){
    //             res.status(500).send(err)
    //         }
    //     }
    // )



});

//port...
const port = process.env.PORT || 8050;

// Listen port...
const server = app.listen(port, () => {
    console.log(
        `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
            .bgCyan.white
    );
});