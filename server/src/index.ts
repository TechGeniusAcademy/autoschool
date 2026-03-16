import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import avatarRoutes from './routes/avatarRoutes';
import adminRoutes from './routes/adminRoutes';
import contactMessageRoutes from './routes/contactMessageRoutes';
import blogRoutes from './routes/blog';
import coursesRoutes from './routes/courses';
import lessonsRoutes from './routes/lessons';
import testsRoutes from './routes/tests';
import studentRoutes from './routes/student';
import instructorRoutes from './routes/instructor';
import reviewsRoutes from './routes/reviews';
import schedulesRoutes from './routes/schedules';
import pricesRoutesNew from './routes/pricesRoutesNew';
import reportsRoutes from './routes/reports';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Разрешаем запросы без origin (мобильные приложения, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Разрешенные origins
    const allowedOrigins = [
      'http://localhost:5000',
      'http://192.168.8.17:5000',
      'https://tdk-autoschool.kz',
      'http://tdk-autoschool.kz',
      'http://51.68.129.249',
      'http://51.68.129.249:5000',
    ];
    
    // Проверяем точное соответствие или подсеть 192.168.8.*
    if (allowedOrigins.includes(origin) || origin.match(/^http:\/\/192\.168\.8\.\d+:5000$/)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactMessageRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/prices', pricesRoutesNew);
app.use('/api/admin/prices', pricesRoutesNew);
app.use('/api/admin/reports', reportsRoutes);

// Базовый роут для проверки работы сервера
app.get('/', (req, res) => {
  res.json({ message: 'AutoSchool Server is running!' });
});

// Обработка ошибок 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Глобальный обработчик ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  
  // Обработка ошибки размера payload
  if (err.type === 'entity.too.large' || err.name === 'PayloadTooLargeError') {
    return res.status(413).json({ 
      success: false, 
      message: 'Размер загружаемых данных слишком большой. Максимальный размер: 50MB. Попробуйте уменьшить размер изображений.',
      error: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  // Обработка ошибки парсинга JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      success: false, 
      message: 'Ошибка в формате данных. Проверьте корректность заполнения полей.',
      error: 'INVALID_JSON'
    });
  }
  
  // Общая обработка ошибок
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Внутренняя ошибка сервера',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

// Запуск сервера
const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌐 Server is accessible at:`);
      console.log(`   - Local: http://localhost:${PORT}`);
      console.log(`   - Network: http://192.168.8.17:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
