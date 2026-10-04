import { generateToken, verifyToken } from "../token/index.js";
import { Token } from "../../DB/model/token.model.js";  

export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((error) => {
            next(error);
        });
    };
};

export const globalErrorHandler = async (err, req, res, next) => {   
    try {
        if (err.message == "jwt expired") {
            const refreshToken = req.headers.refreshtoken;   

            if (!refreshToken) {
                throw new Error("Invalid refresh token", { cause: 401 });
            }

            const payload = verifyToken(refreshToken);

            await Token.findOneAndDelete({
                token: refreshToken,
                user: payload.id,
                type: "refresh"
            });

            const accessToken = generateToken({
                payload: { id: payload.id },
                options: { expiresIn: "15m" }
            });

            const newRefreshToken = generateToken({
                payload: { id: payload.id },
                options: { expiresIn: "7d" }
            });

            await Token.create({
                token: newRefreshToken,
                user: payload.id,
                type: "refresh"
            });

            return res.status(200).json({
                message: "Token refreshed",
                success: true,
                data: {
                    accessToken,
                    refreshToken: newRefreshToken
                }
            });
        }

    res.status(err.cause || 500).json({
        message: err.message,
        success: false,
        globalErrorHandler: true,
        stack: err.stack
    });
    }catch(error) {
        res.status(err.cause || 500).json({
        message: err.message,
        success: false,
        globalErrorHandler: true,
        stack: err.stack
    })}
}
