(function () {
  var USER_KEY = "metropro_user";
  var SESSION_KEY = "metropro_session";
  var ACCOUNTS_KEY = "metropro_accounts";

  function getAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveAccounts(obj) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(obj));
  }

  function getCurrentUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) === "1" && !!getCurrentUser();
  }

  function login(email, password) {
    var accounts = getAccounts();
    var entry = accounts[email.trim().toLowerCase()];
    if (!entry || entry.password !== simpleHash(password)) {
      return { ok: false, message: "Invalid email or password." };
    }
    var user = { email: email.trim(), name: entry.name, cardId: entry.cardId };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, "1");
    return { ok: true, user: user };
  }

  function signup(name, email, password) {
    if (!window.MetroProValidators.isValidEmail(email)) {
      return { ok: false, message: "Please enter a valid email address." };
    }
    var strength = window.MetroProValidators.passwordStrength(password);
    if (password.length < 8 || strength.score < 2) {
      return { ok: false, message: "Password must be at least 8 characters and stronger." };
    }
    var key = email.trim().toLowerCase();
    var accounts = getAccounts();
    if (accounts[key]) {
      return { ok: false, message: "An account with this email already exists." };
    }
    var cardId = "MP-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    accounts[key] = {
      name: name.trim(),
      password: simpleHash(password),
      cardId: cardId,
    };
    saveAccounts(accounts);
    var user = { email: email.trim(), name: name.trim(), cardId: cardId };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, "1");
    return { ok: true, user: user };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /** Demo-only client-side fingerprint; not cryptographic security. */
  function simpleHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return "h" + (h >>> 0).toString(16);
  }

  /**
   * Redirect to login if protected page and no session.
   * Call from protected pages on DOMContentLoaded.
   */
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  /** Redirect logged-in users away from login/signup */
  function redirectIfAuthed(target) {
    target = target || "home.html";
    if (isLoggedIn()) {
      window.location.href = target;
      return true;
    }
    return false;
  }

  window.MetroProAuth = {
    login: login,
    signup: signup,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    requireAuth: requireAuth,
    redirectIfAuthed: redirectIfAuthed,
  };
})();
