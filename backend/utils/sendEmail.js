const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'portaljob54@gmail.com', // ⚠️ REPLACE WITH YOUR EMAIL
                pass: 'ayvz ftly hubj cyli'     // ⚠️ REPLACE WITH YOUR APP PASSWORD
            }
        });

        await transporter.sendMail({
            from: '"Job Portal" <portaljob54@gmail.com>',
            to: email,
            subject: 'Your Verification OTP',
            text: `Your OTP for registration is: ${otp}. It expires in 5 minutes.`
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email not sent", error);
    }
};

module.exports = sendEmail;