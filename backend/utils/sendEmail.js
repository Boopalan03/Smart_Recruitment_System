const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (email, otp) => {
    try {
        // Write OTP to local file for debugging (wrapped in try/catch for cloud environments)
        try {
            const logPath = path.join(__dirname, '../otp-debug.log');
            const logMessage = `[${new Date().toISOString()}] Email: ${email} - OTP: ${otp}\n`;
            fs.appendFileSync(logPath, logMessage);
        } catch (logErr) {
            console.log("[OTP Debug Log Warning]", logErr.message);
        }

        console.log(`[OTP DEBUG] OTP for ${email} is: ${otp}`);

        const emailUser = process.env.EMAIL_USER || 'portaljob54@gmail.com';
        const emailPass = process.env.EMAIL_PASS || 'wljn gowl wrnt mlsu';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        await transporter.sendMail({
            from: `"Job Portal" <${emailUser}>`,
            to: email,
            subject: 'Your Verification OTP',
            text: `Your OTP for verification is: ${otp}. It expires in 5 minutes.`
        });

        console.log("Email sent successfully to", email);
        return true;
    } catch (error) {
        console.error("Email not sent error:", error.message);
        throw error;
    }
};

module.exports = sendEmail;