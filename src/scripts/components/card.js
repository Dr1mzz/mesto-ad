export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  currentUserId = null
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  if (data.cardId) {
    cardElement.dataset.cardId = data.cardId;
  }

  if (data.ownerId !== currentUserId) {
    deleteButton.remove();
  }

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (data.likes && currentUserId) {
    const isLiked = data.likes.some((user) => user._id === currentUserId);
    if (isLiked) {
      likeButton.classList.add("card__like-button_is-active");
    }
  }

  if (likeCount) {
    likeCount.textContent = data.likes ? data.likes.length : 0;
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(likeButton, data.cardId, isLiked);
    });
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => {
      const cardId = cardElement.dataset.cardId || data.cardId;
      onDeleteCard(cardElement, cardId);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};
