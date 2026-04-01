const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'ProGana - Código de verificación',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #f5f8f7; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00e677; margin: 0; }
            .content { color: #333; line-height: 1.6; }
            .otp-code { background-color: #0f2319; color: #00e677; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>ProGana</h1>
            </div>
            <div class="content">
              <p>Hola ${username},</p>
              <p>Recibimos una solicitud para verificar tu cuenta en ProGana. Tu código de verificación es:</p>
              <div class="otp-code">${otp}</div>
              <p>Este código expirará en 10 minutos.</p>
              <p>Si no solicitaste este código, puedes ignorar este email de forma segura.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProGana. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, username) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'ProGana - Restablecer contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #f5f8f7; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00e677; margin: 0; }
            .content { color: #333; line-height: 1.6; }
            .button { display: inline-block; background-color: #00e677; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 20px 0; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>ProGana</h1>
            </div>
            <div class="content">
              <p>Hola ${username},</p>
              <p>Recibimos una solicitud para restablecer tu contraseña en ProGana.</p>
              <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              <p>Este enlace expirará en 1 hora.</p>
              <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.</p>
            </div>
            <div class="footer">
              <p>© 2024 ProGana. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Bienvenido a ProGana',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; background-color: #f5f8f7; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 12px; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo h1 { color: #00e677; margin: 0; }
            .content { color: #333; line-height: 1.6; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <h1>ProGana</h1>
            </div>
            <div class="content">
              <h2>¡Bienvenido a ProGana, ${username}!</h2>
              <p>Estamos emocionados de tenerte con nosotros.</p>
              <p>ProGana es tu plataforma para dominar las predicciones deportivas. Compite con amigos, únete a grupos y demuestra tu conocimiento en fútbol, baloncesto, Fórmula 1 y más.</p>
              <p>Comienza haciendo tus primeras predicciones y escala en los rankings.</p>
              <p>¡Buena suerte!</p>
            </div>
            <div class="footer">
              <p>© 2024 ProGana. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
