/**
 * Утилита для работы с iframe и отправки сообщений родительскому окну
 */

/**
 * Проверяет, находится ли приложение внутри iframe
 */
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Отправляет сообщение родительскому окну о текущей высоте контента
 */
export const sendHeightToParent = () => {
  if (!isInIframe()) return;

  try {
    // Получаем максимальную высоту из различных источников
    const body = document.body;
    const html = document.documentElement;

    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    // Отправляем высоту родительскому окну
    window.parent.postMessage(
      {
        type: 'iframe-height',
        height: height
      },
      '*'
    );

    console.log('[iframe] Sent height to parent:', height);
  } catch (error) {
    console.error('[iframe] Error sending height:', error);
  }
};

/**
 * Отправляет сообщение родительскому окну для прокрутки страницы вверх
 */
export const scrollParentToTop = () => {
  if (!isInIframe()) return;

  try {
    window.parent.postMessage(
      {
        type: 'iframe-scroll-top',
        scrollTop: true
      },
      '*'
    );

    console.log('[iframe] Sent scroll to top request to parent');
  } catch (error) {
    console.error('[iframe] Error sending scroll request:', error);
  }
};

/**
 * Хук для автоматической отправки высоты при изменении контента
 * Использует ResizeObserver для отслеживания изменений размера
 */
export const observeContentChanges = (callback) => {
  if (!isInIframe()) return null;

  try {
    // Создаем observer для отслеживания изменений размера
    const resizeObserver = new ResizeObserver(() => {
      // Небольшая задержка для завершения всех анимаций
      setTimeout(() => {
        if (callback) callback();
      }, 100);
    });

    // Наблюдаем за body
    resizeObserver.observe(document.body);

    // Возвращаем функцию для отписки
    return () => {
      resizeObserver.disconnect();
    };
  } catch (error) {
    console.error('[iframe] Error setting up ResizeObserver:', error);
    return null;
  }
};

/**
 * Отправляет сообщение о готовности iframe
 */
export const sendReadyMessage = () => {
  if (!isInIframe()) return;

  try {
    window.parent.postMessage(
      {
        type: 'iframe-ready'
      },
      '*'
    );

    console.log('[iframe] Sent ready message to parent');
  } catch (error) {
    console.error('[iframe] Error sending ready message:', error);
  }
};
