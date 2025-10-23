import { useState, useRef, useEffect } from 'react';
import styles from './HeadphonesCheck.module.scss';

const HeadphonesCheck = ({ onNext, onBack }) => {
  const [checkedLeft, setCheckedLeft] = useState(false);
  const [checkedRight, setCheckedRight] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioLeftRef = useRef(null);
  const audioRightRef = useRef(null);

  useEffect(() => {
    // Обработчик ошибок загрузки аудио
    const handleAudioError = (e) => {
      console.error('Ошибка загрузки аудио:', e);
      setAudioError(true);
    };

    if (audioLeftRef.current) {
      audioLeftRef.current.addEventListener('error', handleAudioError);
    }
    if (audioRightRef.current) {
      audioRightRef.current.addEventListener('error', handleAudioError);
    }

    return () => {
      if (audioLeftRef.current) {
        audioLeftRef.current.removeEventListener('error', handleAudioError);
      }
      if (audioRightRef.current) {
        audioRightRef.current.removeEventListener('error', handleAudioError);
      }
    };
  }, []);

  const handlePlayLeft = () => {
    if (audioLeftRef.current) {
      audioLeftRef.current.currentTime = 0;
      audioLeftRef.current.play().catch(error => {
        console.error('Ошибка воспроизведения аудио:', error);
        alert('Не удалось воспроизвести звук. Проверьте, что аудио файлы доступны.');
      });
      setCheckedLeft(true);
    }
  };

  const handlePlayRight = () => {
    if (audioRightRef.current) {
      audioRightRef.current.currentTime = 0;
      audioRightRef.current.play().catch(error => {
        console.error('Ошибка воспроизведения аудио:', error);
        alert('Не удалось воспроизвести звук. Проверьте, что аудио файлы доступны.');
      });
      setCheckedRight(true);
    }
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 4;

  const canProceed = checkedLeft && checkedRight;

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

        <h1 className={styles.title}>Проверка наушников</h1>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            Наденьте наушники и установите громкость устройства на 70%.
          </p>
          <p className={styles.infoText}>
            Нажмите на кнопки, чтобы проверить левый и правый канал.
          </p>
        </div>

        <div className={styles.checkButtons}>
          <button
            type="button"
            className={`${styles.checkButton} ${checkedLeft ? styles.checked : ''}`}
            onClick={handlePlayLeft}
          >
            {checkedLeft && <span className={styles.checkmark}>✓</span>}
            Проверить левый
          </button>

          <button
            type="button"
            className={`${styles.checkButton} ${checkedRight ? styles.checked : ''}`}
            onClick={handlePlayRight}
          >
            {checkedRight && <span className={styles.checkmark}>✓</span>}
            Проверить правый
          </button>
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
            disabled={!canProceed}
            onClick={onNext}
          >
            Далее
          </button>
        </div>

        {/* Скрытые аудио элементы */}
        <audio ref={audioLeftRef} src="/sounds/test/audio-left.mp3" preload="auto" />
        <audio ref={audioRightRef} src="/sounds/test/audio-right.mp3" preload="auto" />
      </div>
    </div>
  );
};

export default HeadphonesCheck;
