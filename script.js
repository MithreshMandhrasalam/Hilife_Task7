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
  document.getElementById("tab-btn-directory").classList.toggle("active", isDirectory);
  document.getElementById("tab-btn-timer").classList.toggle("active", !isDirectory);
  document.getElementById("directory-tab").classList.toggle("active", isDirectory);
  document.getElementById("timer-tab").classList.toggle("active", !isDirectory);
  if (isDirectory) {
    showTable(employees);
    clearFilters();
  } else {
    loadStopwatchState();
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
  var time = new Date().toLocaleTimeString("en-IN");
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var nextStatus = ((clockData[u] && clockData[u].status) || "Out") === "In" ? "Out" : "In";
  clockData[u] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  if (document.getElementById("greeting-overlay").hidden === true) {
    alert("You clocked " + nextStatus + " successfully at " + time + "!");
  }
  updateClockUI(u);
}

function handleHeaderClockToggle() {
  handleClockToggle();
}

function updateClockUI(username) {
  var clock = JSON.parse(localStorage.getItem("clock") || "{}")[username] || { status: "Out", time: "None" };
  
  var statusEl = document.getElementById("clock-status");
  statusEl.textContent = "Clocked " + clock.status + " at " + clock.time;
  statusEl.style.color = clock.status === "In" ? "green" : "red";
  document.getElementById("clock-toggle-btn").textContent = clock.status === "In" ? "Clock Out" : "Clock In";
  
  document.getElementById("header-clock-status").textContent = "Clocked " + clock.status;
  document.getElementById("header-clock-status").className = "status-indicator " + (clock.status === "In" ? "clocked-in" : "clocked-out");
  document.getElementById("header-clock-btn").textContent = clock.status === "In" ? "Clock Out" : "Clock In";
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
