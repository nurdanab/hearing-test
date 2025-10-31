import nodemailer from 'nodemailer';

/**
 * Создает транспорт для отправки email
 */
function createTransporter() {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true для 465, false для других портов
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
}

/**
 * Отправляет результаты теста на email клиента
 *
 * @param {Object} params - Параметры отправки
 * @param {string} params.to - Email получателя
 * @param {string} params.name - ФИО клиента
 * @param {string} params.testResult - Результат теста ("Тяжелая степень")
 * @param {number} params.averageDb - Средний уровень dB
 * @param {number} params.leftEarDb - Уровень dB левого уха
 * @param {number} params.rightEarDb - Уровень dB правого уха
 * @param {string} params.description - Описание результата
 * @param {string} params.pdfBase64 - PDF файл в формате base64
 * @param {string} params.pdfFilename - Название PDF файла
 * @returns {Promise<Object>} Результат отправки
 */
export async function sendTestResults({
  to,
  name,
  testResult,
  averageDb,
  leftEarDb,
  rightEarDb,
  description,
  pdfBase64,
  pdfFilename = 'hearing-test-results.pdf'
}) {
  // Проверка настроек SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP settings not configured. Please check your .env file.');
  }

  try {
    const transporter = createTransporter();

    // HTML шаблон письма
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  
</head>
<body>
  <div class="header">
    <h1>Результаты теста слуха</h1>
  </div>

  <div class="content">
    <p>Здравствуйте, ${name}!</p>

    <p>Вы прошли онлайн-тест на слух на сайте <b>DomSluha</b>.</p>

    <div class="result-box">
      <div class="result-title"><b>Ваш результат:</b> ${testResult}</div>
    </div>

    <div class="pdf-note">
      <i>К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.</i>
    </div>

    <p>Спасибо, что заботитесь о своём здоровье.<br>Напоминаем, что онлайн-тест не заменяет профессиональную диагностику. Мы приглашаем вас на бесплатную консультацию, где можно пройти полную аудиометрию и получить рекомендации специалиста.</p>

    <p>🌐 Сайт: <a href="https://domsluha.kz/" style="color: #667eea;">https://domsluha.kz/</a></p>
  </div>

  <div class="footer">
    <p>С уважением,<br>Команда <b>DomSluha</b></p>
  </div>
</body>
</html>
    `;

    // Текстовая версия письма (для клиентов, которые не поддерживают HTML)
    const textContent = `
Здравствуйте, ${name}!

Вы прошли онлайн-тест на слух на сайте DomSluha.

Ваш результат: ${testResult}

К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.

Спасибо, что заботитесь о своём здоровье.

Напоминаем, что онлайн-тест не заменяет профессиональную диагностику. Мы приглашаем вас на бесплатную консультацию, где можно пройти полную аудиометрию и получить рекомендации специалиста.

🌐 Сайт: https://domsluha.kz/

С уважением,
Команда DomSluha
    `;

    // Настройка письма
    const mailOptions = {
      from: `"Тест слуха от DomSluha" <${process.env.SMTP_USER}>`,
      to: to,
      subject: 'Ваш результат онлайн-теста слуха DomSluha',
      text: textContent,
      html: htmlContent,
      attachments: []
    };

    // Добавляем PDF вложение, если оно передано
    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: pdfFilename,
        content: pdfBase64,
        encoding: 'base64'
      });
    }

    console.log('Sending email to:', to);

    // Отправка письма
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Проверяет настройки SMTP
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP configuration is valid');
    return true;
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return false;
  }
}
