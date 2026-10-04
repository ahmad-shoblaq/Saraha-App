import { verifyToken } from "../utils/token/index.js";
import { User } from "../DB/model/user.model.js";
import { Token } from "../DB/model/token.model.js";

export const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        throw new Error("Token is required", { cause: 401 });
    }

    // reject logged-out (revoked) tokens
    const blockedToken = await Token.findOne({ token , type: "access" });
    if (blockedToken) {
        throw new Error("Invalid token", { cause: 401 });
    }

    const payload = verifyToken(token); 

    const userExist = await User.findById(payload.id);
    if (!userExist) {
        throw new Error("User not found", { cause: 404 });
    }
    
    // Check if credentials were updated after token generation
    if (userExist.credentialsUpdatedAt && userExist.credentialsUpdatedAt > payload.iat * 1000) {
        throw new Error("Credentials updated, please login again", { cause: 401 });
    }
    
    req.user = userExist;
    next();
};