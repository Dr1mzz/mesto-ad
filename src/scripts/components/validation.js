// Отображает сообщение об ошибке под невалидным полем ввода и добавляет соответствующие CSS-классы
// formElement - DOM-элемент формы, содержащей поле ввода
// inputElement - DOM-элемент поля ввода, которое не прошло валидацию
// errorMessage - текст сообщения об ошибке, который будет отображен пользователю
// settings - объект с настройками валидации, содержащий селекторы и классы для стилизации ошибок
export const showInputError = (formElement, inputElement, errorMessage, settings) => {
    // Находим элемент для отображения ошибки по ID, который формируется как "id-поля-error"
    // Например, для поля с id="user-name" ищем элемент с id="user-name-error"
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    // Добавляем класс ошибки к полю ввода для визуального выделения (например, красная рамка)
    // settings.inputErrorClass содержит CSS-класс, который стилизует невалидное поле
    inputElement.classList.add(settings.inputErrorClass);
    // Устанавливаем текст ошибки в элемент, который будет отображаться под полем ввода
    errorElement.textContent = errorMessage;
    // Добавляем класс видимости к элементу ошибки, чтобы он стал видимым на странице
    // settings.errorClass содержит CSS-класс, который делает элемент ошибки видимым
    errorElement.classList.add(settings.errorClass);
};

// Скрывает сообщение об ошибке под полем ввода и удаляет CSS-классы, связанные с ошибкой
// Используется когда поле становится валидным или при очистке формы
// formElement - DOM-элемент формы, содержащей поле ввода
// inputElement - DOM-элемент поля ввода, для которого нужно скрыть ошибку
// settings - объект с настройками валидации
export const hideInputError = (formElement, inputElement, settings) => {
    // Находим элемент для отображения ошибки по ID поля
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    // Удаляем класс ошибки с поля ввода, возвращая ему нормальный вид
    inputElement.classList.remove(settings.inputErrorClass);
    // Очищаем текст ошибки
    errorElement.textContent = "";
    // Удаляем класс видимости, скрывая элемент ошибки
    errorElement.classList.remove(settings.errorClass);
};

// Проверяет валидность конкретного поля ввода и отображает или скрывает ошибку
// formElement - DOM-элемент формы, содержащей поле ввода
// inputElement - DOM-элемент поля ввода, которое нужно проверить
// settings - объект с настройками валидации
export const checkInputValidity = (formElement, inputElement, settings) => {
    // Проверяем, есть ли ошибка несоответствия паттерну (pattern) и кастомное сообщение об ошибке
    // inputElement.validity.patternMismatch - true, если значение не соответствует регулярному выражению в атрибуте pattern
    // inputElement.dataset.errorMessage - кастомное сообщение об ошибке из атрибута data-error-message
    // Если оба условия выполнены, устанавливаем кастомное сообщение вместо стандартного браузерного
    if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
        // setCustomValidity устанавливает кастомное сообщение об ошибке, которое будет доступно через validationMessage
        inputElement.setCustomValidity(inputElement.dataset.errorMessage);
    } else {
        // Если нет кастомного сообщения или ошибка другого типа, очищаем кастомное сообщение
        // Это позволяет использовать стандартные сообщения браузера для других типов ошибок
        inputElement.setCustomValidity("");
    }

    // Проверяем общую валидность поля через встроенный API валидации HTML5
    // inputElement.validity.valid - true, если поле валидно, false - если есть ошибки
    if (!inputElement.validity.valid) {
        // Если поле невалидно, отображаем ошибку
        // inputElement.validationMessage содержит текст ошибки (либо кастомный, либо стандартный браузерный)
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        // Если поле валидно, скрываем ошибку
        hideInputError(formElement, inputElement, settings);
    }
};

// Проверяет наличие невалидных полей в форме
// inputList - массив DOM-элементов полей ввода формы
// Возвращает true, если хотя бы одно поле невалидно, иначе false
export const hasInvalidInput = (inputList) => {
    // Используем метод массива some(), который возвращает true, если хотя бы один элемент проходит проверку
    // Проверяем каждое поле: если validity.valid === false, значит поле невалидно
    return inputList.some((inputElement) => {
        // Возвращаем true для невалидного поля (validity.valid === false)
        return !inputElement.validity.valid;
    });
};

// Делает кнопку отправки формы неактивной (недоступной для нажатия)
// buttonElement - DOM-элемент кнопки отправки формы
// settings - объект с настройками валидации, содержащий класс для неактивной кнопки
export const disableSubmitButton = (buttonElement, settings) => {
    // Добавляем CSS-класс для визуального отображения неактивного состояния кнопки
    // settings.inactiveButtonClass содержит класс, который делает кнопку серой/полупрозрачной
    buttonElement.classList.add(settings.inactiveButtonClass);
    // Устанавливаем атрибут disabled в true, что делает кнопку недоступной для клика
    // disabled - стандартный HTML-атрибут, который блокирует взаимодействие с элементом
    buttonElement.disabled = true;
};

// Делает кнопку отправки формы активной (доступной для нажатия)
// buttonElement - DOM-элемент кнопки отправки формы
// settings - объект с настройками валидации
export const enableSubmitButton = (buttonElement, settings) => {
    // Удаляем CSS-класс неактивного состояния, возвращая кнопке нормальный вид
    buttonElement.classList.remove(settings.inactiveButtonClass);
    // Устанавливаем атрибут disabled в false, делая кнопку доступной для клика
    buttonElement.disabled = false;
};

// Переключает состояние кнопки отправки формы в зависимости от валидности всех полей
// Если хотя бы одно поле невалидно - кнопка становится неактивной
// Если все поля валидны - кнопка становится активной
// inputList - массив DOM-элементов всех полей ввода формы
// buttonElement - DOM-элемент кнопки отправки формы
// settings - объект с настройками валидации
export const toggleButtonState = (inputList, buttonElement, settings) => {
    // Проверяем наличие невалидных полей в форме
    if (hasInvalidInput(inputList)) {
        // Если есть невалидные поля, делаем кнопку неактивной
        // Пользователь не сможет отправить форму с ошибками
        disableSubmitButton(buttonElement, settings);
    } else {
        // Если все поля валидны, делаем кнопку активной
        // Пользователь может отправить форму
        enableSubmitButton(buttonElement, settings);
    }
};

// Устанавливает обработчики событий для всех полей формы
// При каждом изменении поля проверяется его валидность и обновляется состояние кнопки
// formElement - DOM-элемент формы, для которой нужно настроить валидацию
// settings - объект с настройками валидации, содержащий селекторы для поиска элементов
export const setEventListeners = (formElement, settings) => {
    // Находим все поля ввода в форме по селектору из настроек
    // settings.inputSelector - селектор для поиска полей ввода (например, ".popup__input")
    // Array.from() преобразует NodeList в обычный массив для удобной работы
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    // Находим кнопку отправки формы по селектору из настроек
    // settings.submitButtonSelector - селектор для поиска кнопки (например, ".popup__button")
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    // Устанавливаем начальное состояние кнопки при первом открытии формы
    // Если есть невалидные поля (например, пустые обязательные поля), кнопка будет неактивна
    toggleButtonState(inputList, buttonElement, settings);

    // Для каждого поля ввода устанавливаем обработчик события "input"
    // Событие "input" срабатывает при каждом изменении значения поля (ввод символа, удаление и т.д.)
    // 
    // addEventListener - метод для добавления обработчика события к элементу
    // Синтаксис: element.addEventListener("типСобытия", функцияОбработчик)
    // 
    // Параметры:
    //   "input" - тип события (срабатывает при изменении значения поля ввода)
    //   () => { ... } - стрелочная функция-обработчик, которая будет вызвана при событии
    // 
    // Как это работает:
    //   1. Пользователь вводит символ в поле
    //   2. Срабатывает событие "input"
    //   3. Вызывается функция-обработчик (стрелочная функция)
    //   4. Внутри обработчика проверяется валидность поля и обновляется состояние кнопки
    inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
            // При каждом изменении поля проверяем его валидность
            // Это отображает или скрывает ошибку под полем в реальном времени
            checkInputValidity(formElement, inputElement, settings);
            // После проверки поля обновляем состояние кнопки отправки
            // Если все поля стали валидными, кнопка активируется
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
};

// Очищает все ошибки валидации формы и делает кнопку отправки неактивной
// Используется при открытии формы (чтобы убрать старые ошибки) и после успешной отправки
// formElement - DOM-элемент формы, которую нужно очистить
// settings - объект с настройками валидации
export const clearValidation = (formElement, settings) => {
    // Находим все поля ввода в форме
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    // Находим кнопку отправки формы
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    // Для каждого поля ввода очищаем ошибки валидации
    inputList.forEach((inputElement) => {
        // Скрываем визуальное отображение ошибки (убираем классы и текст)
        hideInputError(formElement, inputElement, settings);
        // Очищаем кастомное сообщение об ошибке, если оно было установлено
        // Это сбрасывает состояние валидации поля
        inputElement.setCustomValidity("");
    });

    // Делаем кнопку отправки неактивной после очистки
    // Это гарантирует, что при открытии формы кнопка будет неактивна до ввода данных
    disableSubmitButton(buttonElement, settings);
};

// Включает валидацию для всех форм на странице
// Находит все формы по селектору и устанавливает для каждой обработчики событий
// settings - объект с настройками валидации, содержащий селектор для поиска форм
export const enableValidation = (settings) => {
    // Находим все формы на странице по селектору из настроек
    // settings.formSelector - селектор для поиска форм (например, ".popup__form")
    // Array.from() преобразует NodeList в массив
    const formList = Array.from(document.querySelectorAll(settings.formSelector));
    // Для каждой найденной формы устанавливаем обработчики событий валидации
    formList.forEach((formElement) => {
        // setEventListeners настраивает валидацию для конкретной формы:
        // - устанавливает обработчики событий "input" для всех полей
        // - настраивает начальное состояние кнопки отправки
        setEventListeners(formElement, settings);
    });
};

