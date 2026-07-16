const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

// Set DNS servers to Google and Cloudflare to bypass local network DNS timeouts
dns.setServers(['8.8.8.8', '1.1.1.1']);

const sendEmail = async (email, otp) => {
    try {
        // Write OTP to a local file for easy development debugging
        const logPath = path.join(__dirname, '../otp-debug.log');
        const logMessage = `[${new Date().toISOString()}] Email: ${email} - OTP: ${otp}\n`;
        fs.appendFileSync(logPath, logMessage);
        
        console.log(`[OTP DEBUG] OTP for ${email} is: ${otp} (Logged to backend/otp-debug.log)`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'portaljob54@gmail.com', // ⚠️ REPLACE WITH YOUR EMAIL
                pass: 'wljn gowl wrnt mlsu'     // ⚠️ REPLACE WITH YOUR APP PASSWORD
            },
            lookup: (hostname, options, callback) => {
                dns.resolve4(hostname, (err, addresses) => {
                    if (err || !addresses || addresses.length === 0) {
                        dns.lookup(hostname, options, (lookupErr, address) => {
                            if (lookupErr) {
                                if (hostname === 'smtp.gmail.com') {
                                    console.log("[SMTP DNS Fallback] Using Google SMTP IP: 142.251.10.108");
                                    callback(null, '142.251.10.108', 4);
                                } else {
                                    callback(lookupErr);
                                }
                            } else {
                                callback(null, address, 4);
                            }
                        });
                    } else {
                        callback(null, addresses[0], 4);
                    }
                });
            },
            tls: {
                servername: 'smtp.gmail.com'
            }
        });

        await transporter.sendMail({
            from: '"Job Portal" <portaljob54@gmail.com>',
            to: email,
            subject: 'Your Verification OTP',
            text: `Your OTP for verification is: ${otp}. It expires in 5 minutes.`
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("Email not sent", error);
    }
};

module.exports = sendEmail;