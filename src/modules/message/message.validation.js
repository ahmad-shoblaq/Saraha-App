import Joi from "joi";
import { generalField } from "../../middleware/validation.middleware.js";

export const sendMessageSchema = Joi.object({
    content: Joi.string().min(3).max(1000),
    receiver: generalField.objectId.required(),
    sender: generalField.objectId
}).required();

export const getMessageSchema = Joi.object({
    id: generalField.objectId.required()
}).required();
