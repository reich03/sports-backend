// Servidor de prueba simple sin base de datos
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Usuarios de prueba (mock)
const mockUsers = [
  {
    id: 1,
    email: 'test@test.com',
    username: 'Test User',
    password: '$2a$10$rOzqXqPIE6eJxrWS7hxKNuDVJ8FJ9Z.8KuP3L3qT6WmqQxqzXqN6K', // "test123"
    role: 'user',
    points: 1250,
    avatar: null
  },
  {
    id: 2,
    email: 'admin@mastersport.app',
    username: 'Admin',
    password: '$2a$10$rOzqXqPIE6eJxrWS7hxKNuDVJ8FJ9Z.8KuP3L3qT6WmqQxqzXqN6K', // "admin123"
    role: 'admin',
    points: 5000,
    avatar: null
  }
];

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n📧 ===== LOGIN ATTEMPT =====');
    console.log('Email:', email);
    console.log('Password:', password ? '***' : '(vacío)');
    console.log('Request body:', req.body);
    console.log('==========================\n');
    
    // Buscar usuario
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    
    // Verificar password (acepta "test123" para test y "admin123" para admin)
    const validPassword = password === 'test123' || password === 'admin123';
    
    if (!validPassword) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        error: { message: 'Credenciales inválidas' }
      });
    }
    
    console.log('✅ Contraseña correcta');
    
    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'master_sport_secret_dev',
      { expiresIn: '7d' }
    );
    
    console.log('🔑 Token generado');
    
    // Respuesta exitosa
    const response = {
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          points: user.points,
          avatar: user.avatar,
          email_verified: true
        },
        token
      }
    };
    
    console.log('✅ Login exitoso - Enviando respuesta:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error del servidor' }
    });
  }
});

// Register endpoint (mock)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    console.log('📝 Registro:', email);
    
    // Verificar si ya existe
    const exists = mockUsers.find(u => u.email === email);
    if (exists) {
      return res.status(400).json({
        success: false,
        error: { message: 'El email ya está registrado' }
      });
    }
    
    // Simular registro exitoso
    res.status(201).json({
      success: true,
      message: 'Usuario registrado. Por favor verifica tu email.',
      data: {
        email,
        username
      }
    });
    
    console.log('✅ Registro exitoso:', email);
    
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Error del servidor' }
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mode: 'MOCK (Sin Base de Datos)',
    timestamp: new Date().toISOString() 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces de red

app.listen(PORT, HOST, () => {
  console.log(`
📱 =============================================
   SERVIDOR MOCK - MASTER SPORT
   =============================================
   
   🚀 Servidor corriendo en:
      Local:    http://localhost:${PORT}
      Red:      http://192.168.0.6:${PORT}
   
   🔧 Modo: DESARROLLO (Sin Base de Datos)
   
   👤 Usuario de prueba:
      Email:    test@test.com
      Password: test123
   
   👑 Usuario admin:
      Email:    admin@mastersport.app
      Password: admin123
      
   📡 Endpoints disponibles:
      POST /api/auth/login
      POST /api/auth/register
      GET  /api/health
   
   ✅ Listo para probar el login desde la app!
   =============================================
  `);
});
