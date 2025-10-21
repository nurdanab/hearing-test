import { useRef, useEffect, useCallback } from 'react';
import styles from './Results.module.scss';

const Results = ({ testResults, onBack, onFinish }) => {
  const canvasRef = useRef(null);

  const FREQUENCIES = [250, 500, 1000, 1500, 2000, 8000];
  const DB_LEVELS = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];

  // Уровни для отображения на графике (каждые 10 дБ для читаемости)
  const DISPLAY_DB_LEVELS = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

  const drawAudiogram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Параметры графика
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Фон графика
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

    // Сетка - рисуем линии только для DISPLAY_DB_LEVELS (каждые 10 дБ)
    DISPLAY_DB_LEVELS.forEach((db) => {
      const dbIndex = DB_LEVELS.indexOf(db);
      const y = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * dbIndex;

      // Основные линии (каждые 10 дБ) - более заметные
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Подписи уровней dB (слева)
      ctx.fillStyle = '#666';
      ctx.font = '13px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(db + ' дБ', padding.left - 10, y);
    });

    // Промежуточные линии (каждые 5 дБ) - тонкие, пунктирные
    DB_LEVELS.forEach((db, index) => {
      if (!DISPLAY_DB_LEVELS.includes(db)) {
        const y = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * index;

        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 3]); // Пунктир
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]); // Сброс пунктира
      }
    });

    // Вертикальные линии (частоты)
    FREQUENCIES.forEach((freq, index) => {
      const x = padding.left + (chartWidth / (FREQUENCIES.length - 1)) * index;

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();

      // Подписи частот (снизу)
      ctx.fillStyle = '#666';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(freq + ' Гц', x, padding.top + chartHeight + 10);
    });

    // Рамка графика
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

    // Зона нормального слуха (до 25 дБ) - зелёная заливка
    const normalThresholdIndex = DB_LEVELS.indexOf(25);
    if (normalThresholdIndex !== -1) {
      const normalThresholdY = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * normalThresholdIndex;
      ctx.fillStyle = 'rgba(76, 175, 80, 0.08)'; // Светло-зелёный с прозрачностью
      ctx.fillRect(padding.left, padding.top, chartWidth, normalThresholdY - padding.top);

      // Линия границы нормы (25 дБ)
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, normalThresholdY);
      ctx.lineTo(padding.left + chartWidth, normalThresholdY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Функция для получения координат точки
    const getPointCoordinates = (freqIndex, dbValue) => {
      const x = padding.left + (chartWidth / (FREQUENCIES.length - 1)) * freqIndex;
      const dbIndex = DB_LEVELS.indexOf(dbValue);
      const y = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * dbIndex;
      return { x, y };
    };

    // Рисование данных для левого уха (синяя линия с крестиками)
    if (testResults?.left) {
      ctx.strokeStyle = '#2196F3';
      ctx.fillStyle = '#2196F3';
      ctx.lineWidth = 2;

      const leftPoints = FREQUENCIES.map((freq, index) => {
        const dbValue = testResults.left[freq];
        if (dbValue !== undefined) {
          return getPointCoordinates(index, dbValue);
        }
        return null;
      }).filter(p => p !== null);

      // Линия
      if (leftPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (let i = 1; i < leftPoints.length; i++) {
          ctx.lineTo(leftPoints[i].x, leftPoints[i].y);
        }
        ctx.stroke();
      }

      // Крестики
      leftPoints.forEach(point => {
        const size = 10;
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(point.x - size, point.y - size);
        ctx.lineTo(point.x + size, point.y + size);
        ctx.moveTo(point.x + size, point.y - size);
        ctx.lineTo(point.x - size, point.y + size);
        ctx.stroke();
      });
    }

    // Рисование данных для правого уха (красная линия с кружками)
    if (testResults?.right) {
      ctx.strokeStyle = '#F44336';
      ctx.fillStyle = '#F44336';
      ctx.lineWidth = 2;

      const rightPoints = FREQUENCIES.map((freq, index) => {
        const dbValue = testResults.right[freq];
        if (dbValue !== undefined) {
          return getPointCoordinates(index, dbValue);
        }
        return null;
      }).filter(p => p !== null);

      // Линия
      if (rightPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(rightPoints[0].x, rightPoints[0].y);
        for (let i = 1; i < rightPoints.length; i++) {
          ctx.lineTo(rightPoints[i].x, rightPoints[i].y);
        }
        ctx.stroke();
      }

      // Кружки
      rightPoints.forEach(point => {
        ctx.strokeStyle = '#F44336';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });
    }

    // Легенда
    const legendY = padding.top - 20;

    // Левое ухо
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    const leftLegendX = padding.left + 20;
    ctx.beginPath();
    ctx.moveTo(leftLegendX - 8, legendY - 8);
    ctx.lineTo(leftLegendX + 8, legendY + 8);
    ctx.moveTo(leftLegendX + 8, legendY - 8);
    ctx.lineTo(leftLegendX - 8, legendY + 8);
    ctx.stroke();

    ctx.fillStyle = '#2196F3';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Левое ухо', leftLegendX + 15, legendY);

    // Правое ухо
    ctx.strokeStyle = '#F44336';
    const rightLegendX = padding.left + 120;
    ctx.beginPath();
    ctx.arc(rightLegendX, legendY, 6, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#F44336';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('Правое ухо', rightLegendX + 15, legendY);
  }, [testResults, FREQUENCIES, DB_LEVELS]);

  useEffect(() => {
    drawAudiogram();
  }, [drawAudiogram]);

  // Интерпретация результатов
  const getHearingInterpretation = () => {
    if (!testResults?.left || !testResults?.right) {
      return { level: 'unknown', text: 'Недостаточно данных для анализа', color: '#999999' };
    }

    // Вычисляем средний порог слышимости
    const leftValues = Object.values(testResults.left);
    const rightValues = Object.values(testResults.right);
    const allValues = [...leftValues, ...rightValues];

    if (allValues.length === 0) {
      return { level: 'unknown', text: 'Недостаточно данных для анализа', color: '#999999' };
    }

    const avgDb = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

    if (avgDb <= 25) {
      return {
        level: 'normal',
        text: 'Нормальный слух',
        color: '#4CAF50'
      };
    } else if (avgDb <= 40) {
      return {
        level: 'mild',
        text: 'Легкая потеря слуха',
        color: '#FFC107'
      };
    } else if (avgDb <= 55) {
      return {
        level: 'moderate',
        text: 'Умеренная потеря слуха',
        color: '#FF9800'
      };
    } else if (avgDb <= 70) {
      return {
        level: 'moderately-severe',
        text: 'Умеренно-тяжелая потеря слуха',
        color: '#FF5722'
      };
    } else if (avgDb <= 90) {
      return {
        level: 'severe',
        text: 'Тяжелая потеря слуха',
        color: '#F44336'
      };
    } else {
      return {
        level: 'profound',
        text: 'Глубокая потеря слуха',
        color: '#D32F2F'
      };
    }
  };

  const interpretation = getHearingInterpretation();
  const steps = [1, 2, 3, 4, 5];
  const currentStep = 5;

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <div className={styles.stepsIndicator}>
          {steps.map((step, index) => (
            <div key={step} className={styles.stepWrapper}>
              <div className={step === currentStep ? styles.activeStep : styles.step}>
                {step}
              </div>
              {index < steps.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>

        <h1 className={styles.title}>Результаты теста</h1>

        <div className={styles.interpretationBox} style={{ borderColor: interpretation.color }}>
          {/* <div className={styles.interpretationIcon} style={{ color: interpretation.color }}>
            📊
          </div> */}
          <div>
            <h3 className={styles.interpretationTitle}>Ваш результат</h3>
            <p className={styles.interpretationText} style={{ color: interpretation.color }}>
              {interpretation.text}
            </p>
          </div>
        </div>

        <div className={styles.canvasWrapper}>
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className={styles.audiogramCanvas}
          />
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>Примечание:</strong> Данный тест является ориентировочным и не заменяет
            профессиональную диагностику. Для точного определения состояния слуха обратитесь
            к врачу-сурдологу или отоларингологу.
          </p>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
          >
            Назад
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={onFinish}
          >
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
