import styles from './Warning.module.scss';

const Warning = ({ onNext, onBack }) => {
  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 3;

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

        <h1 className={styles.title}>Важная информация</h1>

        <div className={styles.warningBox}>
          <p className={styles.warningText}>
            Тест не является медицинским диагнозом — рекомендуется записаться на офлайн-консультацию.
          </p>
          <p className={styles.warningText}>
            Для корректного прохождения теста используйте наушники.
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
            className={styles.nextButton}
            onClick={onNext}
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Warning;
