import { createCardElement, deleteCard as removeCardFromDOM } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
// Импортируем функции валидации форм из модуля validation.js
// enableValidation - включает валидацию для всех форм на странице
// clearValidation - очищает ошибки валидации формы и делает кнопку неактивной
import { enableValidation, clearValidation } from "./components/validation.js";
// Импортируем функции для работы с API-сервером
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addCard, deleteCardApi, changeLikeCardStatus } from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardSubmitButton = removeCardForm.querySelector(".popup__button");

const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUserList = usersStatsModalWindow.querySelector(".popup__list");

const logoElement = document.querySelector(".header__logo");

// Переменные для хранения данных карточки, которую нужно удалить
// Используются при подтверждении удаления в модальном окне
let cardToDelete = null;
let cardIdToDelete = null;

// Переменная для хранения ID текущего пользователя
// Будет заполнена после получения данных пользователя с сервера
let currentUserId = null;

// Объект с настройками валидации форм
// Содержит селекторы для поиска элементов и CSS-классы для стилизации ошибок
// Все селекторы и классы используются модулем validation.js для универсальной работы с формами
const validationSettings = {
  // Селектор для поиска всех форм на странице, которые нужно валидировать
  formSelector: ".popup__form",
  // Селектор для поиска всех полей ввода внутри формы
  inputSelector: ".popup__input",
  // Селектор для поиска кнопки отправки формы
  submitButtonSelector: ".popup__button",
  // CSS-класс, который добавляется к кнопке, когда она неактивна (disabled)
  // Используется для визуального отображения неактивного состояния
  inactiveButtonClass: "popup__button_disabled",
  // CSS-класс, который добавляется к полю ввода, когда оно содержит ошибку
  // Используется для визуального выделения невалидного поля (например, красная рамка)
  inputErrorClass: "popup__input_type_error",
  // CSS-класс, который добавляется к элементу с текстом ошибки, чтобы сделать его видимым
  // По умолчанию элемент ошибки скрыт, этот класс делает его видимым
  errorClass: "popup__error_visible",
};

// Функция для форматирования даты в формат ДД месяц ГГГГ
// date - объект Date, который нужно отформатировать
// toLocaleDateString() - метод объекта Date, который форматирует дату в строку согласно локали
// "ru-RU" - локаль для русского языка
// { year: "numeric", month: "long", day: "numeric" } - опции форматирования:
//   year: "numeric" - год в числовом формате (например, 2025)
//   month: "long" - месяц полным названием (например, "январь")
//   day: "numeric" - день в числовом формате (например, 15)
// Возвращает строку вида "15 января 2025"
const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Функция для создания элемента статистики из шаблона
// term - термин (например, "Всего карточек:")
// description - описание (например, "10")
// Возвращает DOM-элемент с заполненными данными
const createInfoString = (term, description) => {
  // Находим шаблон для элемента статистики
  const template = document.querySelector("#popup-info-definition-template");
  // Клонируем содержимое шаблона (cloneNode(true) - глубокое клонирование со всеми дочерними элементами)
  const infoItem = template.content.cloneNode(true);
  // Находим элементы внутри клонированного шаблона
  const termElement = infoItem.querySelector(".popup__info-term");
  const descriptionElement = infoItem.querySelector(".popup__info-description");
  // Заполняем элементы данными
  termElement.textContent = term;
  descriptionElement.textContent = description;
  // Возвращаем готовый элемент
  return infoItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

// Обработчик лайка карточки
// Отправляет запрос на изменение статуса лайка на сервере и обновляет состояние кнопки лайка
// likeButton - DOM-элемент кнопки лайка
// cardId - идентификатор карточки
// isLiked - булево значение, указывающее, стоит ли уже лайк от текущего пользователя
const handleLikeCard = (likeButton, cardId, isLiked) => {
  // Отправляем запрос на изменение статуса лайка на сервере
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      // Если запрос успешен, обновляем состояние кнопки лайка на основе ответа сервера
      // cardData.likes - массив пользователей, поставивших лайк
      // Проверяем, есть ли текущий пользователь в массиве лайков
      const isLikedNow = cardData.likes.some((user) => user._id === currentUserId);

      // Обновляем визуальное состояние кнопки лайка
      if (isLikedNow) {
        // Если лайк есть, добавляем класс активного состояния
        likeButton.classList.add("card__like-button_is-active");
      } else {
        // Если лайка нет, удаляем класс активного состояния
        likeButton.classList.remove("card__like-button_is-active");
      }

      // Обновляем счетчик лайков на основе данных с сервера
      // Находим родительский элемент карточки, чтобы получить доступ к счетчику лайков
      // likeButton.closest(".card") - находит ближайший родительский элемент с классом "card"
      // .querySelector(".card__like-count") - находит элемент счетчика лайков внутри карточки
      const cardElement = likeButton.closest(".card");
      const likeCountElement = cardElement ? cardElement.querySelector(".card__like-count") : null;

      // Если элемент счетчика найден, обновляем его текстовое содержимое
      // cardData.likes.length - количество элементов в массиве лайков (количество лайков)
      // .textContent - устанавливает текстовое содержимое элемента
      if (likeCountElement) {
        likeCountElement.textContent = cardData.likes.length;
      }
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
    });
};

// Обработчик клика на иконку удаления карточки
// Открывает модальное окно подтверждения удаления
// cardElement - DOM-элемент карточки, которую нужно удалить
// cardId - идентификатор карточки для удаления с сервера
const handleDeleteCard = (cardElement, cardId) => {
  // Сохраняем данные карточки для использования при подтверждении удаления
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  // Открываем модальное окно подтверждения удаления
  openModalWindow(removeCardModalWindow);
};

// Обработчик подтверждения удаления карточки
// Вызывается при отправке формы подтверждения удаления
// Удаляет карточку с сервера через API, а затем удаляет её из DOM
const handleConfirmDelete = (evt) => {
  evt.preventDefault(); // Предотвращаем стандартную отправку формы

  // Сохраняем исходный текст кнопки для восстановления после завершения запроса
  const originalButtonText = removeCardSubmitButton.textContent;
  // Изменяем текст кнопки на "Удаление..." для индикации процесса отправки данных
  removeCardSubmitButton.textContent = "Удаление...";

  // Отправляем запрос на удаление карточки с сервера
  deleteCardApi(cardIdToDelete)
    .then(() => {
      // Если запрос успешен, удаляем карточку из DOM
      removeCardFromDOM(cardToDelete);
      // Закрываем модальное окно подтверждения
      closeModalWindow(removeCardModalWindow);
      // Восстанавливаем исходный текст кнопки
      removeCardSubmitButton.textContent = originalButtonText;
      // Очищаем сохраненные данные
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
      // Восстанавливаем исходный текст кнопки даже при ошибке
      removeCardSubmitButton.textContent = originalButtonText;
    });
};

// Обработчик отправки формы редактирования профиля
// Отправляет обновленные данные пользователя на сервер и обновляет страницу
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault(); // Предотвращаем стандартную отправку формы

  // Сохраняем исходный текст кнопки для восстановления после завершения запроса
  const originalButtonText = profileSubmitButton.textContent;
  // Изменяем текст кнопки на "Сохранение..." для индикации процесса отправки данных
  profileSubmitButton.textContent = "Сохранение...";

  // Отправляем данные на сервер с помощью функции setUserInfo
  // Передаем объект с именем и описанием из полей формы
  setUserInfo({
    name: profileTitleInput.value, // Значение из поля "Имя"
    about: profileDescriptionInput.value, // Значение из поля "Описание"
  })
    .then((userData) => {
      // Если запрос успешен, обновляем данные на странице
      // userData - объект с обновленными данными пользователя с сервера
      profileTitle.textContent = userData.name; // Обновляем имя на странице
      profileDescription.textContent = userData.about; // Обновляем описание на странице
      closeModalWindow(profileFormModalWindow); // Закрываем модальное окно
      // Восстанавливаем исходный текст кнопки после успешного завершения
      profileSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
      // Восстанавливаем исходный текст кнопки даже при ошибке
      profileSubmitButton.textContent = originalButtonText;
    });
};

// Обработчик отправки формы обновления аватара
// Отправляет новую ссылку на аватар на сервер и обновляет аватар на странице
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault(); // Предотвращаем стандартную отправку формы

  // Сохраняем исходный текст кнопки для восстановления после завершения запроса
  const originalButtonText = avatarSubmitButton.textContent;
  // Изменяем текст кнопки на "Сохранение..." для индикации процесса отправки данных
  avatarSubmitButton.textContent = "Сохранение...";

  // Отправляем новую ссылку на аватар на сервер с помощью функции setUserAvatar
  setUserAvatar(avatarInput.value) // Передаем значение из поля ввода (URL изображения)
    .then((userData) => {
      // Если запрос успешен, обновляем аватар на странице
      // userData - объект с обновленными данными пользователя с сервера
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`; // Обновляем аватар на странице
      closeModalWindow(avatarFormModalWindow); // Закрываем модальное окно
      // Очищаем форму после успешной отправки
      avatarForm.reset();
      // Очищаем ошибки валидации и делаем кнопку неактивной
      // Это нужно, чтобы при следующем открытии формы не было старых ошибок
      clearValidation(avatarForm, validationSettings);
      // Восстанавливаем исходный текст кнопки после успешного завершения
      avatarSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
      // Восстанавливаем исходный текст кнопки даже при ошибке
      avatarSubmitButton.textContent = originalButtonText;
    });
};

// Обработчик отправки формы добавления новой карточки
// Отправляет данные новой карточки на сервер и добавляет карточку на страницу
const handleCardFormSubmit = (evt) => {
  evt.preventDefault(); // Предотвращаем стандартную отправку формы

  // Сохраняем исходный текст кнопки для восстановления после завершения запроса
  const originalButtonText = cardSubmitButton.textContent;
  // Изменяем текст кнопки на "Создание..." для индикации процесса отправки данных
  cardSubmitButton.textContent = "Создание...";

  // Отправляем данные новой карточки на сервер с помощью функции addCard
  // Передаем объект с названием и ссылкой из полей формы
  addCard({
    name: cardNameInput.value, // Значение из поля "Название"
    link: cardLinkInput.value, // Значение из поля "Ссылка на картинку"
  })
    .then((cardData) => {
      // Если запрос успешен, добавляем новую карточку на страницу
      // cardData - объект с данными созданной карточки с сервера
      // Создаем DOM-элемент карточки и добавляем его в начало списка (prepend)
      placesWrap.prepend(
        createCardElement(
          {
            name: cardData.name, // Название карточки из ответа сервера
            link: cardData.link, // Ссылка на изображение из ответа сервера
            ownerId: cardData.owner._id, // ID владельца карточки (текущий пользователь, так как мы только что создали карточку)
            cardId: cardData._id, // ID карточки для удаления с сервера
            likes: cardData.likes, // Передаем массив лайков для отображения начального состояния
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId // Передаем ID текущего пользователя для проверки владельца
        )
      );

      closeModalWindow(cardFormModalWindow); // Закрываем модальное окно
      // Очищаем форму после успешной отправки
      cardForm.reset();
      // Очищаем ошибки валидации и делаем кнопку неактивной
      // Это нужно, чтобы при следующем открытии формы не было старых ошибок
      clearValidation(cardForm, validationSettings);
      // Восстанавливаем исходный текст кнопки после успешного завершения
      cardSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
      // Восстанавливаем исходный текст кнопки даже при ошибке
      cardSubmitButton.textContent = originalButtonText;
    });
};

// addEventListener - метод DOM-элемента для добавления обработчика события
// Синтаксис: element.addEventListener(типСобытия, обработчик)
// 
// ЧТО ДЕЛАЕТ addEventListener:
// - Подписывает элемент на определенное событие (клик, отправка формы, ввод текста и т.д.)
// - Когда событие происходит, вызывается переданная функция-обработчик
// - Можно добавить несколько обработчиков на одно событие
// - Обработчик будет вызываться каждый раз, когда событие происходит
// 
// Параметры:
//   "submit" - тип события (событие отправки формы)
//   handleProfileFormSubmit - функция, которая будет вызвана при отправке формы
// 
// Примеры событий:
//   "click" - клик мышью
//   "submit" - отправка формы
//   "input" - изменение значения поля ввода
//   "keydown" - нажатие клавиши
//   "focus" - получение фокуса элементом
//   "blur" - потеря фокуса элементом
// 
// Альтернативный способ (старый, не рекомендуется):
//   profileForm.onsubmit = handleProfileFormSubmit;
// 
// Преимущества addEventListener:
//   1. Можно добавить несколько обработчиков на одно событие
//   2. Можно удалить обработчик с помощью removeEventListener
//   3. Более гибкий и современный подход
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleConfirmDelete);

openProfileFormButton.addEventListener("click", () => {
  // Заполняем поля формы текущими данными пользователя со страницы
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  // Очищаем ошибки валидации, которые могли остаться с прошлого открытия формы
  // clearValidation также делает кнопку неактивной (добавляет класс popup__button_disabled и атрибут disabled)
  // Кнопка останется неактивной до тех пор, пока пользователь не начнет вводить данные
  clearValidation(profileForm, validationSettings);

  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  // Очищаем форму перед открытием
  avatarForm.reset();
  // Очищаем ошибки валидации и делаем кнопку неактивной
  // Это нужно, чтобы при открытии формы не было старых ошибок и кнопка была неактивна
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  // Очищаем форму перед открытием
  cardForm.reset();
  // Очищаем ошибки валидации и делаем кнопку неактивной
  // Это нужно, чтобы при открытии формы не было старых ошибок и кнопка была неактивна
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

// Обработчик клика на логотип
// Открывает модальное окно со статистикой пользователей
// Получает актуальные данные карточек с сервера и отображает статистику
const handleLogoClick = () => {
  // Очищаем предыдущие данные из модального окна
  usersStatsModalInfoList.innerHTML = "";
  usersStatsModalUserList.innerHTML = "";

  // Получаем актуальный список карточек с сервера
  getCardList()
    .then((cards) => {
      // Подсчитываем общее количество карточек
      const totalCards = cards.length;
      // Добавляем элемент статистики "Всего карточек"
      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", totalCards.toString())
      );

      // Если есть карточки, добавляем информацию о первой и последней созданных
      if (cards.length > 0) {
        // cards[cards.length - 1] - последняя карточка в массиве (самая старая, первая созданная)
        // new Date() - преобразуем строку даты в объект Date
        // formatDate() - форматируем дату в читаемый формат
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(cards[cards.length - 1].createdAt))
          )
        );
        // cards[0] - первая карточка в массиве (самая новая, последняя созданная)
        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(cards[0].createdAt))
          )
        );
      }

      // Подсчитываем количество уникальных пользователей (авторов карточек)
      // new Set() - создает коллекцию уникальных значений
      // map() - преобразует массив карточек в массив ID авторов
      // Array.from() - преобразует Set обратно в массив
      const uniqueUsers = Array.from(
        new Set(cards.map((card) => card.owner._id))
      );
      const totalUsers = uniqueUsers.length;
      // Добавляем элемент статистики "Всего пользователей"
      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", totalUsers.toString())
      );

      // Устанавливаем заголовок модального окна
      usersStatsModalTitle.textContent = "Статистика";

      // Устанавливаем заголовок списка пользователей
      usersStatsModalText.textContent = "Пользователи:";

      // Находим шаблон для элемента пользователя
      const userTemplate = document.querySelector(
        "#popup-info-user-preview-template"
      );

      // Для каждого уникального пользователя создаем элемент списка
      uniqueUsers.forEach((userId) => {
        // Находим все карточки этого пользователя
        const userCards = cards.filter((card) => card.owner._id === userId);
        // Берем первую карточку пользователя для получения его данных
        const userData = userCards[0].owner;

        // Клонируем шаблон элемента пользователя
        const userItem = userTemplate.content.cloneNode(true);
        const listItem = userItem.querySelector(".popup__list-item");

        // Устанавливаем текст элемента (имя пользователя и количество его карточек)
        listItem.textContent = `${userData.name} (${userCards.length})`;

        // Добавляем элемент в список пользователей
        usersStatsModalUserList.append(userItem);
      });

      // Открываем модальное окно со статистикой
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      // В случае ошибки выводим её в консоль
      console.log(err);
    });
};

// Устанавливаем обработчик клика на логотип
// При клике открывается модальное окно со статистикой пользователей
logoElement.addEventListener("click", handleLogoClick);

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Включаем валидацию для всех форм на странице
// enableValidation находит все формы по селектору из validationSettings.formSelector
// и устанавливает для каждой формы обработчики событий валидации
// После этого все формы будут автоматически валидироваться при вводе данных
enableValidation(validationSettings);

// Promise.all - метод для выполнения нескольких асинхронных запросов одновременно
// Принимает массив промисов и возвращает новый промис, который выполнится,
// когда все промисы в массиве будут выполнены успешно
// Если хотя бы один промис завершится с ошибкой, Promise.all также завершится с ошибкой
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Деструктуризация массива результатов:
    // cards - массив карточек с сервера
    // userData - объект с данными пользователя

    // Сохраняем ID текущего пользователя для проверки владельца карточек
    currentUserId = userData._id;

    // Отображаем данные пользователя на странице
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Отображаем карточки на странице
    // Для каждой карточки из массива создаем DOM-элемент и добавляем на страницу
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          {
            name: cardData.name,
            link: cardData.link,
            ownerId: cardData.owner._id, // Передаем ID владельца карточки для проверки
            cardId: cardData._id, // Передаем ID карточки для удаления с сервера
            likes: cardData.likes, // Передаем массив лайков для отображения начального состояния
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId // Передаем ID текущего пользователя для сравнения с владельцем карточки
        )
      );
    });
  })
  .catch((err) => {
    // В случае возникновения ошибки выводим её в консоль
    console.log(err);
  });
