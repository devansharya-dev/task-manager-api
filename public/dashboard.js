const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const refreshButton = document.getElementById("refreshButton");
const logoutButton = document.getElementById("logoutButton");
const messageBox = document.getElementById("messageBox");
const isHttpProtocol = window.location.protocol === "http:" || window.location.protocol === "https:";
const appOrigin = isHttpProtocol ? `${window.location.protocol}//${window.location.hostname || "localhost"}:5000` : null;
const homeUrl = isHttpProtocol ? `${appOrigin}/` : "./index.html";
const tasksUrl = isHttpProtocol ? `${appOrigin}/api/v1/tasks` : null;

const getToken = () => localStorage.getItem("token");

const showMessage = (message, type = "success") => {
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
};

const clearAuthAndRedirect = (message) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (message) {
    localStorage.setItem("authMessage", message);
  }

  window.location.replace(homeUrl);
};

if (!getToken()) {
  clearAuthAndRedirect("Please log in to continue.");
}

if (!isHttpProtocol) {
  showMessage("Dashboard preview is visible, but task APIs only work when you open the app through http://localhost:5000.", "error");
}

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

const apiRequest = async (url, options = {}) => {
  if (!isHttpProtocol) {
    throw new Error("Start the server and open http://localhost:5000 to use dashboard actions.");
  }

  const token = getToken();

  if (!token) {
    clearAuthAndRedirect("Please log in to continue.");
    throw new Error("Authentication required");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthAndRedirect(data.message || "Session expired. Please log in again.");
      throw new Error("Authentication required");
    }

    throw new Error(data.message || "Request failed");
  }

  return data;
};

const renderTasks = (tasks) => {
  taskList.innerHTML = "";
  emptyState.style.display = tasks.length ? "none" : "block";

  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = "task-item";
    listItem.innerHTML = `
      <div>
        <h3>${task.title}</h3>
        <p class="task-meta">Status: ${task.completed ? "Completed" : "Pending"}</p>
      </div>
      <div class="task-actions">
        <button class="secondary-button" data-action="edit" data-id="${task._id}" data-title="${task.title}">
          Edit
        </button>
        <button class="secondary-button" data-action="toggle" data-id="${task._id}" data-completed="${task.completed}">
          ${task.completed ? "Mark Pending" : "Mark Complete"}
        </button>
        <button class="danger-button" data-action="delete" data-id="${task._id}">Delete</button>
      </div>
    `;
    taskList.appendChild(listItem);
  });
};

const loadTasks = async () => {
  try {
    const data = await apiRequest(`${tasksUrl}?page=1&limit=20`);
    renderTasks(data.data);
  } catch (error) {
    if (error.message !== "Authentication required") {
      showMessage(error.message, "error");
    }
  }
};

taskForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const titleInput = document.getElementById("taskTitle");

  try {
    await apiRequest(tasksUrl, {
      method: "POST",
      body: JSON.stringify({ title: titleInput.value }),
    });

    titleInput.value = "";
    showMessage("Task created successfully.");
    await loadTasks();
  } catch (error) {
    if (error.message !== "Authentication required") {
      showMessage(error.message, "error");
    }
  }
});

taskList?.addEventListener("click", async (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const taskId = button.dataset.id;
  const action = button.dataset.action;

  try {
    if (action === "edit") {
      const currentTitle = button.dataset.title || "";
      const updatedTitle = window.prompt("Edit task title:", currentTitle);

      if (updatedTitle === null) {
        return;
      }

      await apiRequest(`${tasksUrl}/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ title: updatedTitle }),
      });
      showMessage("Task title updated successfully.");
    }

    if (action === "delete") {
      await apiRequest(`${tasksUrl}/${taskId}`, {
        method: "DELETE",
      });
      showMessage("Task deleted successfully.");
    }

    if (action === "toggle") {
      const currentStatus = button.dataset.completed === "true";
      await apiRequest(`${tasksUrl}/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !currentStatus }),
      });
      showMessage("Task updated successfully.");
    }

    await loadTasks();
  } catch (error) {
    if (error.message !== "Authentication required") {
      showMessage(error.message, "error");
    }
  }
});

refreshButton?.addEventListener("click", loadTasks);

logoutButton?.addEventListener("click", () => {
  clearAuthAndRedirect();
});

loadTasks();
