// src/app/api/send-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    // Validate email credentials
    const emailUser = process.env.RESULTS_EMAIL;
    const emailPass = process.env.RESULTS_EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPass) {
        console.error("Missing email credentials in environment variables.");
        throw new Error("Server configuration error: Missing email credentials.");
    }

    const formData = await request.formData();
    const patientEmail = formData.get('patientEmail') as string;
    const doctorEmail = formData.get('doctorEmail') as string | null;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const file = formData.get('file') as File | null;

    if (!patientEmail || !subject || !message || !file) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Health Wise Mobile Lab" <${emailUser}>`,
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

    if (doctorEmail) {
      mailOptions.cc = doctorEmail;
    }

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' });

  } catch (error) {
    console.error("Send Results API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error sending email', error: errorMessage }, { status: 500 });
  }
}
