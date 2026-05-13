(function () {
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(email) {
    return typeof email === "string" && EMAIL_RE.test(email.trim());
  }

  /**
   * Returns score 0-4 and label for password strength UI.
   */
  function passwordStrength(password) {
    if (!password || password.length === 0) {
      return { score: 0, label: "", percent: 0, className: "" };
    }
    var score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    score = Math.min(4, score);
    var labels = ["Weak", "Fair", "Good", "Strong"];
    var classes = ["mp-pw-weak", "mp-pw-medium", "mp-pw-medium", "mp-pw-strong"];
    var percent = [25, 50, 75, 100][Math.max(0, score - 1)] || (password.length < 8 ? 15 : 25);

    return {
      score: score,
      label: score === 0 ? "Too short" : labels[score - 1],
      percent: score === 0 ? Math.min(20, password.length * 3) : percent,
      className: score === 0 ? "mp-pw-weak" : classes[score - 1],
    };
  }

  window.MetroProValidators = {
    isValidEmail: isValidEmail,
    passwordStrength: passwordStrength,
  };
})();
