import { useState } from 'react';
import styles from './MiniSurvey.module.scss';

const questions = [
  {
    id: 1,
    question: 'Как давно вы заметили ухудшение слуха?',
    options: [
      'Более 5 лет',
      'Более года',
      'Менее 3 месяцев'
    ]
  },
  {
    id: 2,
    question: 'Часто ли вы переспрашиваете?',
    options: [
      'Более 5 лет',
      'Более года',
      'Менее 3 месяцев'
    ]
  },
  {
    id: 3,
    question: 'Есть ли звон или шум в ушах?',
    options: [
      'Более 5 лет',
      'Более года',
      'Менее 3 месяцев'
    ]
  }
];

const MiniSurvey = ({ onNext, onBack, initialAnswers }) => {
  const [answers, setAnswers] = useState(initialAnswers || {
    1: null,
    2: null,
    3: null
  });

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(answers);
  };

  const isAllAnswered = () => {
    return Object.values(answers).every(answer => answer !== null);
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 2;

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

        <h1 className={styles.title}>Пройдите мини опрос</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {questions.map((q) => (
            <div key={q.id} className={styles.questionBlock}>
              <h3 className={styles.questionTitle}>{q.question}</h3>
              <div className={styles.optionsGroup}>
                {q.options.map((option, index) => (
                  <label
                    key={index}
                    className={`${styles.optionLabel} ${
                      answers[q.id] === option ? styles.optionSelected : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={() => handleAnswerSelect(q.id, option)}
                      className={styles.radioInput}
                    />
                    <span className={styles.customRadio}></span>
                    <span className={styles.optionText}>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.buttonGroup}>
          <button
              type="button"
              className={styles.backButton}
              onClick={onBack}
            >
              Назад
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isAllAnswered()}
            >
              Далее
            </button>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default MiniSurvey;
