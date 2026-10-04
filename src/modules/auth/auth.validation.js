import Joi from "joi";
import { generalField } from "../../middleware/validation.middleware.js";
export const registerSchema = Joi
    .object({
    fullName: generalField.name.required(),
    email: generalField.email,
    password: generalField.password.required(),
    rePassword: generalField.rePassword('password'),
    phone: generalField.phone,
    dob: generalField.dob.required()
})
.or('email', 'phone');

export const loginSchema = Joi.object({
    email: generalField.email,
    phone: generalField.phone,
    password: generalField.password.required(),
})
.or('email', 'phone');

export const resetPasswordSchema = Joi.object({
    email: generalField.email.required(),
    otp: generalField.otp.required(),
    newPassword: generalField.password.required(),
    rePassword: generalField.rePassword('newPassword').required(),
})