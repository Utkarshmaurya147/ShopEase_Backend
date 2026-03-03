const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use a Google "App Password", not your login password
  },
});


// --- NEW: Verification Email ---
const sendVerificationEmail = async (userEmail, otpCode) => {
  const mailOptions = {
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify your ShopEase Account",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 32px; text-align: center;">
        <div style="background-color: #eff6ff; width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
           <span style="font-size: 32px;">🛡️</span>
        </div>
        <h2 style="color: #0f172a; margin-bottom: 8px;">Verify your email</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 32px;">Enter this 6-digit code to activate your ShopEase account. It expires in 10 minutes.</p>
        
        <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; border-radius: 16px; margin-bottom: 32px;">
          <h1 style="color: #2563eb; font-size: 40px; letter-spacing: 12px; margin: 0; font-family: monospace;">${otpCode}</h1>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

const sendOrderEmail = async (userEmail, orderDetails) => {
  const mailOptions = {
    from: `"ShopEase" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Order Confirmed! #${orderDetails.id.slice(0, 8)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
        <h2 style="color: #2563eb;">Thanks for your order!</h2>
        <p>Hi there, we've received your order and are getting it ready.</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p><strong>Order ID:</strong> ${orderDetails.id}</p>
        <p><strong>Total Amount:</strong> $${parseFloat(orderDetails.totalAmount).toFixed(2)}</p>
        <p><strong>Shipping to:</strong> ${orderDetails.address}</p>
        <br />
        <div style="text-align: center;">
          <a href="http://localhost:3000/orders" style="background: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block;">View Order Status</a>
        </div>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

const sendSupportEmail = async (data) => {
  const mailOptions = {
    from: `"ShopEase Support" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // You receive the customer's message
    subject: `Support Ticket: ${data.subject}`,
    html: `
      <h3>New Customer Inquiry</h3>
      <p><strong>From:</strong> ${data.name} (${data.email})</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendOrderEmail, sendSupportEmail, sendVerificationEmail};