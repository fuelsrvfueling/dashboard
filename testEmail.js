const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dashboard@fuelsrv.com',
      pass: 'dmmu misx chag gynw'  // use the app password here WITH spaces
    }
  });

  try {
    const info = await transporter.sendMail({
      from: 'dashboard@fuelsrv.com',
      to: 'contact@fuelsrv.com',
      subject: '🚀 Test Email from Node',
      text: 'This is a test email sent from a local script using Gmail app password.'
    });

    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();
