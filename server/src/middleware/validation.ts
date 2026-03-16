import { body, param } from 'express-validator';

// Валидация регистрации
export const validateRegister = [
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Zа-яА-Я\s]+$/)
    .withMessage('First name must contain only letters'),

  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Zа-яА-Я\s]+$/)
    .withMessage('Last name must contain only letters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .matches(/^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/)
    .withMessage('Please provide a valid Russian phone number'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Валидация входа
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Валидация сообщений обратной связи
export const validateContactMessage = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('phone')
    .matches(/^(\+7|8)[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/)
    .withMessage('Please provide a valid Russian phone number'),

  body('subject')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

// Валидация ответа на сообщение
export const validateMessageResponse = [
  body('admin_response')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Response must be between 1 and 2000 characters')
];

// Валидация блога
export const validateBlog = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  body('slug')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Slug must be between 1 and 200 characters')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),

  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt must not exceed 500 characters'),

  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Валидация ID параметра
export const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
];

// Валидация slug параметра
export const validateSlug = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 200 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers and hyphens')
];
