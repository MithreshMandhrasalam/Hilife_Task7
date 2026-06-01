var employees = [
  { id: "EMP101", name: "Arun", dob: "1999-02-15", gender: "Male", department: "Software Development", role: "Frontend Developer", email: "arun@example.com", status: "Present" },
  { id: "EMP102", name: "Priya", dob: "1998-07-22", gender: "Female", department: "Web Development", role: "UI/UX Designer", email: "priya@example.com", status: "Present" },
  { id: "EMP103", name: "Karthik", dob: "1997-11-10", gender: "Male", department: "Cyber Security", role: "Security Analyst", email: "karthik@example.com", status: "Present" },
  { id: "EMP104", name: "Divya", dob: "2000-04-03", gender: "Female", department: "Data Science", role: "Data Analyst", email: "divya@example.com", status: "Present" },
  { id: "EMP105", name: "Surya", dob: "1996-09-18", gender: "Male", department: "Cloud Computing", role: "Cloud Engineer", email: "surya@example.com", status: "On Permission" },
  { id: "EMP106", name: "Keerthi", dob: "1999-01-27", gender: "Female", department: "Artificial Intelligence", role: "ML Engineer", email: "keerthi@example.com", status: "Present" },
  { id: "EMP107", name: "Vignesh", dob: "1998-06-05", gender: "Male", department: "IT Support", role: "System Administrator", email: "vignesh@example.com", status: "Present" },
  { id: "EMP108", name: "Nisha", dob: "2001-12-14", gender: "Female", department: "Mobile App Development", role: "Android Developer", email: "nisha@example.com", status: "Present" },
  { id: "EMP109", name: "Hari", dob: "1997-08-29", gender: "Male", department: "DevOps", role: "DevOps Engineer", email: "hari@example.com", status: "On Leave" },
  { id: "EMP110", name: "Aishwarya", dob: "2000-03-11", gender: "Female", department: "Database Management", role: "Database Administrator", email: "aishwarya@example.com", status: "Present" }
];

var clockTimer = null, timerId = null, isRunning = false, startTime = 0, accumulatedTime = 0, lapCounter = 0, laps = [];

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

  var rem = localStorage.getItem("rememberedUsername");
  if (rem) {
    document.getElementById("signin-username").value = rem;
    document.getElementById("signin-remember").checked = true;
  }
  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    var users = JSON.parse(localStorage.getItem("users") || "{}");
    if (users[currentUser]) showDashboard(currentUser, users[currentUser].firstName + " " + users[currentUser].lastName);
    else showLoginScreen();
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
  document.getElementById("lapBtn").addEventListener("click", addStopwatchLap);
  document.getElementById("resetBtn").addEventListener("click", resetStopwatch);
};

function showLoginScreen() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("dashboard-screen").classList.add("hidden");
}

function showDashboard(username, fullName) {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("dashboard-screen").classList.remove("hidden");
  document.getElementById("user-greeting").textContent = "Hello, " + fullName;
  updateClockUI(username);
  updateAttendanceStats(username);
  switchDashboardTab("directory");
}

function switchLoginTab(tab) {
  var isSign = tab === "signin";
  document.getElementById("tab-signin").classList.toggle("active", isSign);
  document.getElementById("tab-signup").classList.toggle("active", !isSign);
  document.getElementById("panel-signin").classList.toggle("active", isSign);
  document.getElementById("panel-signup").classList.toggle("active", !isSign);
}

function switchDashboardTab(tab) {
  var isDirectory = tab === "directory";
  var currentUser = localStorage.getItem("currentUser") || "hilife";
  document.getElementById("tab-btn-directory").classList.toggle("active", isDirectory);
  document.getElementById("tab-btn-timer").classList.toggle("active", !isDirectory);
  document.getElementById("directory-tab").classList.toggle("active", isDirectory);
  document.getElementById("timer-tab").classList.toggle("active", !isDirectory);
  if (isDirectory) {
    showTable(employees);
    clearFilters();
  } else {
    loadStopwatchState();
    updateAttendanceStats(currentUser);
  }
}

function togglePassword(inputId, btn) {
  var input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
  btn.textContent = input.type === "password" ? "Show" : "Hide";
}

function handleSignIn(e) {
  e.preventDefault();
  var u = document.getElementById("signin-username").value.trim();
  var p = document.getElementById("signin-password").value;
  if (!u || !p) return alert("Fill all fields");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[u] || users[u].password !== p) return alert("Invalid credentials");
  if (document.getElementById("signin-remember").checked) localStorage.setItem("rememberedUsername", u);
  else localStorage.removeItem("rememberedUsername");
  localStorage.setItem("currentUser", u);
  showGreeting(u, users[u].firstName + " " + users[u].lastName);

  // Clear inputs
  document.getElementById("signin-username").value = "";
  document.getElementById("signin-password").value = "";
}

function handleSignUp(e) {
  e.preventDefault();
  var f = document.getElementById("signup-firstname").value.trim();
  var l = document.getElementById("signup-lastname").value.trim();
  var u = document.getElementById("signup-username").value.trim();
  var em = document.getElementById("signup-email").value.trim();
  var p = document.getElementById("signup-password").value;
  var c = document.getElementById("signup-confirm").value;
  if (!f || !l || !u || !em || !p || !c) return alert("Fill all fields");
  if (p.length < 6) return alert("Password min 6 chars");
  if (p !== c) return alert("Passwords do not match");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[u]) return alert("Username taken");
  users[u] = { firstName: f, lastName: l, email: em, password: p };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", u);
  showGreeting(u, f + " " + l);

  // Clear inputs
  document.getElementById("signup-firstname").value = "";
  document.getElementById("signup-lastname").value = "";
  document.getElementById("signup-username").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
  document.getElementById("signup-confirm").value = "";
}

function handleSignOut() {
  if (isRunning) {
    clearInterval(timerId);
    isRunning = false;
    saveStopwatchState();
  }
  localStorage.removeItem("currentUser");
  showLoginScreen();
}

function forgotPassword() {
  var u = document.getElementById("signin-username").value.trim();
  if (!u) return alert("Enter username first");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!users[u]) return alert("No account found");
  alert("Reset link sent to: " + users[u].email);
}

function showGreeting(username, name) {
  document.getElementById("greeting-name").textContent = name;
  var timeEl = document.getElementById("greeting-time");
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(() => timeEl.textContent = new Date().toLocaleTimeString("en-IN"), 1000);
  timeEl.textContent = new Date().toLocaleTimeString("en-IN");
  document.getElementById("greeting-overlay").hidden = false;
  updateClockUI(username);
}

function handleClockToggle() {
  var u = localStorage.getItem("currentUser") || document.getElementById("greeting-overlay").getAttribute("data-user");
  if (!u) return;
  
  var time = new Date().toLocaleTimeString("en-IN");
  var dateStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var nextStatus = ((clockData[u] && clockData[u].status) || "Out") === "In" ? "Out" : "In";
  
  // Update last-status state
  clockData[u] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  
  // Track detailed attendance logs in localStorage
  var logsKey = "attendance_logs_" + u;
  var logs = JSON.parse(localStorage.getItem(logsKey) || "[]");
  
  if (nextStatus === "In") {
    // Clocking in: create a new session
    var newSession = {
      date: dateStr,
      clockIn: time,
      clockOut: null,
      rawIn: Date.now(),
      rawOut: null,
      duration: null
    };
    logs.push(newSession);
  } else {
    // Clocking out: locate the active session and close it
    var activeSession = logs.find(log => log.clockOut === null);
    if (activeSession) {
      activeSession.clockOut = time;
      activeSession.rawOut = Date.now();
      activeSession.duration = activeSession.rawOut - activeSession.rawIn;
    } else {
      // Fallback in case of mismatch
      logs.push({
        date: dateStr,
        clockIn: time,
        clockOut: time,
        rawIn: Date.now(),
        rawOut: Date.now(),
        duration: 0
      });
    }
  }
  localStorage.setItem(logsKey, JSON.stringify(logs));
  
  if (document.getElementById("greeting-overlay").hidden === true) {
    alert("You clocked " + nextStatus + " successfully at " + time + "!");
  }
  
  updateClockUI(u);
  updateAttendanceStats(u);
}

function handleHeaderClockToggle() {
  handleClockToggle();
}

function updateClockUI(username) {
  var clock = JSON.parse(localStorage.getItem("clock") || "{}")[username] || { status: "Out", time: "None" };
  
  var statusEl = document.getElementById("clock-status");
  if (statusEl) {
    statusEl.textContent = "Clocked " + clock.status + " at " + clock.time;
    statusEl.style.color = clock.status === "In" ? "var(--success-color)" : "var(--danger-color)";
  }
  
  var toggleBtn = document.getElementById("clock-toggle-btn");
  if (toggleBtn) {
    toggleBtn.textContent = clock.status === "In" ? "Clock Out" : "Clock In";
    toggleBtn.className = clock.status === "In" ? "btn-primary clocked-in" : "btn-primary clocked-out";
  }
  
  var headerStatus = document.getElementById("header-clock-status");
  if (headerStatus) {
    headerStatus.textContent = "Clocked " + clock.status;
    headerStatus.className = "status-indicator " + (clock.status === "In" ? "clocked-in" : "clocked-out");
  }
  
  var headerBtn = document.getElementById("header-clock-btn");
  if (headerBtn) {
    headerBtn.textContent = clock.status === "In" ? "Clock Out" : "Clock In";
  }
}

function formatDuration(ms) {
  var s = Math.floor(ms / 1000);
  var hours = Math.floor(s / 3600);
  var minutes = Math.floor((s % 3600) / 60);
  var seconds = s % 60;
  var pad = (n) => n < 10 ? "0" + n : n;
  return pad(hours) + "h " + pad(minutes) + "m " + pad(seconds) + "s";
}

function updateAttendanceStats(username) {
  if (!username) return;
  
  var logsKey = "attendance_logs_" + username;
  var logs = JSON.parse(localStorage.getItem(logsKey) || "[]");
  var todayStr = new Date().toLocaleDateString("en-CA");
  
  // Find active running session across all logs (even if logged before midnight)
  var activeSession = logs.find(log => log.clockOut === null);
  var isClockedIn = !!activeSession;
  
  // Filter sessions that occurred today OR are currently active (spans midnight)
  var todayLogs = logs.filter(log => log.date === todayStr || log === activeSession);
  
  var firstIn = "--:--";
  var lastOut = "--:--";
  var totalWorkMs = 0;
  
  if (todayLogs.length > 0) {
    firstIn = todayLogs[0].clockIn;
    
    for (var i = 0; i < todayLogs.length; i++) {
      var log = todayLogs[i];
      if (log.clockOut) {
        totalWorkMs += log.duration;
        lastOut = log.clockOut;
      } else {
        // Active running session: calculate elapsed time live
        totalWorkMs += (Date.now() - log.rawIn);
      }
    }
  }
  
  // Update attendance widgets in dashboard
  var statsStatus = document.getElementById("stats-status");
  if (statsStatus) {
    statsStatus.textContent = isClockedIn ? "Clocked In" : "Clocked Out";
    statsStatus.className = "stat-value " + (isClockedIn ? "clocked-in" : "clocked-out");
  }
  
  var statsFirstIn = document.getElementById("stats-first-in");
  if (statsFirstIn) statsFirstIn.textContent = firstIn;
  
  var statsLastOut = document.getElementById("stats-last-out");
  if (statsLastOut) statsLastOut.textContent = lastOut;
  
  var statsWork = document.getElementById("stats-work-hours");
  if (statsWork) statsWork.textContent = formatDuration(totalWorkMs);
  
  // Daily Target calculation (8 Hours = 28,800,000 ms)
  var targetMs = 8 * 60 * 60 * 1000;
  var percentage = Math.min(100, Math.floor((totalWorkMs / targetMs) * 100));
  var hoursRaw = (totalWorkMs / (3600 * 1000)).toFixed(2);
  
  var goalPerc = document.getElementById("goal-percentage");
  if (goalPerc) goalPerc.textContent = percentage + "% (" + hoursRaw + " / 8 hrs)";
  
  var progressFill = document.getElementById("goal-progress-fill");
  if (progressFill) progressFill.style.width = percentage + "%";
  
  // Render Attendance Table logs
  var tbody = document.getElementById("attendanceLogsBody");
  var noLogsMsg = document.getElementById("noAttendanceLogs");
  
  if (tbody) {
    tbody.innerHTML = "";
    if (todayLogs.length === 0) {
      if (noLogsMsg) noLogsMsg.style.display = "block";
    } else {
      if (noLogsMsg) noLogsMsg.style.display = "none";
      
      for (var j = 0; j < todayLogs.length; j++) {
        var item = todayLogs[j];
        var durationText = item.duration ? formatDuration(item.duration) : "Running...";
        var outText = item.clockOut ? item.clockOut : "Active";
        var statusBadgeClass = item.clockOut ? "badge active" : "badge on-leave"; // green for completed, amber for active
        var statusLabel = item.clockOut ? "Completed" : "Active";
        
        var tr = document.createElement("tr");
        tr.innerHTML = 
          "<td>" + item.clockIn + "</td>" +
          "<td>" + outText + "</td>" +
          "<td>" + durationText + "</td>" +
          "<td><span class='" + statusBadgeClass + "'>" + statusLabel + "</span></td>";
        tbody.appendChild(tr);
      }
    }
  }
}

function closeGreeting() {
  document.getElementById("greeting-overlay").hidden = true;
  if (clockTimer) clearInterval(clockTimer);
  var currentUser = localStorage.getItem("currentUser");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (currentUser && users[currentUser]) {
    showDashboard(currentUser, users[currentUser].firstName + " " + users[currentUser].lastName);
  }
}

function calculateAge(dob) {
  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

function buildTableRows(employeeList) {
  var html = "";
  for (var i = 0; i < employeeList.length; i++) {
    var emp = employeeList[i];
    var formattedDOB = emp.dob.split("-").reverse().join("-");
    var badgeClass = emp.status === "Present" ? "badge active" : emp.status === "On Leave" ? "badge on-leave" : "badge on-permission";
    html += "<tr>" +
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
  document.getElementById("resultCount").textContent = filteredList.length;
  document.getElementById("tableBody").innerHTML = buildTableRows(filteredList);
  document.getElementById("noResult").classList.toggle("hidden", filteredList.length > 0);
}

function applyFilters() {
  var searchText = document.getElementById("searchName").value.toLowerCase().trim();
  var dept = document.getElementById("filterDept").value;
  var role = document.getElementById("filterRole").value;
  var gender = document.getElementById("filterGender").value;
  var status = document.getElementById("filterStatus").value;
  var filtered = [];
  for (var i = 0; i < employees.length; i++) {
    var emp = employees[i];
    var matchName = emp.name.toLowerCase().indexOf(searchText) !== -1 || emp.id.toLowerCase().indexOf(searchText) !== -1;
    var matchDept = !dept || emp.department === dept;
    var matchRole = !role || emp.role === role;
    var matchGender = !gender || emp.gender === gender;
    var matchStatus = !status || emp.status === status;
    if (matchName && matchDept && matchRole && matchGender && matchStatus) filtered.push(emp);
  }
  showTable(filtered);
}

function clearFilters() {
  ["searchName", "filterDept", "filterRole", "filterGender", "filterStatus"].forEach(id => document.getElementById(id).value = "");
  showTable(employees);
}

function getStopwatchKey(key) {
  return "stopwatch_" + (localStorage.getItem("currentUser") || "default") + "_" + key;
}

function formatTime(totalMs) {
  var s = Math.floor(totalMs / 1000);
  var pad = (n) => n < 10 ? "0" + n : n;
  return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
}

function tickStopwatch() {
  document.getElementById("display").innerText = formatTime(accumulatedTime + (Date.now() - startTime));
}

function saveStopwatchState() {
  localStorage.setItem(getStopwatchKey("isRunning"), isRunning);
  localStorage.setItem(getStopwatchKey("startTime"), startTime);
  localStorage.setItem(getStopwatchKey("accumulatedTime"), accumulatedTime);
  localStorage.setItem(getStopwatchKey("laps"), JSON.stringify(laps));
}

function loadStopwatchState() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  laps = JSON.parse(localStorage.getItem(getStopwatchKey("laps"))) || [];
  lapCounter = laps.length;
  
  var lapsList = document.getElementById("lapsList");
  lapsList.innerHTML = "";
  for (var i = 0; i < laps.length; i++) {
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap " + (i + 1) + "</span><span>" + laps[i] + "</span>";
    lapsList.insertBefore(li, lapsList.firstChild);
  }
  
  isRunning = localStorage.getItem(getStopwatchKey("isRunning")) === "true";
  startTime = parseInt(localStorage.getItem(getStopwatchKey("startTime"))) || 0;
  accumulatedTime = parseInt(localStorage.getItem(getStopwatchKey("accumulatedTime"))) || 0;
  
  var displayTime = accumulatedTime;
  var btn = document.getElementById("startStopBtn");
  if (isRunning) {
    displayTime += Date.now() - startTime;
    timerId = setInterval(tickStopwatch, 1000);
    btn.innerText = "Stop";
    btn.className = "btn stop";
  } else {
    btn.innerText = "Start";
    btn.className = "btn start";
  }
  document.getElementById("display").innerText = formatTime(displayTime);
}

function toggleStopwatch() {
  var btn = document.getElementById("startStopBtn");
  if (isRunning === false) {
    isRunning = true;
    startTime = Date.now();
    timerId = setInterval(tickStopwatch, 1000);
    tickStopwatch();
    btn.innerText = "Stop";
    btn.className = "btn stop";
  } else {
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
    accumulatedTime += Date.now() - startTime;
    btn.innerText = "Start";
    btn.className = "btn start";
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
  if (timerId) clearInterval(timerId);
  timerId = null;
  isRunning = false;
  startTime = accumulatedTime = lapCounter = 0;
  laps = [];
  
  document.getElementById("display").innerText = "00:00:00";
  document.getElementById("startStopBtn").innerText = "Start";
  document.getElementById("startStopBtn").className = "btn start";
  document.getElementById("lapsList").innerHTML = "";
  
  ["isRunning", "startTime", "accumulatedTime", "laps"].forEach(key => localStorage.removeItem(getStopwatchKey(key)));
}
