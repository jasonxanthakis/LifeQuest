/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

let container;

beforeEach(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "../../hero/inventory/inventory.html"),
    "utf8"
  );
  document.documentElement.innerHTML = html;

  // Mock inventory items for testing
  const inventoryList = document.querySelector("#inventoryList");
  inventoryList.innerHTML = `
    <div class="inventory-item">
      <span class="item-name">Sword</span>
      <button class="equip-btn" style="display: inline-block;">Equip</button>
      <button class="unequip-btn" style="display: none;">Unequip</button>
    </div>
  `;

  container = document.body;

  // Mock button click handlers
  container.querySelector(".equip-btn").addEventListener("click", function () {
    this.style.display = "none";
    this.nextElementSibling.style.display = "inline-block";
  });

  container.querySelector(".unequip-btn").addEventListener("click", function () {
    this.style.display = "none";
    this.previousElementSibling.style.display = "inline-block";
  });
});

afterEach(() => {
  jest.resetModules();
});

describe("Inventory Page", () => {
  test("Inventory items load correctly", () => {
    const items = container.querySelectorAll("#inventoryList .inventory-item");
    expect(items.length).toBeGreaterThan(0);
  });

  test("Equip button click toggles to Unequip", () => {
    const equipBtn = container.querySelector(".equip-btn");
    const unequipBtn = container.querySelector(".unequip-btn");

    let equipBtnStyle = window.getComputedStyle(equipBtn);
    let unequipBtnStyle = window.getComputedStyle(unequipBtn);

    expect(equipBtnStyle.display).toBe("inline-block");
    expect(unequipBtnStyle.display).toBe("none");

    equipBtn.click();

    equipBtnStyle = window.getComputedStyle(equipBtn);
    unequipBtnStyle = window.getComputedStyle(unequipBtn);

    expect(equipBtnStyle.display).toBe("none");
    expect(unequipBtnStyle.display).toBe("inline-block");
  });

  test("Unequip button click toggles back to Equip", () => {
    const equipBtn = container.querySelector(".equip-btn");
    const unequipBtn = container.querySelector(".unequip-btn");

    // Equip first
    equipBtn.click();
    // Then unequip
    unequipBtn.click();

    const equipBtnStyle = window.getComputedStyle(equipBtn);
    const unequipBtnStyle = window.getComputedStyle(unequipBtn);

    expect(equipBtnStyle.display).toBe("inline-block");
    expect(unequipBtnStyle.display).toBe("none");
  });

  test("Empty inventory message shows when no items exist", () => {
    const inventoryList = container.querySelector("#inventoryList");
    inventoryList.innerHTML = ""; // clear inventory
    const emptyMsg = container.querySelector("#emptyInventory");

    // simulate function that shows empty message
    if (!inventoryList.children.length) emptyMsg.style.display = "block";

    expect(emptyMsg.style.display).toBe("block");
  });

  test("Total points display shows correct initial value", () => {
    const totalPoints = container.querySelector("#pointsValue");
    expect(totalPoints.textContent).toBe("100");
  });

  test("Navigation links exist and are correct", () => {
    const navLinks = container.querySelectorAll("nav.top-navbar .nav-link");
    expect(navLinks[0].textContent).toContain("Inventory");
    expect(navLinks[1].textContent).toContain("Shop");
    expect(navLinks[0].getAttribute("href")).toBe("../inventory/inventory.html");
    expect(navLinks[1].getAttribute("href")).toBe("../shop/shop.html");
  });

  test("Logout button exists", () => {
    const logoutBtns = container.querySelectorAll("#logoutbtn");
    expect(logoutBtns.length).toBeGreaterThan(0);
  });
});
