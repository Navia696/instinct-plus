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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();
const storage = firebase.storage();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
  console.warn("Firebase auth persistence error:", err);
});

let userId = localStorage.getItem("userId");
if (!userId) {
  userId = (crypto.randomUUID && crypto.randomUUID()) || ("u_" + Date.now());
  localStorage.setItem("userId", userId);
}

window.db = db;
window.auth = auth;
window.storage = storage;
window.userId = userId;
window.logout = function() {
  auth.signOut().then(() => location.href = 'login.html');
};

