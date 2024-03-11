import express from 'express';
import dotenv from 'dotenv';
import contactUsRoutes from './routes/contactUs.js';
import cookieParser from 'cookie-parser';
import path from 'path';

dotenv.config();

const __dirname = path.resolve();
const app = express();

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log("Server is Running on port: ", port);
});

app.get("/api/test", (req, res) => {
    res.status(200).send("Test is Successfull!")
});

app.use("/api/contactUs", contactUsRoutes);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
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