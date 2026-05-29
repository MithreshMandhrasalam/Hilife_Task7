var defaultEmployees = [
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
var employees = JSON.parse(localStorage.getItem("employees")) || defaultEmployees;
if (!localStorage.getItem("employees")) localStorage.setItem("employees", JSON.stringify(employees));

var clockTimer = null, timerId = null, startTime = 0, accumulatedTime = 0, isRunning = false;
var lapCounter = 0, laps = [], currentSortColumn = null, currentSortDirection = "asc";
var breakTime = 0, isBreak = false, breakStart = 0, editingEmpId = null;

window.onload = function () {
  if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark-mode");
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
  
  var filters = ["searchName", "filterDept", "filterRole", "filterGender", "filterStatus"];
  filters.forEach(id => document.getElementById(id).addEventListener(id === "searchName" ? "input" : "change", applyFilters));
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
  updateHeaderClockDisplay(username);
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
  var isDir = tab === "directory";
  document.getElementById("tab-btn-directory").classList.toggle("active", isDir);
  document.getElementById("tab-btn-timer").classList.toggle("active", !isDir);
  document.getElementById("directory-tab").classList.toggle("active", isDir);
  document.getElementById("timer-tab").classList.toggle("active", !isDir);
  if (isDir) {
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
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!u || !p) return alert("Fill all fields");
  if (!users[u] || users[u].password !== p) return alert("Invalid credentials");

  if (document.getElementById("signin-remember").checked) localStorage.setItem("rememberedUsername", u);
  else localStorage.removeItem("rememberedUsername");

  localStorage.setItem("currentUser", u);
  showGreeting(u, users[u].firstName + " " + users[u].lastName);
}

function checkPasswordStrength(p) {
  var text = "Weak", color = "red";
  if (p.length > 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) { text = "Strong"; color = "green"; }
  else if (p.length >= 6) { text = "Medium"; color = "orange"; }
  document.getElementById("strength-text").innerText = p ? text + " Password" : "";
  document.getElementById("strength-text").style.color = color;
  document.getElementById("strength-bar").style.width = p ? (text === "Strong" ? "100%" : text === "Medium" ? "66%" : "33%") : "0";
  document.getElementById("strength-bar").style.backgroundColor = color;
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
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(p)) {
    return alert("Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
  }
  if (p !== c) return alert("Passwords do not match");

  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[u]) return alert("Username taken");

  users[u] = { firstName: f, lastName: l, email: em, password: p };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", u);
  showGreeting(u, f + " " + l);
}

function handleSignOut() {
  if (isRunning) toggleStopwatch();
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
  
  var overlay = document.getElementById("greeting-overlay");
  overlay.hidden = false;
  overlay.setAttribute("data-user", username);
  
  var clock = JSON.parse(localStorage.getItem("clock") || "{}")[username] || { status: "Out", time: "None" };
  document.getElementById("clock-status").textContent = "Clocked " + clock.status + " at " + clock.time;
  document.getElementById("clock-status").style.color = clock.status === "In" ? "green" : "red";
  document.getElementById("clock-toggle-btn").textContent = clock.status === "In" ? "Clock Out" : "Clock In";
}

function handleClockToggle() {
  var username = document.getElementById("greeting-overlay").getAttribute("data-user");
  var time = new Date().toLocaleTimeString("en-IN");
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var nextStatus = ((clockData[username] && clockData[username].status) || "Out") === "In" ? "Out" : "In";
  clockData[username] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  showGreeting(username, document.getElementById("greeting-name").textContent);
}

function closeGreeting() {
  document.getElementById("greeting-overlay").hidden = true;
  if (clockTimer) clearInterval(clockTimer);
  var u = localStorage.getItem("currentUser");
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (u && users[u]) showDashboard(u, users[u].firstName + " " + users[u].lastName);
}

function handleHeaderClockToggle() {
  var u = localStorage.getItem("currentUser");
  if (!u) return;
  var time = new Date().toLocaleTimeString("en-IN");
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var nextStatus = ((clockData[u] && clockData[u].status) || "Out") === "In" ? "Out" : "In";
  clockData[u] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  alert("You clocked " + nextStatus + " successfully at " + time + "!");
  updateHeaderClockDisplay(u);
}

function updateHeaderClockDisplay(username) {
  var clock = JSON.parse(localStorage.getItem("clock") || "{}")[username] || { status: "Out", time: "None" };
  document.getElementById("header-clock-status").textContent = "Clocked " + clock.status;
  document.getElementById("header-clock-status").className = "status-indicator " + (clock.status === "In" ? "clocked-in" : "clocked-out");
  document.getElementById("header-clock-btn").textContent = clock.status === "In" ? "Clock Out" : "Clock In";
}

function calculateAge(dob) {
  var diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function buildTableRows(list) {
  return list.map(emp => {
    var formattedDOB = emp.dob.split("-").reverse().join("-");
    var badgeClass = emp.status === "Present" ? "badge active" : emp.status === "On Leave" ? "badge on-leave" : "badge on-permission";
    return "<tr>" +
      "<td>" + emp.id + "</td>" +
      "<td>" + emp.name + "</td>" +
      "<td>" + formattedDOB + "</td>" +
      "<td>" + calculateAge(emp.dob) + "</td>" +
      "<td>" + emp.gender + "</td>" +
      "<td>" + emp.department + "</td>" +
      "<td>" + emp.role + "</td>" +
      "<td>" + emp.email + "</td>" +
      "<td><span class='" + badgeClass + "'>" + emp.status + "</span></td>" +
      "<td>" +
        "<button onclick=\"openEditModal('" + emp.id + "')\" style=\"background:#ffc107; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px;\">Edit</button>" +
        "<button onclick=\"deleteEmployee('" + emp.id + "')\" style=\"background:#dc3545; color:#fff; border:none; padding:4px 8px; border-radius:3px; cursor:pointer;\">Delete</button>" +
      "</td>" +
    "</tr>";
  }).join("");
}

function showTable(filteredList) {
  document.getElementById("resultCount").textContent = filteredList.length;
  document.getElementById("tableBody").innerHTML = buildTableRows(filteredList);
  document.getElementById("noResult").classList.toggle("hidden", filteredList.length > 0);
  updateStats(filteredList);
}

function updateStats(list) {
  var total = list.length;
  var present = list.filter(e => e.status === "Present").length;
  var leave = list.filter(e => e.status === "On Leave").length;
  var ageSum = list.reduce((sum, e) => sum + calculateAge(e.dob), 0);
  
  document.getElementById("stat-total").innerText = total;
  document.getElementById("stat-present").innerText = present;
  document.getElementById("stat-leave").innerText = leave;
  document.getElementById("stat-avg-age").innerText = total > 0 ? Math.round(ageSum / total) : 0;
}

function sortEmployees(list, col, dir) {
  if (!col) return list;
  return list.sort((a, b) => {
    var valA = col === 'age' ? calculateAge(a.dob) : (a[col] || "").toString().toLowerCase();
    var valB = col === 'age' ? calculateAge(b.dob) : (b[col] || "").toString().toLowerCase();
    return dir === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });
}

function updateSortIcons() {
  var cols = ['id', 'name', 'dob', 'age', 'gender', 'department', 'role', 'email', 'status'];
  cols.forEach(col => {
    var iconEl = document.getElementById("sort-icon-" + col);
    if (iconEl) iconEl.textContent = currentSortColumn === col ? (currentSortDirection === "asc" ? " ▲" : " ▼") : "";
  });
}

function handleSort(column) {
  currentSortDirection = currentSortColumn === column && currentSortDirection === 'asc' ? 'desc' : 'asc';
  currentSortColumn = column;
  updateSortIcons();
  applyFilters();
}

function applyFilters() {
  var search = document.getElementById("searchName").value.toLowerCase().trim();
  var dept = document.getElementById("filterDept").value;
  var role = document.getElementById("filterRole").value;
  var gender = document.getElementById("filterGender").value;
  var status = document.getElementById("filterStatus").value;
  
  var filtered = employees.filter(emp => 
    (emp.name.toLowerCase().indexOf(search) !== -1 || emp.id.toLowerCase().indexOf(search) !== -1) &&
    (!dept || emp.department === dept) &&
    (!role || emp.role === role) &&
    (!gender || emp.gender === gender) &&
    (!status || emp.status === status)
  );
  
  showTable(sortEmployees(filtered, currentSortColumn, currentSortDirection));
}

function clearFilters() {
  ["searchName", "filterDept", "filterRole", "filterGender", "filterStatus"].forEach(id => document.getElementById(id).value = "");
  currentSortColumn = null;
  currentSortDirection = "asc";
  updateSortIcons();
  showTable(employees);
}

function getStopwatchKey(key) {
  return "stopwatch_" + (localStorage.getItem("currentUser") || "default") + "_" + key;
}

function formatTime(ms) {
  var s = Math.floor(ms / 1000);
  var hrs = Math.floor(s / 3600);
  var mins = Math.floor((s % 3600) / 60);
  var secs = s % 60;
  var pad = (n) => n < 10 ? "0" + n : n;
  return pad(hrs) + ":" + pad(mins) + ":" + pad(secs);
}

function tickStopwatch() {
  var now = Date.now();
  var currentElapsed = accumulatedTime + (now - startTime) - breakTime - (isBreak ? now - breakStart : 0);
  document.getElementById("display").innerText = formatTime(currentElapsed);
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
  lapsList.innerHTML = laps.map((lap, i) => "<li><span>Lap " + (i + 1) + "</span><span>" + lap + "</span></li>").reverse().join("");
  
  isRunning = localStorage.getItem(getStopwatchKey("isRunning")) === "true";
  accumulatedTime = parseInt(localStorage.getItem(getStopwatchKey("accumulatedTime"))) || 0;
  startTime = parseInt(localStorage.getItem(getStopwatchKey("startTime"))) || 0;
  
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
  if (!isRunning) {
    isRunning = true;
    startTime = Date.now();
    timerId = setInterval(tickStopwatch, 1000);
    btn.innerText = "Stop";
    btn.className = "btn stop";
  } else {
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
    if (isBreak) {
      isBreak = false;
      breakTime += Date.now() - breakStart;
      document.getElementById("breakBtn").innerText = "Break";
      document.getElementById("breakBtn").style.backgroundColor = "";
    }
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
  startTime = accumulatedTime = lapCounter = breakTime = breakStart = 0;
  isBreak = false;
  
  document.getElementById("breakBtn").innerText = "Break";
  document.getElementById("breakBtn").style.backgroundColor = "";
  document.getElementById("display").innerText = "00:00:00";
  document.getElementById("startStopBtn").innerText = "Start";
  document.getElementById("startStopBtn").className = "btn start";
  document.getElementById("lapsList").innerHTML = "";
  
  ["isRunning", "startTime", "accumulatedTime", "laps"].forEach(key => localStorage.removeItem(getStopwatchKey(key)));
}

function openAddEmployeeModal() {
  editingEmpId = null;
  document.getElementById("modal-title").innerText = "Add Employee";
  document.getElementById("emp-id").value = "";
  document.getElementById("emp-id").disabled = false;
  ["emp-name", "emp-dob", "emp-dept", "emp-role", "emp-email"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("emp-gender").value = "Male";
  document.getElementById("emp-status").value = "Present";
  document.getElementById("employee-modal").style.display = "flex";
}

function closeEmployeeModal() {
  document.getElementById("employee-modal").style.display = "none";
}

function saveEmployee() {
  var emp = {
    id: document.getElementById("emp-id").value.trim(),
    name: document.getElementById("emp-name").value.trim(),
    dob: document.getElementById("emp-dob").value,
    gender: document.getElementById("emp-gender").value,
    department: document.getElementById("emp-dept").value.trim(),
    role: document.getElementById("emp-role").value.trim(),
    email: document.getElementById("emp-email").value.trim(),
    status: document.getElementById("emp-status").value
  };

  if (!emp.id || !emp.name || !emp.dob || !emp.department || !emp.role || !emp.email) {
    return alert("Please fill all fields!");
  }

  if (editingEmpId === null) {
    if (employees.some(e => e.id.toLowerCase() === emp.id.toLowerCase())) return alert("Employee ID already exists!");
    employees.push(emp);
  } else {
    var index = employees.findIndex(e => e.id === editingEmpId);
    if (index !== -1) employees[index] = emp;
  }

  localStorage.setItem("employees", JSON.stringify(employees));
  closeEmployeeModal();
  applyFilters();
}

function openEditModal(id) {
  var emp = employees.find(e => e.id === id);
  if (!emp) return;
  editingEmpId = id;
  document.getElementById("modal-title").innerText = "Edit Employee";
  document.getElementById("emp-id").value = emp.id;
  document.getElementById("emp-id").disabled = true;
  document.getElementById("emp-name").value = emp.name;
  document.getElementById("emp-dob").value = emp.dob;
  document.getElementById("emp-gender").value = emp.gender;
  document.getElementById("emp-dept").value = emp.department;
  document.getElementById("emp-role").value = emp.role;
  document.getElementById("emp-email").value = emp.email;
  document.getElementById("emp-status").value = emp.status;
  document.getElementById("employee-modal").style.display = "flex";
}

function deleteEmployee(id) {
  if (confirm("Are you sure you want to delete employee " + id + "?")) {
    employees = employees.filter(e => e.id !== id);
    localStorage.setItem("employees", JSON.stringify(employees));
    applyFilters();
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

function exportData(type) {
  var content = type === 'json' ? JSON.stringify(employees, null, 2) : 
    "ID,Name,DOB,Gender,Department,Role,Email,Status\n" + 
    employees.map(e => [e.id, e.name, e.dob, e.gender, e.department, e.role, e.email, e.status].join(",")).join("\n");
  
  var blob = new Blob([content], { type: type === 'json' ? 'application/json' : 'text/csv' });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "employees." + type;
  a.click();
}

function toggleBreak() {
  if (!isRunning) return alert("Start the timer first!");
  var btn = document.getElementById("breakBtn");
  if (!isBreak) {
    isBreak = true;
    breakStart = Date.now();
    btn.innerText = "Resume Work";
    btn.style.backgroundColor = "#ffc107";
  } else {
    isBreak = false;
    breakTime += Date.now() - breakStart;
    btn.innerText = "Break";
    btn.style.backgroundColor = "";
    alert("Total break time: " + Math.floor(breakTime / 1000) + " seconds.");
  }
}
