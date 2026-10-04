import multer , { diskStorage } from "multer";
import { nanoid } from "nanoid";
import fs from "fs";

export function fileUpload({
    folder, 
    allowedType = ["image/png", "image/jpeg", "image/jpg"]
} = {}){
    const storage = diskStorage({
        destination: (req, file, cb) => {
            let dest = `uploads/${req.user._id}/${folder}`;
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }
            cb(null, dest);
        },
        filename: (req, file, cb) => {
            console.log({file})
            cb(null, nanoid(8) + "_" + file.originalname);
        },
    });
    const fileFilter = (req, file, cb) => {
        if (allowedType.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid file type!"), { cause: 400 });
        }
    };


    return multer({ storage, fileFilter }) // new multer()
}

    