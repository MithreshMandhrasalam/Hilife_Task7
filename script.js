var employees = [
  { id: "EMP101", name: "Arun",      dob: "1999-02-15", gender: "Male",   department: "Software Development",    role: "Frontend Developer",      email: "arun@example.com",      status: "Present" },
  { id: "EMP102", name: "Priya",     dob: "1998-07-22", gender: "Female", department: "Web Development",         role: "UI/UX Designer",          email: "priya@example.com",     status: "Present" },
  { id: "EMP103", name: "Karthik",   dob: "1997-11-10", gender: "Male",   department: "Cyber Security",          role: "Security Analyst",        email: "karthik@example.com",   status: "Present" },
  { id: "EMP104", name: "Divya",     dob: "2000-04-03", gender: "Female", department: "Data Science",            role: "Data Analyst",            email: "divya@example.com",     status: "Present" },
  { id: "EMP105", name: "Surya",     dob: "1996-09-18", gender: "Male",   department: "Cloud Computing",         role: "Cloud Engineer",          email: "surya@example.com",     status: "On Permission" },
  { id: "EMP106", name: "Keerthi",   dob: "1999-01-27", gender: "Female", department: "Artificial Intelligence", role: "ML Engineer",             email: "keerthi@example.com",   status: "Present" },
  { id: "EMP107", name: "Vignesh",   dob: "1998-06-05", gender: "Male",   department: "IT Support",              role: "System Administrator",    email: "vignesh@example.com",   status: "Present" },
  { id: "EMP108", name: "Nisha",     dob: "2001-12-14", gender: "Female", department: "Mobile App Development",  role: "Android Developer",       email: "nisha@example.com",     status: "Present" },
  { id: "EMP109", name: "Hari",      dob: "1997-08-29", gender: "Male",   department: "DevOps",                  role: "DevOps Engineer",         email: "hari@example.com",      status: "On Leave" },
  { id: "EMP110", name: "Aishwarya", dob: "2000-03-11", gender: "Female", department: "Database Management",     role: "Database Administrator",  email: "aishwarya@example.com", status: "Present" }
];

// ── Stopwatch state ────────────────────────────────────────────────────────────
var clockTimer       = null;   // interval for the greeting clock display
var timerId          = null;   // interval for the stopwatch tick
var isRunning        = false;
var startTime        = 0;
var accumulatedTime  = 0;
var lapCounter       = 0;
var laps             = [];

// ── BUG FIX #1: declare attendanceInterval at the top so it is always defined ─
var attendanceInterval = null;

// ── App boot ──────────────────────────────────────────────────────────────────
window.onload = function () {
  // Seed a default account if none exist
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (Object.keys(users).length === 0) {
    users["hilife"] = {
      firstName: "HiLife",
      lastName:  "User",
      email:     "user@hilife.ai",
      password:  "password123"
    };
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Restore "Remember me" username
  var rem = localStorage.getItem("rememberedUsername");
  if (rem) {
    document.getElementById("signin-username").value = rem;
    document.getElementById("signin-remember").checked = true;
  }

  // Auto-login: go straight to dashboard WITHOUT showing the greeting popup
  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    var storedUsers = JSON.parse(localStorage.getItem("users") || "{}");
    if (storedUsers[currentUser]) {
      showDashboard(currentUser, storedUsers[currentUser].firstName + " " + storedUsers[currentUser].lastName);
    } else {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }

  // Filter event listeners
  document.getElementById("searchName").addEventListener("input",  applyFilters);
  document.getElementById("filterDept").addEventListener("change", applyFilters);
  document.getElementById("filterRole").addEventListener("change", applyFilters);
  document.getElementById("filterGender").addEventListener("change", applyFilters);
  document.getElementById("filterStatus").addEventListener("change", applyFilters);
  document.getElementById("clearBtn").addEventListener("click",    clearFilters);

  // Stopwatch event listeners
  document.getElementById("startStopBtn").addEventListener("click", toggleStopwatch);
  document.getElementById("lapBtn").addEventListener("click",       addStopwatchLap);
  document.getElementById("resetBtn").addEventListener("click",     resetStopwatch);
};

// ── Screen helpers ────────────────────────────────────────────────────────────
function showLoginScreen() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
  // Use class-based hide so display:flex in .overlay is not overridden by HTML hidden attr
  document.getElementById("greeting-overlay").classList.add("overlay-hidden");

  // Stop the live-stats interval when leaving the dashboard
  if (attendanceInterval) {
    clearInterval(attendanceInterval);
    attendanceInterval = null;
  }
}

function showDashboard(username, fullName) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard-screen").classList.remove("hidden");
  document.getElementById("user-greeting").textContent = "Hello, " + fullName;

  updateClockUI(username);
  updateAttendanceStats(username);

  // BUG FIX #3: start a live-updating interval so the "Total Work Today"
  //             counter ticks in real time while the user is clocked in.
  if (attendanceInterval) clearInterval(attendanceInterval);
  attendanceInterval = setInterval(function () {
    var u = localStorage.getItem("currentUser");
    if (u) updateAttendanceStats(u);
  }, 1000);

  var savedTab = localStorage.getItem("active_tab_" + username) || "directory";
  switchDashboardTab(savedTab);
}

// ── Tab switching ─────────────────────────────────────────────────────────────
function switchLoginTab(tab) {
  var isSign = tab === "signin";
  document.getElementById("tab-signin").classList.toggle("active",  isSign);
  document.getElementById("tab-signup").classList.toggle("active",  !isSign);
  document.getElementById("panel-signin").classList.toggle("active", isSign);
  document.getElementById("panel-signup").classList.toggle("active", !isSign);
}

function switchDashboardTab(tab) {
  var isDirectory = tab === "directory";
  var currentUser = localStorage.getItem("currentUser") || "hilife";

  localStorage.setItem("active_tab_" + currentUser, tab);

  document.getElementById("tab-btn-directory").classList.toggle("active", isDirectory);
  document.getElementById("tab-btn-timer").classList.toggle("active",     !isDirectory);
  document.getElementById("directory-tab").classList.toggle("active",     isDirectory);
  document.getElementById("timer-tab").classList.toggle("active",         !isDirectory);

  if (isDirectory) {
    showTable(employees);
    clearFilters();
  } else {
    loadStopwatchState();
    updateAttendanceStats(currentUser);
  }
}

// ── Password toggle ───────────────────────────────────────────────────────────
function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "Show" : "Hide";
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function handleSignIn(e) {
  e.preventDefault();
  var u = document.getElementById("signin-username").value.trim();
  var p = document.getElementById("signin-password").value;
  if (!u || !p) return alert("Please fill in all fields.");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[u] || users[u].password !== p) return alert("Invalid username or password.");
  if (document.getElementById("signin-remember").checked) {
    localStorage.setItem("rememberedUsername", u);
  } else {
    localStorage.removeItem("rememberedUsername");
  }
  localStorage.setItem("currentUser", u);
  showGreeting(u, users[u].firstName + " " + users[u].lastName);
  document.getElementById("signin-username").value = "";
  document.getElementById("signin-password").value = "";
}

function handleSignUp(e) {
  e.preventDefault();
  var f  = document.getElementById("signup-firstname").value.trim();
  var l  = document.getElementById("signup-lastname").value.trim();
  var u  = document.getElementById("signup-username").value.trim();
  var em = document.getElementById("signup-email").value.trim();
  var p  = document.getElementById("signup-password").value;
  var c  = document.getElementById("signup-confirm").value;
  if (!f || !l || !u || !em || !p || !c) return alert("Please fill in all fields.");
  if (p.length < 6)  return alert("Password must be at least 6 characters.");
  if (p !== c)       return alert("Passwords do not match.");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[u])      return alert("Username is already taken.");
  users[u] = { firstName: f, lastName: l, email: em, password: p };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", u);
  showGreeting(u, f + " " + l);
  ["signup-firstname","signup-lastname","signup-username","signup-email","signup-password","signup-confirm"]
    .forEach(function (id) { document.getElementById(id).value = ""; });
}

function handleSignOut() {
  // Stop the stopwatch if running
  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;
    saveStopwatchState();
  }
  // Stop the live-stats interval
  if (attendanceInterval) {
    clearInterval(attendanceInterval);
    attendanceInterval = null;
  }
  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) localStorage.removeItem("active_tab_" + currentUser);
  localStorage.removeItem("currentUser");
  showLoginScreen();
}

function forgotPassword() {
  var u = document.getElementById("signin-username").value.trim();
  if (!u) return alert("Please enter your username first.");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[u]) return alert("No account found with that username.");
  alert("Password reset link sent to: " + users[u].email);
}

// ── Time-based greeting ───────────────────────────────────────────────────────
function getGreeting() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12)  return "Good Morning,";
  if (hour >= 12 && hour < 17) return "Good Afternoon,";
  if (hour >= 17 && hour < 21) return "Good Evening,";
  return "Good Night,";
}

// ── Greeting overlay ──────────────────────────────────────────────────────────
function showGreeting(username, name) {
  // Set time-based greeting text
  document.getElementById("greeting-text").textContent = getGreeting();
  document.getElementById("greeting-name").textContent = name;

  // Show real system time (not a timer/stopwatch)
  var timeEl = document.getElementById("greeting-time");
  function updateClock() {
    var now  = new Date();
    var hrs  = now.getHours();
    var mins = now.getMinutes();
    var secs = now.getSeconds();
    var ampm = hrs >= 12 ? "PM" : "AM";
    hrs = hrs % 12 || 12;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    timeEl.textContent = pad(hrs) + ":" + pad(mins) + ":" + pad(secs) + " " + ampm;
    // Also update the greeting in case the clock ticks past midnight etc.
    document.getElementById("greeting-text").textContent = getGreeting();
  }
  updateClock(); // set immediately so no flash of --:--:--
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);

  // Show the overlay
  document.getElementById("greeting-overlay").classList.remove("overlay-hidden");
  updateClockUI(username);
}

function closeGreeting() {
  document.getElementById("greeting-overlay").classList.add("overlay-hidden");
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  var currentUser = localStorage.getItem("currentUser");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (currentUser && users[currentUser]) {
    showDashboard(currentUser, users[currentUser].firstName + " " + users[currentUser].lastName);
  }
}

// ── Clock In / Out ────────────────────────────────────────────────────────────
function handleClockToggle() {
  var u = localStorage.getItem("currentUser");
  if (!u) return;

  var time    = new Date().toLocaleTimeString("en-IN");
  var dateStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  var clockData  = JSON.parse(localStorage.getItem("clock") || "{}");
  var currentStatus = (clockData[u] && clockData[u].status) || "Out";
  var nextStatus = currentStatus === "In" ? "Out" : "In";

  clockData[u] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));

  var logsKey = "attendance_logs_" + u;
  var logs = JSON.parse(localStorage.getItem(logsKey) || "[]");

  if (nextStatus === "In") {
    logs.push({
      date:     dateStr,
      clockIn:  time,
      clockOut: null,
      rawIn:    Date.now(),
      rawOut:   null,
      duration: null
    });
  } else {
    var activeSession = null;
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].clockOut === null) { activeSession = logs[i]; break; }
    }
    if (activeSession) {
      activeSession.clockOut = time;
      activeSession.rawOut   = Date.now();
      activeSession.duration = activeSession.rawOut - activeSession.rawIn;
    } else {
      // Safety fallback: should not normally happen
      logs.push({ date: dateStr, clockIn: time, clockOut: time,
                  rawIn: Date.now(), rawOut: Date.now(), duration: 0 });
    }
  }
  localStorage.setItem(logsKey, JSON.stringify(logs));

  // Show confirmation only when the popup is not visible
  if (document.getElementById("greeting-overlay").hidden === true) {
    alert("You clocked " + nextStatus + " successfully at " + time + "!");
  }

  updateClockUI(u);
  updateAttendanceStats(u);
}

function handleHeaderClockToggle() {
  handleClockToggle();
}

// ── BUG FIX #4: updateClockUI – replace missing CSS vars with real hex colors ─
function updateClockUI(username) {
  var clock = (JSON.parse(localStorage.getItem("clock") || "{}")[username]) || { status: "Out", time: "None" };
  var isClockedIn = clock.status === "In";

  var statusEl = document.getElementById("clock-status");
  if (statusEl) {
    statusEl.textContent = "Clocked " + clock.status + " at " + clock.time;
    // BUG FIX: was using var(--success-color) / var(--danger-color) which don't exist
    statusEl.style.color = isClockedIn ? "#28a745" : "#dc3545";
  }

  var toggleBtn = document.getElementById("clock-toggle-btn");
  if (toggleBtn) {
    toggleBtn.textContent = isClockedIn ? "Clock Out" : "Clock In";
    toggleBtn.className   = isClockedIn ? "btn-primary clocked-in" : "btn-primary clocked-out";
  }

  var headerStatus = document.getElementById("header-clock-status");
  if (headerStatus) {
    headerStatus.textContent = "Clocked " + clock.status;
    headerStatus.className   = "status-indicator " + (isClockedIn ? "clocked-in" : "clocked-out");
  }

  var headerBtn = document.getElementById("header-clock-btn");
  if (headerBtn) {
    headerBtn.textContent = isClockedIn ? "Clock Out" : "Clock In";
  }
}

// ── Attendance stats ──────────────────────────────────────────────────────────
function formatDuration(ms) {
  if (!ms || ms < 0) return "00h 00m 00s";
  var s       = Math.floor(ms / 1000);
  var hours   = Math.floor(s / 3600);
  var minutes = Math.floor((s % 3600) / 60);
  var seconds = s % 60;
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  return pad(hours) + "h " + pad(minutes) + "m " + pad(seconds) + "s";
}

function updateAttendanceStats(username) {
  if (!username) return;

  var logsKey  = "attendance_logs_" + username;
  var logs     = JSON.parse(localStorage.getItem(logsKey) || "[]");
  var todayStr = new Date().toLocaleDateString("en-CA");

  // Find any currently-active (open) session
  var activeSession = null;
  for (var k = 0; k < logs.length; k++) {
    if (logs[k].clockOut === null) { activeSession = logs[k]; break; }
  }
  var isClockedIn = !!activeSession;

  // Sessions that belong to today OR the ongoing cross-midnight session
  var todayLogs = [];
  for (var i = 0; i < logs.length; i++) {
    if (logs[i].date === todayStr || logs[i] === activeSession) todayLogs.push(logs[i]);
  }

  var firstIn      = "--:--";
  var lastOut      = "--:--";
  var totalWorkMs  = 0;

  if (todayLogs.length > 0) {
    firstIn = todayLogs[0].clockIn;
    for (var j = 0; j < todayLogs.length; j++) {
      var log = todayLogs[j];
      if (log.clockOut) {
        totalWorkMs += log.duration;
        lastOut      = log.clockOut;
      } else {
        // Active session: count elapsed time right now
        totalWorkMs += (Date.now() - log.rawIn);
      }
    }
  }

  // Status widget
  var statsStatus = document.getElementById("stats-status");
  if (statsStatus) {
    statsStatus.textContent = isClockedIn ? "Clocked In" : "Clocked Out";
    statsStatus.className   = "stat-value " + (isClockedIn ? "clocked-in" : "clocked-out");
  }

  var statsFirstIn = document.getElementById("stats-first-in");
  if (statsFirstIn) statsFirstIn.textContent = firstIn;

  var statsLastOut = document.getElementById("stats-last-out");
  if (statsLastOut) statsLastOut.textContent = lastOut;

  var statsWork = document.getElementById("stats-work-hours");
  if (statsWork) statsWork.textContent = formatDuration(totalWorkMs);

  // Daily goal (8 hours = 28 800 000 ms)
  var targetMs    = 8 * 60 * 60 * 1000;
  var percentage  = Math.min(100, Math.floor((totalWorkMs / targetMs) * 100));
  var hoursRaw    = (totalWorkMs / (3600 * 1000)).toFixed(2);

  var goalPerc = document.getElementById("goal-percentage");
  if (goalPerc) goalPerc.textContent = percentage + "% (" + hoursRaw + " / 8 hrs)";

  var progressFill = document.getElementById("goal-progress-fill");
  if (progressFill) progressFill.style.width = percentage + "%";

  // Attendance log table
  var tbody     = document.getElementById("attendanceLogsBody");
  var noLogsMsg = document.getElementById("noAttendanceLogs");

  if (tbody) {
    tbody.innerHTML = "";
    if (todayLogs.length === 0) {
      if (noLogsMsg) noLogsMsg.style.display = "block";
    } else {
      if (noLogsMsg) noLogsMsg.style.display = "none";
      for (var m = 0; m < todayLogs.length; m++) {
        var item = todayLogs[m];
        // BUG FIX #5: live-calculate duration for the active row
        var rowDuration    = item.clockOut ? formatDuration(item.duration) : formatDuration(Date.now() - item.rawIn);
        var outText        = item.clockOut ? item.clockOut : "Active";
        var badgeClass     = item.clockOut ? "badge active" : "badge on-leave";
        var statusLabel    = item.clockOut ? "Completed"   : "Active";

        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + item.clockIn  + "</td>" +
          "<td>" + outText       + "</td>" +
          "<td>" + rowDuration   + "</td>" +
          "<td><span class='" + badgeClass + "'>" + statusLabel + "</span></td>";
        tbody.appendChild(tr);
      }
    }
  }
}

// ── Employee directory ────────────────────────────────────────────────────────
function calculateAge(dob) {
  var today     = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m   = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function buildTableRows(employeeList) {
  var html = "";
  for (var i = 0; i < employeeList.length; i++) {
    var emp = employeeList[i];
    var formattedDOB = emp.dob.split("-").reverse().join("-");
    var badgeClass = emp.status === "Present"
      ? "badge active"
      : emp.status === "On Leave"
        ? "badge on-leave"
        : "badge on-permission";
    html +=
      "<tr>" +
      "<td>" + emp.id + "</td>" +
      "<td>" + emp.name + "</td>" +
      "<td>" + formattedDOB + "</td>" +
      "<td>" + calculateAge(emp.dob) + "</td>" +
      "<td>" + emp.gender + "</td>" +
      "<td>" + emp.department + "</td>" +
      "<td>" + emp.role + "</td>" +
      "<td>" + emp.email + "</td>" +
      "<td><span class='" + badgeClass + "'>" + emp.status + "</span></td>" +
      "</tr>";
  }
  return html;
}

function showTable(filteredList) {
  document.getElementById("resultCount").textContent    = filteredList.length;
  document.getElementById("tableBody").innerHTML        = buildTableRows(filteredList);
  document.getElementById("noResult").classList.toggle("hidden", filteredList.length > 0);
}

function applyFilters() {
  var searchText = document.getElementById("searchName").value.toLowerCase().trim();
  var dept       = document.getElementById("filterDept").value;
  var role       = document.getElementById("filterRole").value;
  var gender     = document.getElementById("filterGender").value;
  var status     = document.getElementById("filterStatus").value;
  var filtered   = [];
  for (var i = 0; i < employees.length; i++) {
    var emp = employees[i];
    var matchName   = emp.name.toLowerCase().indexOf(searchText) !== -1 ||
                      emp.id.toLowerCase().indexOf(searchText) !== -1;
    var matchDept   = !dept   || emp.department === dept;
    var matchRole   = !role   || emp.role       === role;
    var matchGender = !gender || emp.gender     === gender;
    var matchStatus = !status || emp.status     === status;
    if (matchName && matchDept && matchRole && matchGender && matchStatus) filtered.push(emp);
  }
  showTable(filtered);
}

function clearFilters() {
  ["searchName","filterDept","filterRole","filterGender","filterStatus"].forEach(function (id) {
    document.getElementById(id).value = "";
  });
  showTable(employees);
}

// ── Stopwatch ─────────────────────────────────────────────────────────────────
function getStopwatchKey(key) {
  return "stopwatch_" + (localStorage.getItem("currentUser") || "default") + "_" + key;
}

function formatTime(totalMs) {
  var s   = Math.floor(totalMs / 1000);
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
}

function tickStopwatch() {
  document.getElementById("display").textContent = formatTime(accumulatedTime + (Date.now() - startTime));
}

function saveStopwatchState() {
  localStorage.setItem(getStopwatchKey("isRunning"),       isRunning);
  localStorage.setItem(getStopwatchKey("startTime"),       startTime);
  localStorage.setItem(getStopwatchKey("accumulatedTime"), accumulatedTime);
  localStorage.setItem(getStopwatchKey("laps"),            JSON.stringify(laps));
}

function loadStopwatchState() {
  if (timerId) { clearInterval(timerId); timerId = null; }

  laps       = JSON.parse(localStorage.getItem(getStopwatchKey("laps"))) || [];
  lapCounter = laps.length;

  var lapsList = document.getElementById("lapsList");
  lapsList.innerHTML = "";
  for (var i = 0; i < laps.length; i++) {
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap " + (i + 1) + "</span><span>" + laps[i] + "</span>";
    lapsList.insertBefore(li, lapsList.firstChild);
  }

  isRunning       = localStorage.getItem(getStopwatchKey("isRunning")) === "true";
  startTime       = parseInt(localStorage.getItem(getStopwatchKey("startTime")),       10) || 0;
  accumulatedTime = parseInt(localStorage.getItem(getStopwatchKey("accumulatedTime")), 10) || 0;

  var btn         = document.getElementById("startStopBtn");
  var displayTime = accumulatedTime;

  if (isRunning) {
    displayTime += Date.now() - startTime;
    timerId      = setInterval(tickStopwatch, 1000);
    btn.textContent = "Stop";
    btn.className   = "btn stop";
  } else {
    btn.textContent = "Start";
    btn.className   = "btn start";
  }
  document.getElementById("display").textContent = formatTime(displayTime);
}

function toggleStopwatch() {
  var btn = document.getElementById("startStopBtn");
  if (!isRunning) {
    isRunning       = true;
    startTime       = Date.now();
    timerId         = setInterval(tickStopwatch, 1000);
    tickStopwatch();
    btn.textContent = "Stop";
    btn.className   = "btn stop";
  } else {
    isRunning       = false;
    clearInterval(timerId);
    timerId         = null;
    accumulatedTime += Date.now() - startTime;
    btn.textContent = "Start";
    btn.className   = "btn start";
  }
  saveStopwatchState();
}

function addStopwatchLap() {
  var elapsed = accumulatedTime + (isRunning ? Date.now() - startTime : 0);
  if (elapsed > 0) {
    lapCounter++;
    var timeString = formatTime(elapsed);
    laps.push(timeString);
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap " + lapCounter + "</span><span>" + timeString + "</span>";
    document.getElementById("lapsList").insertBefore(li, document.getElementById("lapsList").firstChild);
    saveStopwatchState();
  }
}

function resetStopwatch() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  isRunning = false;
  startTime = accumulatedTime = lapCounter = 0;
  laps      = [];

  document.getElementById("display").textContent     = "00:00:00";
  document.getElementById("startStopBtn").textContent = "Start";
  document.getElementById("startStopBtn").className   = "btn start";
  document.getElementById("lapsList").innerHTML        = "";

  ["isRunning","startTime","accumulatedTime","laps"].forEach(function (key) {
    localStorage.removeItem(getStopwatchKey(key));
  });
}
