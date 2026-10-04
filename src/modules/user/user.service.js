import { User } from "../../DB/model/user.model.js";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../utils/token/index.js";
import fs from "fs";
import { uploadFile, deleteFolder } from "../../utils/cloud/cloudinary.config.js";
import { Token } from "../../DB/model/token.model.js";
export const deleteAccount = async (req, res, next) => {
    // Delete user soft delete
    await User.updateOne(
        {_id: req.user._id },
        { deletedAt: Date.now(), credentialsUpdatedAt: Date.now() }
    );
    await Token.deleteMany({ user: req.user._id });
    // Return res
    return res
    .status(200)
    .json({ message: "User deleted successfully" });
};  
export const uploadProfilePicture = async (req, res, next) => {
    // Delete old profile picture if user has one
    if (req.user.profilePicture && fs.existsSync(req.user.profilePicture)) {
        fs.unlinkSync(req.user.profilePicture);
    }   
    const userExist = await User.findByIdAndUpdate(req.user._id, 
        { 
            profilePicture: req.file.path
        },{ new: true }
    );
    if (!userExist) {
        throw new Error("User not found", { cause: 404 });
    }
    return res
    .status(200)
    .json({
        message: "Profile picture uploaded successfully",
        success: true,
        data: userExist
    });

};
export const uploadProfilePictureCloud = async (req, res, next) => {
    // Get data from req
    const user = req.user;
    const file = req.file;

    // Delete old profile picture if user has one
    // if(user.profilePicture?.public_id){
    //     await cloudinary.uploader.destroy(user.profilePicture.public_id);
    // }
    let uploadOptions = {folder: `saraha/users/${user._id}/profile-pic`};
    if(user.profilePicture?.public_id){
        uploadOptions.public_id = user.profilePicture.public_id;
        delete uploadOptions.folder;
    }
    // Upload new profile picture
    const { secure_url, public_id } = await uploadFile({
        path: file.path,
        options: uploadOptions
    });

    // Update DB
    await User.updateOne(
        {_id: user._id},
        {profilePicture: {secure_url, public_id}}
    );


    return res
    .status(200)
    .json({
        message: "Profile picture uploaded successfully",
        success: true,
        data: { secure_url, public_id }
    });

};
export const getProfile = async (req, res, next) => {
    const user = await User.findOne({_id: req.user._id},
    {},
    { populate: [{path: "messages", select:"content sender", populate:{
                path:"sender",
                select:"firstName lastName"
            }}] 
        });
    return res
    .status(200)
    .json({
        message: "Profile retrieved successfully",
        success: true,
        data: {user}
    });
}

   