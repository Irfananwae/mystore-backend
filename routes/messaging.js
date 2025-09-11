// in routes/messaging.js

const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const sgMail = require('@sendgrid/mail');

// Initialize clients with keys from .env file
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// --- NEW ROUTE TO SEND BULK SMS ---
router.post('/send-sms', async (req, res) => {
    const { phoneNumbers, message } = req.body; // Expect an array of numbers and a message

    if (!phoneNumbers || phoneNumbers.length === 0 || !message) {
        return res.status(400).json({ message: "Phone numbers and message are required." });
    }

    const promises = phoneNumbers.map(number => {
        return twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: number
        });
    });

    try {
        await Promise.all(promises);
        res.status(200).json({ message: "SMS messages sent successfully!" });
    } catch (error) {
        console.error("SMS Sending Error:", error);
        res.status(500).json({ message: "Failed to send SMS messages." });
    }
});

// --- NEW ROUTE TO SEND BULK EMAIL ---
router.post('/send-email', async (req, res) => {
    const { emails, subject, body } = req.body; // Expect an array of emails, a subject, and a body

    if (!emails || emails.length === 0 || !subject || !body) {
        return res.status(400).json({ message: "Emails, subject, and body are required." });
    }

    const msg = {
        to: emails, // SendGrid handles bulk emails in the 'to' field
        from: 'your-verified-sender@example.com', // YOU MUST VERIFY A SENDER IN SENDGRID
        subject: subject,
        text: body,
        // html: '<strong>and easy to do anywhere, even with Node.js</strong>', // You can also send HTML
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Email Sending Error:", error);
        res.status(500).json({ message: "Failed to send emails." });
    }
});

module.exports = router;
