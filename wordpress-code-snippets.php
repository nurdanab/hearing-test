<?php

function hearing_test_iframe_script() {
    ?>
    <script>
    (function() {
        'use strict';

        // Получаем iframe - используем querySelector для большей надежности
        var iframe = document.getElementById('hearing-test-iframe');

        if (!iframe) {
            // Пробуем найти через querySelector если getElementById не сработал
            iframe = document.querySelector('iframe[title="Тест на слух"]');
        }

        if (!iframe) {
            console.warn('[WordPress] iframe с id="hearing-test-iframe" не найден');
            return;
        }

        console.log('[WordPress] iframe найден, инициализация скрипта...');

        // Слушаем сообщения от iframe
        window.addEventListener('message', function(event) {
            // ДЛЯ PRODUCTION: раскомментируйте следующую строку для безопасности
            // if (event.origin !== 'https://test-sluha.netlify.app') return;

            var data = event.data;

            // Обработка сообщения с высотой
            if (data.type === 'iframe-height' && data.height) {
                var height = parseInt(data.height, 10);
                if (height > 0) {
                    iframe.style.height = height + 'px';
                    console.log('[WordPress] Высота iframe обновлена:', height + 'px');
                }
            }

            // Обработка сообщения о прокрутке вверх
            if (data.type === 'iframe-scroll-top' && data.scrollTop) {
                var iframeTop = iframe.getBoundingClientRect().top + window.pageYOffset;
                var offset = 20; // отступ сверху в пикселях

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

        console.log('[WordPress] Скрипт iframe теста на слух активирован');
    })();
    </script>
    <?php
}

// Добавляем скрипт в футер (чтобы он загрузился после iframe)
add_action('wp_footer', 'hearing_test_iframe_script', 100);
