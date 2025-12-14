# Tax Certificate Generator

A professional GST/Tax Certificate Generation API that creates PDF certificates, generates preview images, and sends them via email. Built with Node.js and Express, and deployed on Render.

---

## Live Demo 

**Base URL**  
https://taxcertificate.onrender.com

**API Endpoint**  
POST https://taxcertificate.onrender.com/api/generate-certificate

---

## Features

- Generate professional PDF tax certificates
- Create JPG preview images
- Email delivery with attachments
- RESTful API design
- Production-ready deployment
- CORS enabled
- Error handling and logging

---

## Tech Stack

- **Backend:** Node.js, Express.js
- **PDF Generation:** html-pdf
- **Image Creation:** canvas
- **Email Service:** Brevo (SendinBlue)
- **Deployment:** Render
- **Environment Variables:** dotenv

---

## Project Structure
```
certify-app/
├── src/
│   ├── index.js                   # Main server file
│   ├── routes/
│   │   └── certificateRoutes.js   # API routes
│   ├── services/
│   │   ├── certificateService.js  # PDF/JPG generation
│   │   └── emailService.js        # Email sending (Brevo)
│   └── templates/
│       └── certificate.html       # Certificate template
├── package.json
├── .env.example
└── README.md

```


## 🛠️ API Usage /Testing VIA POSTMAN (RECOMMENDED)

### Generate Certificate

**Endpoint**

```http
POST https://taxcertificate.onrender.com/api/generate-certificate
```

Content-Type: application.json
Request Body :json
```Raw data:
{
  "name": "Sam Ranjan",
  "email": "rsoumya150@gmail.com",
  "gstNumber": "29ABCDE1234F1Z5",
  "businessName": "Deployment",
  "businessAddress": "Bangalore, Karnataka, India"
}
```
**Successful Response (200 OK)**
```
{
  "message": "Certificate generated successfully",
  "pdfSize": 17408,
  "jpgSize": 70656,
  "emailStatus": "sent"
}
```

**Error Response (400 / 500)**
```
{
  "error": "All fields are required"
}
```

**Testing with cURL**
bash
```
curl -X POST https://taxcertificate.onrender.com/api/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sam Ranjan",
    "email": "rsoumya150@gmail.com",
    "gstNumber": "29ABCDE1234F1Z5",
    "businessName": "Deployment",
    "businessAddress": "Bangalore, Karnataka, India"
  }'
```

## Installation & Setup Guide

**Prerequisites**
- Node.js (version 18 or higher)
- npm (Node Package Manager)
- Git (for version control)
- Brevo Account (for email service) - Sign up free

**Purpose of Brevo Account**
 Brevo (formerly SendinBlue) provides the email delivery infrastructure that allows your certificate application to send emails with PDF attachments. Without Brevo, your app can generate certificates but cannot   deliver them to users.

**Issue with nodemailer and Puppeteer**
- EMAIL SENDING FAILED:  SMTP Connection Timeouts
- SMTP needs persistent connections
- Render blocks outgoing SMTP ports (587, 465)
- Trying fallback configuration...
- Fallback also failed: Connection timeout

**Deployment relates isssues with render while working with   Puppeteer/Chrome Installation**
-❌ Certificate generation failed: Error: Could not find Chrome (ver. 143.0.7499.42)
-This can occur if either:
  -1. you did not perform an installation before running the script
  -2. your cache path is incorrectly configured

** Nodemailer (Failed Approach): **
```
// This failed on Render due to network restrictions
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // ❌ Blocked by Render firewall
  port: 587,               // ❌ SMTP port restricted
  auth: {
    user: "your@gmail.com",
    pass: "your-password"  // ❌ App passwords still timeout
  }
});
// Result: ❌ Connection timeout every time
```

** Brevo (Working Solution): **
// This works on Render - uses standard HTTPS
```
const response = await fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'api-key': 'your_brevo_key',  // ✅ Simple API key
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(emailData)  // ✅ Plain JSON over HTTPS
});
// Result: ✅ Email sent successfully
```

### 📥 Clone the Repository

```bash
git clone https://github.com/soumya1925/certifyapp.git
cd certifyapp/certify-app
