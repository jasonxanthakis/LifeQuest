const { getAllByText, getByText, fireEvent } = require("@testing-library/dom");
require("@testing-library/jest-dom");

beforeEach(() => {
    document.body.innerHTML = `
    <nav>
        <a href="../quests-board/quests.html">Quests</a>
        <a href="../../inventory/inventory.html">Hero</a>
        <a href="../../dungeon/dungeon.html">Dungeon</a>
        <a href="../../metrics/metrics.html">Metrics</a>
        <button id="logoutbtn">Logout</button>
    </nav>

    <button id="add-quest-btn">Add Quest</button>
    <div id="quest-counter">0</div>
    <div id="quest-list"></div>
    <button id="save-btn">Save</button>

    <!-- Example modal -->
    <div id="example-modal" class="modal" style="display:none;">
    <button class="close-modal-btn">Close</button>
    <p>Modal content</p>
    </div>
    `;

    const questList = document.getElementById("quest-list");
    const questCounter = document.getElementById("quest-counter");

    document.getElementById("add-quest-btn").addEventListener("click", () => {
        const card = document.createElement("div");
        card.className = "quest-card";
        card.innerHTML = `
            <input class="quest-title" value="New Quest">
            <select class="quest-category">
            <option>Adventure</option>
            <option>Combat</option>
            <option>Puzzle</option>
            </select>
            <button class="done-btn">Done</button>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;
        questList.appendChild(card);
        questCounter.textContent = questList.children.length;

        card.querySelector(".delete-btn").addEventListener("click", () => {
            card.remove();
            questCounter.textContent = questList.children.length;
        });
        card.querySelector(".done-btn").addEventListener("click", () => card.classList.toggle("completed"));
        card.querySelector(".edit-btn").addEventListener("click", () => {
            card.querySelector(".quest-title").value = "Edited Quest";
        });
    });

    document.getElementById("save-btn").addEventListener("click", () => {
        window.saved = true;
    });

    // Modal open/close simulation
    const modal = document.getElementById("example-modal");
    modal.open = () => (modal.style.display = "block");
    modal.close = () => (modal.style.display = "none");
    modal.querySelector(".close-modal-btn").addEventListener("click", () => modal.close());
});

test("navbar contains all expected links", () => {
    expect(getAllByText(document.body, "Quests")[0]).toBeInTheDocument();
    expect(getAllByText(document.body, "Hero")[0]).toBeInTheDocument();
    expect(getAllByText(document.body, "Dungeon")[0]).toBeInTheDocument();
    expect(getAllByText(document.body, "Metrics")[0]).toBeInTheDocument();
});

test("navbar links point to correct hrefs", () => {
    const questsLink = getAllByText(document.body, "Quests")[0].closest("a");
    const heroLink = getAllByText(document.body, "Hero")[0].closest("a");
    const dungeonLink = getAllByText(document.body, "Dungeon")[0].closest("a");
    const metricsLink = getAllByText(document.body, "Metrics")[0].closest("a");

    expect(questsLink).toHaveAttribute("href", "../quests-board/quests.html");
    expect(heroLink).toHaveAttribute("href", "../../inventory/inventory.html");
    expect(dungeonLink).toHaveAttribute("href", "../../dungeon/dungeon.html");
    expect(metricsLink).toHaveAttribute("href", "../../metrics/metrics.html");
});

test("logout button exists and can be clicked", () => {
    const logoutBtn = document.getElementById("logoutbtn");
    expect(logoutBtn).toBeInTheDocument();
    logoutBtn.click();
});

// Quest functionality tests
test("user can add a quest and counter updates", () => {
    fireEvent.click(getByText(document.body, "Add Quest"));
    expect(document.querySelectorAll(".quest-card").length).toBe(1);
    expect(document.getElementById("quest-counter").textContent).toBe("1");
});

test("user can delete a quest and counter updates", () => {
    fireEvent.click(getByText(document.body, "Add Quest"));
    fireEvent.click(document.querySelector(".delete-btn"));
    expect(document.querySelectorAll(".quest-card").length).toBe(0);
    expect(document.getElementById("quest-counter").textContent).toBe("0");
});

test("user can select a category", () => {
    fireEvent.click(getByText(document.body, "Add Quest"));
    const select = document.querySelector(".quest-category");
    fireEvent.change(select, { target: { value: "Combat" } });
    expect(select.value).toBe("Combat");
});

test("user can click done", () => {
    fireEvent.click(getByText(document.body, "Add Quest"));
    fireEvent.click(document.querySelector(".done-btn"));
    expect(document.querySelector(".quest-card")).toHaveClass("completed");
});

test("user can edit a quest card", () => {
    fireEvent.click(getByText(document.body, "Add Quest"));
    fireEvent.click(document.querySelector(".edit-btn"));
    expect(document.querySelector(".quest-title").value).toBe("Edited Quest");
});

test("save button works", () => {
    fireEvent.click(getByText(document.body, "Save"));
    expect(window.saved).toBe(true);
});

test("modal opens and closes correctly", () => {
    const modal = document.getElementById("example-modal");
    modal.open();
    expect(modal.style.display).toBe("block");
    modal.querySelector(".close-modal-btn").click();
    expect(modal.style.display).toBe("none");
});
