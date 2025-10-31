import { updateLeadWithResults } from './lib/crmService.js';

/**
 * Netlify Function для обновления лида результатами теста
 *
 * PUT /.netlify/functions/update-lead
 */
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { leadId, results, interpretation } = JSON.parse(event.body);

    if (!leadId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Lead ID is required'
        })
      };
    }

    if (!results || !interpretation) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: results, interpretation'
        })
      };
    }

    await updateLeadWithResults(leadId, { results, interpretation });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Lead updated with test results successfully'
      })
    };

  } catch (error) {
    console.error('Error in update-lead function:', error);

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
