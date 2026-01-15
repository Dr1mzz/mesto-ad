// Экспортируемая функция для переключения состояния лайка на карточке
// export - ключевое слово ES6 модулей, делает функцию доступной для импорта в других файлах
// const - объявление константы (нельзя переопределить)
// likeCard - имя функции
// 
// СТРЕЛОЧНАЯ ФУНКЦИЯ (Arrow Function):
// (likeButton) => { ... } - это стрелочная функция (arrow function), синтаксис ES6
// 
// Стрелочная функция - это короткий способ записи функции в JavaScript
// 
// Сравнение с обычной функцией:
//   Обычная функция: function likeCard(likeButton) { ... }
//   Стрелочная функция: (likeButton) => { ... }
// 
// Особенности стрелочных функций:
//   1. Более короткий синтаксис
//   2. Не имеют собственного контекста this (используют this из внешней области)
//   3. Нельзя использовать как конструктор (нельзя вызывать с new)
//   4. Не имеют объекта arguments
// 
// Синтаксис: (параметры) => { тело функции }
//   - Если параметр один, скобки можно опустить: параметр => { ... }
//   - Если тело одно выражение, фигурные скобки можно опустить: (x) => x * 2
//   - Если возвращаем значение без return, можно: (x) => x * 2 (автоматический return)
// 
// (likeButton) => { ... } - стрелочная функция, принимает один параметр likeButton
// likeButton - DOM-элемент кнопки лайка, на которую нужно переключить состояние
export const likeCard = (likeButton) => {
  // classList - свойство DOM-элемента, содержащее список CSS-классов
  // toggle() - метод, который добавляет класс, если его нет, или удаляет, если он есть
  // "card__like-button_is-active" - CSS-класс, который визуально показывает активное состояние лайка (например, красное сердце)
  // Если класс есть - удаляет его (лайк снимается), если нет - добавляет (лайк ставится)
  likeButton.classList.toggle("card__like-button_is-active");
};

// Экспортируемая функция для удаления карточки со страницы
// export - делает функцию доступной для импорта в других файлах
// const deleteCard - объявление константы с именем функции
// (cardElement) => { ... } - стрелочная функция, принимает один параметр cardElement
// cardElement - DOM-элемент всей карточки, которую нужно удалить
export const deleteCard = (cardElement) => {
  // remove() - метод DOM-элемента, который удаляет элемент из DOM дерева
  // После вызова этого метода карточка полностью исчезает со страницы
  cardElement.remove();
};

// Приватная функция (не экспортируется) для получения шаблона карточки
// const getTemplate - объявление константы, функция доступна только внутри этого модуля
// () => { ... } - стрелочная функция без параметров
const getTemplate = () => {
  // return - возвращает результат выполнения функции
  // document - глобальный объект, представляющий HTML-документ
  // getElementById("card-template") - находит элемент по ID "card-template" (это <template> в HTML)
  // .content - свойство элемента <template>, содержащее его содержимое (DocumentFragment)
  // querySelector(".card") - находит первый элемент с классом "card" внутри шаблона
  // cloneNode(true) - создает глубокую копию элемента (true означает копировать и все дочерние элементы)
  // Возвращает клонированный элемент карточки, готовый для заполнения данными
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

// Экспортируемая функция для создания готовой карточки с данными и обработчиками событий
// export const createCardElement - делает функцию доступной для импорта
// (data, { onPreviewPicture, onLikeIcon, onDeleteCard }) - функция принимает два параметра:
//   data - объект с данными карточки (свойства: name - название, link - ссылка на изображение)
//   { onPreviewPicture, onLikeIcon, onDeleteCard } - деструктуризация объекта с колбэками (callback функциями)
//     Это означает, что второй параметр - объект, из которого извлекаются три функции-обработчика
// 
// ЧТО ТАКОЕ КОЛБЭК-ФУНКЦИЯ (CALLBACK):
// Колбэк - это функция, которая передается в другую функцию как параметр и вызывается позже
// 
// Простой пример колбэка:
//   function doSomething(callback) {
//     // делаем что-то
//     callback(); // вызываем переданную функцию
//   }
//   doSomething(() => console.log("Готово!")); // передаем функцию как параметр
// 
// В нашем случае:
//   createCardElement получает функции onPreviewPicture, onLikeIcon, onDeleteCard
//   Эти функции будут вызваны позже, когда пользователь кликнет на кнопку/изображение
// 
// ЧТО ТАКОЕ ДЕСТРУКТУРИЗАЦИЯ ОБЪЕКТА:
// Деструктуризация - это способ извлечь свойства из объекта в отдельные переменные
// 
// Без деструктуризации (длинно):
//   function createCard(data, callbacks) {
//     const onPreviewPicture = callbacks.onPreviewPicture;
//     const onLikeIcon = callbacks.onLikeIcon;
//     const onDeleteCard = callbacks.onDeleteCard;
//   }
// 
// С деструктуризацией (коротко):
//   function createCard(data, { onPreviewPicture, onLikeIcon, onDeleteCard }) {
//     // onPreviewPicture, onLikeIcon, onDeleteCard уже доступны как переменные
//   }
// 
// Пример вызова функции:
//   createCardElement(
//     { name: "Байкал", link: "https://..." },
//     {
//       onPreviewPicture: handlePreviewPicture,  // передаем функцию
//       onLikeIcon: likeCard,                     // передаем функцию
//       onDeleteCard: deleteCard                  // передаем функцию
//     }
//   );
// 
// Внутри функции эти функции доступны как переменные:
//   onPreviewPicture, onLikeIcon, onDeleteCard
export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId = null
) => {
  // Вызываем приватную функцию getTemplate() для получения клона шаблона карточки
  // const cardElement - сохраняем клонированный элемент карточки в переменную
  const cardElement = getTemplate();

  // Находим элементы внутри карточки с помощью querySelector
  // querySelector() - метод, который находит первый элемент, соответствующий CSS-селектору
  // const likeButton - сохраняем DOM-элемент кнопки лайка
  const likeButton = cardElement.querySelector(".card__like-button");
  // const deleteButton - сохраняем DOM-элемент кнопки удаления
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  // const cardImage - сохраняем DOM-элемент изображения карточки
  const cardImage = cardElement.querySelector(".card__image");
  // const likeCount - сохраняем DOM-элемент счетчика лайков
  const likeCount = cardElement.querySelector(".card__like-count");

  // Сохраняем ID карточки в data-атрибут для использования при удалении
  if (data.cardId) {
    cardElement.dataset.cardId = data.cardId;
  }

  // Проверяем, является ли текущий пользователь владельцем карточки
  // Если карточка не принадлежит текущему пользователю, скрываем иконку удаления
  // data.ownerId - ID владельца карточки (передается из index.js)
  // currentUserId - ID текущего пользователя (передается как третий параметр)
  // Если ID владельца не совпадает с ID текущего пользователя, удаляем кнопку удаления
  if (data.ownerId && currentUserId && data.ownerId !== currentUserId) {
    // Удаляем кнопку удаления из DOM, если карточка не принадлежит текущему пользователю
    deleteButton.remove();
  }

  // Заполняем карточку данными из объекта data
  // .src - свойство элемента <img>, устанавливает URL изображения
  // data.link - берем ссылку на изображение из объекта data
  cardImage.src = data.link;
  // .alt - свойство элемента <img>, устанавливает альтернативный текст (для доступности)
  // data.name - берем название из объекта data
  cardImage.alt = data.name;
  // Находим элемент заголовка карточки и устанавливаем его текстовое содержимое
  // querySelector(".card__title") - находит элемент с классом "card__title"
  // .textContent - свойство, которое устанавливает текстовое содержимое элемента (без HTML)
  // data.name - название карточки из объекта data
  cardElement.querySelector(".card__title").textContent = data.name;

  // Устанавливаем начальное состояние лайка на основе данных с сервера
  // data.likes - массив пользователей, поставивших лайк (передается из index.js)
  // currentUserId - ID текущего пользователя (передается как третий параметр)
  // Проверяем, есть ли текущий пользователь в массиве лайков
  if (data.likes && currentUserId) {
    const isLiked = data.likes.some((user) => user._id === currentUserId);
    // Если лайк есть, добавляем класс активного состояния
    if (isLiked) {
      likeButton.classList.add("card__like-button_is-active");
    }
  }

  // Отображаем количество лайков карточки
  // data.likes - массив пользователей, поставивших лайк
  // .length - свойство массива, возвращает количество элементов в массиве
  // Если массив likes существует, используем его длину, иначе 0
  // .textContent - устанавливает текстовое содержимое элемента счетчика лайков
  if (likeCount) {
    likeCount.textContent = data.likes ? data.likes.length : 0;
  }

  // Условная проверка: если передан обработчик onLikeIcon
  // if (onLikeIcon) - проверяет, что функция существует и не является undefined/null
  if (onLikeIcon) {
    // addEventListener() - метод для добавления обработчика события
    // "click" - тип события (клик мышью)
    // () => onLikeIcon(likeButton, data.cardId, isLiked) - стрелочная функция-обработчик
    //   Передаем likeButton (DOM-элемент), cardId (ID карточки) и isLiked (текущее состояние лайка)
    likeButton.addEventListener("click", () => {
      // Определяем текущее состояние лайка перед кликом
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      // Вызываем обработчик с параметрами: кнопка, ID карточки, текущее состояние лайка
      onLikeIcon(likeButton, data.cardId, isLiked);
    });
  }

  // Условная проверка: если передан обработчик onDeleteCard
  if (onDeleteCard) {
    // Добавляем обработчик клика на кнопку удаления
    // () => onDeleteCard(cardElement, data.cardId) - при клике вызывается переданная функция
    //   с параметрами cardElement (DOM-элемент карточки) и data.cardId (ID карточки для удаления с сервера)
    // data.cardId - идентификатор карточки, сохраненный в data-атрибуте или переданный в объекте data
    deleteButton.addEventListener("click", () => {
      // Получаем ID карточки из data-атрибута или из объекта data
      const cardId = cardElement.dataset.cardId || data.cardId;
      onDeleteCard(cardElement, cardId);
    });
  }

  // Условная проверка: если передан обработчик onPreviewPicture
  if (onPreviewPicture) {
    // Добавляем обработчик клика на изображение карточки
    // () => onPreviewPicture({name: data.name, link: data.link}) - при клике вызывается функция
    //   {name: data.name, link: data.link} - создается объект с данными карточки
    //   Это объектный литерал (object literal) - способ создания объекта напрямую
    //   Передаем название и ссылку для отображения в модальном окне
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  // return - возвращает готовую карточку с заполненными данными и установленными обработчиками
  // cardElement - DOM-элемент карточки, который можно добавить на страницу
  return cardElement;
};
