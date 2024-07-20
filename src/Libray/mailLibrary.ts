import transporter from "../Config/nodemailer";
import userModel from "../Models/userModel";

export type sendOtpParams = {
  email: string;
  text: string;
  subject: string;
  fromMail?: string;
};

export async function sendMail(data: sendOtpParams) {
  try {
    const mailOptions = {
      from: data.fromMail ? data.fromMail : "alugojuvamshi@gmail.com",
      to: data.email,
      subject: data.subject,
      text: data.text,
    };
    // await transporter.sendMail(mailOptions);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}
