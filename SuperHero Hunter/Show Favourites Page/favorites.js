// Initialize favorites from localStorage
let favorites = new Map(JSON.parse(localStorage.getItem('favorites')) || []);

// Redirect to the main page when "Home" is clicked
document.querySelectorAll('.home-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});

// Display favorite characters
function displayFavoriteCharacters() {
  const container = document.getElementById('favorite-characters');
  container.innerHTML = '';

  if (favorites.size === 0) {
    container.innerHTML = `<p>No favorite characters found.</p>`;
    return;
  }

  favorites.forEach((hero) => {
    if (!hero.thumbnail || !hero.thumbnail.path || !hero.thumbnail.extension) {
      // Skip characters without thumbnails
      return;
    }

    container.innerHTML += `
      <div class="character-card">
        <img src="${hero.thumbnail.path}/portrait_uncanny.${hero.thumbnail.extension}" alt="${hero.name}">
        <h3 class="character-name">${hero.name}</h3>
        <button class="know-more-btn" onclick="redirectToDetails('${hero.id}')">Know More</button>
        <button class="remove-fav-btn" onclick="removeFromFavorites('${hero.id}')">Remove from Favorites</button>
      </div>
    `;
  });
}

// Redirect to character details page
function redirectToDetails(heroId) {
  const selectedHero = favorites.get(heroId);
  if (selectedHero) {
      localStorage.setItem('selectedHero', JSON.stringify(selectedHero));
      window.location.href = '/Characters Details Page/character-details.html';
  } else {
      console.error('Character not found in favorites:', heroId);
  }
}

// Remove character from favorites with Undo Option
function removeFromFavorites(heroId) {
  const hero = favorites.get(heroId);

  if (hero) {
    // Temporarily remove the character
    favorites.delete(heroId);
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    displayFavoriteCharacters();

    // Show notification with Undo option
    showUndoNotification(hero);
  }
}

// Show notification with Undo option
function showUndoNotification(hero) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${hero.name} removed from favorites.</span>
    <button class="undo-btn">
      <i class="fas fa-undo"></i> Undo
    </button>
  `;
  document.body.appendChild(notification);

  // Event listener for Undo button
  const undoButton = notification.querySelector('.undo-btn');
  undoButton.addEventListener('click', () => {
    favorites.set(hero.id.toString(), hero); // Add back the hero
    localStorage.setItem('favorites', JSON.stringify([...favorites]));
    displayFavoriteCharacters();
    notification.remove(); // Remove the undo notification immediately

    // Show restored notification
    showNotification(`${hero.name} restored to favorites.`);
  });

  // Auto-remove notification after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 5000);
}

// Show general notifications (e.g., restored message)
function showNotification(message, type = "default") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerText = message;

  document.body.appendChild(notification);

  // Automatically remove the notification after the animation duration
  setTimeout(() => notification.remove(), 2000);
}

// Example usage:
// For default notification:
// showNotification("Character removed!", "default");

// For restored notification:
// showNotification("Character restored!", "restored");



// Initialize the favorites display
displayFavoriteCharacters();
