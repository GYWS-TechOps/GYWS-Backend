import { Router } from 'express';
import { createTransport } from "nodemailer";
const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const transporter = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'server@gyws.org',
                pass: process.env.MAIL
            }
        })
        const mailOptions = {
            from: 'server@gyws.org',
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

export default router;
