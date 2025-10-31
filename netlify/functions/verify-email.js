import { verifyEmailConfig } from './lib/emailService.js';

/**
 * Netlify Function для проверки настроек email
 *
 * GET /.netlify/functions/verify-email
 */
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const isValid = await verifyEmailConfig();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        configured: isValid,
        message: isValid
          ? 'Email service is configured and ready'
          : 'Email service configuration is invalid'
      })
    };

  } catch (error) {
    console.error('Error in verify-email function:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        configured: false,
        message: 'Error verifying email configuration',
        error: error.message
      })
    };
  }
}
