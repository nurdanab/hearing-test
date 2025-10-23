import { useRef, useEffect, useState } from 'react';
import styles from './Results.module.scss';
import { drawUserResults, drawNormalResults } from './audiogramHelpers';
import { generatePDF } from '../utils/pdfGenerator';

const Results = ({ testResults, onBack, onFinish, userData }) => {
  const userCanvasRef = useRef(null);
  const normalCanvasRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Рисуем графики при монтировании и изменении данных
  useEffect(() => {
    if (userCanvasRef.current) {
      drawUserResults(userCanvasRef.current, testResults);
    }
  }, [testResults]);

  useEffect(() => {
    if (normalCanvasRef.current) {
      drawNormalResults(normalCanvasRef.current);
    }
  }, []);

  // Интерпретация результатов
  const getHearingInterpretation = () => {
    if (!testResults?.left || !testResults?.right) {
      return {
        level: 'unknown',
        text: 'Недостаточно данных для анализа',
        description: 'Не удалось получить достаточно данных для определения состояния слуха.',
        color: '#999999'
      };
    }

    // Вычисляем средний порог слышимости
    const leftValues = Object.values(testResults.left);
    const rightValues = Object.values(testResults.right);
    const allValues = [...leftValues, ...rightValues];

    if (allValues.length === 0) {
      return {
        level: 'unknown',
        text: 'Недостаточно данных для анализа',
        description: 'Не удалось получить достаточно данных для определения состояния слуха.',
        color: '#999999'
      };
    }

    const avgDb = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const avgLeftDb = leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length;
    const avgRightDb = rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length;

    if (avgDb <= 25) {
      return {
        level: 'normal',
        text: 'Нормальный слух',
        description: `Ваш слух находится в пределах нормы. Средний порог слышимости составляет ${Math.round(avgDb)} дБ, что соответствует нормальному восприятию звуков. Вы можете слышать тихую речь и различать звуки в обычных условиях без затруднений.`,
        color: '#4CAF50',
        hearingAid: null,
        hearingAidTitle: 'Слуховой аппарат не требуется',
        hearingAidDescription: 'При нормальном слухе использование слухового аппарата не требуется. Рекомендуется регулярная проверка слуха для профилактики.'
      };
    } else if (avgDb <= 40) {
      return {
        level: 'mild',
        text: 'Лёгкая потеря слуха',
        description: `Обнаружена лёгкая потеря слуха. Средний порог слышимости: ${Math.round(avgDb)} дБ. Вы можете испытывать трудности при восприятии тихой речи или звуков на расстоянии, особенно в шумной обстановке. Рекомендуется консультация специалиста для оценки необходимости коррекции слуха.`,
        color: '#FFC107',
        hearingAid: '/images/hearing-aids/image1.png',
        hearingAidTitle: 'Внутриканальные аппараты (ITC/CIC)',
        hearingAidDescription: 'Компактные устройства, размещаемые внутри слухового канала. Практически незаметны, идеально подходят для лёгкой степени потери слуха. Обеспечивают естественное звучание и комфорт при повседневном использовании.'
      };
    } else if (avgDb <= 55) {
      return {
        level: 'moderate',
        text: 'Умеренная потеря слуха',
        description: `Обнаружена умеренная потеря слуха. Средний порог слышимости: ${Math.round(avgDb)} дБ. Вы испытываете значительные трудности в восприятии обычной речи без усиления звука. Затруднено общение в группе людей и при фоновом шуме. Настоятельно рекомендуется обращение к врачу-сурдологу для подбора слухового аппарата.`,
        color: '#FF9800',
        hearingAid: '/images/hearing-aids/image2.png',
        hearingAidTitle: 'Заушные аппараты с выносным ресивером (RIC)',
        hearingAidDescription: 'Современные заушные аппараты с динамиком в ушном канале. Обеспечивают отличное качество звука, комфортны в ношении. Подходят для умеренной потери слуха, имеют широкие возможности настройки и подавления шума.'
      };
    } else if (avgDb <= 70) {
      return {
        level: 'moderately-severe',
        text: 'Умеренно-тяжёлая потеря слуха',
        description: `Обнаружена умеренно-тяжёлая потеря слуха. Средний порог слышимости: ${Math.round(avgDb)} дБ. Восприятие речи значительно затруднено даже при громком разговоре. Необходимо использование слухового аппарата. Обязательно обратитесь к врачу-сурдологу для комплексного обследования и подбора средств реабилитации.`,
        color: '#FF5722',
        hearingAid: '/images/hearing-aids/image3.png',
        hearingAidTitle: 'Мощные заушные аппараты (BTE)',
        hearingAidDescription: 'Классические заушные аппараты повышенной мощности. Надежны, долговечны и обеспечивают мощное усиление звука. Подходят для умеренно-тяжёлой потери слуха, оснащены продвинутыми функциями шумоподавления и направленными микрофонами.'
      };
    } else if (avgDb <= 90) {
      return {
        level: 'severe',
        text: 'Тяжёлая потеря слуха',
        description: `Обнаружена тяжёлая потеря слуха. Средний порог слышимости: ${Math.round(avgDb)} дБ. Восприятие речи без слухового аппарата практически невозможно. Слышны только очень громкие звуки. Требуется срочная консультация врача-сурдолога и использование мощного слухового аппарата или рассмотрение вопроса о кохлеарной имплантации.`,
        color: '#F44336',
        hearingAid: '/images/hearing-aids/image3.png',
        hearingAidTitle: 'Сверхмощные заушные аппараты (Power BTE)',
        hearingAidDescription: 'Сверхмощные слуховые аппараты для тяжёлой потери слуха. Обеспечивают максимальное усиление и отличную разборчивость речи. Оснащены влагозащитой, прочным корпусом и продвинутыми технологиями обработки звука для сложных акустических условий.'
      };
    } else {
      return {
        level: 'profound',
        text: 'Глубокая потеря слуха',
        description: `Обнаружена глубокая потеря слуха. Средний порог слышимости: ${Math.round(avgDb)} дБ. Восприятие звуков крайне ограничено или отсутствует. Необходима срочная консультация врача-сурдолога для рассмотрения возможности кохлеарной имплантации или использования других высокотехнологичных средств реабилитации.`,
        color: '#D32F2F',
        hearingAid: '/images/hearing-aids/image2.png',
        hearingAidTitle: 'Кохлеарный имплант',
        hearingAidDescription: 'Высокотехнологичное устройство, которое обходит поврежденные части уха и напрямую стимулирует слуховой нерв. Подходит для глубокой потери слуха, когда традиционные слуховые аппараты неэффективны. Требует хирургической установки и последующей настройки специалистом.'
      };
    }
  };

  const interpretation = getHearingInterpretation();
  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 6;

  // Функция для скачивания PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const result = await generatePDF(
        userData,
        testResults,
        interpretation,
        userCanvasRef.current,
        normalCanvasRef.current
      );

      if (result.success) {
        console.log('PDF успешно сгенерирован:', result.fileName);
      } else {
        console.error('Ошибка генерации PDF:', result.error);
        alert('Произошла ошибка при генерации PDF. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при генерации PDF. Попробуйте еще раз.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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

        <div className={styles.resultInline}>
          <svg
            className={styles.resultIcon}
            style={{ color: interpretation.color }}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path d="M 30 50 L 45 65 L 70 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className={styles.resultText}>Ваш результат - {interpretation.text}</span>
        </div>

        <div className={styles.chartsContainer}>
          <div className={styles.chartBlock}>
            <h3 className={styles.chartTitle}>Ваши результаты</h3>
            <canvas
              ref={userCanvasRef}
              width={800}
              height={500}
              className={styles.audiogramCanvas}
            />
          </div>
          <div className={styles.chartBlock}>
            <h3 className={styles.chartTitle}>Норма</h3>
            <canvas
              ref={normalCanvasRef}
              width={800}
              height={500}
              className={styles.audiogramCanvas}
            />
          </div>
        </div>

        <div className={styles.descriptionBox}>
          <h3 className={styles.descriptionTitle}>Описание результата</h3>
          <p className={styles.descriptionText}>
            {interpretation.description}
          </p>
        </div>

        <div className={styles.hearingAidBox}>
          <h3 className={styles.hearingAidBoxTitle}>Рекомендация по слуховому аппарату</h3>
          <div className={styles.hearingAidContent}>
            {interpretation.hearingAid && (
              <div className={styles.hearingAidImageWrapper}>
                <img
                  src={interpretation.hearingAid}
                  alt={interpretation.hearingAidTitle}
                  className={styles.hearingAidImage}
                />
              </div>
            )}
            <div className={styles.hearingAidInfo}>
              <h4 className={styles.hearingAidTitle}>{interpretation.hearingAidTitle}</h4>
              <p className={styles.hearingAidDescription}>
                {interpretation.hearingAidDescription}
              </p>
            </div>
          </div>
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
            className={styles.downloadButton}
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? 'Генерация PDF...' : 'Скачать результаты в PDF'}
          </button>
          <button
            type="button"
            className={styles.submitButton}
            onClick={onFinish}
          >
            Пройти повторно
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
