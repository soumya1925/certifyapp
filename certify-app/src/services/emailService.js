const nodemailer = require("nodemailer");

console.log("📧 EMAIL DEBUG");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}...@gmail.com` : 'Not set');
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

/**
 * SMTP transporter configuration optimized for certificate emails
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Timeout settings for Render
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 15000,
  dnsTimeout: 10000,
  // Security
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  // Debug
  logger: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production'
});

/**
 * Verify SMTP connection on startup (non-blocking)
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("⚠️ SMTP VERIFY FAILED:");
    
    // Friendly error messages
    if (error.code === 'ETIMEDOUT') {
      console.error("Timeout connecting to Gmail SMTP");
      console.error("This is normal on Render - emails will still be attempted");
    } else if (error.code === 'EAUTH') {
      console.error("Gmail authentication failed");
      console.error("Please check:");
      console.error("1. EMAIL_USER is correct");
      console.error("2. EMAIL_PASS is an 'App Password' (not your regular password)");
      console.error("3. 2-Step Verification is enabled in Google Account");
      console.error("Get App Password: https://myaccount.google.com/apppasswords");
    } else {
      console.error("Error:", error.message);
    }
  } else {
    console.log("✅ SMTP SERVER IS READY");
  }
});

/**
 * Send certificate email with PDF attachment
 * @param {string} toEmail - Recipient email
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {Buffer} jpgBuffer - JPG buffer (optional)
 */
const sendCertificateEmail = async (toEmail, pdfBuffer, jpgBuffer) => {
  console.log("📨 Preparing email to:", toEmail);
  console.log("📎 PDF attachment size:", Math.round(pdfBuffer.length / 1024), "KB");

  try {
    const mailOptions = {
      from: `"Certificate System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your GST Registration Certificate",
      text: `Dear Recipient,

Your GST Registration Certificate has been generated successfully.

Please find your certificate attached in PDF format.

Certificate Details:
- This is an official certificate of registration
- Please keep this document for your records
- The PDF is digitally generated and valid

Thank you for using our service.

Best regards,
Certificate System
`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 5px 5px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .button { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📜 Your Certificate is Ready!</h1>
    </div>
    <div class="content">
        <p>Dear Recipient,</p>
        
        <p>Your <strong>GST Registration Certificate</strong> has been generated successfully and is attached to this email.</p>
        
        <p><strong>What's included:</strong></p>
        <ul>
            <li>Official Certificate of Registration (PDF)</li>
            <li>Professionally formatted document</li>
            <li>Ready for printing and records</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Download the attached PDF certificate</li>
            <li>Save it for your business records</li>
            <li>Print a copy for physical filing if needed</li>
        </ol>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        <strong>Certificate System</strong></p>
    </div>
    <div class="footer">
        <p>This is an automated email. Please do not reply to this address.</p>
        <p>Certificate generated on: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
`,
      attachments: [
        { 
          filename: `GST_Certificate_${Date.now()}.pdf`, 
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Add JPG attachment only if it's not a placeholder
    if (jpgBuffer && jpgBuffer.length > 100 && !jpgBuffer.toString().includes('placeholder')) {
      mailOptions.attachments.push({
        filename: `Certificate_Preview_${Date.now()}.jpg`,
        content: jpgBuffer,
        contentType: 'image/jpeg'
      });
      console.log("📎 JPG attachment added:", Math.round(jpgBuffer.length / 1024), "KB");
    }

    // Send email with timeout protection
    console.log("✉️ Sending email...");
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout (25s)')), 25000);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);

    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("📫 Message ID:", info.messageId);
    console.log("👤 Sent to:", toEmail);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: toEmail,
      sentAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ EMAIL SENDING FAILED:", error.message);
    
    // Don't throw error - certificate was generated successfully
    // Just log and return failure info
    console.log("⚠️ Email failed but certificate was generated");
    
    return {
      success: false,
      error: error.message,
      recipient: toEmail,
      attemptedAt: new Date().toISOString(),
      note: "Certificate was generated but email delivery failed"
    };
  }
};

/**
 * Test email function (optional)
 */
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email connection test passed");
    return true;
  } catch (error) {
    console.error("❌ Email connection test failed:", error.message);
    return false;
  }
};

module.exports = {
  sendCertificateEmail,
  testEmailConnection
};