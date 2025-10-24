# 🚀 Быстрый старт - Интеграция iframe

## Для тестирования локально

1. **Запустите React-приложение:**
   ```bash
   npm run dev
   ```

2. **Откройте тестовую страницу:**
   Откройте файл `test-wordpress-iframe.html` в браузере.

3. **Проверьте работу:**
   - Высота iframe должна автоматически подстраиваться
   - При смене шагов страница должна прокручиваться вверх
   - В "Консоли событий" видны все сообщения

---

## Для интеграции на WordPress

### 1. HTML код iframe

```html
<iframe
  id="hearing-test-iframe"
  src="https://test-sluha.netlify.app/"
  style="width: 100%; border: none; overflow: hidden; display: block;"
  scrolling="no"
  frameborder="0"
  title="Тест на слух">
</iframe>
```

### 2. JavaScript код (добавьте после iframe)

```html
<script>
(function() {
    const iframe = document.getElementById('hearing-test-iframe');
    if (!iframe) return;

    window.addEventListener('message', function(event) {
        const data = event.data;

        // Обновление высоты
        if (data.type === 'iframe-height' && data.height) {
            iframe.style.height = parseInt(data.height) + 'px';
        }

        // Прокрутка вверх
        if (data.type === 'iframe-scroll-top' && data.scrollTop) {
            const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: iframeTop - 20,
                behavior: 'smooth'
            });
        }
    });
})();
</script>
```

---

## Что было изменено в React-приложении

✅ **Убрана фиксированная высота** (`min-height: 100vh`)
✅ **Создана утилита** `src/utils/iframeHelper.js` для коммуникации с родительским окном
✅ **Добавлены useEffect** в `App.jsx` для автоматической отправки сообщений
✅ **Отслеживание изменений размера** через ResizeObserver

---

## Типы сообщений от iframe

| Тип | Описание | Данные |
|-----|----------|--------|
| `iframe-ready` | iframe загружен и готов | - |
| `iframe-height` | Новая высота контента | `height: number` |
| `iframe-scroll-top` | Запрос прокрутки вверх | `scrollTop: true` |

---

## Полная документация

📄 См. файл `WORDPRESS_INTEGRATION.md` для подробной инструкции.

---

## Проверка перед деплоем

- [ ] Пересобрать приложение: `npm run build`
- [ ] Задеплоить на Netlify
- [ ] Проверить на мобильных устройствах
- [ ] Убедиться, что нет двойной прокрутки
- [ ] Протестировать все шаги теста

---

## Важные замечания

⚠️ **ID iframe должен быть:** `hearing-test-iframe`
⚠️ **Атрибуты iframe:** `scrolling="no"` обязателен
⚠️ **Для production:** добавьте проверку `event.origin`

---

## Поддержка

При возникновении проблем проверьте:
1. Консоль браузера (F12) на наличие ошибок
2. Что JavaScript код загружается после iframe
3. Что React-приложение пересобрано с новыми изменениями
