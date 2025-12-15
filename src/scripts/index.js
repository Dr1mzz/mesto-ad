import { initialCards } from "./cards.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
// Импортируем функции валидации форм из модуля validation.js
// enableValidation - включает валидацию для всех форм на странице
// clearValidation - очищает ошибки валидации формы и делает кнопку неактивной
import { enableValidation, clearValidation } from "./components/validation.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

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

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileTitle.textContent = profileTitleInput.value;
  profileDescription.textContent = profileDescriptionInput.value;
  closeModalWindow(profileFormModalWindow);
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  profileAvatar.style.backgroundImage = `url(${avatarInput.value})`;
  closeModalWindow(avatarFormModalWindow);
  // Очищаем форму после успешной отправки
  avatarForm.reset();
  // Очищаем ошибки валидации и делаем кнопку неактивной
  // Это нужно, чтобы при следующем открытии формы не было старых ошибок
  clearValidation(avatarForm, validationSettings);
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  placesWrap.prepend(
    createCardElement(
      {
        name: cardNameInput.value,
        link: cardLinkInput.value,
      },
      {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: likeCard,
        onDeleteCard: deleteCard,
      }
    )
  );

  closeModalWindow(cardFormModalWindow);
  // Очищаем форму после успешной отправки
  cardForm.reset();
  // Очищаем ошибки валидации и делаем кнопку неактивной
  // Это нужно, чтобы при следующем открытии формы не было старых ошибок
  clearValidation(cardForm, validationSettings);
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  // Заполняем поля формы текущими данными пользователя со страницы
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  // Очищаем ошибки валидации, которые могли остаться с прошлого открытия формы
  clearValidation(profileForm, validationSettings);

  // Программно вызываем событие "input" для каждого поля после заполнения
  // Это запускает обработчики валидации, которые были установлены в setEventListeners
  // new Event("input", { bubbles: true }) - создает событие ввода с всплытием (bubbling)
  // После вызова события проверяется валидность полей и обновляется состояние кнопки
  // Если данные валидны, кнопка станет активной; если нет - останется неактивной
  profileTitleInput.dispatchEvent(new Event("input", { bubbles: true }));
  profileDescriptionInput.dispatchEvent(new Event("input", { bubbles: true }));

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

initialCards.forEach((data) => {
  placesWrap.append(
    createCardElement(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    })
  );
});

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Включаем валидацию для всех форм на странице
// enableValidation находит все формы по селектору из validationSettings.formSelector
// и устанавливает для каждой формы обработчики событий валидации
// После этого все формы будут автоматически валидироваться при вводе данных
enableValidation(validationSettings);
