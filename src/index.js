import express from "express";
import { bootstrap } from "./app.controller.js";
import dotenv from "dotenv";
import { scheduledDeletion } from "./utils/cron-job/index.js";

dotenv.config({ path: "./configs/local.env" });

const app = express();
const port = process.env.PORT;

bootstrap(app, express);
scheduledDeletion();
app.listen(port, () => {
  console.log("Server running on port", port);
});


