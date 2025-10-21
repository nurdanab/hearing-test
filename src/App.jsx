import { useState } from 'react';
import UserForm from './components/UserForm';
import MiniSurvey from './components/MiniSurvey';
import HeadphonesCheck from './components/HeadphonesCheck';
import HearingTest from './components/HearingTest';
import Results from './components/Results';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const handleUserFormSubmit = (formData) => {
    console.log('Данные формы:', formData);
    setUserData(formData);
    setCurrentStep(2); // Переход к следующему шагу
  };

  const handleSurveySubmit = (answers) => {
    console.log('Ответы опроса:', answers);
    setSurveyData(answers);
    setCurrentStep(3); // Переход к следующему шагу
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
  };

  const handleHeadphonesCheckNext = () => {
    console.log('Проверка наушников завершена');
    setCurrentStep(4); // Переход к следующему шагу
  };

  const handleBackToSurvey = () => {
    setCurrentStep(2);
  };

  const handleHearingTestNext = (results) => {
    console.log('Результаты теста на слух:', results);
    setTestResults(results);
    setCurrentStep(5); // Переход к следующему шагу
  };

  const handleBackToHeadphonesCheck = () => {
    setCurrentStep(3);
  };

  const handleBackToHearingTest = () => {
    setCurrentStep(4);
  };

  const handleFinish = () => {
    console.log('Тест завершён');
    console.log('Все данные:', {
      userData,
      surveyData,
      testResults
    });
    // Здесь можно добавить логику отправки данных на сервер или сброса теста
  };

  return (
    <div className="app">
      {currentStep === 1 && <UserForm onNext={handleUserFormSubmit} initialData={userData} />}
      {currentStep === 2 && (
        <MiniSurvey onNext={handleSurveySubmit} onBack={handleBackToForm} initialAnswers={surveyData} />
      )}
      {currentStep === 3 && (
        <HeadphonesCheck onNext={handleHeadphonesCheckNext} onBack={handleBackToSurvey} />
      )}
      {currentStep === 4 && (
        <HearingTest onNext={handleHearingTestNext} onBack={handleBackToHeadphonesCheck} />
      )}
      {currentStep === 5 && (
        <Results
          testResults={testResults}
          onBack={handleBackToHearingTest}
          onFinish={handleFinish}
        />
      )}
    </div>
  );
}

export default App;
