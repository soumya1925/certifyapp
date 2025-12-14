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
