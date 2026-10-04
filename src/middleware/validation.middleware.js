import joi from "joi";
export const isValid = (schema) => {
    return (req, res, next) => {
        let data = {...req.body, ...req.params, ...req.query }
        const {error} = schema.validate(data, { abortEarly: false });
        if (error) {
            let errMessages = error.details.map((err) => {
                return err.message;
            });
            errMessages = errMessages.join(', ');
            throw new Error(errMessages, { cause: 400 });
        }
        // Call next
        next();
    }
}

export const generalField = {
    email: joi.string().email({tlds: {allow:["com","net","org","edu","gov"]}}),
    password: joi.string().min(5).max(50),
    name: joi.string().min(8).max(50),
    phone: joi.string().length(11),
    dob: joi.date(),
    otp: joi.string().length(6),
    rePassword: (ref) => joi.string().min(5).max(50).valid(joi.ref(ref)),
    objectId: joi.string().length(24).hex()
}
