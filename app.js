import {connect} from "mongoose"
import { config } from "dotenv";
import cors from "cors";
import express, { json } from 'express';
import contactUsRoutes from "./routes/contactUs.js";
import cookieParser from "cookie-parser";
import MailerRoute from "./routes/Mailer.js";
import adminsRouter from "./routes/admins.js"
config();
const app = express();

app.use(json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log("Server is Running on port: ", port);
});

app.use("/api/contactUs", contactUsRoutes);
app.use("/api/Mail", MailerRoute)

// Connect to MongoDB Atlas
const uri = process.env.ATLAS_URI;
connect(uri)
    .then(() => console.log("MongoDB database connection established successfully"))
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err.message);
        console.error("Stack trace:", err.stack);
    });

// Use the admins router
app.use("/admins", adminsRouter);
 
app.get("/", (req, res) => {
    res.send("HAPPY MOMENT! :) GYWS Backend Server is running...");
  });

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error!";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
});

