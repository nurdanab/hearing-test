import { useState } from 'react';
import styles from './UserForm.module.scss';

const UserForm = ({ onNext, onBack, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    phone: '+7',
    email: '',
    consent: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, '');

    const limitedPhone = phoneNumber.slice(0, 11);

    // Форматируем номер
    let formatted = '+7';

    if (limitedPhone.length > 1) {
      formatted += ' ' + limitedPhone.slice(1, 4);
    }
    if (limitedPhone.length > 4) {
      formatted += ' ' + limitedPhone.slice(4, 7);
    }
    if (limitedPhone.length > 7) {
      formatted += ' ' + limitedPhone.slice(7, 9);
    }
    if (limitedPhone.length > 9) {
      formatted += ' ' + limitedPhone.slice(9, 11);
    }

    return formatted;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === 'checkbox' ? checked : value;

    // Применяем маску для телефона
    if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = 'Введите ваше ФИО';
        }
        break;
      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length < 11) {
          error = 'Введите номер телефона полностью';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Введите email';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Некорректный email адрес';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));

    return error === '';
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Введите ваше ФИО';
      isValid = false;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      newErrors.phone = 'Введите номер телефона полностью';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Введите email';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email адрес';
      isValid = false;
    }

    if (!formData.consent) {
      newErrors.consent = 'Необходимо согласие на обработку данных';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Пометить все поля как touched
    setTouched({
      name: true,
      phone: true,
      email: true,
      consent: true
    });

    if (validateForm()) {
      onNext(formData);
    }
  };

  const steps = [1, 2, 3, 4, 5, 6];
  const currentStep = 1;

  // Проверка заполненности всех обязательных полей
  const isFormValid = () => {
    const phoneDigits = formData.phone.replace(/\D/g, '');
    return (
      formData.name.trim() !== '' &&
      phoneDigits.length === 11 &&
      formData.email.trim() !== '' &&
      formData.consent === true
    );
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

        <h1 className={styles.title}>Заполните форму</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              ФИО
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ''}`}
              placeholder="Введите ФИО"
            />
            {errors.name && touched.name && (
              <span className={styles.errorMessage}>{errors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Номер телефона
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${errors.phone && touched.phone ? styles.inputError : ''} ${formData.phone === '+7' ? styles.inputPlaceholder : ''}`}
              placeholder="+7"
            />
            {errors.phone && touched.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
              placeholder="Введите email"
            />
            {errors.email && touched.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Нажимая кнопку "Продолжить", я даю свое согласие на обработку моих персональных данных
              </span>
            </label>
            {errors.consent && touched.consent && (
              <span className={styles.errorMessage}>{errors.consent}</span>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.backButton} onClick={onBack}>
              Назад
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!isFormValid()}
            >
              Продолжить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
