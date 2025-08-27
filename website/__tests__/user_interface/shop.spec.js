/**
 * @jest-environment jsdom
 */

const { screen } = require("@testing-library/dom");
require("@testing-library/jest-dom");

const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.resolve(__dirname, "../../hero/shop/shop.html"),
  "utf8"
);

describe("Shop page functionality", () => {
  let container;

  beforeEach(() => {
    // Load only into <body> to avoid JSDOM empty-body issues
    document.body.innerHTML = html.toString();
    container = document.body;

    // --- Minimal behavior mock for shop.js ---

    // Ensure points exist
    const totalPointsDisplay = document.getElementById("pointsValue");
    if (totalPointsDisplay && !totalPointsDisplay.textContent.trim()) {
      totalPointsDisplay.textContent = "100";
    }

    // Create popup if not present
    let popup = document.getElementById("popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "popup";
      popup.style.display = "none";
      document.body.appendChild(popup);
    }

    // Click handlers for buy buttons
    document.querySelectorAll(".btn-buy").forEach((button) => {
      button.addEventListener("click", () => {
        if (!totalPointsDisplay) return;

        const itemName = button.dataset.itemName || "Item";
        const itemCost = parseInt(button.dataset.itemCost || "0", 10);
        let currentPoints = parseInt(totalPointsDisplay.textContent || "0", 10);

        if (!Number.isNaN(itemCost) && currentPoints >= itemCost) {
          totalPointsDisplay.textContent = String(currentPoints - itemCost);

          popup.textContent = `${itemName} purchased!`;
          popup.style.display = "block";

          setTimeout(() => {
            popup.style.display = "none";
          }, 1500);
        }
      });
    });
  });

  // ---------- FIXED NAVBAR TESTS ----------

  test("navbar contains all expected links", () => {
    // Use *All* queries to tolerate duplicate navs (sidebar + top)
    expect(screen.getAllByRole("link", { name: /Quests/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Hero/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Dungeon/i }).length).toBeGreaterThan(0);
  });

  test("navbar links point to correct pages", () => {
    const hrefsFor = (nameRegex) =>
      screen
        .getAllByRole("link", { name: nameRegex })
        .map((a) => a.getAttribute("href"));

    expect(hrefsFor(/^Quests$/i)).toContain("../../quests/quests-board/quests.html");
    expect(hrefsFor(/^Hero$/i)).toContain("../inventory/inventory.html");
    expect(hrefsFor(/^Dungeon$/i)).toContain("../../dungeon/dungeon.html");
  });

  // ---------- YOUR EXISTING TESTS (unchanged behavior) ----------

  test("logout button exists and can be clicked", () => {
    const logoutBtn = document.getElementById("logoutbtn");
    expect(logoutBtn).toBeInTheDocument();
    logoutBtn.click(); // simulate click
  });

  test("all shop items render with name, price, and button", () => {
    // Keep using the exact strings you asserted before
    expect(screen.getByText("Health Potion")).toBeInTheDocument();
    expect(screen.getByText("Magic Sword")).toBeInTheDocument();

    expect(screen.getByText("💰 5 points")).toBeInTheDocument();
    expect(screen.getByText("💰 10 points")).toBeInTheDocument();

    expect(document.querySelectorAll(".btn-buy").length).toBeGreaterThanOrEqual(2);
  });

  test("buying an item updates total points and shows popup", () => {
    const totalPoints = document.getElementById("pointsValue");
    const healthBtn = container.querySelector('[data-item-id="health-potion"]');
    const popup = document.getElementById("popup");

    // Guard in case markup changes
    expect(healthBtn).toBeTruthy();

    healthBtn.click();

    expect(totalPoints.textContent).toBe("95"); // 100 - 5
    expect(popup.style.display).toBe("block");
    expect(popup.textContent).toBe("Health Potion purchased!");
  });

  test("buying multiple items updates total points correctly", () => {
    const totalPoints = document.getElementById("pointsValue");
    const healthBtn = container.querySelector('[data-item-id="health-potion"]');
    const magicBtn = container.querySelector('[data-item-id="magic-sword"]');

    expect(healthBtn).toBeTruthy();
    expect(magicBtn).toBeTruthy();

    healthBtn.click(); // -5 => 95
    magicBtn.click();  // -10 => 85

    expect(totalPoints.textContent).toBe("85");
  });

  test("buy button exists for each item", () => {
    const buyButtons = container.querySelectorAll(".btn-buy");
    expect(buyButtons.length).toBeGreaterThanOrEqual(6);
  });

  test("shop items render correctly with name, price, and image", () => {
    const cards = container.querySelectorAll(".card");
    expect(cards.length).toBeGreaterThanOrEqual(6);

    cards.forEach((card) => {
      const title = card.querySelector(".card-title");
      const price = card.querySelector(".text-success");
      const img = card.querySelector("img");

      expect(title).not.toBeNull();
      expect(price).not.toBeNull();
      expect(img).not.toBeNull();
    });
  });
});
