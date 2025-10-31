# Деплой на Netlify с Netlify Functions

## ✅ Что было сделано

Backend переделан с Express на **Netlify Functions** (serverless).

**Преимущества:**
- ✅ Frontend + Backend в одном месте (на Netlify)
- ✅ Не засыпает (в отличие от бесплатного Render)
- ✅ Автоматическое масштабирование
- ✅ Бесплатно для вашего трафика

**Структура:**
```
hearing-test/
├── netlify/
│   └── functions/           # Serverless функции
│       ├── lib/
│       │   ├── emailService.js    # Сервис отправки email
│       │   └── crmService.js      # Сервис работы с CRM
│       ├── send-email.js          # /.netlify/functions/send-email
│       ├── verify-email.js        # /.netlify/functions/verify-email
│       ├── create-lead.js         # /.netlify/functions/create-lead
│       ├── update-lead.js         # /.netlify/functions/update-lead
│       ├── create-lead-with-results.js
│       └── package.json           # Зависимости для functions
├── netlify.toml             # Конфигурация Netlify
└── src/services/            # Frontend API клиенты (обновлены)
```

---

## 🚀 Шаг 1: Подготовка к деплою

### 1.1. Установите Netlify CLI (для локального тестирования)

```bash
npm install -g netlify-cli
```

### 1.2. Закоммитьте изменения в Git

```bash
git add .
git commit -m "Переход на Netlify Functions для backend"
git push
```

---

## 🌐 Шаг 2: Деплой на Netlify

### Вариант A: Через Netlify Dashboard (рекомендуется)

1. **Зайдите на https://app.netlify.com/**

2. **Подключите GitHub репозиторий:**
   - Нажмите "Add new site" → "Import an existing project"
   - Выберите GitHub и авторизуйтесь
   - Найдите репозиторий `hearing-test`

3. **Настройте Build Settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Настройте Environment Variables:**

   Перейдите в **Site settings** → **Environment variables** и добавьте:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=email-заказчика@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

   ⚠️ **ВАЖНО:**
   - Используйте **App Password** от Gmail, НЕ обычный пароль
   - После получения данных от заказчика - замените SMTP_USER и SMTP_PASS

   **Опционально (для CRM, когда заказчик даст API ключи):**
   ```
   CRM_API_URL=https://api-crm.com
   CRM_API_KEY=your_crm_api_key
   ```

5. **Deploy site** - нажмите и ждите ~2-3 минуты

6. **Ваш сайт готов!** 🎉
   ```
   https://ваш-сайт.netlify.app
   ```

### Вариант B: Через Netlify CLI

```bash
# Войдите в аккаунт Netlify
netlify login

# Инициализируйте проект
netlify init

# Деплой
netlify deploy --prod
```

---

## 🧪 Шаг 3: Тестирование после деплоя

### 3.1. Проверьте работу сайта

Откройте ваш сайт: `https://ваш-сайт.netlify.app`

### 3.2. Проверьте Netlify Functions

Откройте консоль браузера (F12) и проверьте Network при отправке email.

**Должны быть запросы к:**
```
/.netlify/functions/send-email
/.netlify/functions/create-lead
/.netlify/functions/update-lead
```

### 3.3. Пройдите тест полностью

1. Заполните форму с вашим email
2. Пройдите тест
3. На странице результатов проверьте:
   - ✅ Email отправлен
   - ✅ PDF сгенерирован
   - ✅ Письмо пришло (проверьте Спам!)

### 3.4. Проверьте логи Netlify Functions

1. Зайдите в **Netlify Dashboard** → ваш сайт
2. Перейдите в **Functions**
3. Выберите функцию (например, `send-email`)
4. Посмотрите логи выполнения

**Ожидаемые логи:**
```
Sending email to: client@example.com
Email sent successfully: <message-id>
```

---

## ⚙️ Шаг 4: Настройка домена (опционально)

Если хотите использовать свой домен вместо `ваш-сайт.netlify.app`:

1. **Купите домен** (например, domsluha.kz)
2. В Netlify Dashboard → **Domain settings** → **Add custom domain**
3. Следуйте инструкциям для настройки DNS

---

## 🔧 Локальная разработка с Netlify Dev

Для тестирования Netlify Functions локально:

```bash
# Установите зависимости
npm install

# Запустите Netlify Dev (вместо vite dev)
netlify dev
```

Сайт будет доступен на `http://localhost:8888`

Netlify Functions будут работать на:
- `http://localhost:8888/.netlify/functions/send-email`
- `http://localhost:8888/.netlify/functions/create-lead`
- и т.д.

---

## 📋 Чеклист после деплоя

- [ ] Сайт открывается по URL
- [ ] Форма работает
- [ ] Тест проходит корректно
- [ ] Email отправляется (проверьте Спам!)
- [ ] PDF генерируется и прикрепляется
- [ ] Логи в Netlify Functions без ошибок

---

## 🐛 Troubleshooting

### Проблема: "Function not found"

**Решение:**
- Проверьте что `netlify.toml` существует
- Проверьте что `functions = "netlify/functions"` указан правильно
- Пересоберите сайт на Netlify

### Проблема: "SMTP settings not configured"

**Решение:**
- Зайдите в **Netlify Dashboard** → **Site settings** → **Environment variables**
- Убедитесь что все SMTP переменные добавлены:
  ```
  SMTP_HOST
  SMTP_PORT
  SMTP_SECURE
  SMTP_USER
  SMTP_PASS
  ```
- После изменения переменных - **пересоберите сайт** (Deploys → Trigger deploy → Clear cache and deploy)

### Проблема: Email не отправляется

**Решение:**
1. Проверьте логи функции `send-email` в Netlify Dashboard
2. Проверьте что SMTP_USER и SMTP_PASS правильные
3. Убедитесь что используется **App Password**, а не обычный пароль Gmail
4. Проверьте папку Спам у получателя

### Проблема: CRM не работает

**Решение:**
- CRM пока не настроен (нужны API ключи от заказчика)
- Это нормально - приложение работает без CRM
- Когда получите API ключи - добавьте `CRM_API_URL` и `CRM_API_KEY` в Environment variables

---

## 📊 Лимиты Netlify (бесплатный план)

- ✅ **Bandwidth:** 100 GB/месяц
- ✅ **Functions:** 125,000 запросов/месяц
- ✅ **Build minutes:** 300 минут/месяц
- ✅ **Concurrent builds:** 1

Для вашего приложения этого **более чем достаточно**.

---

## 🎯 Следующие шаги

1. **Получите данные от заказчика:**
   - Email и App Password для SMTP
   - CRM API ключи (когда будут готовы)

2. **Обновите Environment Variables** на Netlify

3. **Протестируйте** отправку email с реальными данными

4. **Настройте домен** (если нужно)

5. **Готово!** 🚀

---

## 💡 Полезные ссылки

- [Netlify Functions документация](https://docs.netlify.com/functions/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Gmail App Password](https://support.google.com/accounts/answer/185833)
