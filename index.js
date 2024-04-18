const express = require('express');
const resend = require('resend');

const app = express();
const port = 3000; // You can change this to your desired port

const resendClient = new resend.Resend('YOUR API KEY FROM https://resend.com/');


const verificationCodes = new Map();

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

app.get('/api/email/:email', (req, res) => {
    const { email } = req.params;

    const verificationCode = generateVerificationCode();

    const emailMessage = {
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Email Verification',
        html: `<p>Your verification code is: ${verificationCode}</p>`
    };

    resendClient.emails.send(emailMessage)
        .then(response => {
            console.log('Email sent:', response);
            verificationCodes.set(email, verificationCode);
            res.send('Email sent successfully!');
        })
        .catch(error => {
            console.error('Error sending email:', error);
            res.status(500).send('Failed to send email');
        });
});

app.get('/api/verify/:email/:code', (req, res) => {
    const { email, code } = req.params;


    if (verificationCodes.has(email) && verificationCodes.get(email) == code) {
        // Verification successful
        verificationCodes.delete(email);
        res.send('Email verification successful!');
    } else {
        
        res.status(400).send('Invalid verification code');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
