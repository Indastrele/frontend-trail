"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const showHiddenCheckbox = document.getElementById('show-hidden');
    const cards = document.querySelectorAll('.card');

    // State holders
    let hiddenTiles = new Set();
    let favourites = new Set();
    let comparison = new Set();

    const FILTER_TYPES = {
        ALL: 'all',
        FAVOURITES: 'favourites',
        COMPARISON: 'comparison'
    };

    const TOGGLE_TYPE = {
        LIKE: 'like',
        COMPARE: 'compare',
        HIDE: 'hide'
    };

    const FA_ICON_STATES = {
        REGULAR: 'fa-regular',
        SOLID: 'fa-solid'
    };

    const FA_ICONS = {
        HEART: 'fa-heart',
        EYE: 'fa-eye',
        EYE_SLASH: 'fa-eye-slash'
    };

    let currentFilter = FILTER_TYPES.ALL;
    let showHidden = false;

    const STORAGE_KEYS = {
        HIDDEN: 'hiddenTiles',
        FAVOURITES: 'favourites',
        COMPARISON: 'comparison'
    };

    const saveToLocalStorage = () => {
        localStorage.setItem(STORAGE_KEYS.HIDDEN, JSON.stringify(Array.from(hiddenTiles)));
        localStorage.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(Array.from(favourites)));
        localStorage.setItem(STORAGE_KEYS.COMPARISON, JSON.stringify(Array.from(comparison)));
    };

    const loadFromLocalStorage = () => {
        const hiddenData = localStorage.getItem(STORAGE_KEYS.HIDDEN);
        const favData = localStorage.getItem(STORAGE_KEYS.FAVOURITES);
        const compData = localStorage.getItem(STORAGE_KEYS.COMPARISON);

        if (hiddenData) {
            hiddenTiles = new Set(JSON.parse(hiddenData));
        }
        if (favData) {
            favourites = new Set(JSON.parse(favData));
        }
        if (compData) {
            comparison = new Set(JSON.parse(compData));
        }
    };

    const renderActionButtons = () => {
        cards.forEach(card => {
            if (card.querySelector('.card__buttons-box')) {
                return;
            }

            const buttonsBoxHTML = `
                <div class="card__buttons-box">
                    <div class="card__buttons">
                        <button type="button" class="card__button card__button--like">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <button type="button" class="card__button card__button--compare">
                            <i class="fa-solid fa-scale-balanced"></i>
                        </button>
                        <button type="button" class="card__button card__button--hide">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
            card.insertAdjacentHTML('afterbegin', buttonsBoxHTML);

            const addToCartButtonHTML = `
                <button type="button" class="card__add-button">
                    <i class="fa-solid fa-cart-shopping"></i>
                    ADD TO CART
                </button>
            `;
            card.insertAdjacentHTML('beforeend', addToCartButtonHTML);
        });
    };

    const changeButtonIconState = (button, previousIconName, changeTo, reversed) => {
        const icon = button.querySelector('i');
        if (!reversed) {
            icon.classList.remove(FA_ICON_STATES.REGULAR, previousIconName);
            icon.classList.add(FA_ICON_STATES.SOLID, changeTo);
        } else {
            icon.classList.remove(FA_ICON_STATES.SOLID, previousIconName);
            icon.classList.add(FA_ICON_STATES.REGULAR, changeTo);
        }
    };

    const addClassToClassList = (btn, newClass) => btn.classList.add(newClass);

    const restoreCardStates = () => {
        cards.forEach(card => {
            const id = card.dataset.id;

            const likeBtn = card.querySelector('.card__button--like');
            if (likeBtn && favourites.has(id)) {
                addClassToClassList(likeBtn, 'active');
                changeButtonIconState(likeBtn, FA_ICONS.HEART, FA_ICONS.HEART, false);
            }

            const compareBtn = card.querySelector('.card__button--compare');
            if (compareBtn && comparison.has(id)) {
                addClassToClassList(compareBtn, 'active');
            }

            const hideBtn = card.querySelector('.card__button--hide');
            if (hideBtn && hiddenTiles.has(id)) {
                addClassToClassList(hideBtn, 'active');
                changeButtonIconState(likeBtn, FA_ICONS.EYE, FA_ICONS.EYE_SLASH, false);
            }
        });
    };

    const applyFilters = () => {
        cards.forEach(card => {
            const id = card.dataset.id;
            const isHidden = hiddenTiles.has(id);
            const isFav = favourites.has(id);
            const isComp = comparison.has(id);

            let matchesFilter = true;
            if (currentFilter === FILTER_TYPES.FAVOURITES && !isFav ||
                currentFilter === FILTER_TYPES.COMPARISON && !isComp) {
                matchesFilter = false;
            }

            card.classList.remove('card--hidden', 'card--faded');

            if (!matchesFilter) {
                addClassToClassList(card, 'card--hidden');
                card.classList.add('card--hidden');
                return;
            }

            if (isHidden && !showHidden) {
                addClassToClassList(card, 'card--hidden');
            } else if (isHidden) {
                addClassToClassList(card, 'card--faded');
            }
        });
    };

    const toggleAction = (event, cardId, button, actionType) => {
        event.preventDefault();
        const isActive = button.classList.contains('active');

        if (actionType === TOGGLE_TYPE.LIKE) {
            const iconName = FA_ICONS.HEART;
            if (isActive) {
                changeButtonIconState(button, iconName, iconName, true);
                favourites.delete(cardId);
            } else {
                changeButtonIconState(button, iconName, iconName, false);
                favourites.add(cardId);
            }
        } else if (actionType === TOGGLE_TYPE.COMPARE) {
            if (isActive) {
                comparison.delete(cardId);
            } else {
                comparison.add(cardId);
            }
        } else if (actionType === TOGGLE_TYPE.HIDE) {
            if (isActive) {
                changeButtonIconState(button, FA_ICONS.EYE_SLASH, FA_ICONS.EYE, true);
                hiddenTiles.delete(cardId);
            } else {
                changeButtonIconState(button, FA_ICONS.EYE, FA_ICONS.EYE_SLASH, false);
                hiddenTiles.add(cardId);
            }
        }

        button.classList.toggle('active');
        saveToLocalStorage();
        applyFilters();
    };

    // Initialization
    loadFromLocalStorage();
    renderActionButtons();
    restoreCardStates();
    applyFilters();

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            addClassToClassList(btn, 'active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    showHiddenCheckbox.addEventListener('change', () => {
        showHidden = showHiddenCheckbox.checked;
        applyFilters();
    });

    const attachCardListeners = () => {
        cards.forEach(card => {
            const id = card.dataset.id;

            const likeBtn = card.querySelector('.card__button--like');
            const compareBtn = card.querySelector('.card__button--compare');
            const hideBtn = card.querySelector('.card__button--hide');

            if (likeBtn) {
                likeBtn.addEventListener('click', e => toggleAction(e, id, likeBtn, TOGGLE_TYPE.LIKE));
            }
            if (compareBtn) {
                compareBtn.addEventListener('click', e => toggleAction(e, id, compareBtn, TOGGLE_TYPE.COMPARE));
            }
            if (hideBtn) {
                hideBtn.addEventListener('click', e => toggleAction(e, id, hideBtn, TOGGLE_TYPE.HIDE));
            }
        });
    };

    attachCardListeners();
});
