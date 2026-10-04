import { User } from "../../DB/model/user.model.js";
import { sendMail } from "../../utils/email/index.js";
import { generateOTP } from "../../utils/otp/index.js";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../../utils/token/index.js";
import { hashPassword, comparePassword } from "../../utils/hash/index.js";
import { Token } from "../../DB/model/token.model.js";

export const register = async (req, res, next) => {

    // Get data from req
    const { fullName , email, password , phone , dob} = req.body;
    // Check for user existence
    const userExist = await User.findOne({
        $or: [
        {
            $and: [
            { email: { $exists: true } }, // email
            { email: { $ne: null } }, // email != null
            { email: email }, // email == email >> body
            ],
        },
        {
            $and: [
            { phone: { $exists: true } }, // phone
            { phone: { $ne: null } }, // phone != null
            { phone: phone }, // phone == phone >> body
            ],
        },
        ],
    });
    
    if (userExist) {
        throw new Error("User already exists", { cause: 409 });
    }
         
    // Hash password - Encrypt phone number - Factory design pattern
    const user = new User({
        fullName,
        email,
        password: hashPassword(password),
        phone,
        dob
    });    

    // Verification code
    const { otp, otpExpire } = generateOTP();
    user.otp = otp;
    user.otpExpire = otpExpire;
    if(email) {
        await sendMail({
            to: email,
            subject: "Verify your email",
            html: `<h1>Your verification code is ${otp}</h1>`
        });
    }

    // Create user
    await user.save(); // resolve - reject() -> throw new UnhandledPromiseRejectionWarning()
    return res.status(201).json({ 
        message: "User created successfully",
        success: true
    });
    // Send email verification (otp/link)
    // Return res
};
export const verifyAccount = async (req, res, next) => {
    // Get data from req (otp + email)
    const { email, otp } = req.body;
    // Check user otp + otpExpire
    const userExist = await User.findOne({
        email,
        otp,
        otpExpire: { $gt: Date.now()},
    })
    if (!userExist) {
        throw new Error("Invalid otp or otp expired", { cause: 401 });
    }
    // Update isVerified = true
    userExist.isVerified = true;
    userExist.otp = undefined;
    userExist.otpExpire = undefined;
    await userExist.save();
    // Send res
    return res.status(200).json({ 
        message: "Account verified successfully",
        success: true
    });
};
export const googleLogin = async (req, res, next) => {
    
        // Get from req body
        const {idToken} = req.body;
        const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID
        );
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload(); // {email, name, picture ...etc}
        // Check user existence
        let userExist = await User.findOne({ email: payload.email });
        if (!userExist) {
            userExist = await User.create({
                email: payload.email,
                fullName: payload.name,
                picture: payload.picture,
                isVerified: true,
                userAgent: "google"
            });
            return res.status(200).json({ 
                message: "Account created successfully",
                success: true,
                data: userExist
            });
        }
        // Generate Token
        const accessToken = generateToken({
            id: userExist._id, 
            name: userExist.fullName 
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            data: { accessToken }
        });
};
export const resendOTP = async (req, res, next) => {

    // Get data from req (email)
    const { email } = req.body;
    // Check user existence
    const userExist = await User.findOne({ email });
    if (!userExist) {
        throw new Error("User not found", { cause: 404 });
    }
    // Generate new OTP
    const { otp, otpExpire } = generateOTP();
    const user = await User.findOneAndUpdate({ email }, { otp, otpExpire });
    if(!user){
        throw new Error("User not found", { cause: 404 });
    }
    // Send email with new OTP
    await sendMail({
        to: email,
        subject: "Verify your email",
        html: `<h1>Your new verification code is ${otp}</h1>`
    });
    // Send res
    return res.status(200).json({ 
        message: "OTP resent successfully",
        success: true
    });

};
export const login = async (req, res, next) => {

    // Get data from req
    const { email, phone, password } = req.body;
    // Check for user existence
    const userExist =  await User.findOne({
        $or: [
        {
            $and: [
            { email: { $exists: true } }, // email
            { email: { $ne: null } }, // email != null
            { email: email }, // email == email >> body
            ],
        },
        {
            $and: [
            { phone: { $exists: true } }, // phone
            { phone: { $ne: null } }, // phone != null
            { phone: phone }, // phone == phone >> body
            ],
        },
        ],
    });

    if (!userExist) {
        throw new Error("Invalid Credentials", { cause: 401 });
    }
    console.log(userExist);

    if (userExist.isVerified == false) {
        throw new Error("User not verified", { cause: 401 });
    }

    // Compare password
    const passwordMatch = comparePassword(password, userExist.password);
    if (!passwordMatch) {
        throw new Error("Invalid Credentials", { cause: 401 });
    }

    // Check if deleted
    if(userExist.deletedAt){
    userExist.deletedAt = undefined;
    await userExist.save();
    }
    // Generate token
    const accessToken = generateToken({
        payload: { id: userExist._id },
        options: { expiresIn: "5m" }
    });

    const refreshToken = generateToken({
        payload: { id: userExist._id },
        options: { expiresIn: "7d" }
    });

    await Token.create({
        token: refreshToken,
        user: userExist._id,
        type: "refresh"
    });

    return res.status(200).json({
        message: "Login successful",
        success: true,
        data: { accessToken, refreshToken }
    });
};
export const resetPassword = async (req, res, next) => {
    // Get data from req
    const { email, otp, newPassword } = req.body;
    // Check if user exists
    const userExist = await User.findOne({ email });
    if (!userExist) {
        throw new Error("User not found", { cause: 404 });
    }
    // Check if OTP is valid
    if (userExist.otp != otp) {
        throw new Error("Invalid OTP", { cause: 400 });
    }
    // Check if OTP is expired
    if (userExist.otpExpire < Date.now()) {
        throw new Error("OTP expired", { cause: 400 });
    }
    // Hash new password
    userExist.password = hashPassword(newPassword);

    // Update credentials updated at
    userExist.credentialsUpdatedAt = Date.now();
    userExist.otp = undefined;
    userExist.otpExpire = undefined;
    await userExist.save(); // Create if not exists

    // Destroy all tokens
    await Token.deleteMany({ user: userExist._id, type: "refresh" });
    
    // // Update user password
    // const user = await User.findOneAndUpdate({ email }, { password: userExist.password });
    // if(!user){
    //     throw new Error("User not found", { cause: 404 });
    // }

    // Send res
    return res.status(200).json({ 
        message: "Password reset successfully",
        success: true
    });
};
export const logout = async (req, res, next) => {
    // Get data from req
    const token = req.headers.authorization;
    // Store token into DB
    await Token.create({ token, user: req.user._id});
    
    return res
    .status(200)
    .json({
        message: "User logged out successfully",
        success: true
    }); 
};      