import cloudinary, { uploadFiles } from "../../utils/cloud/cloudinary.config.js";
import { Message } from "../../DB/model/message.model.js";

export const sendMessage = async (req, res) => {
    // Get data from req
    const { content } = req.body;
    const { receiver } = req.params;
    const files = req.files;

    // Upload to cloud
    const attachments = await uploadFiles({
        files,
        options: { folder: `saraha/users/${receiver}/messages` }
    });
    // Save to database
    await Message.create({
        content,
        receiver,
        attachments,
        sender: req.user?._id
    });
    // Return response
    res.status(201).json({ 
        message: "Message sent successfully", 
        success: true 
    });
};
export const getMessage = async (req, res, next) => {
   // Get data from req
   const { id } = req.params;
   const message = await Message.findOne(
    { _id: id, receiver: req.user._id },
    { __v: 0 },
    { populate: { path: "sender", select: "firstName lastName" } }
   );
   if (!message) {
       throw new Error("Message not found", { cause: 404 });
   }
   return res
   .status(200)
   .json({
       message: "Message found",
       success: true,
       data: {message}
   });
}
