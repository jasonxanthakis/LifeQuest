let current_quest = 'All Quests'

const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
    btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.assign('../../login/login.html');
    });
}

export async function createSummaryCards(stage, questId) {
    let url = `http://localhost:3000/main/metrics/data/${questId}`;

    const response = await getRequest(url);
    const result = await response.json();

    // const container = document.getElementById('summaryDataContainer');
    const container = document.createElement('div');
    container.id = 'summaryDataContainer';
    container.classList = 'container mt-4';

    const row = document.createElement('div');
    row.classList = 'row text-center';


    Object.entries(result).forEach(([key, value]) => {
        const col = document.createElement('div');
        col.className = "col-md-4 mb-3";

        // Format the title (snake_case -> Capitalized words)
        const title = key.replace(/_/g, " ")
                        .replace(/\b\w/g, l => l.toUpperCase());

        col.innerHTML = `
        <div class="card shadow-sm h-100">
            <div class="card-body text-center">
                <h5 class="card-title">${title}</h5>
                <p class="card-text display-6">${value}</p>
            </div>
        </div>
        `;

        row.appendChild(col);
    });

    container.appendChild(row);
    stage.appendChild(container);
}

export function createDropdown(stage) {
    const dropdownHTML = `
    <h2 class="text-white mb-3">Metrics</h2>
    <div class="dropdown ms-3">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="questDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            ${current_quest}
        </button>
        <ul id="questDropdownMenu" class="dropdown-menu" aria-labelledby="questDropdown">
            <!-- Items will be inserted here dynamically -->
            <li data-quest="0"><a class="dropdown-item" href="#" data-quest-id="0">All Quests</a></li>
        </ul>
    </div>
    `
    stage.innerHTML = dropdownHTML;
}

export async function loadQuestDropdown() {
    const response = await getRequest('http://localhost:3000/main/metrics/quests');
    const result = await response.json();
    const quests = result.quests;

    const menu = document.getElementById('questDropdownMenu');

    // Remove old quest items except "All Quests"
    menu.querySelectorAll('li[data-quest]').forEach(li => li.remove());
    
    menu.innerHTML = `<li data-quest="0"><a class="dropdown-item" href="#" data-quest-id="0">All Quests</a></li>`

    quests.forEach(q => {
        const li = document.createElement('li');
        li.setAttribute('data-quest', q.id);
        li.innerHTML = `<a class="dropdown-item" href="#" data-quest-id="${q.id}">${q.title}</a>`;
        menu.appendChild(li);
    });

    createDropdownEventListener();
}

export async function loadMetrics(questID = 0) {
    try {
        const API_URL = 'http://localhost:3000';

        let url = API_URL + `/main/metrics/${questID}`;

        const response = await getRequestSvg(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.status}`);
        }

        const svgText = await response.text();

        // Clear existing content
        const stage = document.querySelector('.metrics-stage');
        createDropdown(stage);
        await loadQuestDropdown();
        // stage.classList.add('carousel slide');
        // stage.setAttribute('data-bs-ride', 'carousel');

        // Insert the SVG into the page
        const svgContainer = document.createElement('div');
        svgContainer.innerHTML = svgText;
        svgContainer.classList.add('metrics-svg', 'text-center', 'mt-3');
        stage.appendChild(svgContainer);

        // Add the 3 summary stat cards
        await createSummaryCards(stage, questID);        

    } catch (err) {
        console.error(err);
        mainContent.innerHTML = `<p class="text-danger">Could not load metrics. Please try again later.</p>`;
    }
}

function createDropdownEventListener() {
    document.getElementById('questDropdownMenu').addEventListener('click', async (e) => {
        if (e.target.matches('.dropdown-item')) {
            const questId = e.target.getAttribute('data-quest-id');
            current_quest = e.target.text;

            await loadMetrics(questId);
        }
    });
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

export async function getRequestSvg(url) {
    const options = {
        method: "GET",
        headers: {
            "Authorization": localStorage.getItem("token"),
            "Content-Type": "image/svg+xml"
        }
    }

    const resp = await fetch(url, options);

    return resp;
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadMetrics();
});