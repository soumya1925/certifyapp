const pdf = require('html-pdf');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require("fs");
const path = require("path");

exports.generateCertificate = async (data) => {
  const templatePath = path.join(__dirname, "../templates/certificate.html");
  
  console.log('📄 Loading template from:', templatePath);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('Certificate template not found');
  }
  
  let html = fs.readFileSync(templatePath, "utf8");
  console.log('✅ Template loaded successfully');

  // Replace template variables
  const replacements = {
    name: data.name || '',
    businessName: data.businessName || '',
    gstNumber: data.gstNumber || '',
    businessAddress: data.businessAddress || ''
  };

  Object.entries(replacements).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  console.log('🚀 Starting certificate generation...');
  
  try {
    // 1. Generate PDF using html-pdf
    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await new Promise((resolve, reject) => {
      const options = {
        format: 'A4',
        border: '0.5in',
        timeout: 30000
      };

      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          console.error('❌ PDF creation failed:', err.message);
          reject(err);
        } else {
          console.log(`✅ PDF created: ${Math.round(buffer.length / 1024)} KB`);
          resolve(buffer);
        }
      });
    });

    // 2. Generate JPG using canvas
    console.log('📸 Creating JPG with canvas...');
    let jpgBuffer;
    
    try {
      // Create canvas (800x600 pixels for preview)
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext('2d');
      
      // Set background color (white)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8f9fa');
      gradient.addColorStop(1, '#e9ecef');
      ctx.fillStyle = gradient;
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // Add border
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      // Add inner border
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
      
      // Add title
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 32px "Arial"';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF REGISTRATION', canvas.width / 2, 80);
      
      // Add subtitle
      ctx.fillStyle = '#3498db';
      ctx.font = 'italic 20px "Arial"';
      ctx.fillText('GST Registration Certificate', canvas.width / 2, 115);
      
      // Add decorative line
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 100, 130);
      ctx.lineTo(canvas.width / 2 + 100, 130);
      ctx.stroke();
      
      // Add certificate content
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 18px "Arial"';
      ctx.textAlign = 'left';
      
      let yPosition = 180;
      
      // Function to add field
      const addField = (label, value, isImportant = false) => {
        // Label
        ctx.fillStyle = '#34495e';
        ctx.font = 'bold 16px "Arial"';
        ctx.fillText(`${label}:`, 50, yPosition);
        
        // Value
        ctx.fillStyle = isImportant ? '#2c3e50' : '#2c3e50';
        ctx.font = isImportant ? 'bold 18px "Arial"' : '16px "Arial"';
        
        // Handle long text
        let lines = [];
        const maxWidth = 650;
        const words = value.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word + ' ';
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Draw each line
        lines.forEach((line, index) => {
          ctx.fillText(line, 200, yPosition + (index * 25));
        });
        
        yPosition += (lines.length * 25) + 10;
      };
      
      // Add fields
      addField('Certificate Holder', data.name || 'Not Provided', true);
      addField('Business Name', data.businessName || 'Not Provided');
      addField('GST Number', data.gstNumber || 'Not Provided');
      addField('Business Address', data.businessAddress || 'Not Provided');
      
      // Add "This certifies that" text
      yPosition += 20;
      ctx.fillStyle = '#7f8c8d';
      ctx.font = 'italic 16px "Arial"';
      ctx.textAlign = 'center';
      ctx.fillText('This certifies registration under the GST Act', canvas.width / 2, yPosition);
      
      // Add signature area
      yPosition += 60;
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width - 250, yPosition);
      ctx.lineTo(canvas.width - 50, yPosition);
      ctx.stroke();
      
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 14px "Arial"';
      ctx.textAlign = 'right';
      ctx.fillText('Authorized Signatory', canvas.width - 50, yPosition + 20);
      
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '12px "Arial"';
      ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, canvas.width - 50, yPosition + 40);
      
      // Add certificate ID
      ctx.fillStyle = '#95a5a6';
      ctx.font = '10px "Arial"';
      ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: CERT-${Date.now().toString().slice(-8)}`, canvas.width / 2, canvas.height - 20);
      
      // Convert canvas to JPEG buffer
      jpgBuffer = canvas.toBuffer('image/jpeg', {
        quality: 0.9,
        chromaSubsampling: false
      });
      
      console.log(`✅ JPG created with canvas: ${Math.round(jpgBuffer.length / 1024)} KB`);
      
    } catch (jpgError) {
      console.error('❌ Canvas JPG generation failed:', jpgError.message);
      console.log('🔄 Creating ASCII art fallback...');
      
      // Fallback to ASCII art
      const asciiCertificate = `
╔══════════════════════════════════════════════════════╗
║                CERTIFICATE PREVIEW                   ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║   ┌──────────────────────────────────────────────┐   ║
║   │           CERTIFICATE OF REGISTRATION        │   ║
║   │              GST Registration                │   ║
║   │                                              │   ║
║   │  📋 Certificate Holder:                      │   ║
║   │     ${(data.name || '').padEnd(40, ' ')}│   ║
║   │                                              │   ║
║   │  🏢 Business Name:                           │   ║
║   │     ${(data.businessName || '').padEnd(40, ' ')}│   ║
║   │                                              │   ║
║   │  🔢 GST Number:                              │   ║
║   │     ${(data.gstNumber || '').padEnd(40, ' ')}│   ║
║   │                                              │   ║
║   │  📍 Business Address:                        │   ║
║   │     ${(data.businessAddress || '').substring(0, 40).padEnd(40, ' ')}│   ║
║   │                                              │   ║
║   │  📅 Generated: ${new Date().toLocaleDateString().padEnd(30, ' ')}│   ║
║   └──────────────────────────────────────────────┘   ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
      `;
      
      jpgBuffer = Buffer.from(asciiCertificate);
    }

    console.log('🎉 Certificate generation complete!');
    return { 
      pdfBuffer, 
      jpgBuffer,
      metadata: {
        name: data.name,
        gstNumber: data.gstNumber,
        generatedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Simple fallback
    try {
      const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(`
          <html><body style="padding:40px;">
            <h1>CERTIFICATE</h1>
            <p>Name: ${data.name}</p>
            <p>Business: ${data.businessName}</p>
            <p>GST: ${data.gstNumber}</p>
            <p>Address: ${data.businessAddress}</p>
          </body></html>
        `, { format: 'A4' }).toBuffer((err, buffer) => {
          if (err) reject(err);
          else resolve(buffer);
        });
      });
      
      const jpgBuffer = Buffer.from('Certificate Preview');
      return { pdfBuffer, jpgBuffer };
      
    } catch (fallbackError) {
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }
};