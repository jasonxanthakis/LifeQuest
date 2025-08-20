document.addEventListener('DOMContentLoaded', () => {
  const questForm = document.getElementById('questForm');
  const questList = document.getElementById('questList');
  const questModal = new bootstrap.Modal(document.getElementById('addQuestModal'));

  questForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const title = document.getElementById('questTitle').value.trim();
    const description = document.getElementById('questDescription').value.trim();
    const category = document.getElementById('questCategory').value;

    // Create the card
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <h5 class="card-title">${title}</h5>
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
          </div>
        </div>
      </div>
    `;

    // Append to quest list
    questList.appendChild(card);

    // Add toggle behavior
    const toggle = card.querySelector('.done-toggle');
    toggle.addEventListener('change', () => {
    if (toggle.checked) {
        card.classList.add('bg-success', 'text-white');
    } else {
        card.classList.remove('bg-success', 'text-white');
    }
    });

    toggle.addEventListener('change', () => {
    card.classList.toggle('done', toggle.checked);
    });

    // Add edit functionality
    const editBtn = card.querySelector('.edit-btn');
    editBtn.addEventListener('click', function() {
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
          const cardTitle = card.querySelector('.card-title');
          const cardSubtitle = card.querySelector('.card-subtitle');
          const cardText = card.querySelector('.card-text');
          
          cardTitle.textContent = newTitle;
          cardSubtitle.textContent = newCategory;
          cardText.textContent = newDescription;
          
          // Change button back to Edit
          editBtn.textContent = 'Edit';
          editBtn.className = 'btn btn-sm btn-outline-secondary edit-btn';
        } else {
          alert('Please fill in all fields');
        }
      }
    });


    // Clear the form
    questForm.reset();

    // Close the modal
    questModal.hide();
  });
});
