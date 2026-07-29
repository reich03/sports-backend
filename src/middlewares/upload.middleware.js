const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const avatarDir = path.join(__dirname, '../../uploads/avatars');
const teamLogoDir = path.join(__dirname, '../../uploads/teams');
const tournamentBannerDir = path.join(__dirname, '../../uploads/tournaments');
const driverPhotoDir = path.join(__dirname, '../../uploads/drivers');
const f1EventBannerDir = path.join(__dirname, '../../uploads/f1_events');

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

if (!fs.existsSync(teamLogoDir)) {
  fs.mkdirSync(teamLogoDir, { recursive: true });
}

if (!fs.existsSync(tournamentBannerDir)) {
  fs.mkdirSync(tournamentBannerDir, { recursive: true });
}

if (!fs.existsSync(driverPhotoDir)) {
  fs.mkdirSync(driverPhotoDir, { recursive: true });
}

if (!fs.existsSync(f1EventBannerDir)) {
  fs.mkdirSync(f1EventBannerDir, { recursive: true });
}

// Configuración de almacenamiento para avatares
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: userId-timestamp.extension
    const userId = req.user?.id || 'temp';
    const ext = path.extname(file.originalname);
    const filename = `${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Configuración de almacenamiento para logos de equipos
const teamLogoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, teamLogoDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: teamId-timestamp.extension
    const teamId = req.params.teamId || 'temp';
    const ext = path.extname(file.originalname);
    const filename = `team-${teamId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Configuración de almacenamiento para banners de torneos
const tournamentBannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tournamentBannerDir);
  },
  filename: function (req, file, cb) {
    const tournamentId = req.params.id || 'temp';
    const ext = path.extname(file.originalname);
    const filename = `tournament-${tournamentId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp, svg)'));
  }
};

// Configuración de multer para avatares
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

// Configuración de multer para logos de equipos
const uploadTeamLogo = multer({
  storage: teamLogoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

// Configuración de multer para banners de torneos
const uploadTournamentBanner = multer({
  storage: tournamentBannerStorage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: fileFilter
});

// Almacenamiento para fotos de pilotos
const driverPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, driverPhotoDir);
  },
  filename: function (req, file, cb) {
    const driverId = req.params.driverId || 'temp';
    const ext = path.extname(file.originalname);
    cb(null, `driver-${driverId}-${Date.now()}${ext}`);
  }
});

const uploadDriverPhoto = multer({
  storage: driverPhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// Almacenamiento para banners de eventos F1
const f1EventBannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, f1EventBannerDir);
  },
  filename: function (req, file, cb) {
    const eventId = req.params.eventId || 'temp';
    const ext = path.extname(file.originalname);
    cb(null, `f1event-${eventId}-${Date.now()}${ext}`);
  }
});

const uploadF1EventBanner = multer({
  storage: f1EventBannerStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = {
  uploadAvatar,
  uploadTeamLogo,
  uploadTournamentBanner,
  uploadDriverPhoto,
  uploadF1EventBanner
};
