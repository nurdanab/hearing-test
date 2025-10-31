# Тест слуха (Hearing Test)

Веб-приложение для проверки слуха с интеграцией в CRM систему.

## Возможности

- Проверка слуха по различным частотам
- Визуализация результатов (аудиограмма)
- Интерпретация результатов и рекомендации
- **Автоматическая отправка результатов на email клиента** (с PDF вложением)
- Интеграция с CRM (автоматическое сохранение данных клиентов)
- Поддержка WordPress iframe

## Технологии

**Frontend:**
- React 19
- Vite
- SCSS modules
- jsPDF (генерация PDF)

**Backend (Netlify Functions):**
- Netlify Serverless Functions
- Nodemailer (отправка email)
- CRM API интеграция

**Hosting:**
- Netlify (Frontend + Backend в одном месте)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Локальная разработка

**Вариант A: Только Frontend (без backend функций):**
```bash
npm run dev
```

**Вариант B: Frontend + Backend (с Netlify Functions):**
```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Запустите с Netlify Dev
netlify dev
```

Сайт будет доступен на `http://localhost:8888`

Отредактируйте `.env` файлы согласно вашим настройкам.

### 3. Тестирование

Откройте `http://localhost:8888` (с Netlify Dev) или `http://localhost:5173` (только Frontend)

## Интеграция с CRM

Подробная инструкция по настройке интеграции с CRM находится в файле [CRM_INTEGRATION.md](./CRM_INTEGRATION.md)

**Краткие шаги:**
1. Получите API credentials от вашей CRM системы
2. Настройте `.env` файлы
3. Адаптируйте `server/services/crmService.js` под структуру вашего CRM API
4. Запустите backend и frontend
5. Протестируйте интеграцию

## Настройка отправки Email

Приложение автоматически отправляет результаты теста на email клиента с PDF вложением.

Подробная инструкция находится в файле [EMAIL_SETUP.md](./EMAIL_SETUP.md)

**Краткие шаги для локальной разработки:**
1. Выберите SMTP сервис (Gmail, Mail.ru, SendGrid и т.д.)
2. Получите SMTP credentials (для Gmail - App Password)
3. Настройте переменные окружения на Netlify (см. NETLIFY_DEPLOY.md)

**Пример для Gmail (в Netlify Environment Variables):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Production Deploy на Netlify

**Полная инструкция:** [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md)

**Быстрые шаги:**

1. **Push в GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push
   ```

2. **Подключите к Netlify:**
   - Зайдите на https://app.netlify.com/
   - "Add new site" → "Import an existing project"
   - Выберите GitHub репозиторий

3. **Настройте Environment Variables:**
   - Site settings → Environment variables
   - Добавьте SMTP настройки (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)

4. **Deploy!** 🎉

Ваш сайт будет доступен на `https://ваш-сайт.netlify.app`

## WordPress Integration

Для интеграции с WordPress добавьте HTML блок с iframe:

```html
<iframe
  src="https://your-domain.com"
  style="width: 100%; border: none;"
  id="hearing-test-iframe"
></iframe>
```

## Структура проекта

```
hearing-test/
├── src/                         # Исходный код фронтенда
│   ├── components/             # React компоненты
│   ├── services/               # API клиенты (emailApi, crmApi)
│   ├── utils/                  # Утилиты (генерация PDF)
│   └── App.jsx                 # Главный компонент
├── netlify/
│   └── functions/              # Netlify Serverless Functions
│       ├── lib/
│       │   ├── emailService.js # Email сервис
│       │   └── crmService.js   # CRM сервис
│       ├── send-email.js       # POST /.netlify/functions/send-email
│       ├── verify-email.js     # GET /.netlify/functions/verify-email
│       ├── create-lead.js      # POST /.netlify/functions/create-lead
│       ├── update-lead.js      # PUT /.netlify/functions/update-lead
│       └── package.json        # Зависимости для functions
├── server/                      # Старый Express backend (для справки)
│   ├── routes/                 # API routes (deprecated)
│   ├── services/               # Сервисы (deprecated)
│   └── server.js         # Основной файл сервера
└── public/               # Статические файлы
```

## Лицензия

MIT
