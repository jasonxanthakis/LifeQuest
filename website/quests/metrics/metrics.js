const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
    btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.assign('../../login/login.html');
    });
}

async function loadMetrics() {
    try {
        const API_URL = 'http://localhost:3000';

        let url = API_URL + `/main/metrics`;

        const response = await getRequest(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.status}`);
        }

        const svgText = await response.text();
        console.log(svgText);

        // Clear existing content
        const mainContent = document.querySelector('.battle-stage');
        mainContent.innerHTML = '';

        // Insert the SVG into the page
        const svgContainer = document.createElement('div');
        svgContainer.innerHTML = svgText;
        svgContainer.classList.add('metrics-svg', 'text-center', 'mt-3');
        mainContent.appendChild(svgContainer);

    } catch (err) {
        console.error(err);
        mainContent.innerHTML = `<p class="text-danger">Could not load metrics. Please try again later.</p>`;
    }
}

export async function getRequest(url) {
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