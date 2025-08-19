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
        <h5 class="card-title">${title}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${category}</h6>
        <p class="card-text">${description}</p>
      </div>
    `;

    // Append to quest list
    questList.appendChild(card);

    // Clear the form
    questForm.reset();

    // Close the modal
    questModal.hide();
  });
});
