(() => {
  const emailInput = document.getElementById('AlertEmail');
  const minInput = document.getElementById('AlertMinUpdate');
  const maxInput = document.getElementById('AlertMaxUpdate');
  const fieldSelect = document.getElementById('AlertFieldUpdate');

  if (!emailInput) return;

  const storedEmail = localStorage.getItem('alertEmail');
  if (storedEmail) {
    emailInput.value = storedEmail;
    fetch(`/alert-settings?email=${encodeURIComponent(storedEmail)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        if (minInput && data.min !== null) minInput.value = data.min;
        if (maxInput && data.max !== null) maxInput.value = data.max;
        if (fieldSelect && data.priceField) {
          fieldSelect.value = data.priceField;
        }
      })
      .catch(() => {});
  }

  const form = emailInput.closest('form');
  if (form) {
    form.addEventListener('submit', () => {
      if (emailInput.value) {
        localStorage.setItem('alertEmail', emailInput.value.trim());
      }
    });
  }

  const signupEmail = document.getElementById('InputEmail1');
  if (signupEmail) {
    const signupForm = signupEmail.closest('form');
    if (signupForm) {
      signupForm.addEventListener('submit', () => {
        if (signupEmail.value) {
          localStorage.setItem('alertEmail', signupEmail.value.trim());
        }
      });
    }
  }
})();
