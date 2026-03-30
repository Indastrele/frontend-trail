"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const showHiddenCheckbox = document.getElementById('show-hidden');

    // State holders
    let hiddenTiles = new Set();
    let favourites = new Set();
    let comparison = new Set();

    let currentFilter = 'all';
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
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (card.querySelector('.card__buttons-box')) {
                return;
            }

            const buttonsBoxHTML = `
                <div class="card__buttons-box">
                    <div class="card__buttons">
                        <button class="card__button card__button--like">
                            <i class="fa-regular fa-heart"></i>
                        </button>
                        <button class="card__button card__button--compare">
                            <i class="fa-solid fa-scale-balanced"></i>
                        </button>
                        <button class="card__button card__button--hide">
                            <i class="fa-regular fa-eye"></i>
                        </button>
                    </div>
                </div>
            `;
            card.insertAdjacentHTML('afterbegin', buttonsBoxHTML);

            const addToCartButtonHTML = `
                <button class="card__add-button">
                    <i class="fa-solid fa-cart-shopping"></i>
                    ADD TO CART
                </button>
            `;
            card.insertAdjacentHTML('beforeend', addToCartButtonHTML);
        });
    };

    const restoreCardStates = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const id = card.dataset.id;

            const likeBtn = card.querySelector('.card__button--like');
            if (likeBtn && favourites.has(id)) {
                likeBtn.classList.add('active');
                const icon = likeBtn.querySelector('i');
                icon.classList.remove('fa-regular', 'fa-heart');
                icon.classList.add('fa-solid', 'fa-heart');
            }

            const compareBtn = card.querySelector('.card__button--compare');
            if (compareBtn && comparison.has(id)) {
                compareBtn.classList.add('active');
            }

            const hideBtn = card.querySelector('.card__button--hide');
            if (hideBtn && hiddenTiles.has(id)) {
                hideBtn.classList.add('active');
                const icon = hideBtn.querySelector('i');
                icon.classList.remove('fa-regular', 'fa-eye');
                icon.classList.add('fa-solid', 'fa-eye-slash');
            }
        });
    };

    const applyFilters = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const id = card.dataset.id;
            const isHidden = hiddenTiles.has(id);
            const isFav = favourites.has(id);
            const isComp = comparison.has(id);

            let matchesFilter = true;
            if (currentFilter === 'favourites' && !isFav) matchesFilter = false;
            if (currentFilter === 'comparison' && !isComp) matchesFilter = false;

            if (!matchesFilter) {
                card.style.display = 'none';
                return;
            }

            if (isHidden && !showHidden) {
                card.style.display = 'none';
            } else {
                card.style.display = 'block';
                card.style.opacity = isHidden ? '0.5' : '1';
            }
        });
    };

    const toggleFavourite = (cardId, button) => {
        const icon = button.querySelector('i');
        const isActive = button.classList.contains('active');

        if (isActive) {
            icon.classList.remove('fa-solid', 'fa-heart');
            icon.classList.add('fa-regular', 'fa-heart');
            favourites.delete(cardId);
        } else {
            icon.classList.remove('fa-regular', 'fa-heart');
            icon.classList.add('fa-solid', 'fa-heart');
            favourites.add(cardId);
        }

        button.classList.toggle('active');
        saveToLocalStorage();
        applyFilters();
    };

    const toggleComparison = (cardId, button) => {
        const isActive = button.classList.contains('active');
        if (isActive) comparison.delete(cardId);
        else comparison.add(cardId);

        button.classList.toggle('active');
        saveToLocalStorage();
        applyFilters();
    };

    const toggleHide = (cardId, button) => {
        const icon = button.querySelector('i');
        const isActive = button.classList.contains('active');

        if (isActive) {
            icon.classList.remove('fa-solid', 'fa-eye-slash');
            icon.classList.add('fa-regular', 'fa-eye');
            hiddenTiles.delete(cardId);
        } else {
            icon.classList.remove('fa-regular', 'fa-eye');
            icon.classList.add('fa-solid', 'fa-eye-slash');
            hiddenTiles.add(cardId);
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
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            applyFilters();
        });
    });

    showHiddenCheckbox.addEventListener('change', () => {
        showHidden = showHiddenCheckbox.checked;
        applyFilters();
    });

    const attachCardListeners = () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            const id = card.dataset.id;

            const likeBtn = card.querySelector('.card__button--like');
            const compareBtn = card.querySelector('.card__button--compare');
            const hideBtn = card.querySelector('.card__button--hide');

            if (likeBtn) {
                likeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleFavourite(id, likeBtn);
                });
            }
            if (compareBtn) {
                compareBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleComparison(id, compareBtn);
                });
            }
            if (hideBtn) {
                hideBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    toggleHide(id, hideBtn);
                });
            }
        });
    };

    attachCardListeners();
});
