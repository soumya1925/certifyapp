const Brevo = require('@getbrevo/brevo');

console.log("📧 Email Service Initialized - Using Brevo");

/**
 * Send certificate email using Brevo
 */
const sendCertificateEmail = async (toEmail, pdfBuffer, jpgBuffer) => {
  console.log(`📨 Sending to: ${toEmail}`);
  console.log(`📎 PDF size: ${Math.round(pdfBuffer.length / 1024)}KB`);

  try {
    console.log("✉️ Attempting Brevo send...");
    
    // METHOD 1: Direct API call (Most reliable)
    return await sendViaDirectAPI(toEmail, pdfBuffer, jpgBuffer);
    
  } catch (error) {
    console.error("❌ Email failed:", error.message);
    
    return {
      success: false,
      error: error.message,
      recipient: toEmail,
      attemptedAt: new Date().toISOString(),
      note: "Certificate was generated successfully"
    };
  }
};

/**
 * METHOD 1: Direct HTTP API call (most reliable)
 */
async function sendViaDirectAPI(toEmail, pdfBuffer, jpgBuffer) {
  console.log("📡 Using direct HTTP API...");
  
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY not set in environment variables');
  }
  
  // Prepare email data
  const emailData = {
    sender: {
      name: "Certificate System",
      email: process.env.BREVO_SENDER_EMAIL || "monturoul@gmail.com"
    },
    to: [{ email: toEmail }],
    subject: "Your GST Registration Certificate",
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 25px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📜 Certificate Ready!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">GST Registration Certificate</p>
        </div>
        <div class="content">
            <p>Dear Recipient,</p>
            <p>Your <strong>GST Registration Certificate</strong> has been generated successfully.</p>
            <p><strong>What's included:</strong></p>
            <ul>
                <li>Official Certificate (PDF)</li>
                <li>Certificate preview (JPG)</li>
            </ul>
            <p><strong>Next steps:</strong></p>
            <ol>
                <li>Download the attached PDF certificate</li>
                <li>Save it for your business records</li>
                <li>Print if needed</li>
            </ol>
            <p>Best regards,<br><strong>Certificate System</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`,
    textContent: `Dear Recipient,

Your GST Registration Certificate has been generated successfully.

Please find your certificate attached in PDF format.

Thank you for using our service.

Best regards,
Certificate System`,
    attachment: [
      {
        name: `GST_Certificate_${Date.now()}.pdf`,
        content: pdfBuffer.toString('base64')
      }
    ]
  };

  // Add JPG if available
  if (jpgBuffer && jpgBuffer.length > 100) {
    emailData.attachment.push({
      name: `Certificate_Preview_${Date.now()}.jpg`,
      content: jpgBuffer.toString('base64')
    });
  }

  // Make API call
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Brevo API error: ${JSON.stringify(data)}`);
  }

  console.log("✅ Email sent successfully via Brevo API!");
  console.log("📫 Message ID:", data.messageId);
  
  return {
    success: true,
    messageId: data.messageId,
    recipient: toEmail,
    sentAt: new Date().toISOString(),
    via: 'Brevo'
  };
}

/**
 * METHOD 2: Using Brevo SDK (Alternative)
 */
async function sendViaBrevoSDK(toEmail, pdfBuffer, jpgBuffer) {
  console.log("📦 Using Brevo SDK...");
  
  // Initialize Brevo client
  const apiInstance = new Brevo.TransactionalEmailsApi();
  
  // Configure API key
  apiInstance.apiClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;
  
  // Prepare email
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  
  sendSmtpEmail.sender = {
    name: "Certificate System",
    email: process.env.BREVO_SENDER_EMAIL || "monturoul@gmail.com"
  };
  sendSmtpEmail.to = [{ email: toEmail }];
  sendSmtpEmail.subject = "Your GST Registration Certificate";
  sendSmtpEmail.htmlContent = "<p>Your certificate is attached.</p>";
  sendSmtpEmail.textContent = "Your certificate is attached.";
  sendSmtpEmail.attachment = [
    {
      name: `certificate.pdf`,
      content: pdfBuffer.toString('base64')
    }
  ];
  
  const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
  
  console.log("✅ Email sent via Brevo SDK!");
  return {
    success: true,
    messageId: data.messageId,
    via: 'Brevo SDK'
  };
}

/**
 * Test email connection
 */
const testEmailConnection = async () => {
  try {
    console.log("Testing email connection...");
    
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error("❌ BREVO_API_KEY not set");
      return false;
    }
    
    console.log("✅ API Key configured");
    return true;
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    return false;
  }
};

module.exports = {
  sendCertificateEmail,
  testEmailConnection
};