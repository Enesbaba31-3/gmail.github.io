// script.js – 81 İl Lezzetleri – Tüm Etkileşim

document.addEventListener('DOMContentLoaded', function() {
    // ----- ELEMANLAR -----
    const grid = document.getElementById('cityGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const themeToggle = document.getElementById('themeToggle');
    const favToggle = document.getElementById('favToggle');
    const favCount = document.getElementById('favCount');
    const modal = document.getElementById('detailModal');
    const modalClose = document.getElementById('modalClose');
    const modalBody = document.getElementById('modalBody');

    let currentCategory = 'all';
    let favorites = JSON.parse(localStorage.getItem('favCities')) || [];

    // ----- TEMA -----
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀️';
    }
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ----- RENDER KARTLAR -----
    function renderCards(filterText = '', category = 'all') {
        grid.innerHTML = '';
        let filtered = cityData;

        // Metin filtresi (il adı veya yemek adı)
        if (filterText.trim() !== '') {
            const lower = filterText.toLowerCase();
            filtered = filtered.filter(city =>
                city.name.toLowerCase().includes(lower) ||
                city.dishes.some(d => d.name.toLowerCase().includes(lower))
            );
        }

        // Kategori filtresi
        if (category !== 'all') {
            filtered = filtered.filter(city =>
                city.dishes.some(d => d.category === category)
            );
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">😕 Sonuç bulunamadı.</p>`;
            return;
        }

        filtered.forEach(city => {
            const card = document.createElement('div');
            card.className = 'city-card';
            card.dataset.city = city.name;

            const isFav = favorites.includes(city.name);
            const dishTags = city.dishes.slice(0, 4).map(d => `<span class="dish-tag">${d.name}</span>`).join('');

            card.innerHTML = `
                <div class="city-name">${city.name}</div>
                <div class="city-plate">🚗 ${city.plate}</div>
                <div class="city-dishes">${dishTags} ${city.dishes.length > 4 ? `<span class="dish-tag">+${city.dishes.length-4}</span>` : ''}</div>
                <div class="fav-star ${isFav ? 'active' : ''}" data-city="${city.name}">${isFav ? '⭐' : '☆'}</div>
            `;

            // Kart tıklama → modal aç
            card.addEventListener('click', function(e) {
                // Favori yıldızına tıklanırsa modal açma (event propagation ile)
                if (e.target.classList.contains('fav-star')) return;
                openModal(city.name);
            });

            // Favori yıldızı tıklama
            const star = card.querySelector('.fav-star');
            star.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFavorite(city.name);
                renderCards(searchInput.value, currentCategory);
            });

            grid.appendChild(card);
        });
    }

    // ----- FAVORİ -----
    function toggleFavorite(cityName) {
        const idx = favorites.indexOf(cityName);
        if (idx > -1) {
            favorites.splice(idx, 1);
        } else {
            favorites.push(cityName);
        }
        localStorage.setItem('favCities', JSON.stringify(favorites));
        updateFavCount();
    }

    function updateFavCount() {
        favCount.textContent = favorites.length;
    }
    updateFavCount();

    // Favori butonu (header) – sadece favorileri göster
    let favMode = false;
    favToggle.addEventListener('click', function() {
        favMode = !favMode;
        if (favMode) {
            // Sadece favorileri göster
            const favCities = cityData.filter(c => favorites.includes(c.name));
            grid.innerHTML = '';
            if (favCities.length === 0) {
                grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">❤️ Henüz favori il eklemediniz.</p>`;
                return;
            }
            favCities.forEach(city => {
                const card = document.createElement('div');
                card.className = 'city-card';
                card.dataset.city = city.name;
                const dishTags = city.dishes.slice(0, 4).map(d => `<span class="dish-tag">${d.name}</span>`).join('');
                card.innerHTML = `
                    <div class="city-name">${city.name}</div>
                    <div class="city-plate">🚗 ${city.plate}</div>
                    <div class="city-dishes">${dishTags}</div>
                    <div class="fav-star active" data-city="${city.name}">⭐</div>
                `;
                card.addEventListener('click', function(e) {
                    if (e.target.classList.contains('fav-star')) return;
                    openModal(city.name);
                });
                const star = card.querySelector('.fav-star');
                star.addEventListener('click', function(e) {
                    e.stopPropagation();
                    toggleFavorite(city.name);
                    renderCards(searchInput.value, currentCategory);
                    favMode = false;
                    favToggle.style.background = '';
                });
                grid.appendChild(card);
            });
            favToggle.style.background = '#f1c40f33';
        } else {
            favToggle.style.background = '';
            renderCards(searchInput.value, currentCategory);
        }
    });

    // ----- ARAMA -----
    searchInput.addEventListener('input', function() {
        if (favMode) {
            favMode = false;
            favToggle.style.background = '';
        }
        renderCards(this.value, currentCategory);
    });

    // ----- KATEGORİ FİLTRE -----
    categoryFilter.addEventListener('click', function(e) {
        if (!e.target.classList.contains('cat-btn')) return;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.dataset.cat;
        if (favMode) {
            favMode = false;
            favToggle.style.background = '';
        }
        renderCards(searchInput.value, currentCategory);
    });

    // ----- MODAL (Detay Sayfası) -----
    function openModal(cityName) {
        const city = cityData.find(c => c.name === cityName);
        if (!city) return;

        let dishHTML = city.dishes.map(d => {
            const ingredients = d.ingredients.map(i => `<li>${i}</li>`).join('');
            const steps = d.steps.map((s, idx) => `<li>${idx+1}. ${s}</li>`).join('');
            return `
                <div class="modal-recipe">
                    <h3>🍽️ ${d.name}</h3>
                    <p><strong>Kategori:</strong> ${d.category}</p>
                    <h4>🧂 Malzemeler:</h4>
                    <ul>${ingredients}</ul>
                    <h4>📜 Yapılışı:</h4>
                    <ol>${steps}</ol>
                </div>
            `;
        }).join('');

        modalBody.innerHTML = `
            <h2>${city.name}</h2>
            <div class="modal-plate">🚗 Plaka: ${city.plate}</div>
            <div class="modal-dish-list">
                ${city.dishes.map(d => `<li>${d.name}</li>`).join('')}
            </div>
            <hr style="margin:16px 0; border-color:#333;">
            ${dishHTML}
        `;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });

    // ----- İLK YÜKLEME -----
    renderCards('', 'all');
});
