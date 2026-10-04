import { Router } from "express";
import * as messageService from "./message.service.js";
import { fileUpload } from "../../utils/multer/multer.cloud.js"; 
import { isValid } from "../../middleware/validation.middleware.js";
import { sendMessageSchema, getMessageSchema } from "./message.validation.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const router = Router();

// saraha.com/message/id
router.post("/:receiver",
    fileUpload().array("attachments", 2), 
    isValid(sendMessageSchema), 
    messageService.sendMessage
); 

router.post("/:receiver/sender",
    isAuthenticated, 
    fileUpload().array("attachments", 2), 
    isValid(sendMessageSchema), 
    messageService.sendMessage
); 

router.get("/:id", isAuthenticated, isValid(getMessageSchema), messageService.getMessage)

export default router;