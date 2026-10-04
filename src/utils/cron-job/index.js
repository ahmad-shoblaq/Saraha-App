import { User } from "../../DB/model/user.model.js";
import schedule from "node-schedule";
import { deleteFolder } from "../cloud/cloudinary.config.js";
import { Message } from "../../DB/model/message.model.js";

export const scheduledDeletion = () => {
  schedule.scheduleJob("1 50 22 * * *", async () => {
  const users = await User.find({
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 }, // 3 months
  });
  for (const user of users) {
    if (user.profilePicture.public_id) {
      await deleteFolder(`saraha/users/${user._id}`);
    }
  }
  await User.deleteMany({ 
    deletedAt: { $lte: Date.now() - 3 * 30 * 24 * 60 * 60 * 1000 } // 3 months
   });  
  await Message.deleteMany({ 
    receiver: { $in: users.map((user) => user._id) }
   }); 
   console.log("Deleted users");
  });
};
