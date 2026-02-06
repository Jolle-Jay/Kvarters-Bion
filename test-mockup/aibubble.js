document.addEventListener('DOMContentLoaded', () => {
  const bubbleLinks = document.querySelectorAll('.chat-bubble');
  if (!bubbleLinks.length) return;

  const modal = document.createElement('div');
  modal.className = 'ai-modal';
  modal.innerHTML = `
    <div class="ai-modal__dialog" role="dialog" aria-modal="true" aria-label="AI-chatt">
      <div class="ai-modal__header">
        <span>AI-chatt</span>
        <button type="button" class="ai-modal__close" aria-label="Stäng">×</button>
      </div>
      <iframe class="ai-modal__iframe" title="AI-chatt" src=""></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  const iframe = modal.querySelector('.ai-modal__iframe');
  const closeBtn = modal.querySelector('.ai-modal__close');

  const closeModal = () => {
    modal.classList.remove('is-open');
    iframe.src = '';
  };

  bubbleLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const target = link.getAttribute('href') || 'ai.html';
      iframe.src = target;
      modal.classList.add('is-open');
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
});
