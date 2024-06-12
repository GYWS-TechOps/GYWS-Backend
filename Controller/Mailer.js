const nodemailer = require("nodemailer");
const Mail = (req, res) => {
    const { Name, RECIEVER_MAILS, MAIL_BODY, MAIL_SUBJECT, EMAIL, EMAIL_APP_PASSWORD } = req.body;
    const files = req.files;
    const receiveremails = JSON.parse(RECIEVER_MAILS);
    // console.log(receiveremails)
    // console.log(files); 
    let config = {
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: EMAIL_APP_PASSWORD,
      },
    };
  
    let transporter = nodemailer.createTransport(config);
  
    // console.log(MAIL_BODY)
    let attachments = files.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
    }));
   
    let emailPromises = receiveremails.map((receiveremail, i) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          let message = {
            from: {
              name: Name,
              address: EMAIL
            },
            to: receiveremails[i],
            subject: MAIL_SUBJECT,
            html: `<div style="white-space: pre-wrap;">${MAIL_BODY}</div>`,
            attachments: attachments,
          };
          transporter.sendMail(message, (error, info) => {
            if (error) {
              console.log(`Error occurred while sending email to ${receiveremail}: ${error.message}`);
              reject(error);
            } else {
              console.log(`Email sent to ${receiveremail}: ${info.response}`);
              resolve(info);
            }
          });
        }, i * 10000); // Delay of 10 seconds
      });
    });
    
    Promise.all(emailPromises)
    .then(() => {
      return res.status(201).json({
        msg: "Check Mail",
      });
    })
    .catch((error) => {
      return res.status(404).json({
        msg: "Error Occured",
      });
    });
  };
  
  module.exports = {
    Mail,
  };
  