const API = "http://localhost:3000";

function isLoggedIn() {
  return !!localStorage.getItem("user");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function updateNavbar() {
  const authLinks = document.getElementById("authLinks");
  const profileLinks = document.getElementById("profileLinks");
  if (!authLinks || !profileLinks) return;

  if (isLoggedIn()) {
    authLinks.style.display = "none";
    profileLinks.style.display = "flex";
  } else {
    authLinks.style.display = "flex";
    profileLinks.style.display = "none";
  }
}

function handleGuards() {
  const path = window.location.pathname;

  if ((path.includes("login.html") || path.includes("signup.html")) && isLoggedIn()) {
    window.location.href = "dashboard.html";
  }

  if (path.includes("dashboard.html") && !isLoggedIn()) {
    window.location.href = "login.html";
  }
}

function personalizeDashboard() {
  const welcome = document.getElementById("welcomeText");
  if (welcome && isLoggedIn()) {
    welcome.textContent = `Welcome back, ${localStorage.getItem("user")}`;
  }
}

async function loadDashboardStats() {
  const reportedEl = document.getElementById("reportedCount");
  const claimedEl = document.getElementById("claimedCount");
  if (!reportedEl || !claimedEl) return;

  const res = await fetch(API + "/found");
  const items = await res.json();

  reportedEl.textContent = items.length;
  claimedEl.textContent = items.filter(i => i.claimed).length;
}

document.addEventListener("DOMContentLoaded", () => {
  handleGuards();
  updateNavbar();
  personalizeDashboard();
  loadDashboardStats();
});

document.getElementById("loginForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = e.target.querySelector("input").value;
  localStorage.setItem("user", email);
  window.location.href = "dashboard.html";
});

document.getElementById("signupForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const email = e.target.querySelector("input").value;
  localStorage.setItem("user", email);
  window.location.href = "dashboard.html";
});

document.getElementById("foundForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const item = document.getElementById("itemName").value.trim();
  const location = document.getElementById("locationFound").value.trim();
  const keptAt = document.getElementById("keptAt").value;
  const identifiers = document.getElementById("identifiers").value
    .split(",")
    .map(i => i.trim())
    .filter(Boolean);

  if (!item || !location || !keptAt || identifiers.length === 0) return;

  await fetch(API + "/found", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item, location, keptAt, identifiers })
  });

  alert("Found item submitted successfully");
  location.reload();
});

document.getElementById("searchForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const itemQuery = document.getElementById("searchItem").value.toLowerCase();
  const locationQuery = document.getElementById("searchLocation").value.toLowerCase();

  const res = await fetch(API + "/found");
  const items = await res.json();

  const results = document.getElementById("results");
  results.innerHTML = "";

  items.forEach((item, index) => {
    if (
      item.item.toLowerCase().includes(itemQuery) &&
      item.location.toLowerCase().includes(locationQuery)
    ) {
      results.innerHTML += `
        <div class="card">
          <h3>${item.item}</h3>
          <p>Location Found: ${item.location}</p>
          <p>Item Kept At: ${item.keptAt}</p>
          <p>Status: ${item.claimed ? "Claimed" : "Available"}</p>
          ${item.claimed ? "" : `<button class="btn outline" onclick="claimItem(${index})">Claim</button>`}
        </div>
      `;
    }
  });
});

async function claimItem(index) {
  const enteredDetail = prompt("Enter identifying detail");
  if (!enteredDetail) return;

  const res = await fetch(API + "/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, enteredDetail })
  });

  const result = await res.json();

  if (result.success) {
    alert("Congratulations! You have successfully claimed the item.");
    location.reload();
  } else {
    alert(result.message);
  }
}
