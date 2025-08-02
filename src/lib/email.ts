// lib/email.ts
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.RESULTS_EMAIL,
    pass: process.env.RESULTS_EMAIL_APP_PASSWORD,
  },
});

export function buildStatusUpdateEmail(status: string, patientName: string, service: string, date: string) {
  let subject = '';
  let html = '';

  if (status === 'Accepted') {
    subject = 'Your Appointment Has Been Confirmed';
    html = `
      <p>Dear ${patientName},</p>
      <p>Your appointment for <strong>${service}</strong> on <strong>${date}</strong> has been <strong>accepted</strong>.</p>
      <p>We look forward to seeing you!</p>
      <p>— Health Wise Mobile Lab</p>
    `;
  } else if (status === 'Declined') {
    subject = 'Your Appointment Request Has Been Declined';
    html = `
      <p>Dear ${patientName},</p>
      <p>We regret to inform you that your appointment request for <strong>${service}</strong> on <strong>${date}</strong> has been <strong>declined</strong>.</p>
      <p>Please feel free to book another time. We apologize for the inconvenience.</p>
      <p>— Health Wise Mobile Lab</p>
    `;
  }

  return { subject, html };
}
