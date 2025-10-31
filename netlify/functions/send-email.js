import { sendTestResults } from './lib/emailService.js';

/**
 * Netlify Function для отправки email с результатами теста
 *
 * POST /.netlify/functions/send-email
 */
export async function handler(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
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
    } = body;

    // Валидация обязательных полей
    if (!to || !name || !testResult) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: to, name, testResult'
        })
      };
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email address'
        })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('Error in send-email function:', error);

    // Проверяем тип ошибки
    if (error.message.includes('SMTP settings not configured')) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Email service not configured. Please contact administrator.'
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
}
