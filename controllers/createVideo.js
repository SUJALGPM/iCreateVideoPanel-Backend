const userModel = require("../models/userModel");



const createvideocard = async (req, res) => {
  try {
    const { MRID,type, drName, name } = req.body;
    const user = await userModel.findOne({ MRID: MRID });
    console.log(user);
    if (!user)
      return res.status(400).json({ msg: "user not found", success: false });
    if (type !== "videocard")
      return res.status(400).json({
        msg: "type not found",
        success: false,
      });
    await user.cardCategories.push({
      drName,
      name,
      type: type,
      dateOfCreation: Date.now(),
    });
    await user.save();
    return res.json({
      msg: "video card category created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      msg: "Internal Server Error",
      success: false,
    });
  }
};


module.exports = {
    createvideocard
}