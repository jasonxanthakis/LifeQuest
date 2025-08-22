document.addEventListener('DOMContentLoaded', () => {
  const questForm = document.getElementById('questForm');
  const questList = document.getElementById('questList');
  const questModal = new bootstrap.Modal(document.getElementById('addQuestModal'));
  const API_URL = 'http://localhost:3000/quests';

  // Load existing quests
  fetch(API_URL).then(r => r.json()).then(data => data.forEach(q => addQuestCard(q.quest_title, q.description, q.category, q.points_value))).catch(console.error);

  questForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const questTitle = document.getElementById('questTitle').value.trim();
    const description = document.getElementById('questDescription').value.trim();
    const category = document.getElementById('questCategory').value;
    const points_value = 10; // default points

    if (!questTitle || !description || !category) return alert('Please fill in all fields');

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quest_title: questTitle, description, category, points_value })
    }).then(r => r.json())
      .then(q => addQuestCard(q.quest_title, q.description, q.category, q.points_value))
      .catch(console.error);

    questForm.reset(); questModal.hide();
  });

  function addQuestCard(questTitle, description, category, points=10) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h5 class="card-title">${questTitle}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${category} | ${points} pts</h6>
            <p class="card-text">${description}</p>
          </div>
          <div class="d-flex flex-column gap-2">
            <div class="form-check form-switch">
              <input class="form-check-input done-toggle" type="checkbox" role="switch" id="toggle-${Date.now()}">
              <label class="form-check-label" for="toggle-${Date.now()}">Done</label>
            </div>
            <button class="btn btn-sm btn-outline-secondary edit-btn">Edit</button>
          </div>
        </div>
      </div>`;
    questList.appendChild(card);

    const toggle = card.querySelector('.done-toggle');
    toggle.addEventListener('change', () => {
      card.classList.toggle('bg-success', toggle.checked);
      card.classList.toggle('text-white', toggle.checked);
      card.classList.toggle('done', toggle.checked);
    });

    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
      const cardTitle = card.querySelector('.card-title');
      const cardSubtitle = card.querySelector('.card-subtitle');
      const cardText = card.querySelector('.card-text');

      if (editBtn.textContent === 'Edit') {
        const currentTitle = cardTitle.textContent;
        const currentCategory = cardSubtitle.textContent.split('|')[0].trim();
        const currentDescription = cardText.textContent;
        cardTitle.innerHTML = `<input type="text" class="form-control form-control-sm edit-title" value="${currentTitle}">`;
        cardSubtitle.innerHTML = `<select class="form-select form-select-sm edit-category">
          <option value="Smoking" ${currentCategory==='Smoking'?'selected':''}>Smoking</option>
          <option value="Exercise" ${currentCategory==='Exercise'?'selected':''}>Exercise</option>
        </select>`;
        cardText.innerHTML = `<textarea class="form-control form-control-sm edit-description" rows="2">${currentDescription}</textarea>`;
        editBtn.textContent = 'Save'; editBtn.className = 'btn btn-sm btn-success save-btn';
      } else {
        const newTitle = card.querySelector('.edit-title').value.trim();
        const newCategory = card.querySelector('.edit-category').value;
        const newDescription = card.querySelector('.edit-description').value.trim();
        if (newTitle && newCategory && newDescription) {
          cardTitle.textContent = newTitle;
          cardSubtitle.textContent = `${newCategory} | ${points} pts`;
          cardText.textContent = newDescription;
          editBtn.textContent = 'Edit'; editBtn.className = 'btn btn-sm btn-outline-secondary edit-btn';
        } else alert('Please fill in all fields');
      }
    });

    // Clear the form
    questForm.reset();

    // Close the modal
    questModal.hide();
  };

  const logout = document.getElementsByClassName('logout');
  for (let btn of logout) {
    btn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.assign('../../login/login.html');
    });
  }
});
