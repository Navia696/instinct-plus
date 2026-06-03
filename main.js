// Регистрация
document.getElementById("regSubmit")?.addEventListener("click", () => {
  const nick = document.getElementById("regNick").value;
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPass").value;

  if (!nick || !email || !pass) {
    alert("Заповніть всі поля!");
    return;
  }

  // Проверка длины
  if (pass.length < 7) {
    alert("Пароль має містити не менше 7 символів.");
    return;
  }

  // Проверка заглавной буквы
  if (!/[A-ZА-Я]/.test(pass)) {
    alert("Пароль має містити хоча б одну велику літеру.");
    return;
  }

  // Проверка цифры
  if (!/[0-9]/.test(pass)) {
    alert("Пароль має містити хоча б одну цифру.");
    return;
  }

  // Если всё хорошо — сохраняем
  localStorage.setItem("userNick", nick);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userPass", pass);
  localStorage.setItem("lastLogin", Date.now());

  alert("Акаунт створено!");
  window.location.href = "home.html";
});

// Вход
document.getElementById("loginSubmit")?.addEventListener("click", () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPass").value;

  if (
    email === localStorage.getItem("userEmail") &&
    pass === localStorage.getItem("userPass")
  ) {
    localStorage.setItem("lastLogin", Date.now());
    window.location.href = "home.html";
  } else {
    alert("Невірні дані!");
  }
});

// Автовход на 7 дней
const last = localStorage.getItem("lastLogin");
if (last) {
  const week = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - last < week) {
    window.location.href = "home.html";
  }
}

const coverFile = document.getElementById("cover").files[0];
if (coverFile) {
  const reader2 = new FileReader();
  reader2.onload = () => {
    localStorage.setItem("cover", reader2.result);
  };
  reader2.readAsDataURL(coverFile);
}

posts.forEach(text => {
  const div = document.createElement("div");
  div.className = "post";
  div.innerHTML = `<p>${text}</p>`;
  postsContainer.appendChild(div);
});

