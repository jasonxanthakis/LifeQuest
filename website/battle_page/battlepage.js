// Array of images
const images = [
    "basilisk.jpeg",
    "centaur.jpeg",
    "dragon.jpeg",
    "giant.jpeg",
    "goblin.jpeg",
    "golum.jpeg",
    "health-potion.jpg",
    "lucky-charm.jpg",
    "magic-sword.jpeg",
    "mana-crystal.jpg",
    "minotaur.jpeg",
    "placeholder-user.jpg",
    "premium-quest-scroll.jpg",
    "shield-of-protection.jpg",
    "werewolf.jpeg",
    "witch.jpg",
    "zombie.jpeg"
];

// Array of monsters that have images
const monsters = [
    { name: "Basilisk", image: "basilisk.jpeg" },
    { name: "Centaur", image: "centaur.jpeg" },
    { name: "Dragon", image: "dragon.jpeg" },
    { name: "Giant", image: "giant.jpeg" },
    { name: "Goblin", image: "goblin.jpeg" },
    { name: "Golum", image: "golum.jpeg" },
    { name: "Minotaur", image: "minotaur.jpeg" },
    { name: "Werewolf", image: "werewolf.jpeg" },
    { name: "Witch", image: "witch.jpg" },
    { name: "Zombie", image: "zombie.jpeg" }
];

// Load the winner
function loadWinnerImage(result) {
    const winnerName = document.querySelector(".battle-container .character .name");
    const winnerImg = document.querySelector(".battle-container .character img");
    
    if (result.won) {
        if (winnerName) winnerName.textContent = result.winner?.name || "Hero";
        if (winnerImg) winnerImg.src = `../assets/knight.png`;
    } else {
        // Check if result.winner exists before trying to access its name
        if (result.winner && result.winner.name) {
            const enemy = monsters.find(
                m => m.name.toLowerCase() === result.winner.name.toLowerCase()
            );
            if (enemy) {
                if (winnerName) winnerName.textContent = enemy.name;
                if (winnerImg) winnerImg.src = `../assets/${enemy.image}`;
            }
        } else {
            // Fallback if no winner info
            if (winnerName) winnerName.textContent = "Enemy";
            if (winnerImg) winnerImg.src = `../assets/goblin.jpeg`;
        }
    }
}

// Functionality for the logout button
const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
    btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.assign('../login/login.html');
    });
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
    simulateBattle();
});

// Ask the database to run a battle simulation
async function simulateBattle() {
    const API_URL = 'https://lifequest-api.onrender.com';

    let url = API_URL + `/dungeon/${1}/battle`;

    const response = await sendPatchRequest(url, {});
    const result = await response.json();

    loadWinnerImage(result);
    
    if (result.won) {
        const winnerText = document.querySelector(".vs-text");
        if (winnerText) winnerText.textContent = 'YOUR HERO WAS VICTORIOUS';

        const bottomText = document.querySelector(".battle-stage .battle-result .win-text");
        if (bottomText) bottomText.textContent = 'You Won!';

        const resultDiv = document.querySelector(".battle-stage .battle-result");
        const points = document.createElement("div");
        points.className = "points";
        points.textContent = `+${result.points_gained} points`;
        resultDiv.appendChild(points);
    } else {
        const winnerText = document.querySelector(".vs-text");
        if (winnerText) winnerText.textContent = 'YOUR HERO WAS DEFEATED';

        const bottomText = document.querySelector(".battle-stage .battle-result .win-text");
        if (bottomText) bottomText.textContent = 'You Lost...';
    }
}

async function sendPatchRequest(url, data) {
    const options = {
        method: "PATCH",
        headers: {
          "Authorization": localStorage.getItem("token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }

    const resp = await fetch(url, options);

    return resp;
};