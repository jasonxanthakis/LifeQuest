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

// Set level text to level from database
export function setLevel(level) {
  const levelText = document.querySelector(".battle-level");

  if (levelText) levelText.textContent = `Level ${level}`
}

// Set random images for player and enemy
export function setBattleImages(result) {
  const playerImg = document.querySelector(".battle-characters .character:nth-child(1) img");
  const enemyImg = document.querySelector(".battle-characters .character:nth-child(3) img");

  // Player always uses knight.png
  if (playerImg) {
    playerImg.src = `../assets/knight.png`;
    const playerName = document.querySelector(".battle-characters .character:nth-child(1) .name");
    if (playerName) playerName.textContent = result.hero?.name || "Hero";
  }

  // Enemy retrieved from database
  if (enemyImg && result.enemy && result.enemy.name) {
    const enemy = monsters.find(
      m => m.name.toLowerCase() === result.enemy.name.toLowerCase()
    );
    if (enemy) {
      enemyImg.src = `../assets/${enemy.image}`;
      const enemyName = document.querySelector(".battle-characters .character:nth-child(3) .name");
      if (enemyName) enemyName.textContent = enemy.name;
    }
  }
}

// Set character statistics to statistics from database
export function setCharacterStatistics(result) {
  const playerHp = document.querySelector(".battle-characters .character:nth-child(1) .health");
  const playerAtt = document.querySelector(".battle-characters .character:nth-child(1) .attack");
  const playerDef = document.querySelector(".battle-characters .character:nth-child(1) .defense");

  if (playerHp) playerHp.textContent = `❤️ ${result.hero.hp}`
  if (playerAtt) playerAtt.textContent = `⚔️ ${result.hero.att}`
  if (playerDef) playerDef.textContent = `🛡️ ${result.hero.def}`

  const enemyHp = document.querySelector(".battle-characters .character:nth-child(3) .health");
  const enemyAtt = document.querySelector(".battle-characters .character:nth-child(3) .attack");
  const enemyDef = document.querySelector(".battle-characters .character:nth-child(3) .defense");

  if (enemyHp) enemyHp.textContent = `❤️ ${result.enemy.hp}`
  if (enemyAtt) enemyAtt.textContent = `⚔️ ${result.enemy.att}`
  if (enemyDef) enemyDef.textContent = `🛡️ ${result.enemy.def}`
}

// Navigate to battle page on fight
export function setupFightButton() {
  const fightBtn = document.querySelector(".fight-btn");
  if (fightBtn) {
    fightBtn.addEventListener("click", () => {
      // Redirect to battle page
      window.location.href = "./battle_page/battlepage.html";
    });
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  loadDungeon();
  setupFightButton();
});

// Functionality for the logout button
const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.assign('../login/login.html');
  });
}

export async function loadDungeon() {
  const API_URL = 'http://localhost:3000';

  let url = API_URL + `/dungeon`;

  const response = await getRequest(url);
  const result = await response.json();

  setLevel(result.level);
  setBattleImages(result);
  setCharacterStatistics(result);
}

export async function getRequest(url) {
  const options = {
    method: "GET",
    headers: {
      "Authorization": localStorage.getItem("token"),
      "Content-Type": "application/json"
    }
  }

  const resp = await fetch(url, options);

  return resp;
};