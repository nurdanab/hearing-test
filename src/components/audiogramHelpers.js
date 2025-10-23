// Вспомогательные функции для рисования аудиограмм

const FREQUENCIES = [250, 500, 1000, 1500, 2000, 8000];
const DB_LEVELS = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
const DISPLAY_DB_LEVELS = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];

// Функция для рисования базовой сетки
export const drawBaseGrid = (ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 50, right: 30, bottom: 50, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Фон графика
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(padding.left, padding.top, chartWidth, chartHeight);

  // Горизонтальные линии (dB levels)
  DISPLAY_DB_LEVELS.forEach((db) => {
    const dbIndex = DB_LEVELS.indexOf(db);
    const y = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * dbIndex;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();

    // Подписи dB
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(db + ' дБ', padding.left - 8, y);
  });

  // Вертикальные линии (частоты)
  FREQUENCIES.forEach((freq, index) => {
    const x = padding.left + (chartWidth / (FREQUENCIES.length - 1)) * index;

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();

    // Подписи частот
    ctx.fillStyle = '#666';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(freq + ' Гц', x, padding.top + chartHeight + 8);
  });

  // Рамка
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);

  // Зона нормального слуха (до 25 дБ)
  const normalThresholdIndex = DB_LEVELS.indexOf(25);
  if (normalThresholdIndex !== -1) {
    const normalThresholdY = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * normalThresholdIndex;
    ctx.fillStyle = 'rgba(76, 175, 80, 0.08)';
    ctx.fillRect(padding.left, padding.top, chartWidth, normalThresholdY - padding.top);
  }

  return { padding, chartWidth, chartHeight };
};

// Функция для получения координат точки
const getPointCoordinates = (freqIndex, dbValue, padding, chartWidth, chartHeight) => {
  const x = padding.left + (chartWidth / (FREQUENCIES.length - 1)) * freqIndex;
  const dbIndex = DB_LEVELS.indexOf(dbValue);
  const y = padding.top + (chartHeight / (DB_LEVELS.length - 1)) * dbIndex;
  return { x, y };
};

// Рисование результатов пользователя
export const drawUserResults = (canvas, testResults) => {
  if (!canvas || !testResults) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const { padding, chartWidth, chartHeight } = drawBaseGrid(ctx, width, height);

  // Левое ухо (синяя линия с крестиками)
  if (testResults.left) {
    ctx.strokeStyle = '#2196F3';
    ctx.fillStyle = '#2196F3';
    ctx.lineWidth = 2;

    const leftPoints = FREQUENCIES.map((freq, index) => {
      const dbValue = testResults.left[freq];
      if (dbValue !== undefined) {
        return getPointCoordinates(index, dbValue, padding, chartWidth, chartHeight);
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
      const size = 8;
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(point.x - size, point.y - size);
      ctx.lineTo(point.x + size, point.y + size);
      ctx.moveTo(point.x + size, point.y - size);
      ctx.lineTo(point.x - size, point.y + size);
      ctx.stroke();
    });
  }

  // Правое ухо (красная линия с кружками)
  if (testResults.right) {
    ctx.strokeStyle = '#F44336';
    ctx.fillStyle = '#F44336';
    ctx.lineWidth = 2;

    const rightPoints = FREQUENCIES.map((freq, index) => {
      const dbValue = testResults.right[freq];
      if (dbValue !== undefined) {
        return getPointCoordinates(index, dbValue, padding, chartWidth, chartHeight);
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
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }

  // Легенда
  const legendY = padding.top - 25;

  // Левое ухо
  ctx.strokeStyle = '#2196F3';
  ctx.lineWidth = 2;
  const leftLegendX = padding.left + 10;
  ctx.beginPath();
  ctx.moveTo(leftLegendX - 6, legendY - 6);
  ctx.lineTo(leftLegendX + 6, legendY + 6);
  ctx.moveTo(leftLegendX + 6, legendY - 6);
  ctx.lineTo(leftLegendX - 6, legendY + 6);
  ctx.stroke();

  ctx.fillStyle = '#2196F3';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Левое', leftLegendX + 12, legendY);

  // Правое ухо
  ctx.strokeStyle = '#F44336';
  const rightLegendX = padding.left + 80;
  ctx.beginPath();
  ctx.arc(rightLegendX, legendY, 5, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#F44336';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Правое', rightLegendX + 12, legendY);
};

// Рисование нормы
export const drawNormalResults = (canvas) => {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  const { padding, chartWidth, chartHeight } = drawBaseGrid(ctx, width, height);

  // Реалистичные значения для человека с отличным слухом
  // Небольшие вариации в пределах -10 до +5 дБ
  const normalDbValues = [-5, 0, -5, 0, 5, 0]; // Значения для каждой частоты

  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2.5;

  const normalPoints = FREQUENCIES.map((freq, index) => {
    return getPointCoordinates(index, normalDbValues[index], padding, chartWidth, chartHeight);
  });

  // Линия
  ctx.beginPath();
  ctx.moveTo(normalPoints[0].x, normalPoints[0].y);
  for (let i = 1; i < normalPoints.length; i++) {
    ctx.lineTo(normalPoints[i].x, normalPoints[i].y);
  }
  ctx.stroke();

  // Квадратики
  normalPoints.forEach(point => {
    ctx.fillStyle = '#4CAF50';
    const size = 5;
    ctx.fillRect(point.x - size, point.y - size, size * 2, size * 2);
  });

  // Легенда
  const legendY = padding.top - 25;
  const normalLegendX = padding.left + 10;

  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(normalLegendX - 10, legendY);
  ctx.lineTo(normalLegendX + 10, legendY);
  ctx.stroke();

  ctx.fillStyle = '#4CAF50';
  const size = 5;
  ctx.fillRect(normalLegendX - size, legendY - size, size * 2, size * 2);

  ctx.fillStyle = '#4CAF50';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Норма (отличный слух)', normalLegendX + 15, legendY);
};
