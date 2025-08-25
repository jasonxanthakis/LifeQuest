document.addEventListener('DOMContentLoaded', async function() {
    await loadAchievements();
    setupLogout();
});

// Load achievements from backend
async function loadAchievements() {
    try {
        const url = `http://localhost:3000/main/1/achievements`;
        
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
    
    // Create achievement header with stats
    const headerHTML = `
        <div class="achievement-header mb-4">
            <h2 class="text-white mb-3">Your Achievements</h2>
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stat-card bg-light text-dark p-3 rounded text-center">
                        <h4>${stats.achieved_count}</h4>
                        <p class="mb-0">Achieved</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-light text-dark p-3 rounded text-center">
                        <h4>${stats.total_count}</h4>
                        <p class="mb-0">Total</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-light text-dark p-3 rounded text-center">
                        <h4>${stats.completion_percentage}%</h4>
                        <p class="mb-0">Complete</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-light text-dark p-3 rounded text-center">
                        <h4>${stats.current_streak}</h4>
                        <p class="mb-0">Current Streak</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create achievements grid
    const achievementsHTML = `
        <div class="achievements-grid">
            <div class="row">
                ${achievements.map(achievement => createAchievementCard(achievement)).join('')}
            </div>
        </div>
    `;
    
    content.innerHTML = headerHTML + achievementsHTML;
}

// Create individual achievement card
function createAchievementCard(achievement) {
    const cardClass = achievement.achieved ? 'achievement-achieved' : 'achievement-locked';
    const badgeClass = achievement.achieved ? 'bg-success' : 'bg-secondary';
    const iconClass = achievement.achieved ? 'text-warning' : 'text-muted';
    
    // Map achievement names to appropriate icons/images
    const getAchievementIcon = (name) => {
        const iconMap = {
            'First Step': '🏃‍♂️',
            'Strong Start': '💪',
            'One Week Sober': '📅',
            'Half a Month': '🎯',
            'Milestone Month': '🏆',
            'Building Strength': '🔥',
            'Quarter Year': '⭐',
            'Half a Year Free': '🌟',
            'One Year Sober': '👑'
        };
        return iconMap[name] || '🏅';
    };
    
    return `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card achievement-card ${cardClass} h-100">
                <div class="card-body text-center">
                    <div class="achievement-icon mb-3" style="font-size: 3rem;">
                        ${getAchievementIcon(achievement.name)}
                    </div>
                    <h5 class="card-title">${achievement.name}</h5>
                    <p class="card-text">${achievement.description}</p>
                    <span class="badge ${badgeClass}">
                        ${achievement.days_required} day${achievement.days_required > 1 ? 's' : ''}
                    </span>
                    ${achievement.achieved ? 
                        '<div class="mt-2"><span class="badge bg-success">✓ Achieved</span></div>' : 
                        '<div class="mt-2"><span class="badge bg-secondary">🔒 Locked</span></div>'
                    }
                </div>
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
