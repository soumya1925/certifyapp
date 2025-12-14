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


## 🛠️ API Usage

### Generate Certificate

**Endpoint**

```http
POST /api/generate-certificate
Request Headers
http
Copy code
Content-Type: application/json
Request Body
json
Copy code
{
  "name": "Sam Ranjan",
  "email": "rsoumya150@gmail.com",
  "gstNumber": "29ABCDE1234F1Z5",
  "businessName": "Deployment",
  "businessAddress": "Bangalore, Karnataka, India"
}
```
Successful Response (200 OK)
json
Copy code
{
  "message": "Certificate generated successfully",
  "pdfSize": 17408,
  "jpgSize": 70656,
  "emailStatus": "sent"
}
Error Response (400 / 500)
json
Copy code
{
  "error": "All fields are required"
}
🧪 Testing
Testing with cURL
bash
Copy code
curl -X POST https://taxcertificate.onrender.com/api/generate-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sam Ranjan",
    "email": "rsoumya150@gmail.com",
    "gstNumber": "29ABCDE1234F1Z5",
    "businessName": "Deployment",
    "businessAddress": "Bangalore, Karnataka, India"
  }'
Testing with JavaScript (Fetch API)
javascript
Copy code
fetch('https://taxcertificate.onrender.com/api/generate-certificate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Sam Ranjan',
    email: 'rsoumya150@gmail.com',
    gstNumber: '29ABCDE1234F1Z5',
    businessName: 'Deployment',
    businessAddress: 'Bangalore, Karnataka, India'
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
