# Certificate Generator

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

Brevo (formerly SendinBlue) provides the email delivery infrastructure that allows your certificate application to send emails with PDF attachments. Without Brevo, your app can generate certificates but   cannot   deliver them to users.

**Issue with nodemailer and Puppeteer an alternative to using Brevo**
- EMAIL SENDING FAILED:  SMTP Connection Timeouts
- SMTP needs persistent connections
- Render blocks outgoing SMTP ports (587, 465)
- Trying fallback configuration...
- Fallback also failed: Connection timeout


**Nodemailer (Failed Approach):**
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

**Brevo (Working Solution):**

This works on Render - uses standard HTTPS
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
**Quick Installation**
```bash
git clone https://github.com/soumya1925/certifyapp.git
cd certifyapp/certify-app
```
**Install Dependencies**
```
npm install express                      (Express.js is used to create the RESTful API and handle HTTP requests and routes.)
npm install dotenv                       (Loads environment variables from a .env file into process.env.)
npm install html-pdf                     (Generates professional PDF certificates from HTML templates.)
npm install canvas                       (Creates JPG preview images of the generated tax certificates.)
npm install @getbrevo/brevo              (Integrates Brevo (SendinBlue) to send certificate emails with attachments.)
npm install --save-dev nodemon           (Automatically restarts the server during development when code changes.)
```
**Or install all at once**
```
npm install express dotenv html-pdf canvas @getbrevo/brevo
npm install --save-dev nodemon
```
**Get Brevo API Key**

- Sign up at Brevo.com (free tier available)
- Go to SMTP & API → API Keys
- Click "Generate a new API key"
- Name it "Certificate App" and copy the key (starts with xkeysib-)
- Add this key to your .env file as BREVO_API_KEY

**Verify Sender Email**
- In Brevo dashboard, go to Senders & IP → Senders
- Click "Create a new sender"
- Add your email address (e.g., monturoul@gmail.com)
- Click the verification link sent to your email
- Use this verified email in .env as BREVO_SENDER_EMAIL

**Setting up env variables**
- Craete a .env file in the root directory as described in the project structure
- .env must contain the following:

 ```
# Required: Brevo Email Service
BREVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_email@gmail.com
```

**package.json**
- Ensure all dependencies are installed
- Make sure this is present to start the application :

 ```
"start": "node src/index.js",
 "dev": "nodemon src/index.js",
 ```
**App start command**
- run the app , by npm start/ npm run dev
- you must see something like this in the terminal

 ```
> certify-app@1.0.0 dev
> nodemon src/index.js

[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/index.js`
[dotenv@17.2.3] injecting env (2) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops
 Email Service Initialized - Using Brevo
Server running on http://localhost:3000
 ```

- test the link in the postman if runs successfully on local 
- on postman create a post request with url http://localhost:3000/api/generate-certificate
- attach a json body with it like

 ```
{
  "name": "Your name",
  "email": "yourmail@gmail.com",
  "gstNumber": "29ABCDE1234F1Z5",
  "businessName": "Deployment",
  "businessAddress": "Bangalore, Karnataka, India"
}
 ```

**Sucessful response**
 ```
{
    "message": "Certificate generated successfully",
    "pdfSize": 17597,
    "jpgSize": 70229
}
 ```
**Error response**
 ```
{
    "message": "Certificate generation failed",
    "error": "Connection timeout"
}

 ```

## 📋 Sample Certificate on sucessful response
- Jpg file
[📥 Download Sample Certificate jpg](https://drive.google.com/uc?export=download&id=1g44IbEDcQQ49iH2WBK1ylhIwfhoFxhvo)

## Contact

If you encounter any issues with the API or have suggestions for improvements:
Email: soumyaroul19@gmail.com
