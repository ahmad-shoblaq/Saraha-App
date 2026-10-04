import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import { connectDB } from "./DB/connection.js";
import cors from "cors";
import fs from "fs";
import { rateLimit } from "express-rate-limit";
import { globalErrorHandler } from "./utils/error/index.js";

export function bootstrap(app,express) {
    // Parse req body (raw json)
    app.use(express.json());
    
    // Serve static files
    app.use("/uploads", express.static("uploads"));
    
    app.use(
        cors({
            origin: "*"
        })
    );
    
    // Rate limiting
    const limit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 8, // limit each IP to 8 requests per windowMs
        handler: (req,res, next, options) => {
            throw new Error(options.message, { cause: options.statusCode });
        },
        legacyHeaders: true
        // ,
        // standardHeaders: true
    })
    app.use(limit);
    
    // Routes
    app.use("/auth", authRouter);
    app.use("/message", messageRouter);
    app.use("/user", userRouter); 

    // Global error handler
    app.use(globalErrorHandler);
    
    // Connection to DB
    connectDB();
}
