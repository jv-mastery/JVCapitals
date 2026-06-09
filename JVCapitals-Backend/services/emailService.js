import { Resend } from "resend";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const year = new Date().getFullYear();


class EmailService {
	static async sendVerificationEmail(email, name, token) {
		const verificationUrl = `${FRONTEND_URL}/#/verify-email?token=${token}`;
		const templatePath = path.join(
			process.cwd(),
			"templates",
			"verify-account.hbs",
		);
		const sourceHtml = fs.readFileSync(templatePath, "utf-8");
		const template = handlebars.compile(sourceHtml);
		const htmlToSend = template({
			name: name,
			verifyLink: verificationUrl,
			year: year,
		});
		return resend.emails.send({
			from: `JV Capitals <${FROM_EMAIL}>`,
			to: email,
			subject: "Verify your JV Capitals account",
			html: htmlToSend,
		});
	}

	static async sendPasswordResetEmail(email, name, token) {
		const resetUrl = `${FRONTEND_URL}/#/reset-password?token=${token}`;
		const templatePath = path.join(
			process.cwd(),
			"templates",
			"forgot-password.hbs",
		);
		const sourceHtml = fs.readFileSync(templatePath, "utf-8");
		const template = handlebars.compile(sourceHtml);
		const htmlToSend = template({
			name: name,
			resetLink: resetUrl,
			year: year,
		});

		return resend.emails.send({
			from: `JV Capitals <${FROM_EMAIL}>`,
			to: email,
			subject: "Reset your JV Capitals password",
			html: htmlToSend,
		});
	}

	static async sendPasswordChangedEmail(email, name) {
    const templatePath = path.join(
			process.cwd(),
			"templates",
			"password-changed.hbs",
		);
		const sourceHtml = fs.readFileSync(templatePath, "utf-8");
		const template = handlebars.compile(sourceHtml);
		const htmlToSend = template({
			name: name,
			supportLink: 'mailto:coachjvmastery@gmail.com?subject=Security Alert: Password Changed',
			year: year,
		});

		return resend.emails.send({
			from: `JV Capitals <${FROM_EMAIL}>`,
			to: email,
			subject: "Your password has been changed",
			html: htmlToSend
		});
	}
}

export default EmailService;
