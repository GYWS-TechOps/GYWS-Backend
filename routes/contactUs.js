import express from "express";
import nodemailer from 'nodemailer';

const router = express.Router();

router.post("/", async (req, res, next) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'josaacounsellors@gmail.com',
                pass: process.env.MAIL
            }
        })
        const mailOptions = {
            from: 'josaacounsellors@gmail.com',
            to: process.env.ADMIN_MAIL,
            subject: `${req.body.firstName} through GYWS Website`,
            html: `User ${req.body.firstName} ${req.body.lastName} has sent this message for you. <br><br> <b>Message:</b> ${req.body.message} <br> <br> <b>Contact him back here:</b> <br> Email: ${req.body.email} <br> Phone No.: ${req.body.phone}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            res.status(200).json({
                message: "Mail sent successfully",
                status: "success"
            });
        })
    } catch (error) {
        next(error);
    }
})

export default router;