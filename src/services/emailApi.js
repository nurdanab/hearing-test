/**
 * API клиент для отправки email
 * Использует Netlify Functions
 */

/**
 * Отправляет результаты теста на email клиента
 *
 * @param {Object} params - Параметры отправки
 * @param {string} params.to - Email получателя
 * @param {string} params.name - ФИО клиента
 * @param {string} params.testResult - Результат теста
 * @param {number} params.averageDb - Средний dB
 * @param {number} params.leftEarDb - dB левого уха
 * @param {number} params.rightEarDb - dB правого уха
 * @param {string} params.description - Описание результата
 * @param {string} params.pdfBase64 - PDF в base64 (опционально)
 * @returns {Promise<boolean>} Успешность отправки
 */
export async function sendResultsEmail({
  to,
  name,
  testResult,
  averageDb,
  leftEarDb,
  rightEarDb,
  description,
  pdfBase64
}) {
  try {
    console.log('Sending results to email:', to);

    const response = await fetch(`/.netlify/functions/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        name,
        testResult,
        averageDb,
        leftEarDb,
        rightEarDb,
        description,
        pdfBase64,
        pdfFilename: `hearing-test-${name.replace(/\s+/g, '-')}.pdf`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log('Email sent successfully');

    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    // Не блокируем отображение результатов, если email не отправился
    return false;
  }
}
