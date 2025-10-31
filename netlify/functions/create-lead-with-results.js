import { createLeadWithResults } from './lib/crmService.js';

/**
 * Netlify Function для создания лида с результатами теста
 *
 * POST /.netlify/functions/create-lead-with-results
 */
export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userData, testData } = JSON.parse(event.body);

    if (!userData || !userData.name || !userData.phone || !userData.email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required user data fields'
        })
      };
    }

    if (!testData || !testData.results || !testData.interpretation) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required test data fields'
        })
      };
    }

    const result = await createLeadWithResults(userData, testData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        leadId: result.leadId,
        message: 'Lead created with results successfully'
      })
    };

  } catch (error) {
    console.error('Error in create-lead-with-results function:', error);

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
