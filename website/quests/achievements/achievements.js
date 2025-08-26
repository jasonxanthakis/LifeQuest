document.addEventListener('DOMContentLoaded', async function() {
    await loadAchievements();
    setupLogout();
});

// Load achievements from backend
async function loadAchievements() {
    try {
        const url = `http://localhost:3000/main/achievements`;
        
        const response = await getRequest(url);
        const data = await response.json();
        
        if (response.ok) {
            displayAchievements(data.achievements, data.stats);
        } else {
            console.error('Failed to load achievements:', data.error);
            displayErrorMessage();
        }
    } catch (error) {
        console.error('Failed to load achievements:', error);
        displayErrorMessage();
    }
}

// Display achievements in the UI
function displayAchievements(achievements, stats) {
    const content = document.querySelector('main.content');
    
    // Create achievements grid with title and images
    const achievementsHTML = `
        <div class="mb-4">
            <h2 class="page-title">Your Achievements</h2>
        </div>
        <div class="achievements-grid">
            <div class="row">
                ${achievements.map(achievement => createAchievementCard(achievement)).join('')}
            </div>
        </div>
    `;
    
    content.innerHTML = achievementsHTML;
}

// Create individual achievement card
function createAchievementCard(achievement) {
    const opacity = achievement.achieved ? '1' : '0.3';
    const filter = achievement.achieved ? '' : 'grayscale(100%)';
    
    return `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="achievement-image-container">
                <img src="../../assets/${achievement.image}" 
                     alt="${achievement.name}" 
                     class="achievement-image"
                     style="opacity: ${opacity}; filter: ${filter}; width: 200px; height: 200px; object-fit: cover; border-radius: 10px; cursor: pointer; display: block; margin: 0 auto;"
                     title="${achievement.achieved ? achievement.name : 'Locked Achievement'}">
            </div>
        </div>
    `;
}

// Display error message
function displayErrorMessage() {
    const content = document.querySelector('main.content');
    content.innerHTML = `
        <div class="text-center mt-5">
            <h3 class="text-white">Unable to load achievements</h3>
            <p class="text-muted">Please try again later</p>
            <button class="btn btn-purple" onclick="loadAchievements()">Retry</button>
        </div>
    `;
}

// Setup logout functionality
function setupLogout() {
    const logoutButtons = document.getElementsByClassName('logout');
    for (let btn of logoutButtons) {
        btn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.assign('../../login/login.html');
        });
    }
}

// HTTP request helper function
async function getRequest(url) {
    const options = {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("token"),
            "Content-Type": "application/json"
        }
    };

    const resp = await fetch(url, options);
    return resp;
}

// Export all functions at once
export { loadAchievements, displayAchievements, setupLogout, getRequest };