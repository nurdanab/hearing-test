import { useState, useRef, useEffect } from 'react';
import styles from './HearingTest.module.scss';

const HearingTest = ({ onNext, onBack }) => {
  // Константы
  const FREQUENCIES = [250, 500, 1000, 1500, 2000, 8000];
  const DB_LEVELS = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120];
  const EARS = ['left', 'right'];

  // Состояния
  const [currentEarIndex, setCurrentEarIndex] = useState(0);
  const [currentFrequencyIndex, setCurrentFrequencyIndex] = useState(0);
  const [currentDbLevel, setCurrentDbLevel] = useState(8); // 30 дБ (индекс 8 в массиве)
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchingDown, setSearchingDown] = useState(true); // Флаг: ищем порог "сверху вниз"
  const [results, setResults] = useState({
    left: {},
    right: {}
  });

  // Refs для Web Audio API
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Инициализация Audio Context
  useEffect(() => {
    // Проверка поддержки Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.error('Web Audio API не поддерживается в этом браузере');
      alert('Ваш браузер не поддерживает Web Audio API. Пожалуйста, используйте современный браузер (Chrome, Firefox, Safari, Edge).');
      return;
    }

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error('Ошибка инициализации Audio Context:', error);
      alert('Не удалось инициализировать аудио систему. Попробуйте обновить страницу.');
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Текущие параметры
  const currentEar = EARS[currentEarIndex];
  const currentFrequency = FREQUENCIES[currentFrequencyIndex];
  const currentDb = DB_LEVELS[currentDbLevel];

  // Количество пройденных частот
  const totalTests = FREQUENCIES.length * EARS.length;
  const completedTests = Object.keys(results.left).length + Object.keys(results.right).length;

  // Преобразование dB в gain
  const dbToGain = (db) => {
    // Калибровка для работы при системной громкости 70%
    // Увеличиваем диапазон gain, чтобы компенсировать 70% громкости
    // -10 dB -> очень тихо (gain = 0.02)
    // 120 dB -> максимум (gain = 1)
    const normalized = (db + 10) / 130; // Приводим к диапазону [0, 1]
    // Компенсируем 70% системной громкости, увеличивая gain на ~43% (1/0.7 ≈ 1.43)
    const compensated = normalized * 1.43;
    return Math.max(0.02, Math.min(1, compensated));
  };

  // Воспроизведение звука
  const playSound = () => {
    if (!audioContextRef.current) return;

    // Останавливаем предыдущий звук
    stopSound();

    const audioContext = audioContextRef.current;

    // Создаём осциллятор
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(currentFrequency, audioContext.currentTime);

    // Создаём gain node
    const gainNode = audioContext.createGain();
    const gain = dbToGain(currentDb);
    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);

    // Создаём panner для выбора уха
    // StereoPanner поддерживается в большинстве современных браузеров
    // Для старых браузеров используем PannerNode как фоллбэк
    let panner;
    if (audioContext.createStereoPanner) {
      panner = audioContext.createStereoPanner();
      panner.pan.setValueAtTime(currentEar === 'left' ? -1 : 1, audioContext.currentTime);
    } else {
      // Фоллбэк для старых браузеров
      panner = audioContext.createPanner();
      panner.panningModel = 'equalpower';
      panner.setPosition(currentEar === 'left' ? -1 : 1, 0, 0);
    }

    // Соединяем узлы
    oscillator.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioContext.destination);

    // Запускаем
    oscillator.start();

    // Автоматически останавливаем через 1.5 секунды (прерывистый звук)
    oscillator.stop(audioContext.currentTime + 1.5);

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);

    // Сбрасываем флаг isPlaying через 1.5 секунды
    setTimeout(() => {
      setIsPlaying(false);
    }, 1500);
  };

  // Остановка звука
  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Игнорируем ошибку если уже остановлен
      }
      oscillatorRef.current = null;
    }
    gainNodeRef.current = null;
    setIsPlaying(false);
  };

  // Автоматическое воспроизведение при изменении параметров
  useEffect(() => {
    if (completedTests < totalTests) {
      playSound();

      return () => {
        stopSound();
      };
    }
  }, [currentFrequency, currentDb, currentEar, completedTests]);

  // Обработчик "Не слышу"
  const handleNotHeard = () => {
    stopSound();

    // Переключаемся на режим "поиска снизу вверх"
    setSearchingDown(false);

    // Увеличиваем громкость на +5 dB (шаг 1 в массиве с шагом 5 дБ)
    if (currentDbLevel < DB_LEVELS.length - 1) {
      setCurrentDbLevel(currentDbLevel + 1);
    } else {
      // Если достигли максимума, сохраняем максимальное значение и переходим дальше
      saveThresholdAndMoveNext();
    }
  };

  // Обработчик "Слышу"
  const handleHeard = () => {
    stopSound();

    // Если ищем порог "сверху вниз" (ещё не было "Не слышу")
    if (searchingDown) {
      // Понижаем на 10 дБ (шаг 2 в массиве с шагом 5 дБ: 5*2=10)
      const newDbLevel = currentDbLevel - 2;

      if (newDbLevel >= 0) {
        setCurrentDbLevel(newDbLevel);
      } else {
        // Достигли минимума при поиске вниз - сохраняем минимальный уровень
        setCurrentDbLevel(0);
        saveThresholdAndMoveNext();
      }
    } else {
      // Если уже был режим "снизу вверх" (было "Не слышу"), то нашли порог
      saveThresholdAndMoveNext();
    }
  };

  // Функция для сохранения порога и перехода к следующей частоте
  const saveThresholdAndMoveNext = () => {
    // Сохраняем результат
    const newResults = { ...results };
    newResults[currentEar][currentFrequency] = currentDb;
    setResults(newResults);

    // Переходим к следующей частоте
    if (currentFrequencyIndex < FREQUENCIES.length - 1) {
      setCurrentFrequencyIndex(currentFrequencyIndex + 1);
      setCurrentDbLevel(8); // Сбрасываем на 30 дБ (индекс 8)
      setSearchingDown(true); // Сбрасываем флаг направления поиска
    } else {
      // Если частоты закончились, переходим к следующему уху
      if (currentEarIndex < EARS.length - 1) {
        setCurrentEarIndex(currentEarIndex + 1);
        setCurrentFrequencyIndex(0);
        setCurrentDbLevel(8); // Сбрасываем на 30 дБ (индекс 8)
        setSearchingDown(true); // Сбрасываем флаг направления поиска
      } else {
        // Тест завершён
        console.log('Результаты теста:', newResults);
      }
    }
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 5;

  const isTestComplete = completedTests >= totalTests;

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

        <h1 className={styles.title}>Тест на слух</h1>

        {!isTestComplete ? (
          <>
            <div className={styles.infoBox}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ухо:</span>
                <span className={styles.infoValue}>
                  {currentEar === 'left' ? 'Левое' : 'Правое'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Частота:</span>
                <span className={styles.infoValue}>{currentFrequency} Гц</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Громкость:</span>
                <span className={styles.infoValue}>{currentDb} дБ</span>
              </div>
            </div>

            <div className={styles.instructionBox}>
              <p className={styles.instructionText}>
                Нажмите "Слышу", когда услышите звук, или "Не слышу", чтобы увеличить громкость.
              </p>
            </div>

            <div className={styles.playButtonContainer}>
              <button
                type="button"
                className={styles.playButton}
                onClick={playSound}
                disabled={isPlaying}
              >
                {isPlaying ? 'Воспроизводится...' : 'Повторить звук'}
              </button>
            </div>

            <div className={styles.testButtons}>
              <button
                type="button"
                className={`${styles.testButton} ${styles.notHeardButton}`}
                onClick={handleNotHeard}
              >
                Не слышу
              </button>

              <button
                type="button"
                className={`${styles.testButton} ${styles.heardButton}`}
                onClick={handleHeard}
              >
                Слышу
              </button>
            </div>

            <div className={styles.progressInfo}>
              Прогресс: {completedTests} / {totalTests} частот
            </div>
          </>
        ) : (
          <>
            <div className={styles.successBox}>
              <span className={styles.successIcon}>✓</span>
              <p className={styles.successText}>
                Тест завершён! Все частоты проверены.
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
                onClick={() => onNext(results)}
              >
                Посмотреть результаты
              </button>
            </div>
          </>
        )}

        {!isTestComplete && (
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => {
                stopSound();
                onBack();
              }}
            >
              Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HearingTest;
