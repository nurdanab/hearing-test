/**
 * Сервис для работы с CRM API
 *
 * ВАЖНО: Этот файл нужно будет адаптировать под конкретное CRM API,
 * когда получите документацию от заказчика.
 */

/**
 * Создает нового лида в CRM с данными формы
 *
 * @param {Object} userData - Данные пользователя
 * @param {string} userData.name - ФИО
 * @param {string} userData.phone - Телефон
 * @param {string} userData.email - Email
 * @returns {Promise<Object>} Ответ от CRM API с ID созданного лида
 */
export async function createLead(userData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    // Подготовка данных для CRM
    // ВАЖНО: Структуру нужно адаптировать под ваше CRM API
    const crmData = {
      // Пример структуры - адаптируйте под ваш CRM
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      source: 'hearing-test', // источник лида
      status: 'new', // статус
      created_at: new Date().toISOString()
    };

    console.log('Creating lead in CRM:', { name: userData.name, email: userData.email });

    // Запрос к CRM API
    const response = await fetch(`${CRM_API_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_API_KEY}`,
        // Добавьте другие необходимые headers
      },
      body: JSON.stringify(crmData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lead created successfully:', result.id || result);

    return {
      success: true,
      leadId: result.id || result.data?.id, // адаптируйте под структуру ответа
      data: result
    };

  } catch (error) {
    console.error('Error creating lead in CRM:', error);
    throw error;
  }
}

/**
 * Обновляет лида в CRM результатами теста
 *
 * @param {string} leadId - ID лида в CRM
 * @param {Object} testData - Результаты теста
 * @param {Object} testData.results - Результаты по частотам
 * @param {Object} testData.interpretation - Интерпретация результатов
 * @returns {Promise<Object>} Ответ от CRM API
 */
export async function updateLeadWithResults(leadId, testData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    // Подготовка данных результатов для CRM
    const { results, interpretation } = testData;

    // Вычисляем средние значения для каждого уха
    const leftValues = Object.values(results.left || {});
    const rightValues = Object.values(results.right || {});
    const allValues = [...leftValues, ...rightValues];

    const leftAvgDb = leftValues.length > 0
      ? leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length
      : 0;

    const rightAvgDb = rightValues.length > 0
      ? rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length
      : 0;

    const avgDb = allValues.length > 0
      ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length
      : 0;

    // Упрощенная структура данных для CRM
    // ВАЖНО: Названия полей нужно адаптировать под ваше CRM API
    const crmData = {
      test_result: interpretation.text,        // "Тяжелая степень"
      average_db: Math.round(avgDb),           // 75
      left_ear_avg_db: Math.round(leftAvgDb),  // 78
      right_ear_avg_db: Math.round(rightAvgDb), // 72
      test_date: new Date().toISOString()       // "2025-10-30T10:30:00Z"
    };

    console.log('Updating lead with results:', {
      leadId,
      test_result: crmData.test_result,
      average_db: crmData.average_db
    });

    // Запрос к CRM API для обновления
    const response = await fetch(`${CRM_API_URL}/leads/${leadId}`, {
      method: 'PUT', // или PATCH, в зависимости от API
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_API_KEY}`,
        // Добавьте другие необходимые headers
      },
      body: JSON.stringify(crmData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lead updated successfully:', leadId);

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('Error updating lead in CRM:', error);
    throw error;
  }
}

/**
 * Альтернативный метод: создает лида с полными данными сразу
 * Используйте этот метод, если CRM не требует разделения на создание и обновление
 *
 * @param {Object} userData - Данные пользователя
 * @param {Object} testData - Результаты теста
 * @returns {Promise<Object>} Ответ от CRM API
 */
export async function createLeadWithResults(userData, testData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    const { results, interpretation } = testData;

    // Вычисляем средние значения для каждого уха
    const leftValues = Object.values(results.left || {});
    const rightValues = Object.values(results.right || {});
    const allValues = [...leftValues, ...rightValues];

    const leftAvgDb = leftValues.length > 0
      ? leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length
      : 0;

    const rightAvgDb = rightValues.length > 0
      ? rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length
      : 0;

    const avgDb = allValues.length > 0
      ? allValues.reduce((sum, val) => sum + val, 0) / allValues.length
      : 0;

    // Упрощенная структура данных для CRM
    // ВАЖНО: Названия полей нужно адаптировать под ваше CRM API
    const crmData = {
      // Данные пользователя
      name: userData.name,                      // "Джон Смит"
      phone: userData.phone,                    // "+7 700 000 00 00"
      email: userData.email,                    // "jsm@mail.ru"

      // Результаты теста
      test_result: interpretation.text,         // "Тяжелая степень"
      average_db: Math.round(avgDb),            // 75
      left_ear_avg_db: Math.round(leftAvgDb),   // 78
      right_ear_avg_db: Math.round(rightAvgDb), // 72
      test_date: new Date().toISOString()       // "2025-10-30T10:30:00Z"
    };

    console.log('Creating lead with full data:', {
      name: userData.name,
      test_result: crmData.test_result,
      average_db: crmData.average_db
    });

    const response = await fetch(`${CRM_API_URL}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CRM_API_KEY}`,
      },
      body: JSON.stringify(crmData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CRM API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Lead created with results successfully');

    return {
      success: true,
      leadId: result.id || result.data?.id,
      data: result
    };

  } catch (error) {
    console.error('Error creating lead with results:', error);
    throw error;
  }
}
