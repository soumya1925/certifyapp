const express = require("express");
const router = express.Router();

const { generateCertificate } = require("../services/certificateService");
const { sendCertificateEmail } = require("../services/emailService");

// POST /api/generate-certificate
router.post("/generate-certificate", async (req, res) => {
  try {
    const { name, email, gstNumber, businessName, businessAddress } = req.body;

    // Validation
    if (!name || !email || !gstNumber || !businessName || !businessAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 1️ Generate certificate 
    const { pdfBuffer, jpgBuffer } = await generateCertificate({
      name,
      gstNumber,
      businessName,
      businessAddress
    });

    //  Respond immediately (avoid Render timeout)
    res.status(200).json({
      message: "Certificate generated successfully",
      pdfSize: pdfBuffer.length,
      jpgSize: jpgBuffer.length
    });

    //  Sending email AFTER response (non-blocking)
    sendCertificateEmail(email, pdfBuffer, jpgBuffer)
      .then(() => {
        console.log(" Certificate email sent to:", email);
      })
      .catch((err) => {
        console.error(" Email sending failed:", err.message);
      });

  } catch (error) {
    console.error("❌ Certificate generation failed:", error);

    res.status(500).json({
      message: "Certificate generation failed",
      error: error.message
    });
  }
});

module.exports = router;
