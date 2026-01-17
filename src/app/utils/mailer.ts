import nodemailer from 'nodemailer'

import logger from './logger.js'
import config from './setupConfig.js'

const {
	emailPort,
	emailFrom,
	frontendDomain
} = config

// Generic function to send email
export const sendEmail = async (to: string, subject: string, text: string, html = ''): Promise<void> => {
	if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
		logger.silly(text)
		return
	}

	// Configure transporter
	logger.debug('Creating email transporter')
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_SERVER,
		port: emailPort,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.SMTP_LOGIN,
			pass: process.env.SMTP_KEY
		}
	})

	logger.debug('Created transporter')

	const mailOptions = {
		from: emailFrom,
		to,
		subject,
		text,
		html
	}

	logger.debug('Sending email')
	await transporter.sendMail(mailOptions)

	logger.debug('Closing email transporter')
	transporter.close()
	logger.debug('Email transporter closed')
}
// Function to send password reset email
export const sendPasswordResetEmail = async (email: string, passwordResetCode: string): Promise<void> => {
	let passwordResetLink
	if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
		passwordResetLink = `http://${frontendDomain}/reset-password?passwordResetCode=${passwordResetCode}`
	} else {
		passwordResetLink = `https://${frontendDomain}/reset-password?passwordResetCode=${passwordResetCode}`
	}

	const subject = 'Password reset requested'
	const text = `Please reset your password by pasting this link into your browser: ${passwordResetLink} \n If you didn't request a password reset, it's safe to ignore this mail. Someone probably entered your email by mistake \n`
	const html = `<a href="${passwordResetLink}">${passwordResetLink}</a> <br> <p>Please reset your password by clicking the link above.</p> <br> <p>If you didn't request a password reset, it's safe to ignore this mail. Someone probably entered your email by mistake.</p>`

	await sendEmail(email, subject, text, html)
}

// Function to send email not registered email
export const sendEmailNotRegisteredEmail = async (email: string): Promise<void> => {
	const subject = 'Email not signed up'
	const text = 'A password reset has been requested for this email, but it has not been used to sign up for a user on life-stats.net. Please sign up instead. \n If you didn\'t request a password reset, it\'s safe to ignore this mail. Someone probably entered your email by mistake.'
	const html = '<p>A password reset has been requested for this email, but it has not been used to sign up for a user on life-stats.net. Please <a href="life-stats.net/signup">sign up</a> instead.</p> <br> <p>If you didn\'t request a password reset, it\'s safe to ignore this mail. Someone probably entered your email by mistake.</p>'

	await sendEmail(email, subject, text, html)
}
