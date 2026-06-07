// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyC0qMjVOsGUZpOzB-h55zHrs8PVoGdcXlE",
  authDomain: "instinct-plus.firebaseapp.com",
  databaseURL: "https://instinct-plus-default-rtdb.firebaseio.com",
  projectId: "instinct-plus",
  storageBucket: "instinct-plus.firebasestorage.app",
  messagingSenderId: "111913031160",
  appId: "1:111913031160:web:1f22855745df5b05d4320d",
  measurementId: "G-HYJXK5Z0ZT"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Глобальные переменные
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();  // <--- ЭТО БЫЛО ПРОБЛЕМОЙ

// Сохраняем сессию
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
  console.warn("Firebase auth persistence error:", err);
});

// Функция выхода
window.logout = function () {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  }).catch(err => {
    console.error("Ошибка выхода:", err);
  });
};

// Экспортируем в window
window.auth = auth;
window.db = db;
window.storage = storage;

console.log("Firebase инициализирован успешно!");
// ========== ОНЛАЙН-СТАТУС ==========
function initOnlineStatus(userId) {
  const userStatusRef = db.ref(`status/${userId}`);
  const isOfflineForDatabase = { online: false, lastSeen: Date.now() };
  const isOnlineForDatabase = { online: true, lastSeen: Date.now() };

  db.ref('.info/connected').on('value', (snap) => {
    if (snap.val() === false) return;
    
    userStatusRef.onDisconnect().set(isOfflineForDatabase);
    userStatusRef.set(isOnlineForDatabase);
  });
}

// Подписка на статус другого пользователя
function subscribeToUserStatus(userId, callback) {
  db.ref(`status/${userId}`).on('value', (snap) => {
    const status = snap.val();
    callback(status ? status.online : false);
  });
}

// Отписка от статуса
function unsubscribeFromUserStatus(userId) {
  db.ref(`status/${userId}`).off();
}
