export const verifyToken = (token, secretKey = process.env.JWT_SECRET) => {
    return jwt.verify(token, secretKey);
};

export const generateToken = ({
    payload,
    secretKey = process.env.JWT_SECRET,
    options = { expiresIn: "15m" }
}) => {
    return jwt.sign(payload, secretKey, options);
};