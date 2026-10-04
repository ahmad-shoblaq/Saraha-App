import multer , { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs";

export function fileUpload({
    allowedType = ["image/png", "image/jpeg", "image/jpg"]} = {}){
    const storage = diskStorage({});
    
    const fileFilter = (req, file, cb) => {
        if (allowedType.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type!"), { cause: 400 });
        }
    };


    return multer({ storage, fileFilter }) // new multer()
}

    