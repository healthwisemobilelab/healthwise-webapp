// src/app/api/send-deposit-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { patientEmail, patientName } = await request.json();

    if (!patientEmail || !patientName) {
      return NextResponse.json({ message: 'Missing patient email or name' }, { status: 400 });
    }

    // Create a transporter object using your Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.RESULTS_EMAIL, // Using the same email for sending notifications
        pass: process.env.RESULTS_EMAIL_APP_PASSWORD,
      },
    });

    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #0d9488;">Health Wise Appointment Deposit Required</h2>
        <p>Dear ${patientName},</p>
        <p>Thank you for submitting your appointment request with Health Wise Mobile Phlebotomy.</p>
        <p>To finalize your booking and secure your requested time slot, a <strong>$30.00 deposit</strong> is required. We will be in contact with you shortly via phone or email to arrange a convenient method for you to make the deposit payment.</p>
        <p>Once the deposit is received, we will send you an official confirmation email for your appointment.</p>
        <p>If you have any immediate questions, please don't hesitate to contact us.</p>
        <br>
        <p>Sincerely,</p>
        <p><strong>The Health Wise Team</strong></p>
      </div>
    `;

    // Prepare the email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Health Wise Mobile Lab" <${process.env.RESULTS_EMAIL}>`,
      to: patientEmail,
      subject: `Deposit Required to Confirm Your Health Wise Appointment`,
      html: emailHtml,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Deposit request email sent successfully' });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error sending email', error: errorMessage }, { status: 500 });
  }
}
