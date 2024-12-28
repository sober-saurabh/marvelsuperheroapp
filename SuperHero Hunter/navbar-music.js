// Marvel theme songs array
const marvelThemeSongs = [
    "/audio/Avengers theme.mp3",
    "/audio/Snap Out of It.mp3",
    "/audio/Mixed Signals.mp3",
    "/audio/Badders.mp3",
    "/audio/Game of Thrones(KSHMR & TGA).mp3",
    "/audio/Skrillex ft Justin B DT - Don't Go.mp3",
    "/audio/Supersonic (My Existence).mp3",
];

// Keys for localStorage
const musicStateKey = "marvelMusicState";
const songIndexKey = "currentSongIndex";

// Retrieve saved state
let currentSongIndex = parseInt(localStorage.getItem(songIndexKey), 10) || 0;
const savedState = JSON.parse(localStorage.getItem(musicStateKey)) || { playing: false, currentTime: 0 };

// Initialize audio object
const audioElement = new Audio();
audioElement.src = marvelThemeSongs[currentSongIndex];
audioElement.loop = false;
audioElement.currentTime = savedState.currentTime;

// Resume play state if previously playing
if (savedState.playing) {
    audioElement.play().catch(() => {
        console.warn("Audio playback will start once the user interacts with the page.");
    });
}


// Add track name dynamically to the center of the navbar
const navbar = document.querySelector(".navbar");
let trackNameElement = document.querySelector(".track-name-display");

if (navbar && !trackNameElement) {
    // Create the track name element
    trackNameElement = document.createElement("span");
    trackNameElement.className = "track-name-display";
    trackNameElement.style.cssText = `
        position: absolute;
        top: 51%;
        left: 67%;
        transform: translate(-50%, -50%);
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', sans-serif;
        font-size: 1rem;
        font-weight: bold;
        color:rgb(243, 61, 110); /* High contrast for visibility */
        background: rgba(87, 85, 85, 0.33); /* Semi-transparent background for better readability */
        padding: 5px 10px;
        border-radius: 5px;
        white-space: nowrap; /* Prevent wrapping */
        z-index: 1000;
        display: none; /* Initially hidden */
    `;
    navbar.appendChild(trackNameElement);
}


// Helper function to extract song name from the path
function getSongName(songPath) {
    return songPath.split("/").pop().replace(".mp3", ""); // Extract filename without extension
}

// Update song name dynamically
function updateSongName() {
    if (trackNameElement) {
        trackNameElement.textContent = getSongName(marvelThemeSongs[currentSongIndex]);
        trackNameElement.style.display = "block"; // Show the track name when a song plays
    }
}

// Hide the track name
function hideSongName() {
    if (trackNameElement) {
        trackNameElement.style.display = "none"; // Hide the track name when the song is paused or ends
    }
}

// Toggle play/pause functionality
function toggleMarvelTheme() {
    if (!audioElement.paused) {
        audioElement.pause();
        hideSongName(); // Hide the track name when paused
    } else {
        audioElement
            .play()
            .then(() => updateSongName()) // Show the track name when playing
            .catch((error) => console.warn("Audio playback deferred until user interacts with the page."));
    }
    saveMusicState();
}

// Play next song
function playNextMarvelTheme() {
    currentSongIndex = (currentSongIndex + 1) % marvelThemeSongs.length;
    audioElement.src = marvelThemeSongs[currentSongIndex];
    audioElement.play().catch((error) => console.error("Audio playback error:", error));
    updateSongName();
    saveMusicState();
}

// Play previous song
function playPreviousMarvelTheme() {
    currentSongIndex = (currentSongIndex - 1 + marvelThemeSongs.length) % marvelThemeSongs.length;
    audioElement.src = marvelThemeSongs[currentSongIndex];
    audioElement.play().catch((error) => console.error("Audio playback error:", error));
    updateSongName();
    saveMusicState();
}

// Navbar logo click logic
const navbarLogo = document.querySelector(".navbar-logo");
if (navbarLogo) {
    let logoClickCount = 0;
    const clickResetDelay = 400; // ms
    let logoClickTimer = null;

    navbarLogo.addEventListener("click", () => {
        logoClickCount++;

        clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => {
            if (logoClickCount === 1) {
                toggleMarvelTheme(); // Single-click action
            } else if (logoClickCount === 2) {
                playNextMarvelTheme(); // Double-click action
            } else if (logoClickCount === 3) {
                playPreviousMarvelTheme(); // Triple-click action
            }
            logoClickCount = 0; // Reset click count
        }, clickResetDelay);
    });
}

// Save state
function saveMusicState() {
    localStorage.setItem(
        musicStateKey,
        JSON.stringify({
            playing: !audioElement.paused,
            currentTime: audioElement.currentTime,
        })
    );
    localStorage.setItem(songIndexKey, currentSongIndex);
}

// Save state before page unload
window.addEventListener("beforeunload", saveMusicState);

// Play next song when the current one ends
audioElement.addEventListener("ended", playNextMarvelTheme);


// Update the track name on page load
updateSongName();
