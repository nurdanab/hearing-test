import express from 'express';
import { createLead, updateLeadWithResults, createLeadWithResults } from '../services/crmService.js';

const router = express.Router();

/**
 * POST /api/crm/lead
 * Создает нового лида в CRM с данными формы
 *
 * Body:
 * {
 *   name: string,
 *   phone: string,
 *   email: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   leadId: string,
 *   message: string
 * }
 */
router.post('/lead', async (req, res, next) => {
  try {
    const { name, phone, email } = req.body;

    // Валидация входных данных
    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phone, email'
      });
    }

    // Создаем лида в CRM
    const result = await createLead({ name, phone, email });

    res.json({
      success: true,
      leadId: result.leadId,
      message: 'Lead created successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/crm/lead/:leadId/results
 * Обновляет лида результатами теста
 *
 * Params:
 * - leadId: ID лида в CRM
 *
 * Body:
 * {
 *   results: {
 *     left: { 250: number, 500: number, ... },
 *     right: { 250: number, 500: number, ... }
 *   },
 *   interpretation: {
 *     level: string,
 *     text: string,
 *     description: string,
 *     hearingAidTitle: string,
 *     ...
 *   }
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 */
router.put('/lead/:leadId/results', async (req, res, next) => {
  try {
    const { leadId } = req.params;
    const { results, interpretation } = req.body;

    // Валидация
    if (!leadId) {
      return res.status(400).json({
        success: false,
        error: 'Lead ID is required'
      });
    }

    if (!results || !interpretation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: results, interpretation'
      });
    }

    // Обновляем лида результатами
    await updateLeadWithResults(leadId, { results, interpretation });

    res.json({
      success: true,
      message: 'Lead updated with test results successfully'
    });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/crm/lead-with-results
 * Создает лида сразу с результатами теста (альтернативный вариант)
 *
 * Body:
 * {
 *   userData: {
 *     name: string,
 *     phone: string,
 *     email: string
 *   },
 *   testData: {
 *     results: { ... },
 *     interpretation: { ... }
 *   }
 * }
 *
 * Response:
 * {
 *   success: true,
 *   leadId: string,
 *   message: string
 * }
 */
router.post('/lead-with-results', async (req, res, next) => {
  try {
    const { userData, testData } = req.body;

    // Валидация
    if (!userData || !userData.name || !userData.phone || !userData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required user data fields'
      });
    }

    if (!testData || !testData.results || !testData.interpretation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required test data fields'
      });
    }

    // Создаем лида с результатами
    const result = await createLeadWithResults(userData, testData);

    res.json({
      success: true,
      leadId: result.leadId,
      message: 'Lead created with results successfully'
    });

  } catch (error) {
    next(error);
  }
});

export default router;
