import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import { IAnalysisResult, IUser } from '../types';

/**
 * Email Service using Nodemailer
 */
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Verify Your Email - ATS Resume Analyzer',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 ATS Resume Analyzer</h1>
            </div>
            <div class="content">
              <h2>Welcome, ${name}!</h2>
              <p>Thank you for signing up. Please verify your email address to get started.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;
    
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: 'Reset Your Password - ATS Resume Analyzer',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 ATS Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send analysis report email
   */
  async sendAnalysisReport(
    email: string,
    name: string,
    analysisResult: IAnalysisResult,
    resumeFileName: string
  ): Promise<void> {
    const scoreColor = analysisResult.overallScore >= 70 ? '#4CAF50' : 
                       analysisResult.overallScore >= 50 ? '#FF9800' : '#F44336';

    const feedbackHtml = analysisResult.feedback.map((f) => `
      <div style="margin: 15px 0; padding: 15px; background: ${f.status === 'good' ? '#E8F5E9' : f.status === 'warning' ? '#FFF3E0' : '#FFEBEE'}; border-radius: 5px;">
        <h4 style="margin: 0 0 10px 0; color: ${f.status === 'good' ? '#2E7D32' : f.status === 'warning' ? '#EF6C00' : '#C62828'};">
          ${f.status === 'good' ? '✅' : f.status === 'warning' ? '⚠️' : '❌'} ${f.section} (${f.score}/100)
        </h4>
        ${f.issues.length > 0 ? `<p><strong>Issues:</strong> ${f.issues.join(', ')}</p>` : ''}
        ${f.suggestions.length > 0 ? `<p><strong>Suggestions:</strong> ${f.suggestions.join(' ')}</p>` : ''}
      </div>
    `).join('');

    const improvementsHtml = analysisResult.improvements.map((imp) => `
      <li style="margin: 10px 0;">
        <strong style="color: ${imp.type === 'critical' ? '#C62828' : imp.type === 'major' ? '#EF6C00' : '#1976D2'};">
          [${imp.type.toUpperCase()}]
        </strong>
        ${imp.issue} - ${imp.suggestion}
        ${imp.example ? `<br><em>Example: ${imp.example}</em>` : ''}
      </li>
    `).join('');

    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: `Your ATS Analysis Report - Score: ${analysisResult.overallScore}/100`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .score-circle { width: 150px; height: 150px; border-radius: 50%; background: white; margin: 20px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .score-number { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
            .section { margin: 20px 0; padding: 20px; background: white; border-radius: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your ATS Analysis Report</h1>
              <p>Resume: ${resumeFileName}</p>
            </div>
            <div class="content">
              <div style="text-align: center;">
                <div class="score-circle">
                  <span class="score-number">${analysisResult.overallScore}</span>
                </div>
                <h2>Your ATS Score: ${analysisResult.overallScore}/100</h2>
                <p style="color: ${scoreColor}; font-weight: bold;">
                  ${analysisResult.overallScore >= 70 ? '🎉 Great job! Your resume is well-optimized.' : 
                    analysisResult.overallScore >= 50 ? '👍 Good start, but there\'s room for improvement.' : 
                    '⚠️ Your resume needs significant improvements.'}
                </p>
              </div>

              <div class="section">
                <h3>📈 Score Breakdown</h3>
                <ul>
                  <li>Keyword Relevance: ${analysisResult.scores.keywordRelevance}/100</li>
                  <li>Section Structure: ${analysisResult.scores.sectionStructure}/100</li>
                  <li>Formatting: ${analysisResult.scores.formatting}/100</li>
                  <li>Experience Quality: ${analysisResult.scores.experienceQuality}/100</li>
                  <li>Skills Match: ${analysisResult.scores.skillsMatch}/100</li>
                  <li>File Structure: ${analysisResult.scores.fileStructure}/100</li>
                </ul>
              </div>

              <div class="section">
                <h3>📝 Section Feedback</h3>
                ${feedbackHtml}
              </div>

              <div class="section">
                <h3>🔑 Keywords Analysis</h3>
                <p><strong>Keywords Found:</strong> ${analysisResult.keywords.found.slice(0, 10).join(', ')}</p>
                <p><strong>Missing Keywords:</strong> ${analysisResult.keywords.missing.slice(0, 10).join(', ')}</p>
                <p><strong>Keyword Score:</strong> ${analysisResult.keywords.relevanceScore}/100</p>
              </div>

              <div class="section">
                <h3>🎯 Recommended Improvements</h3>
                <ul>
                  ${improvementsHtml}
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p>Want to improve your score? Visit our platform for detailed suggestions!</p>
                <a href="${config.frontendUrl}/dashboard" style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">View Full Analysis</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 ATS Resume Analyzer. All rights reserved.</p>
              <p>Questions? Reply to this email for support.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    email: string,
    name: string,
    plan: string,
    amount: number
  ): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to: email,
      subject: '🎉 Payment Confirmed - ATS Resume Analyzer Premium',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .receipt { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Premium!</h1>
            </div>
            <div class="content">
              <h2>Thank you, ${name}!</h2>
              <p>Your payment has been successfully processed. You now have access to all premium features!</p>
              
              <div class="receipt">
                <h3>Receipt</h3>
                <p><strong>Plan:</strong> ${plan}</p>
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <h3>🌟 Your Premium Benefits:</h3>
              <ul>
                <li>✅ Unlimited resume analyses</li>
                <li>✅ AI-powered resume rewriting suggestions</li>
                <li>✅ Multiple job role optimization</li>
                <li>✅ ATS-safe resume templates</li>
                <li>✅ Download optimized resume PDF</li>
                <li>✅ Priority email support</li>
              </ul>

              <p style="text-align: center;">
                <a href="${config.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
              </p>
            </div>
            <div class="footer">
              <p>© 2024 ATS Resume Analyzer. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  /**
   * Verify email connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
