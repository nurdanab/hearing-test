import express from 'express';
import { sendTestResults, verifyEmailConfig } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/email/send-results
 * Отправляет результаты теста на email клиента
 *
 * Body:
 * {
 *   to: string,              // Email получателя
 *   name: string,            // ФИО клиента
 *   testResult: string,      // "Тяжелая степень"
 *   averageDb: number,       // 75
 *   leftEarDb: number,       // 78
 *   rightEarDb: number,      // 72
 *   description: string,     // Полное описание результата
 *   pdfBase64: string,       // PDF в base64 (опционально)
 *   pdfFilename: string      // Название файла (опционально)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
router.post('/send-results', async (req, res, next) => {
  try {
    const {
      to,
      name,
      testResult,
      averageDb,
      leftEarDb,
      rightEarDb,
      description,
      pdfBase64,
      pdfFilename
    } = req.body;

    // Валидация обязательных полей
    if (!to || !name || !testResult) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, name, testResult'
      });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    console.log('Sending test results to:', to);

    // Отправка email
    const result = await sendTestResults({
      to,
      name,
      testResult,
      averageDb: averageDb || 0,
      leftEarDb: leftEarDb || 0,
      rightEarDb: rightEarDb || 0,
      description: description || '',
      pdfBase64,
      pdfFilename
    });

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Error in /send-results:', error);

    // Проверяем тип ошибки
    if (error.message.includes('SMTP settings not configured')) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Please contact administrator.'
      });
    }

    next(error);
  }
});

/**
 * GET /api/email/verify
 * Проверяет настройки email (для тестирования)
 *
 * Response:
 * {
 *   configured: boolean,
 *   message: string
 * }
 */
router.get('/verify', async (req, res) => {
  try {
    const isValid = await verifyEmailConfig();

    res.json({
      configured: isValid,
      message: isValid
        ? 'Email service is configured and ready'
        : 'Email service configuration is invalid'
    });

  } catch (error) {
    res.status(500).json({
      configured: false,
      message: 'Error verifying email configuration',
      error: error.message
    });
  }
});

export default router;
