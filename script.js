var employees = [
  { id: "EMP101", name: "Arun",      dob: "1999-02-15", gender: "Male",   department: "Software Development",    role: "Frontend Developer",     email: "arun@example.com",      status: "Present" },
  { id: "EMP102", name: "Priya",     dob: "1998-07-22", gender: "Female", department: "Web Development",         role: "UI/UX Designer",         email: "priya@example.com",     status: "Present" },
  { id: "EMP103", name: "Karthik",   dob: "1997-11-10", gender: "Male",   department: "Cyber Security",          role: "Security Analyst",       email: "karthik@example.com",   status: "Present" },
  { id: "EMP104", name: "Divya",     dob: "2000-04-03", gender: "Female", department: "Data Science",            role: "Data Analyst",           email: "divya@example.com",     status: "Present" },
  { id: "EMP105", name: "Surya",     dob: "1996-09-18", gender: "Male",   department: "Cloud Computing",         role: "Cloud Engineer",         email: "surya@example.com",     status: "On Permission" },
  { id: "EMP106", name: "Keerthi",   dob: "1999-01-27", gender: "Female", department: "Artificial Intelligence", role: "ML Engineer",            email: "keerthi@example.com",   status: "Present" },
  { id: "EMP107", name: "Vignesh",   dob: "1998-06-05", gender: "Male",   department: "IT Support",              role: "System Administrator",   email: "vignesh@example.com",   status: "Present" },
  { id: "EMP108", name: "Nisha",     dob: "2001-12-14", gender: "Female", department: "Mobile App Development",  role: "Android Developer",      email: "nisha@example.com",     status: "Present" },
  { id: "EMP109", name: "Hari",      dob: "1997-08-29", gender: "Male",   department: "DevOps",                  role: "DevOps Engineer",        email: "hari@example.com",      status: "On Leave" },
  { id: "EMP110", name: "Aishwarya", dob: "2000-03-11", gender: "Female", department: "Database Management",     role: "Database Administrator", email: "aishwarya@example.com", status: "Present" }
];

var clockTimer = null;
var stopwatchTimer = null;
var attendanceTimer = null;
var stopwatchRunning = false;
var stopwatchStart = 0;
var stopwatchTotal = 0;
var lapCount = 0;
var lapTimes = [];

window.onload = function () {
  var users = JSON.parse(localStorage.getItem("users") || "{}");

  if (Object.keys(users).length === 0) {
    users["hilife"] = {
      firstName: "HiLife",
      lastName: "User",
      email: "user@hilife.ai",
      password: "password123"
    };
    localStorage.setItem("users", JSON.stringify(users));
  }

  var savedUsername = localStorage.getItem("rememberedUsername");
  if (savedUsername) {
    document.getElementById("signin-username").value = savedUsername;
    document.getElementById("signin-remember").checked = true;
  }

  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    var allUsers = JSON.parse(localStorage.getItem("users") || "{}");
    if (allUsers[currentUser]) {
      var fullName = allUsers[currentUser].firstName + " " + allUsers[currentUser].lastName;
      showDashboard(currentUser, fullName);
    } else {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }

  document.getElementById("searchName").addEventListener("input", applyFilters);
  document.getElementById("filterDept").addEventListener("change", applyFilters);
  document.getElementById("filterRole").addEventListener("change", applyFilters);
  document.getElementById("filterGender").addEventListener("change", applyFilters);
  document.getElementById("filterStatus").addEventListener("change", applyFilters);
  document.getElementById("clearBtn").addEventListener("click", clearFilters);
  document.getElementById("startStopBtn").addEventListener("click", toggleStopwatch);
  document.getElementById("lapBtn").addEventListener("click", addLap);
  document.getElementById("resetBtn").addEventListener("click", resetStopwatch);
};

function showLoginScreen() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
  document.getElementById("greeting-overlay").classList.add("overlay-hidden");

  if (attendanceTimer) {
    clearInterval(attendanceTimer);
    attendanceTimer = null;
  }
}

function showDashboard(username, fullName) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard-screen").classList.remove("hidden");
  document.getElementById("user-greeting").textContent = "Hello, " + fullName;

  updateClockButtons(username);
  updateAttendanceStats(username);

  if (attendanceTimer) {
    clearInterval(attendanceTimer);
  }
  attendanceTimer = setInterval(function () {
    var user = localStorage.getItem("currentUser");
    if (user) {
      updateAttendanceStats(user);
    }
  }, 1000);

  var lastTab = localStorage.getItem("active_tab_" + username) || "directory";
  switchDashboardTab(lastTab);
}

function switchLoginTab(tab) {
  if (tab === "signin") {
    document.getElementById("tab-signin").classList.add("active");
    document.getElementById("tab-signup").classList.remove("active");
    document.getElementById("panel-signin").classList.add("active");
    document.getElementById("panel-signup").classList.remove("active");
  } else {
    document.getElementById("tab-signin").classList.remove("active");
    document.getElementById("tab-signup").classList.add("active");
    document.getElementById("panel-signin").classList.remove("active");
    document.getElementById("panel-signup").classList.add("active");
  }
}

function switchDashboardTab(tab) {
  var currentUser = localStorage.getItem("currentUser") || "hilife";
  localStorage.setItem("active_tab_" + currentUser, tab);

  if (tab === "directory") {
    document.getElementById("tab-btn-directory").classList.add("active");
    document.getElementById("tab-btn-timer").classList.remove("active");
    document.getElementById("directory-tab").classList.add("active");
    document.getElementById("timer-tab").classList.remove("active");
    showTable(employees);
    clearFilters();
  } else {
    document.getElementById("tab-btn-directory").classList.remove("active");
    document.getElementById("tab-btn-timer").classList.add("active");
    document.getElementById("directory-tab").classList.remove("active");
    document.getElementById("timer-tab").classList.add("active");
    loadStopwatchState();
    updateAttendanceStats(currentUser);
  }
}

function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
}

function handleSignIn(e) {
  e.preventDefault();

  var username = document.getElementById("signin-username").value.trim();
  var password = document.getElementById("signin-password").value;

  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }

  var users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[username] || users[username].password !== password) {
    alert("Invalid username or password.");
    return;
  }

  if (document.getElementById("signin-remember").checked) {
    localStorage.setItem("rememberedUsername", username);
  } else {
    localStorage.removeItem("rememberedUsername");
  }

  localStorage.setItem("currentUser", username);

  var fullName = users[username].firstName + " " + users[username].lastName;
  showGreeting(username, fullName);

  document.getElementById("signin-username").value = "";
  document.getElementById("signin-password").value = "";
}

function handleSignUp(e) {
  e.preventDefault();

  var firstName = document.getElementById("signup-firstname").value.trim();
  var lastName  = document.getElementById("signup-lastname").value.trim();
  var username  = document.getElementById("signup-username").value.trim();
  var email     = document.getElementById("signup-email").value.trim();
  var password  = document.getElementById("signup-password").value;
  var confirm   = document.getElementById("signup-confirm").value;

  if (!firstName || !lastName || !username || !email || !password || !confirm) {
    alert("Please fill in all fields.");
    return;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }
  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  var users = JSON.parse(localStorage.getItem("users") || "{}");

  if (users[username]) {
    alert("Username is already taken.");
    return;
  }

  users[username] = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password
  };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", username);

  showGreeting(username, firstName + " " + lastName);

  document.getElementById("signup-firstname").value = "";
  document.getElementById("signup-lastname").value  = "";
  document.getElementById("signup-username").value  = "";
  document.getElementById("signup-email").value     = "";
  document.getElementById("signup-password").value  = "";
  document.getElementById("signup-confirm").value   = "";
}

function handleSignOut() {
  if (stopwatchRunning) {
    clearInterval(stopwatchTimer);
    stopwatchRunning = false;
    saveStopwatchState();
  }
  if (attendanceTimer) {
    clearInterval(attendanceTimer);
    attendanceTimer = null;
  }

  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    localStorage.removeItem("active_tab_" + currentUser);
  }
  localStorage.removeItem("currentUser");
  showLoginScreen();
}

function forgotPassword() {
  var username = document.getElementById("signin-username").value.trim();

  if (!username) {
    alert("Please enter your username first.");
    return;
  }

  var users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[username]) {
    alert("No account found with that username.");
    return;
  }

  alert("Password reset link sent to: " + users[username].email);
}

function getGreeting() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning,";
  if (hour >= 12 && hour < 17) return "Good Afternoon,";
  if (hour >= 17 && hour < 21) return "Good Evening,";
  return "Good Night,";
}

function padTwo(number) {
  return number < 10 ? "0" + number : "" + number;
}

function showGreeting(username, name) {
  document.getElementById("greeting-text").textContent = getGreeting();
  document.getElementById("greeting-name").textContent = name;

  var timeDisplay = document.getElementById("greeting-time");

  function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    timeDisplay.textContent = padTwo(hours) + ":" + padTwo(minutes) + ":" + padTwo(seconds) + " " + ampm;
    document.getElementById("greeting-text").textContent = getGreeting();
  }

  updateClock();

  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(updateClock, 1000);

  document.getElementById("greeting-overlay").classList.remove("overlay-hidden");
  updateClockButtons(username);
}

function closeGreeting() {
  document.getElementById("greeting-overlay").classList.add("overlay-hidden");

  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }

  var currentUser = localStorage.getItem("currentUser");
  var users = JSON.parse(localStorage.getItem("users") || "{}");

  if (currentUser && users[currentUser]) {
    var fullName = users[currentUser].firstName + " " + users[currentUser].lastName;
    showDashboard(currentUser, fullName);
  }
}

function handleClockToggle() {
  var username = localStorage.getItem("currentUser");
  if (!username) return;

  var currentTime = new Date().toLocaleTimeString("en-IN");
  var currentDate = new Date().toLocaleDateString("en-CA");

  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var currentStatus = "Out";
  if (clockData[username]) {
    currentStatus = clockData[username].status;
  }
  var newStatus = currentStatus === "In" ? "Out" : "In";

  clockData[username] = { status: newStatus, time: currentTime };
  localStorage.setItem("clock", JSON.stringify(clockData));

  var logsKey = "attendance_logs_" + username;
  var logs = JSON.parse(localStorage.getItem(logsKey) || "[]");

  if (newStatus === "In") {
    var newSession = {
      date: currentDate,
      clockIn: currentTime,
      clockOut: null,
      rawIn: Date.now(),
      rawOut: null,
      duration: null
    };
    logs.push(newSession);
  } else {
    var activeSession = null;
    for (var i = 0; i < logs.length; i++) {
      if (logs[i].clockOut === null) {
        activeSession = logs[i];
        break;
      }
    }
    if (activeSession) {
      activeSession.clockOut = currentTime;
      activeSession.rawOut   = Date.now();
      activeSession.duration = activeSession.rawOut - activeSession.rawIn;
    } else {
      logs.push({
        date: currentDate,
        clockIn: currentTime,
        clockOut: currentTime,
        rawIn: Date.now(),
        rawOut: Date.now(),
        duration: 0
      });
    }
  }

  localStorage.setItem(logsKey, JSON.stringify(logs));

  var overlay = document.getElementById("greeting-overlay");
  if (overlay.classList.contains("overlay-hidden")) {
    alert("You clocked " + newStatus + " successfully at " + currentTime + "!");
  }

  updateClockButtons(username);
  updateAttendanceStats(username);
}

function handleHeaderClockToggle() {
  handleClockToggle();
}

function updateClockButtons(username) {
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var clockInfo = clockData[username] || { status: "Out", time: "None" };
  var isClockedIn = clockInfo.status === "In";

  var statusText = document.getElementById("clock-status");
  if (statusText) {
    statusText.textContent = "Clocked " + clockInfo.status + " at " + clockInfo.time;
    statusText.style.color = isClockedIn ? "#28a745" : "#dc3545";
  }

  var toggleBtn = document.getElementById("clock-toggle-btn");
  if (toggleBtn) {
    toggleBtn.textContent = isClockedIn ? "Clock Out" : "Clock In";
    toggleBtn.className   = isClockedIn ? "btn-primary clocked-in" : "btn-primary clocked-out";
  }

  var headerStatus = document.getElementById("header-clock-status");
  if (headerStatus) {
    headerStatus.textContent = "Clocked " + clockInfo.status;
    headerStatus.className   = "status-indicator " + (isClockedIn ? "clocked-in" : "clocked-out");
  }

  var headerBtn = document.getElementById("header-clock-btn");
  if (headerBtn) {
    headerBtn.textContent = isClockedIn ? "Clock Out" : "Clock In";
  }
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "00h 00m 00s";
  var totalSeconds = Math.floor(ms / 1000);
  var hours   = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;
  return padTwo(hours) + "h " + padTwo(minutes) + "m " + padTwo(seconds) + "s";
}

function updateAttendanceStats(username) {
  if (!username) return;

  var logsKey = "attendance_logs_" + username;
  var logs    = JSON.parse(localStorage.getItem(logsKey) || "[]");
  var today   = new Date().toLocaleDateString("en-CA");

  var activeSession = null;
  for (var k = 0; k < logs.length; k++) {
    if (logs[k].clockOut === null) {
      activeSession = logs[k];
      break;
    }
  }

  var isClockedIn = activeSession !== null;

  var todayLogs = [];
  for (var i = 0; i < logs.length; i++) {
    if (logs[i].date === today || logs[i] === activeSession) {
      todayLogs.push(logs[i]);
    }
  }

  var firstCheckIn  = "--:--";
  var lastCheckOut  = "--:--";
  var totalWorkedMs = 0;

  if (todayLogs.length > 0) {
    firstCheckIn = todayLogs[0].clockIn;
    for (var j = 0; j < todayLogs.length; j++) {
      var log = todayLogs[j];
      if (log.clockOut) {
        totalWorkedMs += log.duration;
        lastCheckOut   = log.clockOut;
      } else {
        totalWorkedMs += Date.now() - log.rawIn;
      }
    }
  }

  var statusEl = document.getElementById("stats-status");
  if (statusEl) {
    statusEl.textContent = isClockedIn ? "Clocked In" : "Clocked Out";
    statusEl.className   = "stat-value " + (isClockedIn ? "clocked-in" : "clocked-out");
  }

  var firstInEl = document.getElementById("stats-first-in");
  if (firstInEl) firstInEl.textContent = firstCheckIn;

  var lastOutEl = document.getElementById("stats-last-out");
  if (lastOutEl) lastOutEl.textContent = lastCheckOut;

  var workEl = document.getElementById("stats-work-hours");
  if (workEl) workEl.textContent = formatDuration(totalWorkedMs);

  var eightHoursMs = 8 * 60 * 60 * 1000;
  var percentage   = Math.min(100, Math.floor((totalWorkedMs / eightHoursMs) * 100));
  var hoursDecimal = (totalWorkedMs / 3600000).toFixed(2);

  var goalEl = document.getElementById("goal-percentage");
  if (goalEl) goalEl.textContent = percentage + "% (" + hoursDecimal + " / 8 hrs)";

  var barEl = document.getElementById("goal-progress-fill");
  if (barEl) barEl.style.width = percentage + "%";

  var tbody     = document.getElementById("attendanceLogsBody");
  var noLogsMsg = document.getElementById("noAttendanceLogs");

  if (!tbody) return;

  tbody.innerHTML = "";

  if (todayLogs.length === 0) {
    if (noLogsMsg) noLogsMsg.style.display = "block";
    return;
  }

  if (noLogsMsg) noLogsMsg.style.display = "none";

  for (var m = 0; m < todayLogs.length; m++) {
    var entry = todayLogs[m];
    var isCompleted = entry.clockOut !== null;
    var outTime     = isCompleted ? entry.clockOut : "Active";
    var duration    = isCompleted ? formatDuration(entry.duration) : formatDuration(Date.now() - entry.rawIn);
    var badge       = isCompleted ? "badge active" : "badge on-leave";
    var label       = isCompleted ? "Completed" : "Active";

    var row = document.createElement("tr");
    row.innerHTML = "<td>" + entry.clockIn + "</td>" +
                    "<td>" + outTime       + "</td>" +
                    "<td>" + duration      + "</td>" +
                    "<td><span class='" + badge + "'>" + label + "</span></td>";
    tbody.appendChild(row);
  }
}

function calculateAge(dob) {
  var today     = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function buildTableRows(list) {
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var emp = list[i];
    var dob = emp.dob.split("-").reverse().join("-");
    var badgeClass = "badge on-permission";
    if (emp.status === "Present") badgeClass = "badge active";
    if (emp.status === "On Leave") badgeClass = "badge on-leave";

    html += "<tr>" +
      "<td>" + emp.id         + "</td>" +
      "<td>" + emp.name       + "</td>" +
      "<td>" + dob            + "</td>" +
      "<td>" + calculateAge(emp.dob) + "</td>" +
      "<td>" + emp.gender     + "</td>" +
      "<td>" + emp.department + "</td>" +
      "<td>" + emp.role       + "</td>" +
      "<td>" + emp.email      + "</td>" +
      "<td><span class='" + badgeClass + "'>" + emp.status + "</span></td>" +
      "</tr>";
  }
  return html;
}

function showTable(list) {
  document.getElementById("resultCount").textContent = list.length;
  document.getElementById("tableBody").innerHTML     = buildTableRows(list);
  if (list.length > 0) {
    document.getElementById("noResult").classList.add("hidden");
  } else {
    document.getElementById("noResult").classList.remove("hidden");
  }
}

function applyFilters() {
  var searchText = document.getElementById("searchName").value.toLowerCase().trim();
  var dept       = document.getElementById("filterDept").value;
  var role       = document.getElementById("filterRole").value;
  var gender     = document.getElementById("filterGender").value;
  var status     = document.getElementById("filterStatus").value;

  var filtered = [];
  for (var i = 0; i < employees.length; i++) {
    var emp = employees[i];
    var nameMatch   = emp.name.toLowerCase().indexOf(searchText) !== -1 || emp.id.toLowerCase().indexOf(searchText) !== -1;
    var deptMatch   = dept   === "" || emp.department === dept;
    var roleMatch   = role   === "" || emp.role       === role;
    var genderMatch = gender === "" || emp.gender     === gender;
    var statusMatch = status === "" || emp.status     === status;

    if (nameMatch && deptMatch && roleMatch && genderMatch && statusMatch) {
      filtered.push(emp);
    }
  }

  showTable(filtered);
}

function clearFilters() {
  document.getElementById("searchName").value    = "";
  document.getElementById("filterDept").value    = "";
  document.getElementById("filterRole").value    = "";
  document.getElementById("filterGender").value  = "";
  document.getElementById("filterStatus").value  = "";
  showTable(employees);
}

function getStopwatchKey(key) {
  var user = localStorage.getItem("currentUser") || "default";
  return "stopwatch_" + user + "_" + key;
}

function formatStopwatchTime(totalMs) {
  var totalSeconds = Math.floor(totalMs / 1000);
  var hours   = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;
  return padTwo(hours) + ":" + padTwo(minutes) + ":" + padTwo(seconds);
}

function tickStopwatch() {
  var elapsed = stopwatchTotal + (Date.now() - stopwatchStart);
  document.getElementById("display").textContent = formatStopwatchTime(elapsed);
}

function saveStopwatchState() {
  localStorage.setItem(getStopwatchKey("isRunning"),       stopwatchRunning);
  localStorage.setItem(getStopwatchKey("startTime"),       stopwatchStart);
  localStorage.setItem(getStopwatchKey("accumulatedTime"), stopwatchTotal);
  localStorage.setItem(getStopwatchKey("laps"),            JSON.stringify(lapTimes));
}

function loadStopwatchState() {
  if (stopwatchTimer) {
    clearInterval(stopwatchTimer);
    stopwatchTimer = null;
  }

  lapTimes = JSON.parse(localStorage.getItem(getStopwatchKey("laps"))) || [];
  lapCount = lapTimes.length;

  var lapsList = document.getElementById("lapsList");
  lapsList.innerHTML = "";
  for (var i = 0; i < lapTimes.length; i++) {
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap " + (i + 1) + "</span><span>" + lapTimes[i] + "</span>";
    lapsList.insertBefore(li, lapsList.firstChild);
  }

  stopwatchRunning = localStorage.getItem(getStopwatchKey("isRunning")) === "true";
  stopwatchStart   = parseInt(localStorage.getItem(getStopwatchKey("startTime")),       10) || 0;
  stopwatchTotal   = parseInt(localStorage.getItem(getStopwatchKey("accumulatedTime")), 10) || 0;

  var btn = document.getElementById("startStopBtn");
  var displayTime = stopwatchTotal;

  if (stopwatchRunning) {
    displayTime += Date.now() - stopwatchStart;
    stopwatchTimer = setInterval(tickStopwatch, 1000);
    btn.textContent = "Stop";
    btn.className   = "btn stop";
  } else {
    btn.textContent = "Start";
    btn.className   = "btn start";
  }

  document.getElementById("display").textContent = formatStopwatchTime(displayTime);
}

function toggleStopwatch() {
  var btn = document.getElementById("startStopBtn");

  if (!stopwatchRunning) {
    stopwatchRunning = true;
    stopwatchStart   = Date.now();
    stopwatchTimer   = setInterval(tickStopwatch, 1000);
    tickStopwatch();
    btn.textContent = "Stop";
    btn.className   = "btn stop";
  } else {
    stopwatchRunning  = false;
    stopwatchTotal   += Date.now() - stopwatchStart;
    clearInterval(stopwatchTimer);
    stopwatchTimer    = null;
    btn.textContent   = "Start";
    btn.className     = "btn start";
  }

  saveStopwatchState();
}

function addLap() {
  var elapsed = stopwatchTotal;
  if (stopwatchRunning) {
    elapsed += Date.now() - stopwatchStart;
  }

  if (elapsed > 0) {
    lapCount++;
    var timeStr = formatStopwatchTime(elapsed);
    lapTimes.push(timeStr);

    var li = document.createElement("li");
    li.innerHTML = "<span>Lap " + lapCount + "</span><span>" + timeStr + "</span>";

    var lapsList = document.getElementById("lapsList");
    lapsList.insertBefore(li, lapsList.firstChild);

    saveStopwatchState();
  }
}

function resetStopwatch() {
  if (stopwatchTimer) {
    clearInterval(stopwatchTimer);
    stopwatchTimer = null;
  }

  stopwatchRunning = false;
  stopwatchStart   = 0;
  stopwatchTotal   = 0;
  lapCount         = 0;
  lapTimes         = [];

  document.getElementById("display").textContent      = "00:00:00";
  document.getElementById("startStopBtn").textContent = "Start";
  document.getElementById("startStopBtn").className   = "btn start";
  document.getElementById("lapsList").innerHTML        = "";

  localStorage.removeItem(getStopwatchKey("isRunning"));
  localStorage.removeItem(getStopwatchKey("startTime"));
  localStorage.removeItem(getStopwatchKey("accumulatedTime"));
  localStorage.removeItem(getStopwatchKey("laps"));
}
