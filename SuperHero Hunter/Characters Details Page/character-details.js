// Retrieve selectedHero from localStorage
const selectedHero = JSON.parse(localStorage.getItem("selectedHero"));


// Function to display character details
function displayCharacterDetails() {
    const container = document.getElementById("character-details");

    // Validate selectedHero data
    if (!selectedHero) {
        container.innerHTML = `<p class="error-message">Error: No character data available. Please go back and try again.</p>`;
        return;
    }

    // Apply fallback values for missing data
    const description = selectedHero.description || "No description available.";
    const comics = selectedHero.comics !== undefined ? selectedHero.comics : 0;
    const series = selectedHero.series !== undefined ? selectedHero.series : 0;
    const stories = selectedHero.stories !== undefined ? selectedHero.stories : 0;
    const thumbnail = selectedHero.thumbnail?.path
        ? `${selectedHero.thumbnail.path}/portrait_uncanny.${selectedHero.thumbnail.extension}`
        : "https://via.placeholder.com/300x450";

    // Prepare a public-facing Marvel character link
    const characterLink = `https://www.marvel.com/characters/${selectedHero.name
        .toLowerCase()
        .replace(/\s+/g, "-")}`;

    // Render character details dynamically with animations
    container.innerHTML = `
        <div class="container mt-5">
            <div class="row mb-4">
                <div class="col-12 text-center">
                    <h1 id="character-name" class="display-4 text-uppercase animate-fade-in">${selectedHero.name}</h1>
                </div>
            </div>
            <div class="row align-items-center">
                <div class="col-12 col-md-5 text-center mb-3 mb-md-0 animate-slide-in">
                    <img id="character-image" 
                         src="${thumbnail}" 
                         alt="${selectedHero.name}" 
                         class="img-fluid rounded shadow-lg character-img-hover">
                </div>
                <div class="col-12 col-md-7 details-section animate-slide-in">
                    <h4>Description:</h4>
                    <p id="character-description">${description}</p>
                    <h4>Comics:</h4>
                    <p id="character-comics">${comics} comics available</p>
                    <h4>Series:</h4>
                    <p id="character-series">${series} series available</p>
                    <h4>Stories:</h4>
                    <p id="character-stories">${stories} stories available</p>
                    <h4>Resource:</h4>
                    <p>
                        ${
                            characterLink
                                ? `<a href="${characterLink}" target="_blank" rel="noopener noreferrer" class="official-link">Official Marvel Page</a>`
                                : "No official Marvel page available."
                        }
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Update the DOM with selectedHero data on page load
document.addEventListener("DOMContentLoaded", displayCharacterDetails);
