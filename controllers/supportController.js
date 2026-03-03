const { sendSupportEmail } = require("../utils/emailService");

exports.handleContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    // Send email to admin
    await sendSupportEmail({ name, email, subject, message });

    res.status(200).json({ success: true, message: "Support ticket received" });
  } catch (error) {
    console.error("Support Error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
};