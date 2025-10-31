import { createLead } from './lib/crmService.js';

/**
 * Netlify Function для создания лида в CRM
 *
 * POST /.netlify/functions/create-lead
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
    const { name, phone, email } = JSON.parse(event.body);

    if (!name || !phone || !email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing required fields: name, phone, email'
        })
      };
    }

    const result = await createLead({ name, phone, email });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        leadId: result.leadId,
        message: 'Lead created successfully'
      })
    };

  } catch (error) {
    console.error('Error in create-lead function:', error);

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
