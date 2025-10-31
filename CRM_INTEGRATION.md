# Интеграция с CRM - Инструкция по настройке

Это руководство описывает, как настроить интеграцию теста слуха с вашей CRM системой.

## Архитектура решения

Реализован безопасный вариант интеграции с использованием backend сервера:

```
Фронтенд (React) → Backend (Node.js/Express) → CRM API
```

**Преимущества:**
- API ключи хранятся на сервере (не раскрываются в браузере)
- Дополнительная валидация данных
- Возможность логирования и обработки ошибок
- Подходит для production

## Структура проекта

```
hearing-test/
├── src/                          # Фронтенд (React + Vite)
│   ├── components/
│   ├── services/
│   │   └── crmApi.js            # API клиент для общения с backend
│   └── App.jsx                  # Основное приложение
├── server/                       # Backend (Node.js + Express)
│   ├── routes/
│   │   └── crm.js               # API endpoints
│   ├── services/
│   │   └── crmService.js        # Логика интеграции с CRM
│   ├── server.js                # Основной файл сервера
│   └── package.json
├── .env.example                 # Пример для фронтенда
└── server/.env.example          # Пример для backend
```

## Шаги настройки

### 1. Получите данные от заказчика

Вам понадобится от заказчика:

- **CRM_API_URL** - базовый URL CRM API (например: `https://crm.example.com/api/v1`)
- **CRM_API_KEY** - API ключ или токен для авторизации
- **Документация API** - информация о:
  - Endpoints для создания/обновления лидов
  - Структура данных (какие поля обязательны)
  - Метод авторизации (Bearer token, API key в header, и т.д.)
  - Формат запросов и ответов

### 2. Настройка Backend

#### 2.1 Установите зависимости

```bash
cd server
npm install
```

#### 2.2 Создайте .env файл

```bash
cp .env.example .env
```

#### 2.3 Заполните .env файл данными от заказчика

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
CRM_API_URL=https://your-crm-api.com/api/v1
CRM_API_KEY=your_api_key_here
```

#### 2.4 Адаптируйте код под ваш CRM

Откройте файл `server/services/crmService.js` и адаптируйте функции под структуру вашего CRM API:

**Пример адаптации функции `createLead`:**

```javascript
// ДО (шаблон):
const crmData = {
  name: userData.name,
  phone: userData.phone,
  email: userData.email
};

// ПОСЛЕ (пример для конкретного CRM):
const crmData = {
  contact: {
    first_name: userData.name.split(' ')[0],
    last_name: userData.name.split(' ').slice(1).join(' '),
    phone_number: userData.phone,
    email_address: userData.email
  },
  lead_source: 'hearing-test',
  pipeline_stage: 'new_lead'
};
```

**Пример адаптации функции `updateLeadWithResults`:**

```javascript
// ДО (текущий шаблон):
const crmData = {
  test_result: interpretation.text,        // "Тяжелая степень"
  average_db: Math.round(avgDb),           // 75
  left_ear_avg_db: Math.round(leftAvgDb),  // 78
  right_ear_avg_db: Math.round(rightAvgDb), // 72
  test_date: new Date().toISOString()      // "2025-10-30T10:30:00Z"
};

// ПОСЛЕ (пример для конкретного CRM):
const crmData = {
  hearing_test: {
    result: interpretation.text,
    avg_decibels: Math.round(avgDb),
    left_ear_decibels: Math.round(leftAvgDb),
    right_ear_decibels: Math.round(rightAvgDb),
    completed_at: new Date().toISOString()
  },
  pipeline_stage: 'test_completed'
};
```

**Важные места для адаптации:**

1. **URL endpoints** (строки с `fetch`):
   ```javascript
   // Адаптируйте под ваш CRM
   const response = await fetch(`${CRM_API_URL}/leads`, { ... });
   ```

2. **Headers авторизации**:
   ```javascript
   headers: {
     'Authorization': `Bearer ${CRM_API_KEY}`,  // или другой формат
     // Могут быть дополнительные headers:
     // 'X-API-Key': CRM_API_KEY,
     // 'X-Client-ID': process.env.CRM_CLIENT_ID,
   }
   ```

3. **Структура данных** (crmData объект)

4. **Обработка ответа**:
   ```javascript
   return {
     success: true,
     leadId: result.id || result.data?.id,  // адаптируйте под структуру ответа
   };
   ```

### 3. Настройка Frontend

#### 3.1 Создайте .env файл в корне проекта

```bash
cp .env.example .env
```

#### 3.2 Укажите URL backend сервера

```env
# Для разработки
VITE_API_URL=http://localhost:3001

# Для продакшена замените на реальный URL
# VITE_API_URL=https://your-backend-domain.com
```

### 4. Запуск в разработке

Откройте два терминала:

**Терминал 1 - Backend:**
```bash
cd server
npm run dev
```

**Терминал 2 - Frontend:**
```bash
npm run dev
```

Backend будет доступен на `http://localhost:3001`
Frontend будет доступен на `http://localhost:5173`

### 5. Проверка работы

#### 5.1 Проверьте health endpoint

```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{"status":"ok","message":"Server is running"}
```

#### 5.2 Тестирование интеграции

1. Откройте фронтенд в браузере
2. Заполните форму с данными
3. Пройдите тест до конца
4. Проверьте логи в терминале backend - должны появиться сообщения:
   ```
   Creating lead in CRM: { name: '...', email: '...' }
   Lead created successfully: <lead_id>
   Updating lead with results: { leadId: '...', level: '...' }
   Lead updated successfully: <lead_id>
   ```
5. Проверьте в вашей CRM системе - должен появиться новый лид с результатами

## API Endpoints

### POST /api/crm/lead
Создает лида с данными формы

**Request:**
```json
{
  "name": "Иванов Иван Иванович",
  "phone": "+7 777 777 77 77",
  "email": "ivanov@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "12345",
  "message": "Lead created successfully"
}
```

### PUT /api/crm/lead/:leadId/results
Обновляет лида результатами теста

**Request:**
```json
{
  "results": {
    "left": { "250": 20, "500": 25, ... },
    "right": { "250": 15, "500": 20, ... }
  },
  "interpretation": {
    "level": "mild",
    "text": "Легкая степень",
    "description": "...",
    "hearingAidTitle": "..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead updated with test results successfully"
}
```

### POST /api/crm/lead-with-results
Альтернативный метод - создает лида сразу с результатами

## Deployment в продакшен

### Backend

1. Деплой на хостинг (например: Heroku, Railway, DigitalOcean, VPS)
2. Установите environment variables через панель хостинга
3. Убедитесь что порт настроен правильно (многие хостинги используют переменную PORT)
4. Обновите FRONTEND_URL на продакшн URL

### Frontend

1. Обновите `.env`:
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```
2. Соберите проект:
   ```bash
   npm run build
   ```
3. Деплой `dist` папки на хостинг (Vercel, Netlify, etc.)

### WordPress Integration

Для интеграции с WordPress:

1. Добавьте HTML блок на страницу WordPress
2. Вставьте код iframe:
   ```html
   <iframe
     src="https://your-frontend-domain.com"
     style="width: 100%; border: none;"
     id="hearing-test-iframe"
   ></iframe>
   ```

## Troubleshooting

### Backend не запускается

1. Проверьте что все зависимости установлены: `npm install`
2. Проверьте `.env` файл - все переменные заполнены?
3. Проверьте порт - не занят ли уже 3001?

### Ошибки CORS

Убедитесь что FRONTEND_URL в `.env` backend совпадает с URL фронтенда

### CRM не получает данные

1. Проверьте логи backend - есть ли ошибки?
2. Проверьте CRM_API_URL и CRM_API_KEY
3. Проверьте структуру данных в `crmService.js` - соответствует ли она вашему CRM?
4. Используйте инструменты разработчика (Network tab) для проверки запросов

### Данные не сохраняются

Убедитесь что:
1. Backend запущен и доступен
2. VITE_API_URL в frontend `.env` правильный
3. Нет блокировки CORS
4. CRM API возвращает успешный ответ

## Поддержка

При возникновении проблем:
1. Проверьте логи backend (в терминале)
2. Проверьте Network tab в браузере
3. Проверьте документацию вашего CRM API
4. Свяжитесь с технической поддержкой CRM

## Структура данных в CRM

После успешной интеграции в CRM будут сохраняться следующие данные:

### При заполнении формы (этап 1):

```json
{
  "name": "Джон Смит",
  "phone": "+7 700 000 00 00",
  "email": "jsm@mail.ru"
}
```

### После завершения теста (этап 2 - обновление лида):

```json
{
  "test_result": "Тяжелая степень",
  "average_db": 75,
  "left_ear_avg_db": 78,
  "right_ear_avg_db": 72,
  "test_date": "2025-10-30T10:30:00Z"
}
```

### Полная структура (если используете метод createLeadWithResults):

```json
{
  "name": "Джон Смит",
  "phone": "+7 700 000 00 00",
  "email": "jsm@mail.ru",
  "test_result": "Тяжелая степень",
  "average_db": 75,
  "left_ear_avg_db": 78,
  "right_ear_avg_db": 72,
  "test_date": "2025-10-30T10:30:00Z"
}
```

**Описание полей:**

- `name` - ФИО клиента
- `phone` - Номер телефона (с форматированием)
- `email` - Email адрес
- `test_result` - Результат теста текстом: "Нормальный слух", "Легкая степень", "Умеренная степень", "Выраженная степень", "Тяжелая степень"
- `average_db` - Средний уровень dB обоих ушей (округленный)
- `left_ear_avg_db` - Средний уровень dB левого уха (округленный)
- `right_ear_avg_db` - Средний уровень dB правого уха (округленный)
- `test_date` - Дата и время прохождения теста (ISO 8601 формат)

**Важно:** Названия полей могут отличаться в вашей CRM системе. Адаптируйте их в файле `server/services/crmService.js` согласно документации вашего CRM.
