const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Si no hay configuración de email, retornar null (modo desarrollo)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email no configurado - Modo desarrollo (no se enviarán correos reales)');
    return null;
  }
  
  return nodemailer.createTransport({
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
    
    // Modo desarrollo: no enviar correo, solo mostrar en consola
    if (!transporter) {
      console.log('\n🔐 ═══════════════════════════════════════════════');
      console.log('📧 CÓDIGO OTP (Modo Desarrollo)');
      console.log('═══════════════════════════════════════════════');
      console.log(`👤 Usuario: ${username}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Código OTP: ${otp}`);
      console.log('⏱️  Válido por: 10 minutos');
      console.log('═══════════════════════════════════════════════\n');
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Master Sport - Código de verificación',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #0f1419 0%, #1a1f26 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .email-container {
              max-width: 500px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1f26 0%, #0f1419 100%);
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 230, 119, 0.15);
              border: 1px solid rgba(0, 230, 119, 0.1);
            }
            .email-header {
              text-align: center;
              padding: 50px 30px 30px;
              background: radial-gradient(circle at center, rgba(0, 230, 119, 0.1) 0%, transparent 70%);
            }
            .shield-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: rgba(0, 230, 119, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              animation: pulse 2s ease-in-out infinite;
            }
            .shield-icon::before {
              content: '✓';
              font-size: 40px;
              font-weight: bold;
              color: #00e677;
              text-shadow: 0 0 20px rgba(0, 230, 119, 0.8);
            }
            .shield-icon::after {
              content: '';
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 2px solid #00e677;
              opacity: 0.3;
              animation: ripple 2s ease-out infinite;
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes ripple {
              0% { transform: scale(1); opacity: 0.3; }
              100% { transform: scale(1.4); opacity: 0; }
            }
            .email-title {
              font-size: 24px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 12px;
              letter-spacing: -0.5px;
            }
            .email-subtitle {
              font-size: 14px;
              color: #8b9299;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .user-name {
              color: #00e677;
              font-weight: 600;
            }
            .email-body {
              padding: 0 30px 40px;
            }
            .otp-section {
              background: rgba(15, 35, 25, 0.6);
              border-radius: 16px;
              padding: 40px 20px;
              margin: 30px 0;
              border: 1px solid rgba(0, 230, 119, 0.2);
              position: relative;
              overflow: hidden;
            }
            .otp-section::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(0, 230, 119, 0.15) 0%, transparent 70%);
              border-radius: 50%;
              z-index: 0;
            }
            .otp-code {
              font-size: 56px;
              font-weight: 900;
              color: #00e677;
              text-align: center;
              letter-spacing: 16px;
              margin: 0;
              text-shadow: 
                0 0 20px rgba(0, 230, 119, 0.6),
                0 0 40px rgba(0, 230, 119, 0.3),
                0 0 60px rgba(0, 230, 119, 0.2);
              position: relative;
              z-index: 1;
              font-family: 'Courier New', monospace;
            }
            .expiry-notice {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #00e677;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              position: relative;
              z-index: 1;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, rgba(0, 230, 119, 0.3) 50%, transparent 100%);
              margin: 30px 0;
            }
            .info-text {
              font-size: 13px;
              color: #8b9299;
              line-height: 1.8;
              text-align: center;
            }
            .highlight {
              color: #ffffff;
              font-weight: 600;
            }
            .email-footer {
              text-align: center;
              padding: 30px;
              background: rgba(0, 0, 0, 0.2);
              border-top: 1px solid rgba(0, 230, 119, 0.1);
            }
            .footer-text {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .app-name {
              color: #00e677;
              font-weight: 700;
              font-size: 16px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="shield-icon"></div>
              <h1 class="email-title">Tu código de verificación</h1>
              <p class="email-subtitle">
                Hola <span class="user-name">${username}</span>, para completar tu acceso a<br>
                <strong style="color: #00e677;">MasterSport</strong>, utiliza el siguiente código de 6 dígitos.
              </p>
            </div>
            
            <div class="email-body">
              <div class="otp-section">
                <div class="otp-code">${otp}</div>
                <div class="expiry-notice">Este código expirará en 10 minutos</div>
              </div>
              
              <div class="divider"></div>
              
              <p class="info-text">
                Si <span class="highlight">no solicitaste</span> este código, puedes ignorar<br>
                este email de forma segura.
              </p>
            </div>
            
            <div class="email-footer">
              <p class="footer-text">© 2026 Todos los derechos reservados.</p>
              <div class="app-name">Master Sport</div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp, username) => {
  try {
    const transporter = createTransporter();
    
    // Modo desarrollo: no enviar correo, solo mostrar en consola
    if (!transporter) {
      console.log('\n🔐 ═══════════════════════════════════════════════');
      console.log('📧 RESET PASSWORD OTP (Modo Desarrollo)');
      console.log('═══════════════════════════════════════════════');
      console.log(`👤 Usuario: ${username}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Código OTP: ${otp}`);
      console.log('⏱️  Válido por: 15 minutos');
      console.log('═══════════════════════════════════════════════\n');
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Master Sport - Restablecer contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #0f1419 0%, #1a1f26 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .email-container {
              max-width: 500px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1f26 0%, #0f1419 100%);
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 230, 119, 0.15);
              border: 1px solid rgba(0, 230, 119, 0.1);
            }
            .email-header {
              text-align: center;
              padding: 50px 30px 30px;
              background: radial-gradient(circle at center, rgba(0, 230, 119, 0.1) 0%, transparent 70%);
            }
            .lock-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: rgba(0, 230, 119, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              animation: pulse 2s ease-in-out infinite;
            }
            .lock-icon::before {
              content: '🔒';
              font-size: 40px;
              filter: grayscale(1) brightness(10);
            }
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            .email-title {
              font-size: 24px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 12px;
              letter-spacing: -0.5px;
            }
            .email-subtitle {
              font-size: 14px;
              color: #8b9299;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .user-name {
              color: #00e677;
              font-weight: 600;
            }
            .email-body {
              padding: 0 30px 40px;
            }
            .otp-section {
              background: rgba(15, 35, 25, 0.6);
              border-radius: 16px;
              padding: 40px 20px;
              margin: 30px 0;
              border: 1px solid rgba(0, 230, 119, 0.2);
              position: relative;
              overflow: hidden;
            }
            .otp-section::before {
              content: '';
              position: absolute;
              top: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 200px;
              height: 200px;
              background: radial-gradient(circle, rgba(0, 230, 119, 0.15) 0%, transparent 70%);
              border-radius: 50%;
              z-index: 0;
            }
            .otp-code {
              font-size: 56px;
              font-weight: 900;
              color: #00e677;
              text-align: center;
              letter-spacing: 16px;
              margin: 0;
              text-shadow: 
                0 0 20px rgba(0, 230, 119, 0.6),
                0 0 40px rgba(0, 230, 119, 0.3),
                0 0 60px rgba(0, 230, 119, 0.2);
              position: relative;
              z-index: 1;
              font-family: 'Courier New', monospace;
            }
            .expiry-notice {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #00e677;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
              position: relative;
              z-index: 1;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, rgba(0, 230, 119, 0.3) 50%, transparent 100%);
              margin: 30px 0;
            }
            .info-text {
              font-size: 13px;
              color: #8b9299;
              line-height: 1.8;
              text-align: center;
            }
            .highlight {
              color: #ffffff;
              font-weight: 600;
            }
            .email-footer {
              text-align: center;
              padding: 30px;
              background: rgba(0, 0, 0, 0.2);
              border-top: 1px solid rgba(0, 230, 119, 0.1);
            }
            .footer-text {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .app-name {
              color: #00e677;
              font-weight: 700;
              font-size: 16px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="lock-icon"></div>
              <h1 class="email-title">Restablecer Contraseña</h1>
              <p class="email-subtitle">
                Hola <span class="user-name">${username}</span>, recibimos una solicitud para<br>
                restablecer la contraseña de tu cuenta en <strong style="color: #00e677;">MasterSport</strong>.
              </p>
            </div>
            
            <div class="email-body">
              <div class="otp-section">
                <div class="otp-code">${otp}</div>
                <div class="expiry-notice">Este código expirará en 15 minutos</div>
              </div>
              
              <div class="divider"></div>
              
              <p class="info-text">
                Si <span class="highlight">no solicitaste</span> este cambio, puedes ignorar<br>
                este email de forma segura. Tu contraseña no será modificada.
              </p>
            </div>
            
            <div class="email-footer">
              <p class="footer-text">© 2026 Todos los derechos reservados.</p>
              <div class="app-name">Master Sport</div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de reset enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    // Modo desarrollo: no enviar correo, solo mostrar en consola
    if (!transporter) {
      console.log('\n🎉 ═══════════════════════════════════════════════');
      console.log('📧 WELCOME EMAIL (Modo Desarrollo)');
      console.log('═══════════════════════════════════════════════');
      console.log(`👤 Usuario: ${username}`);
      console.log(`📧 Email: ${email}`);
      console.log('🎊 ¡Bienvenido a Master Sport!');
      console.log('═══════════════════════════════════════════════\n');
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '¡Bienvenido a Master Sport!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: linear-gradient(135deg, #0f1419 0%, #1a1f26 100%);
              padding: 40px 20px;
              min-height: 100vh;
            }
            .email-container {
              max-width: 500px;
              margin: 0 auto;
              background: linear-gradient(135deg, #1a1f26 0%, #0f1419 100%);
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 230, 119, 0.15);
              border: 1px solid rgba(0, 230, 119, 0.1);
            }
            .email-header {
              text-align: center;
              padding: 50px 30px 30px;
              background: radial-gradient(circle at center, rgba(0, 230, 119, 0.1) 0%, transparent 70%);
            }
            .celebration-icon {
              width: 80px;
              height: 80px;
              margin: 0 auto 20px;
              background: rgba(0, 230, 119, 0.15);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              animation: bounce 2s ease-in-out infinite;
            }
            .celebration-icon::before {
              content: '🎉';
              font-size: 40px;
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .email-title {
              font-size: 28px;
              font-weight: 700;
              color: #ffffff;
              margin-bottom: 12px;
              letter-spacing: -0.5px;
            }
            .email-subtitle {
              font-size: 14px;
              color: #8b9299;
              line-height: 1.6;
            }
            .user-name {
              color: #00e677;
              font-weight: 600;
            }
            .email-body {
              padding: 30px;
            }
            .welcome-card {
              background: rgba(15, 35, 25, 0.6);
              border-radius: 16px;
              padding: 30px;
              margin: 20px 0;
              border: 1px solid rgba(0, 230, 119, 0.2);
            }
            .welcome-text {
              font-size: 15px;
              color: #cbd5e1;
              line-height: 1.8;
              margin-bottom: 20px;
              text-align: center;
            }
            .features-list {
              list-style: none;
              padding: 0;
              margin: 20px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              padding: 12px 0;
              color: #8b9299;
              font-size: 14px;
            }
            .feature-item::before {
              content: '⚡';
              margin-right: 12px;
              font-size: 18px;
            }
            .cta-text {
              text-align: center;
              font-size: 16px;
              color: #00e677;
              font-weight: 700;
              margin-top: 30px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .divider {
              height: 1px;
              background: linear-gradient(90deg, transparent 0%, rgba(0, 230, 119, 0.3) 50%, transparent 100%);
              margin: 30px 0;
            }
            .email-footer {
              text-align: center;
              padding: 30px;
              background: rgba(0, 0, 0, 0.2);
              border-top: 1px solid rgba(0, 230, 119, 0.1);
            }
            .footer-text {
              font-size: 12px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            .app-name {
              color: #00e677;
              font-weight: 700;
              font-size: 16px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <div class="celebration-icon"></div>
              <h1 class="email-title">¡Bienvenido!</h1>
              <p class="email-subtitle">
                Hola <span class="user-name">${username}</span>, estamos emocionados de tenerte en<br>
                <strong style="color: #00e677;">MasterSport</strong>
              </p>
            </div>
            
            <div class="email-body">
              <div class="welcome-card">
                <p class="welcome-text">
                  Master Sport es tu plataforma definitiva para dominar las predicciones deportivas.
                </p>
                
                <ul class="features-list">
                  <li class="feature-item">Compite con amigos y escala en los rankings</li>
                  <li class="feature-item">Únete a grupos y crea comunidades</li>
                  <li class="feature-item">Fútbol, Baloncesto, F1 y más deportes</li>
                  <li class="feature-item">Estadísticas detalladas en tiempo real</li>
                </ul>
                
                <div class="cta-text">¡Comienza a Predecir Ahora!</div>
              </div>
            </div>
            
            <div class="email-footer">
              <p class="footer-text">© 2026 Todos los derechos reservados.</p>
              <div class="app-name">Master Sport</div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de bienvenida enviado a: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};
