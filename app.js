const dotenv = require("dotenv");
const cors = require("cors");
const express =require ('express');
const contactUsRoutes = require("./routes/contactUs");
const cookieParser = require("cookie-parser");
const MailerRoute = require("./routes/Mailer")

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log("Server is Running on port: ", port);
});

app.use("/api/contactUs", contactUsRoutes);
app.use("/api/Mail", MailerRoute)

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

