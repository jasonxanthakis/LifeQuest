import { test, expect } from '@playwright/test';

test.describe('Dungeon E2E tests', () => {

  test('Dungeon page loads and shows level, hero, and enemy', async ({ page }) => {
    await page.goto('http://localhost:8000/website/dungeon/dungeon.html');

    // Wait for async fetch to update the DOM
    await expect(page.locator('.battle-level')).toHaveText(/Level \d+/, { timeout: 20000 });
    await expect(page.locator('.battle-characters .character:nth-child(1) .name')).toHaveText(/You|TestHero/, { timeout: 20000 });
  });

  test('Fight button navigates to battle page', async ({ page }) => {
    await page.goto('http://localhost:8000/website/dungeon/dungeon.html');

    const fightBtn = page.locator('.fight-btn');
    await expect(fightBtn).toBeVisible({ timeout: 20000 });
    await fightBtn.click();

    await expect(page).toHaveURL(/battle_page\/battlepage.html/, { timeout: 20000 });
  });

  test('Logout button clears token and redirects to login', async ({ page }) => {
    await page.goto('http://localhost:8000/website/dungeon/dungeon.html');

    const logoutBtn = page.locator('.logout').first();
    await expect(logoutBtn).toBeVisible({ timeout: 20000 });
    await logoutBtn.click();

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
    await expect(page).toHaveURL(/login.html/, { timeout: 20000 });
  });

});
