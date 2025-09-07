const sendMail = require('../utils/mailer');

exports.sendMailController = async (req, res) => {
    const { to, subject, text, html } = req.body;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully', info });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
};
