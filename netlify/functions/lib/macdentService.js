/**
 * Сервис для работы с MacDent CRM API
 * Документация: https://docs-developer.macdent.kz
 */

const MACDENT_API_BASE_URL = 'https://api-developer.macdent.kz';

/**
 * Отправляет заявку на запись в MacDent CRM
 *
 * @param {Object} appointmentData - Данные заявки
 * @param {string} appointmentData.patient_name - Имя пациента (обязательно)
 * @param {string} appointmentData.patient_phone - Номер телефона (обязательно)
 * @param {string} appointmentData.text - Комментарий пользователя
 * @param {string} appointmentData.source - Описание источника записи
 * @returns {Promise<Object>} Результат операции
 */
export async function sendAppointmentToMacdent(appointmentData) {
  const accessToken = process.env.MACDENT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('MACDENT_ACCESS_TOKEN not configured in environment variables');
  }

  try {
    const url = `${MACDENT_API_BASE_URL}/appointment/send?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_name: appointmentData.patient_name,
        patient_phone: appointmentData.patient_phone,
        text: appointmentData.text || '',
        source: appointmentData.source || 'Заявка с теста на слух'
      })
    });

    const result = await response.json();

    // Проверяем успешность запроса по полю response
    if (result.response === 0) {
      throw new Error(result.error || 'Unknown MacDent API error');
    }

    return {
      success: true,
      data: result.data || result,
      appointmentId: result.data?.id
    };

  } catch (error) {
    console.error('Error sending appointment to MacDent:', error);
    throw error;
  }
}

/**
 * Форматирует данные теста на слух в текстовый формат для поля text
 * Краткий формат для CRM
 *
 * @param {Object} userData - Данные пользователя
 * @param {Object} surveyData - Результаты анкетирования
 * @param {Object} testResults - Результаты теста на слух
 * @param {Object} interpretation - Интерпретация результатов
 * @returns {string} Отформатированный текст
 */
export function formatAppointmentText(userData, surveyData, testResults, interpretation) {
  const lines = [];

  // Email
  if (userData?.email) {
    lines.push(`${userData.email};`);
  }

  // Результаты анкетирования (краткий формат)
  if (surveyData) {
    if (surveyData[1]) {
      lines.push(`1-${surveyData[1]};`);
    }
    if (surveyData[2]) {
      lines.push(`2-${surveyData[2]};`);
    }
    if (surveyData[3]) {
      lines.push(`3-${surveyData[3]};`);
    }
  }

  // Результаты теста на слух (краткий формат)
  if (testResults) {
    const leftValues = Object.values(testResults.left || {});
    const rightValues = Object.values(testResults.right || {});
    const allValues = [...leftValues, ...rightValues];

    if (allValues.length > 0) {
      const overallAvg = Math.round(allValues.reduce((sum, val) => sum + val, 0) / allValues.length);
      const leftAvg = leftValues.length > 0
        ? Math.round(leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length)
        : 0;
      const rightAvg = rightValues.length > 0
        ? Math.round(rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length)
        : 0;

      lines.push(`Результат - ${overallAvg}Дб; ${leftAvg}Дб(левое); ${rightAvg}Дб(правое)`);
    }
  }

  return lines.join('\n');
}
