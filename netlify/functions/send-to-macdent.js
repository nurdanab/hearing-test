/**
 * Netlify Function для отправки заявки в MacDent CRM
 */

import { sendAppointmentToMacdent, formatAppointmentText } from './lib/macdentService.js';

export async function handler(event) {
  // Разрешаем только POST запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const requestData = JSON.parse(event.body);

    const {
      userData,
      surveyData,
      testResults,
      interpretation
    } = requestData;

    // Валидация обязательных полей
    if (!userData?.name || !userData?.phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: patient_name and patient_phone are required'
        })
      };
    }

    // Форматируем текст комментария
    const text = formatAppointmentText(userData, surveyData, testResults, interpretation);

    // Подготавливаем данные для отправки в MacDent
    const appointmentData = {
      patient_name: userData.name,
      patient_phone: userData.phone,
      text: text,
      source: 'Заявка с теста на слух'
    };

    // Отправляем в MacDent
    const result = await sendAppointmentToMacdent(appointmentData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        appointmentId: result.appointmentId,
        data: result.data
      })
    };

  } catch (error) {
    console.error('Error in send-to-macdent function:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to send appointment to MacDent'
      })
    };
  }
}
