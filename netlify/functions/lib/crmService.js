/**
 * Сервис для работы с CRM API
 *
 * ВАЖНО: Этот файл нужно будет адаптировать под конкретное CRM API,
 * когда получите документацию от заказчика.
 */

/**
 * Создает нового лида в CRM с данными формы
 */
export async function createLead(userData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    const crmData = {
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      source: 'hearing-test',
      status: 'new',
      created_at: new Date().toISOString()
    };

    console.log('Creating lead in CRM:', { name: userData.name, email: userData.email });

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
    console.log('Lead created successfully:', result.id || result);

    return {
      success: true,
      leadId: result.id || result.data?.id,
      data: result
    };

  } catch (error) {
    console.error('Error creating lead in CRM:', error);
    throw error;
  }
}

/**
 * Обновляет лида в CRM результатами теста
 */
export async function updateLeadWithResults(leadId, testData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    const { results, interpretation } = testData;

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

    const crmData = {
      test_result: interpretation.text,
      average_db: Math.round(avgDb),
      left_ear_avg_db: Math.round(leftAvgDb),
      right_ear_avg_db: Math.round(rightAvgDb),
      test_date: new Date().toISOString()
    };

    console.log('Updating lead with results:', {
      leadId,
      test_result: crmData.test_result,
      average_db: crmData.average_db
    });

    const response = await fetch(`${CRM_API_URL}/leads/${leadId}`, {
      method: 'PUT',
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
 */
export async function createLeadWithResults(userData, testData) {
  const CRM_API_URL = process.env.CRM_API_URL;
  const CRM_API_KEY = process.env.CRM_API_KEY;

  if (!CRM_API_URL || !CRM_API_KEY) {
    throw new Error('CRM API credentials not configured');
  }

  try {
    const { results, interpretation } = testData;

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

    const crmData = {
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      test_result: interpretation.text,
      average_db: Math.round(avgDb),
      left_ear_avg_db: Math.round(leftAvgDb),
      right_ear_avg_db: Math.round(rightAvgDb),
      test_date: new Date().toISOString()
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
