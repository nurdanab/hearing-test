import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Генерирует PDF документ с результатами теста слуха
 * Использует рендеринг HTML в изображение для полной поддержки кириллицы
 */
export const generatePDF = async (userData, testResults, interpretation, userCanvasElement, normalCanvasElement) => {
  try {
    // Создаем временный контейнер для рендеринга
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '40px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';

    // Форматируем дату
    const testDate = new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Создаем HTML контент
    tempContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="color: #224F75; font-size: 28px; margin-bottom: 20px; text-align: center;">
          Результаты теста слуха от немецкого слухового центра «Eurolux»
        </h1>

        <div style="border-bottom: 2px solid #224F75; margin-bottom: 20px;"></div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #224F75; font-size: 18px; margin-bottom: 10px;">Данные пациента:</h2>
          <p style="margin: 5px 0; font-size: 14px;"><strong>ФИО:</strong> ${userData?.name || 'Не указано'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Телефон:</strong> ${userData?.phone || 'Не указан'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Email:</strong> ${userData?.email || 'Не указан'}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Дата прохождения:</strong> ${testDate}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #224F75; font-size: 18px; margin-bottom: 10px;">Ваш результат:</h2>
          <p style="font-size: 16px; font-weight: bold; color: ${interpretation.color}; margin: 5px 0;">
            ${interpretation.text}
          </p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #224F75; font-size: 16px; margin-bottom: 10px;">Описание результата:</h3>
          <p style="font-size: 13px; line-height: 1.6; margin: 0;">
            ${interpretation.description}
          </p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #224F75; font-size: 16px; margin-bottom: 15px;">Аудиограммы:</h3>
          <div id="charts-placeholder" style="margin: 20px 0;"></div>
        </div>

        ${interpretation.hearingAidTitle ? `
          <div style="margin-bottom: 25px;">
            <h3 style="color: #224F75; font-size: 16px; margin-bottom: 10px;">
              Рекомендация по слуховому аппарату:
            </h3>
            ${interpretation.hearingAid ? `
              <div style="display: flex; align-items: center; gap: 20px; margin: 15px 0;">
                <div style="flex-shrink: 0;">
                  <img src="${interpretation.hearingAid}" alt="${interpretation.hearingAidTitle}"
                       style="width: 200px; height: auto; border-radius: 8px;" crossorigin="anonymous" />
                </div>
                <div style="flex: 1;">
                  <p style="font-size: 14px; font-weight: bold; color: #224F75; margin: 0 0 8px 0;">
                    ${interpretation.hearingAidTitle}
                  </p>
                  <p style="font-size: 13px; line-height: 1.6; margin: 0;">
                    ${interpretation.hearingAidDescription}
                  </p>
                </div>
              </div>
            ` : `
              <p style="font-size: 14px; font-weight: bold; color: #224F75; margin: 5px 0;">
                ${interpretation.hearingAidTitle}
              </p>
              <p style="font-size: 13px; line-height: 1.6; margin: 5px 0;">
                ${interpretation.hearingAidDescription}
              </p>
            `}
          </div>
        ` : ''}

        <div style="background-color: #E3F2FD; border: 1px solid #90CAF9; border-radius: 8px; padding: 15px; margin-top: 25px;">
          <p style="font-size: 12px; line-height: 1.5; margin: 0;">
            <strong>Примечание:</strong> Данный тест является ориентировочным и не заменяет
            профессиональную диагностику. Для точного определения состояния слуха обратитесь
            к врачу-сурдологу или отоларингологу.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #224F75;">
         
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; color: #333;">
            <div>
              <p style="margin: 5px 0;"><strong>Адрес:</strong> г. Алматы ул.Желтоксан (бывш.Мира), 126, угол ул.Богенбай батыра
              (бывш.Кирова), 136</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> euroluxsystema@mail.ru</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Алматы:</strong> +7 707 215 72 21</p>
              <p style="margin: 5px 0;"><strong>Астана:</strong> +7 702 266 44 96</p>
              <p style="margin: 5px 0;"><strong>Шымкент:</strong> +7 777 231 22 88</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    // Добавляем графики - конвертируем canvas в изображения
    const chartsPlaceholder = tempContainer.querySelector('#charts-placeholder');
    if (chartsPlaceholder && userCanvasElement && normalCanvasElement) {
      const chartsDiv = document.createElement('div');
      chartsDiv.style.display = 'grid';
      chartsDiv.style.gridTemplateColumns = '1fr 1fr';
      chartsDiv.style.gap = '20px';

      // Конвертируем canvas в изображения
      const userChartImg = document.createElement('img');
      userChartImg.src = userCanvasElement.toDataURL('image/png');
      userChartImg.style.width = '100%';
      userChartImg.style.height = 'auto';

      const normalChartImg = document.createElement('img');
      normalChartImg.src = normalCanvasElement.toDataURL('image/png');
      normalChartImg.style.width = '100%';
      normalChartImg.style.height = 'auto';

      const userChartWrapper = document.createElement('div');
      userChartWrapper.innerHTML = '<h4 style="text-align: center; font-size: 14px; margin-bottom: 10px;">Ваши результаты</h4>';
      userChartWrapper.appendChild(userChartImg);

      const normalChartWrapper = document.createElement('div');
      normalChartWrapper.innerHTML = '<h4 style="text-align: center; font-size: 14px; margin-bottom: 10px;">Норма</h4>';
      normalChartWrapper.appendChild(normalChartImg);

      chartsDiv.appendChild(userChartWrapper);
      chartsDiv.appendChild(normalChartWrapper);
      chartsPlaceholder.appendChild(chartsDiv);
    }

    // Конвертируем в canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Удаляем временный контейнер
    document.body.removeChild(tempContainer);

    // Создаем PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Конвертируем размеры canvas из пикселей в мм (при scale=2)
    const imgWidthMM = (canvas.width / 2) * 0.264583; // 96 DPI to mm
    const imgHeightMM = (canvas.height / 2) * 0.264583;

    // Масштабируем чтобы поместиться на странице с отступами
    const margin = 10; // 10mm отступы
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);

    const scale = Math.min(availableWidth / imgWidthMM, availableHeight / imgHeightMM, 1);
    const finalWidth = imgWidthMM * scale;
    const finalHeight = imgHeightMM * scale;

    // Центрируем по горизонтали
    const imgX = (pdfWidth - finalWidth) / 2;
    const imgY = margin;

    pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);

    // Если контент не помещается на одной странице, добавляем еще страницы
    const totalPages = Math.ceil(finalHeight / availableHeight);
    for (let i = 1; i < totalPages; i++) {
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        margin - (availableHeight * i),
        finalWidth,
        finalHeight
      );
    }

    // Сохраняем PDF
    const fileName = `Результаты_теста_слуха_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    return { success: false, error: error.message };
  }
};
