/**
 * API сервис для взаимодействия с CRM через Netlify Functions
 */

/**
 * Отправляет данные формы в CRM
 *
 * @param {Object} userData - Данные пользователя из формы
 * @param {string} userData.name - ФИО
 * @param {string} userData.phone - Телефон
 * @param {string} userData.email - Email
 * @returns {Promise<string>} ID созданного лида в CRM
 */
export async function submitUserDataToCRM(userData) {
  try {
    const response = await fetch(`/.netlify/functions/create-lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        phone: userData.phone,
        email: userData.email
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit data to CRM');
    }

    const result = await response.json();
    console.log('User data submitted to CRM successfully:', result.leadId);

    return result.leadId;

  } catch (error) {
    console.error('Error submitting user data to CRM:', error);
    // Не блокируем продолжение теста, если CRM недоступен
    // В production можно добавить fallback или уведомление
    return null;
  }
}

/**
 * Отправляет результаты теста в CRM
 *
 * @param {string} leadId - ID лида в CRM
 * @param {Object} testResults - Результаты теста
 * @param {Object} interpretation - Интерпретация результатов
 * @returns {Promise<boolean>} Успешность операции
 */
export async function submitTestResultsToCRM(leadId, testResults, interpretation) {
  if (!leadId) {
    console.warn('No lead ID available, skipping CRM update');
    return false;
  }

  try {
    const response = await fetch(`/.netlify/functions/update-lead`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        leadId,
        results: testResults,
        interpretation: interpretation
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update CRM with results');
    }

    const result = await response.json();
    console.log('Test results submitted to CRM successfully');

    return true;

  } catch (error) {
    console.error('Error submitting test results to CRM:', error);
    // Не блокируем отображение результатов, если CRM недоступен
    return false;
  }
}

/**
 * Альтернативный метод: отправляет все данные сразу (userData + results)
 *
 * @param {Object} userData - Данные пользователя
 * @param {Object} testResults - Результаты теста
 * @param {Object} interpretation - Интерпретация результатов
 * @returns {Promise<string>} ID созданного лида
 */
export async function submitCompleteDataToCRM(userData, testResults, interpretation) {
  try {
    const response = await fetch(`/.netlify/functions/create-lead-with-results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userData: {
          name: userData.name,
          phone: userData.phone,
          email: userData.email
        },
        testData: {
          results: testResults,
          interpretation: interpretation
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit complete data to CRM');
    }

    const result = await response.json();
    console.log('Complete data submitted to CRM successfully:', result.leadId);

    return result.leadId;

  } catch (error) {
    console.error('Error submitting complete data to CRM:', error);
    return null;
  }
}
