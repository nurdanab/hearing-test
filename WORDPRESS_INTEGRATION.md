# Интеграция React-теста на слух с WordPress через iframe

## Что было сделано в React-приложении

### 1. Убрана фиксированная высота
- Удалена `min-height: 100vh` из компонентов
- Добавлено `height: auto` для body и html
- Это позволяет iframe адаптироваться под контент

### 2. Создана утилита для работы с iframe (`src/utils/iframeHelper.js`)
Функции:
- `sendHeightToParent()` - отправляет текущую высоту контента
- `scrollParentToTop()` - запрашивает прокрутку родительской страницы вверх
- `observeContentChanges()` - отслеживает изменения размера контента
- `sendReadyMessage()` - сообщает о готовности iframe

### 3. Добавлены useEffect в App.jsx
- При загрузке: отправка высоты и настройка наблюдения за изменениями
- При смене шага: прокрутка вверх + обновление высоты

---

## Интеграция в WordPress

### Шаг 1: Вставка iframe на страницу WordPress

Добавьте этот HTML-код на вашу страницу WordPress (через редактор HTML или Custom HTML блок):

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

**Важно:**
- `id="hearing-test-iframe"` - ID для обращения к iframe из JavaScript
- `scrolling="no"` - отключаем внутренний скролл
- `overflow: hidden` - скрываем полосы прокрутки
- Начальная высота будет установлена автоматически

---

### Шаг 2: Добавление JavaScript-кода для прослушивания сообщений

Добавьте этот код в файл темы WordPress или через плагин для вставки кода (например, "Code Snippets" или "Insert Headers and Footers").

#### Вариант 1: Через functions.php темы

Откройте файл `wp-content/themes/ваша-тема/functions.php` и добавьте:

```php
<?php
// Добавление скрипта для работы с iframe теста на слух
function add_hearing_test_iframe_script() {
    ?>
    <script>
    (function() {
        'use strict';

        // Получаем iframe
        const iframe = document.getElementById('hearing-test-iframe');

        if (!iframe) {
            console.warn('[WordPress] iframe с id="hearing-test-iframe" не найден');
            return;
        }

        // Слушаем сообщения от iframe
        window.addEventListener('message', function(event) {
            // Проверяем источник (для безопасности)
            // Раскомментируйте и укажите ваш домен для production:
            // if (event.origin !== 'https://test-sluha.netlify.app') return;

            const data = event.data;

            // Обработка сообщения с высотой
            if (data.type === 'iframe-height' && data.height) {
                const height = parseInt(data.height, 10);
                if (height > 0) {
                    iframe.style.height = height + 'px';
                    console.log('[WordPress] Обновлена высота iframe:', height + 'px');
                }
            }

            // Обработка сообщения о прокрутке вверх
            if (data.type === 'iframe-scroll-top' && data.scrollTop) {
                // Прокручиваем к iframe с небольшим отступом сверху
                const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
                const offset = 20; // отступ сверху в пикселях

                window.scrollTo({
                    top: iframeTop - offset,
                    behavior: 'smooth'
                });

                console.log('[WordPress] Прокрутка к iframe выполнена');
            }

            // Сообщение о готовности iframe
            if (data.type === 'iframe-ready') {
                console.log('[WordPress] iframe теста на слух готов');
            }
        });

        console.log('[WordPress] Скрипт iframe теста на слух инициализирован');
    })();
    </script>
    <?php
}
add_action('wp_footer', 'add_hearing_test_iframe_script');
?>
```

#### Вариант 2: Через плагин "Code Snippets"

1. Установите и активируйте плагин "Code Snippets"
2. Создайте новый сниппет (Snippets → Add New)
3. Скопируйте только JavaScript код (без тегов `<script>`):

```javascript
(function() {
    'use strict';

    // Получаем iframe
    const iframe = document.getElementById('hearing-test-iframe');

    if (!iframe) {
        console.warn('[WordPress] iframe с id="hearing-test-iframe" не найден');
        return;
    }

    // Слушаем сообщения от iframe
    window.addEventListener('message', function(event) {
        // Проверяем источник (для безопасности)
        // Раскомментируйте и укажите ваш домен для production:
        // if (event.origin !== 'https://test-sluha.netlify.app') return;

        const data = event.data;

        // Обработка сообщения с высотой
        if (data.type === 'iframe-height' && data.height) {
            const height = parseInt(data.height, 10);
            if (height > 0) {
                iframe.style.height = height + 'px';
                console.log('[WordPress] Обновлена высота iframe:', height + 'px');
            }
        }

        // Обработка сообщения о прокрутке вверх
        if (data.type === 'iframe-scroll-top' && data.scrollTop) {
            // Прокручиваем к iframe с небольшим отступом сверху
            const iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
            const offset = 20; // отступ сверху в пикселях

            window.scrollTo({
                top: iframeTop - offset,
                behavior: 'smooth'
            });

            console.log('[WordPress] Прокрутка к iframe выполнена');
        }

        // Сообщение о готовности iframe
        if (data.type === 'iframe-ready') {
            console.log('[WordPress] iframe теста на слух готов');
        }
    });

    console.log('[WordPress] Скрипт iframe теста на слух инициализирован');
})();
```

4. Выберите "Run snippet everywhere" (Frontend)
5. Сохраните и активируйте сниппет

#### Вариант 3: Прямая вставка на страницу

Если у вас есть доступ к редактированию страницы в режиме HTML, добавьте iframe и скрипт вместе:

```html
<!-- iframe -->
<iframe
  id="hearing-test-iframe"
  src="https://test-sluha.netlify.app/"
  style="width: 100%; border: none; overflow: hidden; display: block;"
  scrolling="no"
  frameborder="0"
  title="Тест на слух">
</iframe>

<!-- Скрипт для обработки сообщений -->
<script>
(function() {
    'use strict';

    const iframe = document.getElementById('hearing-test-iframe');

    if (!iframe) {
        console.warn('[WordPress] iframe не найден');
        return;
    }

    window.addEventListener('message', function(event) {
        const data = event.data;

        if (data.type === 'iframe-height' && data.height) {
            const height = parseInt(data.height, 10);
            if (height > 0) {
                iframe.style.height = height + 'px';
            }
        }

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

## Настройки и дополнительная информация

### Безопасность

Для production рекомендуется раскомментировать проверку источника:

```javascript
// Проверяем источник сообщения
if (event.origin !== 'https://test-sluha.netlify.app') {
    console.warn('Сообщение от неизвестного источника:', event.origin);
    return;
}
```

### Настройка прокрутки

Вы можете изменить отступ при прокрутке к iframe:

```javascript
const offset = 20; // измените на нужное значение в пикселях
```

Или отключить плавную прокрутку:

```javascript
window.scrollTo({
    top: iframeTop - offset,
    behavior: 'auto' // вместо 'smooth'
});
```

### Отладка

Откройте консоль браузера (F12) для просмотра логов:
- `[WordPress]` - сообщения от родительской страницы
- `[iframe]` - сообщения от React-приложения

---

## Проверка работы

После внедрения проверьте:

1. ✅ iframe отображается на странице
2. ✅ Высота iframe автоматически подстраивается под контент
3. ✅ При переходе между шагами страница прокручивается к началу теста
4. ✅ Нет двойной прокрутки (внутри iframe и на странице)
5. ✅ Всё работает плавно на мобильных устройствах

---

## Устранение неполадок

### Проблема: iframe не меняет высоту

**Решение:**
- Проверьте, что ID iframe совпадает: `id="hearing-test-iframe"`
- Убедитесь, что JavaScript код загружается после iframe
- Проверьте консоль на наличие ошибок

### Проблема: страница не прокручивается вверх

**Решение:**
- Убедитесь, что у body страницы нет `overflow: hidden`
- Проверьте, что WordPress тема не блокирует прокрутку
- Попробуйте увеличить offset (отступ)

### Проблема: двойная прокрутка (внутри iframe и на странице)

**Решение:**
- Убедитесь, что в CSS React-приложения убрана `min-height: 100vh`
- Проверьте, что у iframe указано `scrolling="no"`
- Очистите кэш браузера и пересоберите React-приложение

---

## Контакты для поддержки

Если возникнут вопросы при интеграции, проверьте:
- Консоль браузера на наличие ошибок
- Что iframe и скрипт находятся на одной странице
- Что React-приложение пересобрано и задеплоено с новыми изменениями
