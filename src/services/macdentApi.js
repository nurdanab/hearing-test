/**
 * API клиент для отправки данных в MacDent CRM
 */

/**
 * Отправляет полные данные теста в MacDent CRM
 *
 * @param {Object} data - Данные для отправки
 * @param {Object} data.userData - Данные пользователя (имя, телефон, email)
 * @param {Object} data.surveyData - Результаты анкетирования
 * @param {Object} data.testResults - Результаты теста на слух
 * @param {Object} data.interpretation - Интерпретация результатов
 * @returns {Promise<Object>} Результат отправки
 */
export async function sendToMacdent(data) {
  try {
    const response = await fetch('/.netlify/functions/send-to-macdent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send data to MacDent');
    }

    const result = await response.json();
    console.log('Successfully sent to MacDent:', result);

    return {
      success: true,
      appointmentId: result.appointmentId,
      data: result.data
    };

  } catch (error) {
    console.error('Error sending to MacDent:', error);
    // Не блокируем работу приложения, если MacDent недоступен
    return {
      success: false,
      error: error.message
    };
  }
}
