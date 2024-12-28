// Marvel API Public & Private Key
const publicKey = "742bcc1f251db304301676071a232292";
const privateKey = "853c27a2872ee4f705ce99697e9b9ddbf03e810c";

// References to search bar and results container
let searchBar = document.getElementById("search-bar");
let searchResults = document.getElementById("search-results");
const backToTopButton = document.getElementById("back-to-top"); // Back to Top button
// const navbarLogo = document.getElementById("navbar-logo");


// Initialize favorites from localStorage
let favorites = new Map();
const storedFavorites = localStorage.getItem("favorites");
if (storedFavorites) {
    try {
        const parsedFavorites = JSON.parse(storedFavorites);
        favorites = new Map(parsedFavorites);
        console.log("Favorites loaded from localStorage:", favorites);
    } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
        localStorage.removeItem("favorites"); // Clear corrupted data
    }
}

// Fetch superheroes from Marvel API
const searchHeroes = async (textSearch) => {
    if (textSearch.trim() === "") {
        searchResults.innerHTML = ``;
        toggleBackToTopVisibility(); // Hide Back to Top button if no input
        return;
    }

    const ts = new Date().getTime();
    const hash = CryptoJS.MD5(ts + privateKey + publicKey).toString();
    const superhero_URL = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${encodeURIComponent(
        textSearch
    )}&ts=${ts}&apikey=${publicKey}&hash=${hash}`;

    try {
        const response = await fetch(superhero_URL);
        if (!response.ok) {
            console.error("API Error:", response.status, response.statusText);
            return;
        }
        const data = await response.json();
        showSearchResults(data.data.results);
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};


// Deep sanitize data and handle missing values
function sanitizeHeroData(hero) {
    return {
        id: hero.id || "Unknown ID",
        name: sanitizeString(hero.name, "Unknown Name"),
        description: sanitizeString(hero.description, "No description available."),
        thumbnail: hero.thumbnail?.path
            ? hero.thumbnail
            : { path: "https://via.placeholder.com/300x450", extension: "png" },
        comics: hero.comics?.available ?? 0,
        series: hero.series?.available ?? 0,
        stories: hero.stories?.available ?? 0,
        resourceURI: hero.resourceURI || "#",
    };
}

// Helper: Sanitize strings
function sanitizeString(value, fallback) {
    if (!value || typeof value !== "string") return fallback;
    return value.replace(/[\r\n]+/g, " ").trim().substring(0, 1000);
}

// Safely encode hero data using base64
function encodeHeroData(hero) {
    try {
        return btoa(JSON.stringify(hero)); // Convert to base64
    } catch (error) {
        console.error("Error encoding hero data:", hero, error);
        return null;
    }
}

// Safely decode hero data from base64
function decodeHeroData(encodedData) {
    try {
        const decodedData = atob(encodedData); // Decode base64
        return JSON.parse(decodedData); // Parse JSON
    } catch (error) {
        console.error("Error decoding hero data:", encodedData, error);
        return null;
    }
}

// Display search results
function showSearchResults(searchedHero) {
    searchResults.innerHTML = ``;

    searchedHero.forEach((hero) => {
        const sanitizedHero = sanitizeHeroData(hero);
        const encodedHeroData = encodeHeroData(sanitizedHero);

        if (!encodedHeroData) return; // Skip if encoding fails

        const heroId = sanitizedHero.id.toString();

        searchResults.innerHTML += `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <li class="single-search-result card shadow-sm p-3 d-flex flex-column align-items-center text-center">
                    <div class="img-info">
                        <img src="${sanitizedHero.thumbnail.path}/portrait_xlarge.${sanitizedHero.thumbnail.extension}" 
                             alt="${sanitizedHero.name}" 
                             class="thumbnail-img" 
                             data-hero='${encodedHeroData}'>
                        <div class="hero-info card-body">
                            <h5 class="card-title text-light">${sanitizedHero.name}</h5>
                        </div>
                    </div>

                    <button 
                        class="btn add-to-fav-btn" 
                        data-hero-id="${heroId}" 
                        data-hero='${encodedHeroData}'>
                        ${favorites.has(heroId) 
                            ? '<i class="fa-solid fa-heart-circle-minus"></i> Remove from Favorites'
                            : '<i class="fa-solid fa-heart"></i> Add to Favorites'}
                    </button>
                </li>
            </div>
        `;
    });

    attachThumbnailClickEvents();
    toggleBackToTopVisibility(); // Toggle visibility after rendering results
}


// Attach event listeners to thumbnails for redirection
function attachThumbnailClickEvents() {
    document.querySelectorAll(".thumbnail-img").forEach((thumbnail) => {
        thumbnail.addEventListener("click", () => {
            const rawHeroData = thumbnail.dataset.hero;
            const hero = decodeHeroData(rawHeroData);

            if (hero) redirectToDetails(hero);
        });
    });
}

// Handle clicks on dynamically generated buttons
searchResults.addEventListener("click", (event) => {
    if (event.target.closest(".add-to-fav-btn")) {
        const button = event.target.closest(".add-to-fav-btn");
        const rawHeroData = button.dataset.hero;
        const hero = decodeHeroData(rawHeroData);

        if (hero) toggleFavorite(hero);
    }
});

// Add or remove a character from favorites
function toggleFavorite(hero) {
    const heroId = hero.id.toString();

    if (favorites.has(heroId)) {
        favorites.delete(heroId);
        showNotification(`${hero.name} removed from favorites.`);
    } else {
        favorites.set(heroId, hero);
        showNotification(`${hero.name} added to favorites.`);
    }

    localStorage.setItem("favorites", JSON.stringify(Array.from(favorites.entries())));
    updateFavoriteButton(heroId);
}

// Update favorite button text dynamically
function updateFavoriteButton(heroId) {
    const button = document.querySelector(`[data-hero-id="${heroId}"]`);
    if (button) {
        button.innerHTML = favorites.has(heroId)
            ? '<i class="fa-solid fa-heart-circle-minus"></i> Remove from Favorites'
            : '<i class="fa-solid fa-heart"></i> Add to Favorites';
    }
}

// Redirect to details page
function redirectToDetails(hero) {
    try {
        localStorage.setItem("selectedHero", JSON.stringify(hero));
        window.location.href = "/Characters Details Page/character-details.html";
    } catch (error) {
        console.error("Error storing hero details for redirection:", error);
    }
}


// Show notification with smooth effect
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}


// Toggle Back to Top button visibility
function toggleBackToTopVisibility() {
    if (searchResults.innerHTML.trim() !== "") {
        backToTopButton.style.display = "block";
    } else {
        backToTopButton.style.display = "none";
    }
}


// Event listener for search bar
searchBar.addEventListener("input", () => searchHeroes(searchBar.value));

// Ensure Back to Top button is hidden initially
backToTopButton.style.display = "none";

