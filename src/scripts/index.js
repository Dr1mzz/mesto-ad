import { createCardElement, deleteCard as removeCardFromDOM } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
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

let cardToDelete = null;
let cardIdToDelete = null;
let currentUserId = null;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const template = document.querySelector("#popup-info-definition-template");
  const infoItem = template.content.cloneNode(true);
  const termElement = infoItem.querySelector(".popup__info-term");
  const descriptionElement = infoItem.querySelector(".popup__info-description");

  termElement.textContent = term;
  descriptionElement.textContent = description;

  return infoItem;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (likeButton, cardId, isLiked) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((cardData) => {
      const isLikedNow = cardData.likes.some((user) => user._id === currentUserId);

      if (isLikedNow) {
        likeButton.classList.add("card__like-button_is-active");
      } else {
        likeButton.classList.remove("card__like-button_is-active");
      }

      const cardElement = likeButton.closest(".card");
      const likeCountElement = cardElement ? cardElement.querySelector(".card__like-count") : null;

      if (likeCountElement) {
        likeCountElement.textContent = cardData.likes.length;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = (cardElement, cardId) => {
  cardToDelete = cardElement;
  cardIdToDelete = cardId;
  openModalWindow(removeCardModalWindow);
};

const handleConfirmDelete = (evt) => {
  evt.preventDefault();

  const originalButtonText = removeCardSubmitButton.textContent;
  removeCardSubmitButton.textContent = "Удаление...";

  deleteCardApi(cardIdToDelete)
    .then(() => {
      removeCardFromDOM(cardToDelete);
      closeModalWindow(removeCardModalWindow);
      removeCardSubmitButton.textContent = originalButtonText;
      cardToDelete = null;
      cardIdToDelete = null;
    })
    .catch((err) => {
      console.log(err);
      removeCardSubmitButton.textContent = originalButtonText;
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const originalButtonText = profileSubmitButton.textContent;
  profileSubmitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
      profileSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      console.log(err);
      profileSubmitButton.textContent = originalButtonText;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const originalButtonText = avatarSubmitButton.textContent;
  avatarSubmitButton.textContent = "Сохранение...";

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
      avatarSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      console.log(err);
      avatarSubmitButton.textContent = originalButtonText;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const originalButtonText = cardSubmitButton.textContent;
  cardSubmitButton.textContent = "Создание...";

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          {
            name: cardData.name,
            link: cardData.link,
            ownerId: cardData.owner._id,
            cardId: cardData._id,
            likes: cardData.likes,
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId
        )
      );

      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
      cardSubmitButton.textContent = originalButtonText;
    })
    .catch((err) => {
      console.log(err);
      cardSubmitButton.textContent = originalButtonText;
    });
};

const handleLogoClick = () => {
  usersStatsModalInfoList.innerHTML = "";
  usersStatsModalUserList.innerHTML = "";

  getCardList()
    .then((cards) => {
      const totalCards = cards.length;

      usersStatsModalInfoList.append(
        createInfoString("Всего карточек:", totalCards.toString())
      );

      if (cards.length > 0) {
        usersStatsModalInfoList.append(
          createInfoString(
            "Первая создана:",
            formatDate(new Date(cards[cards.length - 1].createdAt))
          )
        );
        usersStatsModalInfoList.append(
          createInfoString(
            "Последняя создана:",
            formatDate(new Date(cards[0].createdAt))
          )
        );
      }

      const uniqueUsers = Array.from(
        new Set(cards.map((card) => card.owner._id))
      );
      const totalUsers = uniqueUsers.length;

      usersStatsModalInfoList.append(
        createInfoString("Всего пользователей:", totalUsers.toString())
      );

      usersStatsModalTitle.textContent = "Статистика";
      usersStatsModalText.textContent = "Пользователи:";

      const userTemplate = document.querySelector(
        "#popup-info-user-preview-template"
      );

      uniqueUsers.forEach((userId) => {
        const userCards = cards.filter((card) => card.owner._id === userId);
        const userData = userCards[0].owner;
        const userItem = userTemplate.content.cloneNode(true);
        const listItem = userItem.querySelector(".popup__list-item");

        listItem.textContent = `${userData.name} (${userCards.length})`;
        usersStatsModalUserList.append(userItem);
      });

      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
removeCardForm.addEventListener("submit", handleConfirmDelete);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          {
            name: cardData.name,
            link: cardData.link,
            ownerId: cardData.owner._id,
            cardId: cardData._id,
            likes: cardData.likes,
          },
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          },
          currentUserId
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
