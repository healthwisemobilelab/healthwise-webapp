// src/app/api/send-booking-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Helper function to create a Google Calendar link
function createGoogleCalendarLink(details: { text: string; dates: string; details: string; }) {
    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const params = new URLSearchParams(details);
    return `${baseUrl}&${params.toString()}`;
}

// Helper function to create an Apple Calendar (.ics) data URI
function createIcsDataUri(details: { title: string; description: string; startTime: Date; endTime: Date; }) {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `URL:${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`,
        `DTSTART:${formatDate(details.startTime)}`,
        `DTEND:${formatDate(details.endTime)}`,
        `SUMMARY:${details.title}`,
        `DESCRIPTION:${details.description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\n');

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}


export async function POST(request: NextRequest) {
  try {
    const { patientEmail, patientName, service, requestedDate, paymentStatus } = await request.json();

    if (!patientEmail || !patientName || !service || !requestedDate || !paymentStatus) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.RESULTS_EMAIL,
        pass: process.env.RESULTS_EMAIL_APP_PASSWORD,
      },
    });

    let subject = '';
    let emailHtml = '';

    // Customize the email based on the payment status
    if (paymentStatus.includes('Paid Online')) {
        subject = `Your Health Wise Appointment is Confirmed!`;
        
        // Create calendar links
        const eventDate = new Date(requestedDate.split(' at ')[0]);
        const startTime = new Date(`${eventDate.toDateString()} ${requestedDate.split(' at ')[1]}`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration
        
        const googleCalendarLink = createGoogleCalendarLink({
            text: `Health Wise Appointment: ${service}`,
            dates: `${startTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
            details: `Appointment for ${service} with Health Wise Mobile Phlebotomy.`,
        });

        const appleCalendarLink = createIcsDataUri({
            title: `Health Wise Appointment: ${service}`,
            description: `Appointment for ${service} with Health Wise Mobile Phlebotomy.`,
            startTime,
            endTime,
        });

        emailHtml = `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2 style="color: #0d9488;">Your Appointment is Confirmed!</h2>
            <p>Dear ${patientName},</p>
            <p>Thank you for your booking and payment. Your appointment with Health Wise Mobile Phlebotomy is confirmed.</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${requestedDate}</p>
            <p>A member of our team will see you at your provided address.</p>
            <p style="margin-top: 20px;">
              <a href="${googleCalendarLink}" target="_blank" style="background-color: #4285F4; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">
                Add to Google Calendar
              </a>
              <a href="${appleCalendarLink}" style="background-color: #000000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Add to Apple Calendar
              </a>
            </p>
            <br>
            <p>Sincerely,</p>
            <p><strong>The Health Wise Team</strong></p>
          </div>
        `;
    } else { // For 'Deposit Required'
        subject = `Your Health Wise Appointment Request Has Been Received`;
        emailHtml = `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2 style="color: #0d9488;">Your Appointment Request Has Been Received</h2>
            <p>Dear ${patientName},</p>
            <p>Thank you for submitting your appointment request with Health Wise Mobile Phlebotomy.</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Date & Time:</strong> ${requestedDate}</p>
            <p>To finalize your booking and secure your time slot, a <strong>$30.00 deposit</strong> is required. We will be in contact with you shortly via phone or email to arrange a convenient method for you to make the deposit payment.</p>
            <p>Once the deposit is received, we will send you an official confirmation email.</p>
            <br>
            <p>Sincerely,</p>
            <p><strong>The Health Wise Team</strong></p>
          </div>
        `;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Health Wise Mobile Lab" <${process.env.RESULTS_EMAIL}>`,
      to: patientEmail,
      subject: subject,
      html: emailHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Confirmation email sent successfully' });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error sending email', error: errorMessage }, { status: 500 });
  }
}
