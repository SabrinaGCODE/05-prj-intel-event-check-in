// Intel Sustainability Summit Check-In App (LEVEL UP VERSION)

// ----- Grab elements -----
const checkInForm = document.getElementById("checkInForm");
const attendeeNameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

const greeting = document.getElementById("greeting");

const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

const waterCountEl = document.getElementById("waterCount");
const zeroCountEl = document.getElementById("zeroCount");
const powerCountEl = document.getElementById("powerCount");

// Team cards (for highlighting the leader)
const waterCard = document.querySelector(".team-card.water");
const zeroCard = document.querySelector(".team-card.zero");
const powerCard = document.querySelector(".team-card.power");

// ----- Level Up: add UI elements (no HTML edits needed) -----
const container = document.querySelector(".container");

// Celebration message box
const celebration = document.createElement("div");
celebration.id = "celebration";
celebration.style.marginTop = "12px";
celebration.style.fontWeight = "700";
celebration.style.textAlign = "center";
celebration.style.fontSize = "18px";
celebration.style.display = "none";

// Attendee log
const logWrap = document.createElement("div");
logWrap.style.marginTop = "18px";

const logTitle = document.createElement("h3");
logTitle.textContent = "Recent Check-Ins";
logTitle.style.textAlign = "center";
logTitle.style.marginBottom = "10px";

const attendeeLog = document.createElement("div");
attendeeLog.id = "attendeeLog";
attendeeLog.style.display = "grid";
attendeeLog.style.gap = "8px";

// Insert right under greeting, above the form
greeting.insertAdjacentElement("afterend", celebration);

// Insert attendee log at bottom of container (after team stats area)
container.appendChild(logWrap);
logWrap.appendChild(logTitle);
logWrap.appendChild(attendeeLog);

// Accessibility: make greeting announce updates
greeting.setAttribute("aria-live", "polite");
celebration.setAttribute("aria-live", "polite");

// ----- App state -----
const GOAL = 50;
const STORAGE_KEY = "intel_summit_checkin_state_v1";

let totalAttendees = 0;
let teamCounts = {
  water: 0, // Team Water Wise
  zero: 0, // Team Net Zero
  power: 0, // Team Renewables
};

// Attendee list (Level Up)
let attendees = []; // { name, team, time }

// ----- Helpers -----
function teamLabel(teamValue) {
  if (teamValue === "water") return "Team Water Wise";
  if (teamValue === "zero") return "Team Net Zero";
  if (teamValue === "power") return "Team Renewables";
  return "Unknown Team";
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ----- localStorage (Level Up) -----
function saveState() {
  const state = { totalAttendees, teamCounts, attendees };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);
    if (typeof state.totalAttendees === "number")
      totalAttendees = state.totalAttendees;

    if (state.teamCounts && typeof state.teamCounts === "object") {
      teamCounts.water = Number(state.teamCounts.water) || 0;
      teamCounts.zero = Number(state.teamCounts.zero) || 0;
      teamCounts.power = Number(state.teamCounts.power) || 0;
    }

    if (Array.isArray(state.attendees)) {
      attendees = state.attendees;
    }
  } catch (err) {
    console.warn("Could not load saved state:", err);
  }
}

// ----- UI updates -----
function updateProgress() {
  const percent = Math.min(100, (totalAttendees / GOAL) * 100);
  progressBar.style.width = `${percent}%`;
}

function updateCounts() {
  attendeeCountEl.textContent = totalAttendees;
  waterCountEl.textContent = teamCounts.water;
  zeroCountEl.textContent = teamCounts.zero;
  powerCountEl.textContent = teamCounts.power;
}

function highlightLeader() {
  // reset styles
  [waterCard, zeroCard, powerCard].forEach((card) => {
    if (!card) return;
    card.style.outline = "none";
    card.style.boxShadow = "none";
    card.style.transform = "none";
  });

  // find max
  const max = Math.max(teamCounts.water, teamCounts.zero, teamCounts.power);

  // if everyone is 0, no leader
  if (max === 0) return;

  // highlight any tied leaders
  if (teamCounts.water === max && waterCard) applyLeaderStyle(waterCard);
  if (teamCounts.zero === max && zeroCard) applyLeaderStyle(zeroCard);
  if (teamCounts.power === max && powerCard) applyLeaderStyle(powerCard);
}

function applyLeaderStyle(card) {
  card.style.outline = "3px solid rgba(0, 102, 204, 0.65)";
  card.style.boxShadow = "0 10px 24px rgba(0, 0, 0, 0.12)";
  card.style.transform = "translateY(-2px)";
}

function renderAttendeeLog() {
  attendeeLog.innerHTML = "";

  // show most recent first, limit to 10
  const latest = [...attendees].slice(-10).reverse();

  latest.forEach((a) => {
    const item = document.createElement("div");
    item.style.padding = "10px 12px";
    item.style.borderRadius = "10px";
    item.style.background = "#ffffff";
    item.style.border = "1px solid rgba(0,0,0,0.08)";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.gap = "12px";

    const left = document.createElement("div");
    left.textContent = `${a.name} — ${teamLabel(a.team)}`;

    const right = document.createElement("div");
    right.style.opacity = "0.7";
    right.style.fontSize = "14px";
    right.textContent = formatTime(a.time);

    item.appendChild(left);
    item.appendChild(right);
    attendeeLog.appendChild(item);
  });
}

function maybeCelebrate() {
  if (totalAttendees >= GOAL) {
    const winners = getWinningTeams();
    celebration.style.display = "block";
    celebration.textContent = `🎉 Goal reached! Winning team: ${winners} 🎉`;
  } else {
    celebration.style.display = "none";
    celebration.textContent = "";
  }
}

function getWinningTeams() {
  const entries = [
    { key: "water", label: "Team Water Wise", count: teamCounts.water },
    { key: "zero", label: "Team Net Zero", count: teamCounts.zero },
    { key: "power", label: "Team Renewables", count: teamCounts.power },
  ];

  const max = Math.max(...entries.map((e) => e.count));
  const tied = entries.filter((e) => e.count === max);

  if (tied.length > 1) return tied.map((t) => t.label).join(" + ");
  return tied[0].label;
}

function updateUI() {
  updateCounts();
  updateProgress();
  highlightLeader();
  renderAttendeeLog();
  maybeCelebrate();
}

// ----- Main event: form submit -----
checkInForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = attendeeNameInput.value.trim();
  const team = teamSelect.value; // "water" | "zero" | "power"

  if (!name) {
    greeting.textContent = "Please enter a name to check in 🙂";
    attendeeNameInput.focus();
    return;
  }

  if (!team) {
    greeting.textContent = "Please select a team 🙂";
    teamSelect.focus();
    return;
  }

  // update state
  totalAttendees += 1;
  teamCounts[team] += 1;

  attendees.push({
    name,
    team,
    time: Date.now(),
  });

  // update greeting
  greeting.textContent = `Welcome, ${name}! ✅ Checked in with ${teamLabel(team)}.`;

  updateUI();
  saveState();

  // reset inputs
  attendeeNameInput.value = "";
  teamSelect.selectedIndex = 0;
  attendeeNameInput.focus();
});

// ----- Init -----
loadState();
updateUI();
