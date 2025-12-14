const pdf = require('html-pdf');
const fs = require("fs");
const path = require("path");

exports.generateCertificate = async (data) => {
  const templatePath = path.join(__dirname, "../templates/certificate.html");
  
  console.log('📄 Loading template from:', templatePath);
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Template not found at:', templatePath);
    throw new Error('Certificate template not found');
  }
  
  let html = fs.readFileSync(templatePath, "utf8");
  console.log('✅ Template loaded successfully');

  // Replace template variables with actual data
  const replacements = {
    name: data.name || '',
    businessName: data.businessName || '',
    gstNumber: data.gstNumber || '',
    businessAddress: data.businessAddress || ''
  };

  console.log('🔄 Replacing template variables:');
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    const beforeCount = (html.match(placeholder) || []).length;
    html = html.replace(placeholder, value);
    const afterCount = (html.match(placeholder) || []).length;
    
    console.log(`  • {{${key}}}: "${value.substring(0, 30)}${value.length > 30 ? '...' : ''}"`);
    console.log(`    (${beforeCount} → ${afterCount} occurrences)`);
  });

  // Verify all placeholders are replaced
  const remainingPlaceholders = html.match(/\{\{.*?\}\}/g);
  if (remainingPlaceholders) {
    console.log('⚠️ Warning: Some placeholders not replaced:', remainingPlaceholders);
  }

  console.log('🚀 Starting PDF generation...');
  
  try {
    // Generate PDF using html-pdf
    const pdfBuffer = await new Promise((resolve, reject) => {
      const options = {
        format: 'A4',
        orientation: 'portrait',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        type: 'pdf',
        quality: '100',
        timeout: 30000, // 30 second timeout
        // PhantomJS options
        phantomArgs: ['--ignore-ssl-errors=yes', '--ssl-protocol=any'],
        // Render delay to ensure CSS loads
        renderDelay: 500,
        // Base path for relative resources
        base: 'file://' + path.dirname(templatePath) + '/'
      };

      console.log('🖨️ Creating PDF...');
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          console.error('❌ PDF creation failed:', err.message);
          if (err.message.includes('phantomjs')) {
            console.error('PhantomJS error - ensure it can execute on the system');
          }
          reject(err);
        } else {
          const fileSizeKB = Math.round(buffer.length / 1024);
          console.log(`✅ PDF created successfully: ${fileSizeKB} KB`);
          
          // Optional: Save PDF for debugging
          if (process.env.NODE_ENV === 'development') {
            const debugPath = path.join(__dirname, '../../debug_certificate.pdf');
            fs.writeFileSync(debugPath, buffer);
            console.log(`📁 Debug PDF saved to: ${debugPath}`);
          }
          
          resolve(buffer);
        }
      });
    });

    // Create a simple JPG placeholder (text representation)
    const jpgText = `
      CERTIFICATE OF REGISTRATION
      
      Certificate Holder: ${data.name || ''}
      Business Name: ${data.businessName || ''}
      GST Number: ${data.gstNumber || ''}
      Business Address: ${data.businessAddress || ''}
      
      Generated: ${new Date().toLocaleString()}
      This is a text representation of the certificate.
    `;
    
    const jpgBuffer = Buffer.from(jpgText);

    console.log('🎉 Certificate generation complete!');
    return { 
      pdfBuffer, 
      jpgBuffer,
      metadata: {
        name: data.name,
        gstNumber: data.gstNumber,
        businessName: data.businessName,
        generatedAt: new Date().toISOString(),
        pdfSize: pdfBuffer.length,
        jpgSize: jpgBuffer.length
      }
    };
    
  } catch (error) {
    console.error('❌ Certificate generation error:', error.message);
    
    // Provide detailed error info
    console.log('\n🔍 Debug information:');
    console.log('1. Template path:', templatePath);
    console.log('2. Template exists:', fs.existsSync(templatePath));
    console.log('3. Template size:', html.length, 'characters');
    console.log('4. Current directory:', process.cwd());
    console.log('5. Node version:', process.version);
    
    // Try alternative PDF generation method
    console.log('\n🔄 Attempting alternative PDF generation...');
    try {
      // Create a very basic HTML as fallback
      const fallbackHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial; padding: 40px; }
                h1 { color: #333; text-align: center; }
                .certificate { border: 2px solid #000; padding: 30px; }
                .field { margin: 15px 0; }
                .label { font-weight: bold; }
                .value { margin-left: 20px; }
            </style>
        </head>
        <body>
            <div class="certificate">
                <h1>CERTIFICATE OF REGISTRATION</h1>
                <div class="field">
                    <span class="label">Certificate Holder:</span>
                    <span class="value">${data.name || ''}</span>
                </div>
                <div class="field">
                    <span class="label">Business Name:</span>
                    <span class="value">${data.businessName || ''}</span>
                </div>
                <div class="field">
                    <span class="label">GST Number:</span>
                    <span class="value">${data.gstNumber || ''}</span>
                </div>
                <div class="field">
                    <span class="label">Business Address:</span>
                    <span class="value">${data.businessAddress || ''}</span>
                </div>
                <div style="margin-top: 40px; text-align: right;">
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </body>
        </html>
      `;
      
      const pdfBuffer = await new Promise((resolve, reject) => {
        pdf.create(fallbackHTML, { 
          format: 'A4', 
          border: '0.5in',
          timeout: 10000 
        })
        .toBuffer((err, buffer) => {
          if (err) reject(err);
          else {
            console.log('✅ Fallback PDF generated:', buffer.length, 'bytes');
            resolve(buffer);
          }
        });
      });
      
      const jpgBuffer = Buffer.from('Certificate JPG - Fallback version');
      return { pdfBuffer, jpgBuffer };
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
      throw new Error(`Certificate generation failed: ${error.message}`);
    }
  }
};