// src/app/api/send-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const patientEmail = formData.get('patientEmail') as string;
    const doctorEmail = formData.get('doctorEmail') as string | null;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    if (!patientEmail || !subject || !message || !file) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create a transporter object using your Gmail App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.RESULTS_EMAIL,
        pass: process.env.RESULTS_EMAIL_APP_PASSWORD,
      },
    });

    // Prepare the email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Health Wise Mobile Lab" <${process.env.RESULTS_EMAIL}>`,
      to: patientEmail,
      subject: subject,
      text: message,
      attachments: [
        {
          filename: file.name,
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type,
        },
      ],
    };

    // Add the doctor's email to the CC list if it exists
    if (doctorEmail) {
      mailOptions.cc = doctorEmail;
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error sending email', error: errorMessage }, { status: 500 });
  }
}
