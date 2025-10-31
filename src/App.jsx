import { useState, useEffect } from 'react';
import Welcome from './components/Welcome';
import UserForm from './components/UserForm';
import MiniSurvey from './components/MiniSurvey';
import Warning from './components/Warning';
import HeadphonesCheck from './components/HeadphonesCheck';
import HearingTest from './components/HearingTest';
import Results from './components/Results';
import {
  sendHeightToParent,
  scrollParentToTop,
  observeContentChanges,
  sendReadyMessage
} from './utils/iframeHelper';
import { submitUserDataToCRM } from './services/crmApi';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [crmLeadId, setCrmLeadId] = useState(null); // ID лида в CRM

  // Эффект для работы с iframe - отправка высоты и прокрутка
  useEffect(() => {
    // Отправляем сообщение о готовности при первой загрузке
    sendReadyMessage();

    // Начальная отправка высоты
    sendHeightToParent();

    // Настраиваем наблюдение за изменениями контента
    const cleanup = observeContentChanges(() => {
      sendHeightToParent();
    });

    // Дополнительная отправка высоты через небольшую задержку
    // (для случаев, когда контент загружается асинхронно)
    const timer = setTimeout(() => {
      sendHeightToParent();
    }, 500);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timer);
    };
  }, []);

  // Эффект для прокрутки и обновления высоты при смене шага
  useEffect(() => {
    // Прокручиваем родительскую страницу вверх
    scrollParentToTop();

    // Отправляем обновленную высоту
    // Небольшая задержка для завершения рендеринга
    const timer = setTimeout(() => {
      sendHeightToParent();
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleWelcomeNext = () => {
    setCurrentStep(1); // Переход к форме
  };

  const handleUserFormSubmit = async (formData) => {
    setUserData(formData);

    // Отправляем данные в CRM
    const leadId = await submitUserDataToCRM({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    });

    if (leadId) {
      setCrmLeadId(leadId);
    }

    setCurrentStep(2); // Переход к следующему шагу
  };

  const handleSurveySubmit = (answers) => {
    setSurveyData(answers);
    setCurrentStep(3); // Переход к предупреждению
  };

  const handleBackToWelcome = () => {
    setCurrentStep(0);
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
  };

  const handleWarningNext = () => {
    setCurrentStep(4); // Переход к проверке наушников
  };

  const handleBackToSurvey = () => {
    setCurrentStep(2);
  };

  const handleHeadphonesCheckNext = () => {
    setCurrentStep(5); // Переход к тесту на слух
  };

  const handleBackToWarning = () => {
    setCurrentStep(3);
  };

  const handleHearingTestNext = (results) => {
    setTestResults(results);
    setCurrentStep(6); // Переход к результатам
  };

  const handleBackToHeadphonesCheck = () => {
    setCurrentStep(4);
  };

  const handleBackToHearingTest = () => {
    setCurrentStep(5);
  };

  const handleFinish = () => {
    // Сброс всех данных и возврат на приветственную страницу
    setUserData(null);
    setSurveyData(null);
    setTestResults(null);
    setCrmLeadId(null);
    setCurrentStep(0);
  };

  return (
    <div className="app">
      {currentStep === 0 && <Welcome onNext={handleWelcomeNext} />}
      {currentStep === 1 && <UserForm onNext={handleUserFormSubmit} onBack={handleBackToWelcome} initialData={userData} />}
      {currentStep === 2 && (
        <MiniSurvey onNext={handleSurveySubmit} onBack={handleBackToForm} initialAnswers={surveyData} />
      )}
      {currentStep === 3 && (
        <Warning onNext={handleWarningNext} onBack={handleBackToSurvey} />
      )}
      {currentStep === 4 && (
        <HeadphonesCheck onNext={handleHeadphonesCheckNext} onBack={handleBackToWarning} />
      )}
      {currentStep === 5 && (
        <HearingTest onNext={handleHearingTestNext} onBack={handleBackToHeadphonesCheck} />
      )}
      {currentStep === 6 && (
        <Results
          testResults={testResults}
          userData={userData}
          crmLeadId={crmLeadId}
          onBack={handleBackToHearingTest}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}

export default App;
