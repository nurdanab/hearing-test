import { useState } from 'react';
import Welcome from './components/Welcome';
import UserForm from './components/UserForm';
import MiniSurvey from './components/MiniSurvey';
import Warning from './components/Warning';
import HeadphonesCheck from './components/HeadphonesCheck';
import HearingTest from './components/HearingTest';
import Results from './components/Results';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const handleWelcomeNext = () => {
    console.log('Начало теста');
    setCurrentStep(1); // Переход к форме
  };

  const handleUserFormSubmit = (formData) => {
    console.log('Данные формы:', formData);
    setUserData(formData);
    setCurrentStep(2); // Переход к следующему шагу
  };

  const handleSurveySubmit = (answers) => {
    console.log('Ответы опроса:', answers);
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
    console.log('Переход к проверке наушников');
    setCurrentStep(4); // Переход к проверке наушников
  };

  const handleBackToSurvey = () => {
    setCurrentStep(2);
  };

  const handleHeadphonesCheckNext = () => {
    console.log('Проверка наушников завершена');
    setCurrentStep(5); // Переход к тесту на слух
  };

  const handleBackToWarning = () => {
    setCurrentStep(3);
  };

  const handleHearingTestNext = (results) => {
    console.log('Результаты теста на слух:', results);
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
    console.log('Тест завершён');
    console.log('Все данные:', {
      userData,
      surveyData,
      testResults
    });
    // Сброс всех данных и возврат на приветственную страницу
    setUserData(null);
    setSurveyData(null);
    setTestResults(null);
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
          onBack={handleBackToHearingTest}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}

export default App;
