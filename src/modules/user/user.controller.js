import { Router } from "express";
import * as userService from "./user.service.js";
import { fileValidation } from "../../middleware/file-validation.middleware.js";
import { fileUpload } from "../../utils/multer/multer.local.js";
import { fileUpload as fileUploadCloud } from "../../utils/multer/multer.cloud.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { isValid } from "../../middleware/validation.middleware.js";
const router = Router();
router.delete("/", isAuthenticated, userService.deleteAccount);
router.post(
    "/upload-profile-picture",
    isAuthenticated,
    fileUpload({ folder: "profile-pictures" }).single("profilePicture"),
    fileValidation(),
    userService.uploadProfilePicture
);
router.post(
    "/upload-profile-picture-cloud",
    isAuthenticated,
    fileUploadCloud({ folder: "profile-pictures" }).single("profilePicture"),
    fileValidation(),
    userService.uploadProfilePictureCloud
);

router.get("/", isAuthenticated, userService.getProfile);

export default router;