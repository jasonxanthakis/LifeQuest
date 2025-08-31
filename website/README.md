# LifeQuest Web App

This website acts as a front-end to the LifeQuest web application. It's a web app designed for desktop, laptop and mobile devices. It was created using HTML, CSS & JavaScript and contains BootStrap elements. It is currently hosted on [Render](https://lifequest-bagl.onrender.com) as a static website.

## Prerequisites
- Node.js (for tests)

## How to Run Locally
1. Clone this repository to your local machine
2. Change directory to the website folder using the `cd ./website` command
3. Run the command `npm install` to install all node module packages needed for development and testing (optional)
4. Open the website locally by opening the `index.html` file in your browser
    - To open the website in development mode, use the command `npm run live` to run live server (must complete step 3 first)

## Testing
1. Follow steps 1-3 in the above section
2. Run the command `npm test` to run the jest tests
3. Run the command `npm run vitest` to run the vitest tests

Note: the front-end unit tests use a combination of two test frameworks, jest and vitest

## LifeQuest Style Guide

### Background System
- Primary Background: url('assets/dungeon-background.jpg')

![background-image](./assets/dungeon-background.jpg)

Background Properties:
- background-size: cover
- background-position: center
- min-height: 100vh
- Overlay Effects: Semi-transparent elements over background image

### Navigation Bar Standards
Desktop Navigation (Sidebar)
- Layout ```col-lg-2 d-none d-lg-flex flex-column sidebar```

- Positioning: Fixed sidebar, full height ```(min-vh-100)```

- Alignment: ```align-items-center text-center```

- Background: Allows dungeon background to show through

- Logo: Centered in sidebar

- Menu Items: Vertical list with active states

Mobile Navigation 
- Layout: ```navbar navbar-expand-lg mainbar d-lg-none```

- Structure: Horizontal bar with hamburger menu

- Logo: Left-aligned with brand link

- Toggle: Right-aligned hamburger button

- Logout: Always visible button next to hamburger

- Collapsible Menu: ```collapse navbar-collapse```

Menu Items
- Active state: ```.nav-link.active``` for current page

- Links: Relative paths between sections

- Order: Quests → Hero/Inventory → Dungeon → Shop

### Logo Standards
- Mobile: ```height="50px"```
- Desktop: ```height="90px"``` (landing page)
- Consistent: Same logo across all pages
- Alt text: "LifeQuest Logo" for accessibility

### Responsive Behaviour
- Mobile-first: Collapsible hamburger menu

- Desktop: Fixed sidebar navigation

- Breakpoint: Bootstrap's ```lg``` breakpoint for switching

### Colour Palette
- Primary Purple: #3c009d - Main brand colour

- Dark Purple: #2e0054 - Secondary/accent

- Success Green: #4CAF50 - Buttons, success states

- Success Green Hover: #45a049

- Warning/Error Red: red - Links, errors

- Text White: #fff - Primary text

- Text Black: black - Form text, contrasting elements

### Visual Effects
- Card Backgrounds: rgba(255, 255, 255, 0.9) - Semi-transparent white over dungeon image

- Navigation: background-color: transparent - Allows dungeon background to show through

Glow Effects:
- Torch glow: rgba(255, 140, 0, 0.6)
- Mystical aura: rgba(100, 0, 200, 0.5)


## Naming Conventions
### File and Folder Structure
```
website/
├── styles.css
├── feature-name/
│   ├── feature-name.html
│   ├── feature-name.js
```

Examples:
- ``login.html``, ```login.js```

- ``signup.html``, ```signup.js```

### CSS Class Naming
- Cards: .feature-card (e.g., .login-card, .signup-card)

- Buttons: .feature-btn (e.g., .login-btn, .signup-btn)

- Links: .feature-link (e.g., .signup-link, .login-link)

- Navigation: .nav-item, .nav-link, .navbar-brand

### JavaScript Conventions
- Variables: camelCase (e.g., questForm, heroItems)

- Functions: camelCase verbs (e.g., loadInventory(), createQuest())

- Constants: UPPER_CASE (e.g., DB_URL)

- DOM Elements: descriptive names (e.g., questList, inventoryList)

### HTML IDs & Classes
- IDs: camelCase for JavaScript targeting (e.g., questForm, heroStats)

- Classes: kebab-case for CSS styling (e.g., quest-card, hero-inventory)

- Bootstrap: Use existing Bootstrap classes where possible

