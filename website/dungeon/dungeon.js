// Array of images
const images = [
  "basilisk.jpeg",
  "centaur.jpeg",
  "dragon.jpeg",
  "giant.jpeg",
  "goblin.jpeg",
  "golem.jpeg",
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
  { name: "Golem", image: "golem.jpeg" },
  { name: "Minotaur", image: "minotaur.jpeg" },
  { name: "Werewolf", image: "werewolf.jpeg" },
  { name: "Witch", image: "witch.jpg" },
  { name: "Zombie", image: "zombie.jpeg" }
];

// Function to get a random item from an array
function getRandomItem(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

// Set random images for player and enemy
function setRandomBattleImages() {
  const playerImg = document.querySelector(".battle-characters .character:nth-child(1) img");
  const enemyImg = document.querySelector(".battle-characters .character:nth-child(3) img");

  // Player always uses knight.png
  if (playerImg) {
    playerImg.src = `../assets/knight.png`;
  }

  // Enemy must pick from monsters
  if (enemyImg) {
    const enemy = getRandomItem(monsters);
    enemyImg.src = `../assets/${enemy.image}`;
    const enemyName = document.querySelector(".battle-characters .character:nth-child(3) .name");
    if (enemyName) enemyName.textContent = enemy.name;
  }
}

// Navigate to battle page on fight
function setupFightButton() {
  const fightBtn = document.querySelector(".fight-btn");
  if (fightBtn) {
    fightBtn.addEventListener("click", () => {
      // Redirect to battle page
      window.location.href = "../battle_page/battlepage.html";
    });
  }
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  setRandomBattleImages();
  setupFightButton();
});
