import { useRef, useEffect, useState } from 'react';
import styles from './Results.module.scss';
import { drawUserResults, drawNormalResults } from './audiogramHelpers';
import { generatePDF } from '../utils/pdfGenerator';
import { submitTestResultsToCRM } from '../services/crmApi';
import { sendResultsEmail } from '../services/emailApi';

const Results = ({ testResults, onBack, onFinish, userData, crmLeadId }) => {
  const userCanvasRef = useRef(null);
  const normalCanvasRef = useRef(null);

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

  // Отправляем результаты в CRM при монтировании компонента
  useEffect(() => {
    if (crmLeadId && testResults) {
      const interpretation = getHearingInterpretation();
      submitTestResultsToCRM(crmLeadId, testResults, interpretation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Выполняется только при монтировании

  // Автоматически отправляем результаты на email после отрисовки графиков
  useEffect(() => {
    let emailSent = false;

    const sendEmailAutomatically = async () => {
      // Проверяем что графики отрисованы и email еще не отправлен
      if (userCanvasRef.current && normalCanvasRef.current && userData?.email && !emailSent) {
        emailSent = true; // Предотвращаем повторную отправку

        try {
          const interpretation = getHearingInterpretation();

          // Вычисляем средние значения для email
          const leftValues = Object.values(testResults.left || {});
          const rightValues = Object.values(testResults.right || {});
          const allValues = [...leftValues, ...rightValues];

          const leftAvgDb = leftValues.length > 0
            ? Math.round(leftValues.reduce((sum, val) => sum + val, 0) / leftValues.length)
            : 0;

          const rightAvgDb = rightValues.length > 0
            ? Math.round(rightValues.reduce((sum, val) => sum + val, 0) / rightValues.length)
            : 0;

          const avgDb = allValues.length > 0
            ? Math.round(allValues.reduce((sum, val) => sum + val, 0) / allValues.length)
            : 0;

          // Генерируем PDF как base64
          const pdfResult = await generatePDF(
            userData,
            testResults,
            interpretation,
            userCanvasRef.current,
            normalCanvasRef.current,
            { returnBase64: true }
          );

          if (pdfResult.success && pdfResult.base64) {
            // Отправляем email с PDF
            await sendResultsEmail({
              to: userData.email,
              name: userData.name,
              testResult: interpretation.text,
              averageDb: avgDb,
              leftEarDb: leftAvgDb,
              rightEarDb: rightAvgDb,
              description: interpretation.description,
              pdfBase64: pdfResult.base64
            });

            console.log('Results sent to email successfully');
          }
        } catch (error) {
          console.error('Error sending email:', error);
        }
      }
    };

    // Даем графикам немного времени на отрисовку
    const timer = setTimeout(() => {
      sendEmailAutomatically();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // 1 СТЕПЕНЬ
        level: 'normal',
        text: 'Нормальный слух',
        description: `Слух в пределах нормы, значимых отклонений не выявлено.
        Важно беречь уши от слишком громких звуков и проходить профилактическую проверку раз в год.
        Если появляется звон, ощущение заложенности или легкий дискомфорт, лучше пройти офлайн-аудиометрию в нашей клинике, чтобы убедиться, что все в порядке.`,
        color: '#4CAF50',

        hearingAid: null,
        hearingAidTitle: 'Слуховой аппарат не требуется',
        hearingAidDescription: 'При нормальном слухе использование слухового аппарата не требуется. Рекомендуется регулярная проверка слуха для профилактики.'
      };
    } else if (avgDb <= 40) {
      return {
        // 2 СТЕПЕНЬ
        level: 'mild',
        text: 'Легкая степень',
        description: `Отмечается небольшое снижение слуха.
        Тихая речь или шепот могут быть слышны нечетко, особенно в шумных помещениях.
        Рекомендуется провести аудиометрию для уточнения причин и, при необходимости, подобрать профилактическое лечение или легкий слуховой аппарат.
        Ранняя диагностика помогает сохранить слух надолго. Наша клиника проводит офлайн-аудиометрию и консультации специалистов.`,
        color: '#FFC107',

        hearingAid: '/images/hearing-aids/image1.png',
        hearingAidTitle: 'Внутриканальные аппараты (ITC/CIC)',
        hearingAidDescription: 'Компактные устройства, размещаемые внутри слухового канала. Практически незаметны, идеально подходят для лёгкой степени потери слуха. Обеспечивают естественное звучание и комфорт при повседневном использовании.'
      };
    } else if (avgDb <= 55) {
      return {
        // 3 СТЕПЕНЬ
        level: 'moderate',
        text: 'Умеренная степень',
        description: `Слух снижен заметно.
        Разговорная речь воспринимается не полностью, особенно если собеседник говорит тихо или стоит на расстоянии.
        Четкость звучания восстанавливается только при повышенном голосе.
        Рекомендуется консультация сурдолога и подбор слухового аппарата, который поможет вернуть комфортное восприятие звуков.`,
        color: '#FF9800',

        hearingAid: '/images/hearing-aids/image2.png',
        hearingAidTitle: 'Заушные аппараты с выносным ресивером (RIC)',
        hearingAidDescription: 'Современные заушные аппараты с динамиком в ушном канале. Обеспечивают отличное качество звука, комфортны в ношении. Подходят для умеренной потери слуха, имеют широкие возможности настройки и подавления шума.'
      };
    } else if (avgDb <= 70) {
      return {
        // 4 СТЕПЕНЬ
        level: 'moderately-severe',
        text: 'Выраженная степень',
        description: `Слух снижен значительно.
        Речь различается с трудом, понятна только громкая речь или отдельные слова вблизи.
        Без слухового аппарата становится сложно общаться и воспринимать звуки окружающего мира.
        В нашей клинике можно пройти полное обследование и подобрать индивидуальный усилитель слуха.`,
        color: '#FF5722',

        hearingAid: '/images/hearing-aids/image3.png',
        hearingAidTitle: 'Мощные заушные аппараты (BTE)',
        hearingAidDescription: 'Классические заушные аппараты повышенной мощности. Надежны, долговечны и обеспечивают мощное усиление звука. Подходят для умеренно-тяжёлой потери слуха, оснащены продвинутыми функциями шумоподавления и направленными микрофонами.'
      };
    } else {
      return {
        // 5 СТЕПЕНЬ
        level: 'severe', 
        text: 'Тяжелая степень',
        description: `Слух практически утрачен.
        Разговорная речь не различается, слышны только очень громкие звуки, например, крик или работающий двигатель.
        В этом случае важно обратиться к сурдологу для подбора подходящего решения: слухопротезирования или кохлеарной имплантации.
        Современные технологии позволяют вернуть возможность слышать и улучшить качество жизни даже при тяжелой степени снижения слуха.`,
        color: '#F44336',

        hearingAid: '/images/hearing-aids/image3.png',
        hearingAidTitle: 'Сверхмощные заушные аппараты (Power BTE)',
        hearingAidDescription: 'Сверхмощные слуховые аппараты для тяжёлой потери слуха. Обеспечивают максимальное усиление и отличную разборчивость речи. Оснащены влагозащитой, прочным корпусом и продвинутыми технологиями обработки звука для сложных акустических условий.'
      };
    } 
  };

  const interpretation = getHearingInterpretation();
  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 6;

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
            профессиональную диагностику.
          </p>
        </div>

        {/* <div className={styles.infoBox} style={{ background: '#E3F2FD', borderColor: '#2196F3' }}> */}
          <p className={styles.infoText2}>
            Результаты тестирования будут также отправлены на вашу почту.
          </p>
        {/* </div> */}

        <div className={styles.buttonGroup}>
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
