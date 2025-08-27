/**
 * @vitest-environment jsdom
 */

import { describe, it, beforeEach, vi, expect } from 'vitest';
import * as dungeonModule from '../../dungeon/dungeon.js';

describe('Dungeon Page functions', () => {
beforeEach(() => {
  document.body.innerHTML = `
    <div class="battle-level"></div>
    <div class="battle-characters">
      <div class="character">
        <img />
        <div class="name"></div>
        <div class="health"></div>
        <div class="attack"></div>
        <div class="defense"></div>
      </div>
      <div class="character">
        <img />
      </div>
      <div class="character">
        <img />
        <div class="name"></div>
        <div class="health"></div>
        <div class="attack"></div>
        <div class="defense"></div>
      </div>
    </div>
    <button class="fight-btn"></button>
    <button class="logout"></button>
  `;

  global.fetch = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      level: 2,
      hero: { name: 'Arthur', hp: 100, att: 20, def: 10, img: 'knight.png' },
      enemy: { name: 'Goblin', hp: 50, att: 10, def: 5, img: 'goblin.jpeg' },
    }),
  }));

  delete window.location;
  window.location = { href: '' };
});


  it('setLevel updates the level text', () => {
    dungeonModule.setLevel(5);
    expect(document.querySelector('.battle-level').textContent).toBe('Level 5');
  });

  it('setBattleImages sets player and enemy images and names', () => {
    const mockData = {
      hero: { name: 'Arthur', img: 'knight.png' },
      enemy: { name: 'Goblin', img: 'goblin.jpeg' },
    };
    dungeonModule.setBattleImages(mockData);

    const playerImg = document.querySelector('.battle-characters .character:nth-child(1) img');
    const enemyImg = document.querySelector('.battle-characters .character:nth-child(3) img');
    const playerName = document.querySelector('.battle-characters .character:nth-child(1) .name');
    const enemyName = document.querySelector('.battle-characters .character:nth-child(3) .name');

    expect(playerImg.src).toContain('knight.png');
    expect(enemyImg.src).toContain('goblin.jpeg');
    expect(playerName.textContent).toBe('Arthur');
    expect(enemyName.textContent).toBe('Goblin');
  });

  it('setCharacterStatistics updates stats', () => {
    const mockData = { hero: { hp: 100, att: 20, def: 10 },
                       enemy: { hp: 50, att: 10, def: 5 }
 };
    dungeonModule.setCharacterStatistics(mockData);

    expect(
      document.querySelector('.battle-characters .character:nth-child(1) .health').textContent
    ).toBe('❤️ 100');
    expect(
      document.querySelector('.battle-characters .character:nth-child(1) .attack').textContent
    ).toBe('⚔️ 20');
    expect(
      document.querySelector('.battle-characters .character:nth-child(1) .defense').textContent
    ).toBe('🛡️ 10');
  });

  it('setupFightButton sets window.location.href on click', () => {
    dungeonModule.setupFightButton();
    const btn = document.querySelector('.fight-btn');
    btn.dispatchEvent(new Event('click'));
    expect(window.location.href).toBe('./battle_page/battlepage.html');
  });

  it('getRequest sends GET request with correct headers', async () => {
    const url = '/some-endpoint';
    await dungeonModule.getRequest(url);
    expect(global.fetch).toHaveBeenCalledWith(url, expect.objectContaining({ method: 'GET' }));
  });

  it('loadDungeon updates DOM as expected', async () => {
    // Instead of spying on read-only exports, just check the DOM changes
    await dungeonModule.loadDungeon();

    expect(document.querySelector('.battle-level').textContent).toBe('Level 2');

    const playerImg = document.querySelector('.battle-characters .character:nth-child(1) img');
    const playerName = document.querySelector('.battle-characters .character:nth-child(1) .name');
    const playerHp = document.querySelector('.battle-characters .character:nth-child(1) .health');
    const playerAtt = document.querySelector('.battle-characters .character:nth-child(1) .attack');
    const playerDef = document.querySelector('.battle-characters .character:nth-child(1) .defense');

    expect(playerImg.src).toContain('knight.png');
    expect(playerName.textContent).toBe('Arthur');
    expect(playerHp.textContent).toBe('❤️ 100');
    expect(playerAtt.textContent).toBe('⚔️ 20');
    expect(playerDef.textContent).toBe('🛡️ 10');

    const enemyImg = document.querySelector('.battle-characters .character:nth-child(3) img');
    const enemyName = document.querySelector('.battle-characters .character:nth-child(3) .name');
    const enemyHp = document.querySelector('.battle-characters .character:nth-child(3) .health');
    const enemyAtt = document.querySelector('.battle-characters .character:nth-child(3) .attack');
    const enemyDef = document.querySelector('.battle-characters .character:nth-child(3) .defense');

    expect(enemyImg.src).toContain('goblin.jpeg');
    expect(enemyName.textContent).toBe('Goblin');
    expect(enemyHp.textContent).toBe('❤️ 50');
    expect(enemyAtt.textContent).toBe('⚔️ 10');
    expect(enemyDef.textContent).toBe('🛡️ 5');
  });
});
