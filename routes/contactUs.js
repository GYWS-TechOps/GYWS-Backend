const express = require('express');
const nodemailer = require("nodemailer");
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

            if (error) {
                res.status(500).json({
                    message: "Mail not sent",
                    status: false
                });
            }
            else {
                res.status(200).json({
                    message: "Mail sent successfully",
                    status: true
                });
            }
        })
    } catch (error) {
        next(error);
    }
})

module.exports = router;