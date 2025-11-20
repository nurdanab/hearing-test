import nodemailer from 'nodemailer';

/**
 * Создает транспорт для отправки email
 */
function createTransporter() {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
}

/**
 * Отправляет результаты теста на email клиента
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
    console.error('SMTP settings missing!');
    throw new Error('SMTP settings not configured. Please check your environment variables.');
  }

  try {
    const transporter = createTransporter();

    // Простой HTML шаблон письма без излишних стилей
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #ffffff; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="color: #000000; font-size: 20px; margin-bottom: 20px;">Результаты теста слуха</h2>

    <p>Здравствуйте, ${name}!</p>

    <p>Вы прошли онлайн-тест на слух на сайте DomSluha.</p>

    <p><strong>Ваш результат: ${testResult}</strong></p>

    <p>К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.</p>

    <p>Спасибо, что заботитесь о своем здоровье.</p>

    <p>Напоминаем, что онлайн-тест не заменяет профессиональную диагностику. Мы приглашаем вас на бесплатную консультацию, где можно пройти полную аудиометрию и получить рекомендации специалиста.</p>

    <p>Сайт: <a href="https://domsluha.kz/" style="color: #0000EE;">https://domsluha.kz/</a></p>

    <p>С уважением,<br>Команда DomSluha</p>
  </div>
</body>
</html>
    `;

    // Текстовая версия письма (без эмодзи для лучшей доставляемости)
    const textContent = `
Здравствуйте, ${name}!

Вы прошли онлайн-тест на слух на сайте DomSluha.

Ваш результат: ${testResult}

К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.

Спасибо, что заботитесь о своем здоровье.

Напоминаем, что онлайн-тест не заменяет профессиональную диагностику. Мы приглашаем вас на бесплатную консультацию, где можно пройти полную аудиометрию и получить рекомендации специалиста.

Сайт: https://domsluha.kz/

С уважением,
Команда DomSluha
    `;

    // Настройка письма с заголовками для улучшения доставляемости
    const mailOptions = {
      from: `"Тест слуха от DomSluha" <${process.env.SMTP_USER}>`,
      to: to,
      replyTo: process.env.SMTP_USER,
      subject: 'Ваш результат онлайн-теста слуха DomSluha',
      text: textContent,
      html: htmlContent,
      attachments: [],
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'DomSluha Notification System',
        'List-Unsubscribe': '<mailto:' + process.env.SMTP_USER + '?subject=unsubscribe>',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      },
      encoding: 'utf-8'
    };

    // Добавляем PDF вложение, если оно передано
    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: pdfFilename,
        content: pdfBase64,
        encoding: 'base64'
      });
    }

    // Отправка письма пользователю
    const info = await transporter.sendMail(mailOptions);

    // Отправляем копию результатов на email клиники
    // Делаем это асинхронно, чтобы не блокировать ответ пользователю
    sendResultsCopyToClinic({
      clientEmail: to,
      name,
      testResult,
      averageDb,
      leftEarDb,
      rightEarDb,
      description,
      pdfBase64,
      pdfFilename
    }).then(result => {
      if (result.success) {
        console.log('Copy sent to clinic successfully:', result.messageId);
      } else {
        console.error('Failed to send copy to clinic:', result.error);
      }
    }).catch(error => {
      console.error('Error sending copy to clinic:', error);
    });

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
 * Отправляет копию результатов теста на email клиники
 */
export async function sendResultsCopyToClinic({
  clientEmail,
  name,
  testResult,
  averageDb,
  leftEarDb,
  rightEarDb,
  description,
  pdfBase64,
  pdfFilename = 'hearing-test-results.pdf'
}) {
  // Email клиники для получения уведомлений
  const clinicEmail = 'domsluhaalmaty@gmail.com';

  try {
    const transporter = createTransporter();

    // HTML шаблон письма для клиники
    const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #000000; background-color: #ffffff; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h2 style="color: #000000; font-size: 20px; margin-bottom: 20px;">Новый пользователь прошел тестирование</h2>

    <p><strong>Информация о пользователе:</strong></p>
    <ul>
      <li><strong>ФИО:</strong> ${name}</li>
      <li><strong>Email:</strong> ${clientEmail}</li>
    </ul>

    <p><strong>Результаты тестирования:</strong></p>
    <ul>
      <li><strong>Результат:</strong> ${testResult}</li>
      <li><strong>Среднее значение:</strong> ${averageDb} дБ</li>
      <li><strong>Левое ухо:</strong> ${leftEarDb} дБ</li>
      <li><strong>Правое ухо:</strong> ${rightEarDb} дБ</li>
    </ul>

    ${description ? `<p><strong>Описание:</strong> ${description}</p>` : ''}

    <p>К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.</p>

    <hr style="border: none; border-top: 1px solid #cccccc; margin: 20px 0;">
  </div>
</body>
</html>
    `;

    // Текстовая версия письма для клиники
    const textContent = `
Новый пользователь прошел тестирование

Информация о пользователе:
- ФИО: ${name}
- Email: ${clientEmail}

Результаты тестирования:
- Результат: ${testResult}
- Среднее значение: ${averageDb} дБ
- Левое ухо: ${leftEarDb} дБ
- Правое ухо: ${rightEarDb} дБ

${description ? `Описание: ${description}` : ''}

К письму прикреплен PDF-файл с полными результатами тестирования, включая аудиограммы и рекомендации.

---
    `;

    // Настройка письма
    const mailOptions = {
      from: `"Тест на слуух от DomSluha" <${process.env.SMTP_USER}>`,
      to: clinicEmail,
      subject: `Новый результат теста: ${name}`,
      text: textContent,
      html: htmlContent,
      attachments: [],
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'DomSluha Notification System',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      },
      encoding: 'utf-8'
    };

    // Добавляем PDF вложение, если оно передано
    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: pdfFilename,
        content: pdfBase64,
        encoding: 'base64'
      });
    }

    // Отправка письма
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Copy sent to clinic successfully'
    };

  } catch (error) {
    console.error('Error sending copy to clinic:', error);
    // Не бросаем ошибку, чтобы не прерывать основной процесс
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Проверяет настройки SMTP
 */
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return false;
  }
}
