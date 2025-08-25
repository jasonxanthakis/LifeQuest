document.addEventListener('DOMContentLoaded', async () => {
  const questForm = document.getElementById('questForm');
  const questList = document.getElementById('questList');
  const questModal = new bootstrap.Modal(document.getElementById('addQuestModal'));

  let url = 'http://localhost:3000/main/quests';

  // Load existing quests
  let response = await getRequest(url)
  let data = await response.json();

  if (data.length > 0) {
    data.forEach(q => addQuestCard(q.id, q.title, q.description, q.category, q.points_value));
  }

  document.getElementById("addQuestBtn").addEventListener("click", (e) => {
    e.preventDefault(); // stop the page from reloading

    const title = document.getElementById('questTitle').value.trim();
    const description = document.getElementById('questDescription').value.trim();
    const category = document.getElementById('questCategory').value;

    if (!questTitle || !description || !category) return alert('Please fill in all fields');

    url = 'http://localhost:3000/main/quests/';

    fetch(url, {
      method: 'POST',
      headers: {
        "Authorization": localStorage.getItem("token"),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, category })
    }).then(r => r.json())
      .then(q => addQuestCard(q.title, q.description, q.category, q.points))
      .catch(console.error);

    questForm.reset();
    questModal.hide();
  });
});


function addQuestCard( questId, questTitle, description, category, points=3) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h5 class="card-title">${questTitle}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${category}</h6>
          <p class="card-text">${description}</p>
        </div>
        <div class="d-flex flex-column gap-2">
          <div class="form-check form-switch">
            <input class="form-check-input done-toggle" type="checkbox" role="switch" id="toggle-${Date.now()}">
            <label class="form-check-label" for="toggle-${Date.now()}">
              Done
            </label>
          </div>
          <button class="btn btn-sm btn-outline-secondary edit-btn">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>
        </div>
      </div>
    </div>
  `;

  // Append to quest list
  questList.appendChild(card);

  // Add toggle behavior
  const toggle = card.querySelector('.done-toggle');
  toggle.addEventListener('change', async () => {
    card.classList.toggle('bg-success', toggle.checked);
    card.classList.toggle('text-white', toggle.checked);
    card.classList.toggle('done', toggle.checked);

    // connecting the toggle to the backend
    let url = `http://localhost:3000/main/quests/${questId}/complete`;
    
    try {
      const response = await sendPatchRequest(url, { completed: toggle.checked });
      const data = response.json();
      
      if (response.status == 200) {
        console.log('Quest completion updated', data);
      } else {
        console.log(data.error);
      }
    } catch (err) {
      console.error(err);
    }

  });

  // Add edit functionality
  const editBtn = card.querySelector('.edit-btn');
  editBtn.addEventListener('click', async () => {
    if (editBtn.textContent === 'Edit') {
      // Switch to edit mode
      const cardTitle = card.querySelector('.card-title');
      const cardSubtitle = card.querySelector('.card-subtitle');
      const cardText = card.querySelector('.card-text');
      
      const currentTitle = cardTitle.textContent;
      const currentCategory = cardSubtitle.textContent;
      const currentDescription = cardText.textContent;
      
      // Replace with input fields
      cardTitle.innerHTML = `<input type="text" class="form-control form-control-sm edit-title" value="${currentTitle}">`;
      cardSubtitle.innerHTML = `<select class="form-select form-select-sm edit-category">
        <option value="Smoking" ${currentCategory === 'Smoking' ? 'selected' : ''}>Smoking</option>
        <option value="Exercise" ${currentCategory === 'Exercise' ? 'selected' : ''}>Exercise</option>
      </select>`;
      cardText.innerHTML = `<textarea class="form-control form-control-sm edit-description" rows="2">${currentDescription}</textarea>`;
      
      // Change button to Save
      editBtn.textContent = 'Save';
      editBtn.className = 'btn btn-sm btn-success save-btn';
      
    } else {
      // Save mode
      const newTitle = card.querySelector('.edit-title').value.trim();
      const newCategory = card.querySelector('.edit-category').value;
      const newDescription = card.querySelector('.edit-description').value.trim();
      
      if (newTitle && newCategory && newDescription) {
        let url = `http://localhost:3000/main/quests/${questId}/`;

        const response = await sendPatchRequest(url, { title: newTitle, description: newDescription, category: newCategory });
        
        if (response.status == 200) {
          const cardTitle = card.querySelector('.card-title');
          const cardSubtitle = card.querySelector('.card-subtitle');
          const cardText = card.querySelector('.card-text');
          
          cardTitle.textContent = newTitle;
          cardSubtitle.textContent = newCategory;
          cardText.textContent = newDescription;
        }
        else {
          console.error('Error: ', response.error)
        }
        
        // Change button back to Edit
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-sm btn-outline-secondary edit-btn';
      } else {
        alert('Please fill in all fields');
      }
    }
  });

  // Add delete functionality
  const deleteBtn = card.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this quest?')) {
      let url = `http://localhost:3000/main/quests/${questId}/`;

      const response = await sendDeleteRequest(url);

      if (response.status == 200) {
        card.remove();
      } else {
        alert('Failed to delete the quest.')
      }
    }
  });
};

const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.assign('../../login/login.html');
  });
};

async function getRequest(url) {
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

async function sendPatchRequest(url, data) {
  const options = {
    method: "PATCH",
    headers: {
      "Authorization": localStorage.getItem("token"),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }

  const resp = await fetch(url, options);

  return resp;
};

async function sendDeleteRequest(url) {
  const options = {
    method: "DELETE",
    headers: {
      "Authorization": localStorage.getItem("token"),
      "Content-Type": "application/json"
    }
  }

  const resp = await fetch(url, options);

  return resp;
}