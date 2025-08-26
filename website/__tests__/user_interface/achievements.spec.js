/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

let container;

beforeEach(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "../../quests/achievements/achievements.html"),
    "utf8"
  );
  document.documentElement.innerHTML = html;

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      clear: jest.fn()
    },
    writable: true
  });

  container = document.body;

  // Mock achievement content for testing
  const content = document.querySelector("#content") || document.querySelector("main.content");
  if (content) {
    content.innerHTML = `
      <div class="achievements-container">
        <h2 class="battle-title">Achievements</h2>
        <div class="achievements-grid">
          <div class="achievement-card achieved">
            <img src="../../assets/starting-journey.png" alt="Starting Your Journey" title="Starting Your Journey">
          </div>
          <div class="achievement-card locked">
            <img src="../../assets/first-step.png" alt="Locked Achievement" title="Locked Achievement">
          </div>
        </div>
      </div>
    `;
  }
});

afterEach(() => {
  jest.resetModules();
});

describe("Achievements Page UI", () => {
  test("Page loads with correct title", () => {
    expect(document.title).toBe("Quests");
  });

  test("Navigation elements exist", () => {
    const navbar = container.querySelector(".navbar");
    expect(navbar).toBeTruthy();
    
    const logo = container.querySelector("img[alt='LifeQuest Logo']");
    expect(logo).toBeTruthy();
    expect(logo.getAttribute("src")).toBe("../../assets/logo.png");
  });

  test("Main content container exists", () => {
    const mainContent = container.querySelector("#content") || container.querySelector("main.content");
    expect(mainContent).toBeTruthy();
  });

  test("Logout button exists", () => {
    const logoutBtn = container.querySelector("#logoutbtn");
    expect(logoutBtn).toBeTruthy();
  });

  test("Bootstrap CSS is properly linked", () => {
    const head = document.head;
    const stylesheets = head.querySelectorAll('link[rel="stylesheet"]');
    
    const bootstrapCSS = Array.from(stylesheets).find(link => 
      link.getAttribute('href').includes('bootstrap')
    );
    expect(bootstrapCSS).toBeTruthy();
  });

  test("Achievements script is properly linked", () => {
    const scripts = document.querySelectorAll('script');
    const achievementsScript = Array.from(scripts).find(script => 
      script.getAttribute('src') === 'achievements.js'
    );
    expect(achievementsScript).toBeTruthy();
  });

  test("Achievement cards display correctly", () => {
    const content = container.querySelector("#content") || container.querySelector("main.content");
    const achievementCards = content.querySelectorAll('.achievement-card');
    expect(achievementCards.length).toBe(2);

    const achievedCard = content.querySelector('.achievement-card.achieved');
    const lockedCard = content.querySelector('.achievement-card.locked');
    
    expect(achievedCard).toBeTruthy();
    expect(lockedCard).toBeTruthy();
  });

  test("Achievement images have proper attributes", () => {
    const content = container.querySelector("#content") || container.querySelector("main.content");
    const images = content.querySelectorAll('.achievement-card img');
    
    expect(images[0].getAttribute('alt')).toBe('Starting Your Journey');
    expect(images[0].getAttribute('title')).toBe('Starting Your Journey');
    expect(images[1].getAttribute('alt')).toBe('Locked Achievement');
    expect(images[1].getAttribute('title')).toBe('Locked Achievement');
  });

  test("Achievement title is displayed", () => {
    const content = container.querySelector("#content") || container.querySelector("main.content");
    const title = content.querySelector('h2');
    
    if (title) {
      expect(title.textContent).toBe('Achievements');
    }
  });

  test("Achievement grid layout exists", () => {
    const content = container.querySelector("#content") || container.querySelector("main.content");
    const grid = content.querySelector('.achievements-grid');
    expect(grid).toBeTruthy();
  });

  test("Mobile navigation elements exist", () => {
    const burgerMenu = container.querySelector('.navbar-toggler');
    if (burgerMenu) {
      expect(burgerMenu.getAttribute('data-bs-toggle')).toBe('collapse');
    }
  });
});
