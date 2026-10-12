import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);

const transporter = host
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

export async function sendVerificationEmail(to: string, code: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[dev] Verification code for ${to}: ${code}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Your CampusFix verification code',
      text: `Your CampusFix verification code is ${code}. It expires in 10 minutes. If you did not create an account, you can ignore this email.`,
      html: `<p>Your CampusFix verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not create an account, you can ignore this email.</p>`,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    console.log(`[dev] Verification code for ${to}: ${code}`);
    return false;
  }
}