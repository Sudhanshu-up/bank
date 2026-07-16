import dotenv from "dotenv";
import asyncHandler from "../utils/async_handler.js";
import nodemailer from "nodemailer";
 dotenv.config();
   
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// export default transporter;


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"BankManagement" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



const sendRegistrationEmail = asyncHandler(async (userEmail,name) => {
    const subject = "Welcome to Bankmangement!";
    const text = `Hello ${name},\n\n Thank you for registering at BankMangement`
    const html = `<p>Hello ${name},</P> <p>Thank you for registering at Bankmangement`
   
    await sendEmail(userEmail, subject, text, html)
    console.log("Recipient:", userEmail);
});


const sendTransactionSuccessEmail = asyncHandler(async(userEmail, name, amount, toAccount)=> {
  const subject = "Transaction Successful!";

  const text = `
Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} was completed successfully.

Transaction Details:
- Amount: ₹${amount}
- Receiver Account: ${toAccount}
- Status: Successful

Thank you for banking with us.

Regards,
Your Bank Team
`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2 style="color:green;">✅ Transaction Successful</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>Your transaction has been completed successfully.</p>

      <table style="border-collapse:collapse;">
        <tr>
          <td><strong>Amount:</strong></td>
          <td>₹${amount}</td>
        </tr>
        <tr>
          <td><strong>Receiver Account:</strong></td>
          <td>${toAccount}</td>
        </tr>
        <tr>
          <td><strong>Status:</strong></td>
          <td style="color:green;">Successful</td>
        </tr>
      </table>

      <p>Thank you for banking with us.</p>

      <p>Regards,<br><strong>Your Bank Team</strong></p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
});


const sendTransactionFailureEmail = asyncHandler(async(userEmail, name, amount, toAccount)=>{
  const subject = "Transaction Failed";

  const text = `
Hello ${name},

We regret to inform you that your transaction of ₹${amount} to account ${toAccount} could not be completed.

Transaction Details:
- Amount: ₹${amount}
- Receiver Account: ${toAccount}
- Status: Failed

Please check your account balance or try again later.

Regards,
Your Bank Team
`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2 style="color:red;">❌ Transaction Failed</h2>

      <p>Hello <strong>${name}</strong>,</p>

      <p>We regret to inform you that your transaction could not be completed.</p>

      <table style="border-collapse:collapse;">
        <tr>
          <td><strong>Amount:</strong></td>
          <td>₹${amount}</td>
        </tr>
        <tr>
          <td><strong>Receiver Account:</strong></td>
          <td>${toAccount}</td>
        </tr>
        <tr>
          <td><strong>Status:</strong></td>
          <td style="color:red;">Failed</td>
        </tr>
      </table>

      <p>Please check your account balance or try again later.</p>

      <p>If the problem persists, contact our support team.</p>

      <p>Regards,<br><strong>Your Bank Team</strong></p>
    </div>
  `;

  await sendEmail(userEmail, subject, text, html);
});


export {sendRegistrationEmail,
  sendTransactionSuccessEmail,
  sendTransactionFailureEmail
};