import { fileTypeFromBuffer } from "file-type";
import fs from "node:fs";
export const fileValidation = (allowedTypes = ["image/jpeg", "image/png"]) => {
    return async (req, res, next) => {
        // get the file path
        const filePath = req.file.path;
        // read the file and return buffer
        const buffer = fs.readFileSync(filePath);
        // get the file type
        const type = await fileTypeFromBuffer(buffer);
        // validate
        if (!type || !allowedTypes.includes(type.mime)) {
            fs.unlinkSync(filePath);
            return next(new Error("Invalid file type"));
        }

        return next();
    };
};
