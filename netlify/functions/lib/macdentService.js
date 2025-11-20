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
    lines.push(`Email: ${userData.email}`);
    lines.push('');
  }

  // Результаты анкетирования
  if (surveyData) {
    lines.push('=== Результаты анкетирования ===');

    const questions = [
      { id: 1, text: 'Как давно вы заметили ухудшение слуха?' },
      { id: 2, text: 'Часто ли вы переспрашиваете?' },
      { id: 3, text: 'Есть ли звон или шум в ушах?' }
    ];

    questions.forEach(q => {
      if (surveyData[q.id]) {
        lines.push(`${q.text}`);
        lines.push(`Ответ: ${surveyData[q.id]}`);
        lines.push('');
      }
    });
  }

  // Результаты теста на слух
  if (testResults) {
    lines.push('=== Результаты теста на слух ===');

    // Левое ухо
    if (testResults.left) {
      lines.push('Левое ухо:');
      Object.entries(testResults.left).forEach(([freq, db]) => {
        lines.push(`  ${freq} Гц: ${db} дБ`);
      });

      const leftValues = Object.values(testResults.left);
      const leftAvg = Math.round(leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length);
      lines.push(`  Средний порог: ${leftAvg} дБ`);
      lines.push('');
    }

    // Правое ухо
    if (testResults.right) {
      lines.push('Правое ухо:');
      Object.entries(testResults.right).forEach(([freq, db]) => {
        lines.push(`  ${freq} Гц: ${db} дБ`);
      });

      const rightValues = Object.values(testResults.right);
      const rightAvg = Math.round(rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length);
      lines.push(`  Средний порог: ${rightAvg} дБ`);
      lines.push('');
    }

    // Общий результат
    const allValues = [
      ...Object.values(testResults.left || {}),
      ...Object.values(testResults.right || {})
    ];

    if (allValues.length > 0) {
      const overallAvg = Math.round(allValues.reduce((sum, val) => sum + val, 0) / allValues.length);
      lines.push(`Общий средний порог: ${overallAvg} дБ`);
      lines.push('');
    }
  }

  // Интерпретация результатов
  if (interpretation) {
    lines.push('=== Результат ===');
    lines.push(`Диагноз: ${interpretation.text}`);
    if (interpretation.description) {
      lines.push('');
      lines.push(interpretation.description);
    }
  }

  return lines.join('\n');
}
