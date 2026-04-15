const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("messageBox");
const isHttpProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";
const appOrigin = isHttpProtocol ? `${window.location.protocol}//${window.location.hostname || "localhost"}:5000` : null;
const dashboardUrl = isHttpProtocol ? `${appOrigin}/dashboard` : "./dashboard.html";
const apiBaseUrl = isHttpProtocol ? `${appOrigin}/api/v1/auth` : null;

const showMessage = (message, type = "success") => {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
};

const saveAuth = (payload) => {
  localStorage.setItem("token", payload.token);
  localStorage.setItem("user", JSON.stringify(payload.user));
};

const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const parseJsonResponse = async (response) => {
  const rawText = await response.text();

  if (!rawText) {
    throw new Error("Empty response from server. Make sure the backend is running on http://localhost:5000.");
  }

  try {
    return JSON.parse(rawText);
  } catch (error) {
    throw new Error(`Server returned invalid response: ${rawText.slice(0, 120)}`);
  }
};

const redirectToDashboardIfAuthenticated = () => {
  if (isHttpProtocol && localStorage.getItem("token")) {
    window.location.replace(dashboardUrl);
  }
};

if (!isHttpProtocol) {
  showMessage("Please open the app through http://localhost:5000 instead of opening the HTML file directly.", "error");
}

const pendingMessage = localStorage.getItem("authMessage");

if (pendingMessage) {
  showMessage(pendingMessage, "error");
  localStorage.removeItem("authMessage");
}

redirectToDashboardIfAuthenticated();

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isHttpProtocol) {
    showMessage("Start the server and open http://localhost:5000 to use registration and login.", "error");
    return;
  }

  const body = {
    name: document.getElementById("registerName").value.trim(),
    email: document.getElementById("registerEmail").value.trim(),
    password: document.getElementById("registerPassword").value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    saveAuth(data.data);
    registerForm.reset();
    showMessage("Registration successful. Redirecting to dashboard...");
    window.setTimeout(() => {
      window.location.assign(dashboardUrl);
    }, 800);
  } catch (error) {
    clearAuth();
    showMessage(error.message, "error");
  }
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isHttpProtocol) {
    showMessage("Start the server and open http://localhost:5000 to use registration and login.", "error");
    return;
  }

  const body = {
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await parseJsonResponse(response);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    saveAuth(data.data);
    loginForm.reset();
    showMessage("Login successful. Redirecting to dashboard...");
    window.setTimeout(() => {
      window.location.assign(dashboardUrl);
    }, 800);
  } catch (error) {
    clearAuth();
    showMessage(error.message, "error");
  }
});
