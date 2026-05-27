const form = document.getElementById("contact-form");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const message = document.getElementById("form-message");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    message.textContent = "Please fill in all fields.";
    message.className = "message error";
    return;
  }

  message.textContent = "Form submitted successfully!";
  message.className = "message success";
  form.reset();
});
