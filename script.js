var defaultEmployees = [
  {
    id: "EMP101",
    name: "Arun",
    dob: "1999-02-15",
    gender: "Male",
    department: "Software Development",
    role: "Frontend Developer",
    email: "arun@example.com",
    status: "Present",
  },
  {
    id: "EMP102",
    name: "Priya",
    dob: "1998-07-22",
    gender: "Female",
    department: "Web Development",
    role: "UI/UX Designer",
    email: "priya@example.com",
    status: "Present",
  },
  {
    id: "EMP103",
    name: "Karthik",
    dob: "1997-11-10",
    gender: "Male",
    department: "Cyber Security",
    role: "Security Analyst",
    email: "karthik@example.com",
    status: "Present",
  },
  {
    id: "EMP104",
    name: "Divya",
    dob: "2000-04-03",
    gender: "Female",
    department: "Data Science",
    role: "Data Analyst",
    email: "divya@example.com",
    status: "Present",
  },
  {
    id: "EMP105",
    name: "Surya",
    dob: "1996-09-18",
    gender: "Male",
    department: "Cloud Computing",
    role: "Cloud Engineer",
    email: "surya@example.com",
    status: "On Permission",
  },
  {
    id: "EMP106",
    name: "Keerthi",
    dob: "1999-01-27",
    gender: "Female",
    department: "Artificial Intelligence",
    role: "ML Engineer",
    email: "keerthi@example.com",
    status: "Present",
  },
  {
    id: "EMP107",
    name: "Vignesh",
    dob: "1998-06-05",
    gender: "Male",
    department: "IT Support",
    role: "System Administrator",
    email: "vignesh@example.com",
    status: "Present",
  },
  {
    id: "EMP108",
    name: "Nisha",
    dob: "2001-12-14",
    gender: "Female",
    department: "Mobile App Development",
    role: "Android Developer",
    email: "nisha@example.com",
    status: "Present",
  },
  {
    id: "EMP109",
    name: "Hari",
    dob: "1997-08-29",
    gender: "Male",
    department: "DevOps",
    role: "DevOps Engineer",
    email: "hari@example.com",
    status: "On Leave",
  },
  {
    id: "EMP110",
    name: "Aishwarya",
    dob: "2000-03-11",
    gender: "Female",
    department: "Database Management",
    role: "Database Administrator",
    email: "aishwarya@example.com",
    status: "Present",
  },
];
var employees = JSON.parse(localStorage.getItem("employees")) || defaultEmployees;
if (!localStorage.getItem("employees")) {
  localStorage.setItem("employees", JSON.stringify(employees));
}
var clockTimer = null;
var isRunning = false;
var startTime = 0;
var accumulatedTime = 0;
var timerId = null;
var lapCounter = 0;
var laps = [];
var currentSortColumn = null;
var currentSortDirection = "asc";

window.onload = function () {
  var rem = localStorage.getItem("rememberedUsername");
  if (rem) {
    document.getElementById("signin-username").value = rem;
    document.getElementById("signin-remember").checked = true;
  }
  var currentUser = localStorage.getItem("currentUser");
  if (currentUser) {
    var users = getUsers();
    if (users[currentUser]) {
      showDashboard(
        currentUser,
        users[currentUser].firstName + " " + users[currentUser].lastName,
      );
    } else {
      showLoginScreen();
    }
  } else {
    showLoginScreen();
  }
  document.getElementById("searchName").addEventListener("input", applyFilters);
  document
    .getElementById("filterDept")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterRole")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterGender")
    .addEventListener("change", applyFilters);
  document
    .getElementById("filterStatus")
    .addEventListener("change", applyFilters);
  document.getElementById("clearBtn").addEventListener("click", clearFilters);
  document
    .getElementById("startStopBtn")
    .addEventListener("click", toggleStopwatch);
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
  var isDirectory = tab === "directory";
  document
    .getElementById("tab-btn-directory")
    .classList.toggle("active", isDirectory);
  document
    .getElementById("tab-btn-timer")
    .classList.toggle("active", !isDirectory);
  document
    .getElementById("directory-tab")
    .classList.toggle("active", isDirectory);
  document.getElementById("timer-tab").classList.toggle("active", !isDirectory);
  if (isDirectory) {
    showTable(employees);
    clearFilters();
  } else {
    loadStopwatchState();
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
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
  var u = document.getElementById("signin-username").value.trim();
  var p = document.getElementById("signin-password").value;
  if (!u || !p) {
    alert("Fill all fields");
    return;
  }
  var users = getUsers();
  if (!users[u] || users[u].password !== p) {
    alert("Invalid credentials");
    return;
  }
  if (document.getElementById("signin-remember").checked) {
    localStorage.setItem("rememberedUsername", u);
  } else {
    localStorage.removeItem("rememberedUsername");
  }
  localStorage.setItem("currentUser", u);
  showGreeting(u, users[u].firstName + " " + users[u].lastName);
}

function checkPasswordStrength(p) {
  var strengthBar = document.getElementById("strength-bar");
  var strengthText = document.getElementById("strength-text");
  if (!p) {
    strengthBar.className = "strength-bar";
    strengthText.textContent = "";
    strengthText.className = "";
    return;
  }
  
  var score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  
  var strength = "Weak";
  var className = "weak";
  if (score >= 5) {
    strength = "Strong";
    className = "strong";
  } else if (score >= 3) {
    strength = "Medium";
    className = "medium";
  }
  
  strengthBar.className = "strength-bar " + className;
  strengthText.textContent = strength + " Password";
  strengthText.className = className;
}

function handleSignUp(e) {
  e.preventDefault();
  var f = document.getElementById("signup-firstname").value.trim();
  var l = document.getElementById("signup-lastname").value.trim();
  var u = document.getElementById("signup-username").value.trim();
  var em = document.getElementById("signup-email").value.trim();
  var p = document.getElementById("signup-password").value;
  var c = document.getElementById("signup-confirm").value;
  if (!f || !l || !u || !em || !p || !c) {
    alert("Fill all fields");
    return;
  }
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(p)) {
    alert("Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    return;
  }
  if (p !== c) {
    alert("Passwords do not match");
    return;
  }
  var users = getUsers();
  if (users[u]) {
    alert("Username taken");
    return;
  }
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
  if (!u) {
    alert("Enter username first");
    return;
  }
  var users = getUsers();
  if (!users[u]) {
    alert("No account found");
    return;
  }
  alert("Reset link sent to: " + users[u].email);
}

function showGreeting(username, name) {
  document.getElementById("greeting-name").textContent = name;
  var timeEl = document.getElementById("greeting-time");
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(function () {
    timeEl.textContent = new Date().toLocaleTimeString("en-IN");
  }, 1000);
  timeEl.textContent = new Date().toLocaleTimeString("en-IN");
  var overlay = document.getElementById("greeting-overlay");
  overlay.hidden = false;
  overlay.setAttribute("data-user", username);
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var clock = clockData[username] || { status: "Out", time: "None" };
  var statusEl = document.getElementById("clock-status");
  statusEl.textContent = "Clocked " + clock.status + " at " + clock.time;
  statusEl.style.color = clock.status === "In" ? "green" : "red";
  var btn = document.getElementById("clock-toggle-btn");
  btn.textContent = clock.status === "In" ? "Clock Out" : "Clock In";
  btn.className =
    "btn-primary " + (clock.status === "In" ? "btn-clock-out" : "btn-clock-in");
}

function handleClockToggle() {
  var overlay = document.getElementById("greeting-overlay");
  var username = overlay.getAttribute("data-user");
  var time = new Date().toLocaleTimeString("en-IN");
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var currentStatus =
    (clockData[username] && clockData[username].status) || "Out";
  var nextStatus = currentStatus === "In" ? "Out" : "In";
  clockData[username] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  showGreeting(username, document.getElementById("greeting-name").textContent);
}

function closeGreeting() {
  document.getElementById("greeting-overlay").hidden = true;
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
  var currentUser = localStorage.getItem("currentUser");
  var users = getUsers();
  if (currentUser && users[currentUser]) {
    showDashboard(
      currentUser,
      users[currentUser].firstName + " " + users[currentUser].lastName,
    );
  }
}

function handleHeaderClockToggle() {
  var username = localStorage.getItem("currentUser");
  if (!username) return;
  var time = new Date().toLocaleTimeString("en-IN");
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var currentStatus =
    (clockData[username] && clockData[username].status) || "Out";
  var nextStatus = currentStatus === "In" ? "Out" : "In";
  clockData[username] = { status: nextStatus, time: time };
  localStorage.setItem("clock", JSON.stringify(clockData));
  alert("You clocked " + nextStatus + " successfully at " + time + "!");
  updateHeaderClockDisplay(username);
}

function updateHeaderClockDisplay(username) {
  var clockData = JSON.parse(localStorage.getItem("clock") || "{}");
  var clock = clockData[username] || { status: "Out", time: "None" };
  var statusIndicator = document.getElementById("header-clock-status");
  var clockBtn = document.getElementById("header-clock-btn");
  statusIndicator.textContent = "Clocked " + clock.status;
  if (clock.status === "In") {
    statusIndicator.className = "status-indicator clocked-in";
    clockBtn.textContent = "Clock Out";
  } else {
    statusIndicator.className = "status-indicator clocked-out";
    clockBtn.textContent = "Clock In";
  }
}

function calculateAge(dob) {
  var today = new Date();
  var birthDate = new Date(dob);
  var age = today.getFullYear() - birthDate.getFullYear();
  var monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age = age - 1;
  }
  return age;
}

function buildTableRows(employeeList) {
  var html = "";
  for (var i = 0; i < employeeList.length; i++) {
    var emp = employeeList[i];
    var age = calculateAge(emp.dob);
    var parts = emp.dob.split("-");
    var formattedDOB = parts[2] + "-" + parts[1] + "-" + parts[0];
    var badgeClass = "";
    if (emp.status === "Present") {
      badgeClass = "badge active";
    } else if (emp.status === "On Permission") {
      badgeClass = "badge on-permission";
    } else if (emp.status === "On Leave") {
      badgeClass = "badge on-leave";
    } else {
      badgeClass = "badge";
    }
    html +=
      "<tr>" +
      "<td>" +
      emp.id +
      "</td>" +
      "<td>" +
      emp.name +
      "</td>" +
      "<td>" +
      formattedDOB +
      "</td>" +
      "<td>" +
      age +
      "</td>" +
      "<td>" +
      emp.gender +
      "</td>" +
      "<td>" +
      emp.department +
      "</td>" +
      "<td>" +
      emp.role +
      "</td>" +
      "<td>" +
      emp.email +
      "</td>" +
      "<td><span class='" +
      badgeClass +
      "'>" +
      emp.status +
      "</span></td>" +
      "</tr>";
  }
  return html;
}

function showTable(filteredList) {
  var tableBody = document.getElementById("tableBody");
  var noResult = document.getElementById("noResult");
  var resultCount = document.getElementById("resultCount");
  resultCount.textContent = filteredList.length;
  if (filteredList.length === 0) {
    tableBody.innerHTML = "";
    noResult.classList.remove("hidden");
  } else {
    tableBody.innerHTML = buildTableRows(filteredList);
    noResult.classList.add("hidden");
  }
}

function sortEmployees(list, column, direction) {
  if (!column) return list;
  
  return list.sort(function(a, b) {
    var valA, valB;
    if (column === 'age') {
      valA = calculateAge(a.dob);
      valB = calculateAge(b.dob);
    } else {
      valA = (a[column] || "").toString().toLowerCase();
      valB = (b[column] || "").toString().toLowerCase();
    }
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function updateSortIcons() {
  var columns = ['id', 'name', 'dob', 'age', 'gender', 'department', 'role', 'email', 'status'];
  for (var i = 0; i < columns.length; i++) {
    var col = columns[i];
    var iconEl = document.getElementById("sort-icon-" + col);
    if (iconEl) {
      if (currentSortColumn === col) {
        iconEl.textContent = currentSortDirection === 'asc' ? " ▲" : " ▼";
      } else {
        iconEl.textContent = "";
      }
    }
  }
}

function handleSort(column) {
  if (currentSortColumn === column) {
    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = column;
    currentSortDirection = 'asc';
  }
  updateSortIcons();
  applyFilters();
}

function applyFilters() {
  var searchText = document
    .getElementById("searchName")
    .value.toLowerCase()
    .trim();
  var selectedDept = document.getElementById("filterDept").value;
  var selectedRole = document.getElementById("filterRole").value;
  var selectedGender = document.getElementById("filterGender").value;
  var selectedStatus = document.getElementById("filterStatus").value;
  var filtered = [];
  for (var i = 0; i < employees.length; i++) {
    var emp = employees[i];
    var matchName =
      emp.name.toLowerCase().indexOf(searchText) !== -1 ||
      emp.id.toLowerCase().indexOf(searchText) !== -1;
    var matchDept = selectedDept === "" || emp.department === selectedDept;
    var matchRole = selectedRole === "" || emp.role === selectedRole;
    var matchGender = selectedGender === "" || emp.gender === selectedGender;
    var matchStatus = selectedStatus === "" || emp.status === selectedStatus;
    if (matchName && matchDept && matchRole && matchGender && matchStatus) {
      filtered.push(emp);
    }
  }
  var sorted = sortEmployees(filtered, currentSortColumn, currentSortDirection);
  showTable(sorted);
}

function clearFilters() {
  document.getElementById("searchName").value = "";
  document.getElementById("filterDept").value = "";
  document.getElementById("filterRole").value = "";
  document.getElementById("filterGender").value = "";
  document.getElementById("filterStatus").value = "";
  currentSortColumn = null;
  currentSortDirection = "asc";
  updateSortIcons();
  showTable(employees);
}

function getStopwatchKey(key) {
  var user = localStorage.getItem("currentUser") || "default";
  return "stopwatch_" + user + "_" + key;
}

function formatNumber(number) {
  return number < 10 ? "0" + number : String(number);
}

function formatTime(totalMs) {
  var totalSeconds = Math.floor(totalMs / 1000);
  var seconds = totalSeconds % 60;
  var minutes = Math.floor(totalSeconds / 60) % 60;
  var hours = Math.floor(totalSeconds / 3600);
  return (
    formatNumber(hours) +
    ":" +
    formatNumber(minutes) +
    ":" +
    formatNumber(seconds)
  );
}

function tickStopwatch() {
  var now = Date.now();
  var currentElapsed = accumulatedTime + (now - startTime);
  document.getElementById("display").innerText = formatTime(currentElapsed);
}

function saveStopwatchState() {
  localStorage.setItem(getStopwatchKey("isRunning"), isRunning);
  localStorage.setItem(getStopwatchKey("startTime"), startTime);
  localStorage.setItem(getStopwatchKey("accumulatedTime"), accumulatedTime);
  localStorage.setItem(getStopwatchKey("laps"), JSON.stringify(laps));
}

function loadStopwatchState() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  var savedIsRunning = localStorage.getItem(getStopwatchKey("isRunning"));
  var savedStartTime = localStorage.getItem(getStopwatchKey("startTime"));
  var savedAccumulatedTime = localStorage.getItem(
    getStopwatchKey("accumulatedTime"),
  );
  var savedLaps = localStorage.getItem(getStopwatchKey("laps"));
  var lapsList = document.getElementById("lapsList");
  lapsList.innerHTML = "";
  if (savedLaps) {
    laps = JSON.parse(savedLaps);
    lapCounter = laps.length;
    for (var i = 0; i < laps.length; i++) {
      var li = document.createElement("li");
      li.innerHTML =
        "<span>Lap " + (i + 1) + "</span><span>" + laps[i] + "</span>";
      lapsList.insertBefore(li, lapsList.firstChild);
    }
  } else {
    laps = [];
    lapCounter = 0;
  }
  var startStopBtn = document.getElementById("startStopBtn");
  if (savedIsRunning === "true") {
    isRunning = true;
    startTime = parseInt(savedStartTime);
    accumulatedTime = parseInt(savedAccumulatedTime);
    var now = Date.now();
    var currentElapsed = accumulatedTime + (now - startTime);
    document.getElementById("display").innerText = formatTime(currentElapsed);
    timerId = setInterval(tickStopwatch, 1000);
    startStopBtn.innerText = "Stop";
    startStopBtn.classList.remove("start");
    startStopBtn.classList.add("stop");
  } else {
    isRunning = false;
    if (savedAccumulatedTime !== null) {
      accumulatedTime = parseInt(savedAccumulatedTime);
      document.getElementById("display").innerText =
        formatTime(accumulatedTime);
    } else {
      accumulatedTime = 0;
      document.getElementById("display").innerText = "00:00:00";
    }
    startStopBtn.innerText = "Start";
    startStopBtn.classList.remove("stop");
    startStopBtn.classList.add("start");
  }
}

function toggleStopwatch() {
  var startStopBtn = document.getElementById("startStopBtn");
  if (isRunning === false) {
    isRunning = true;
    startTime = Date.now();
    timerId = setInterval(tickStopwatch, 1000);
    startStopBtn.innerText = "Stop";
    startStopBtn.classList.remove("start");
    startStopBtn.classList.add("stop");
  } else {
    isRunning = false;
    clearInterval(timerId);
    timerId = null;
    accumulatedTime += Date.now() - startTime;
    startStopBtn.innerText = "Start";
    startStopBtn.classList.remove("stop");
    startStopBtn.classList.add("start");
  }
  saveStopwatchState();
}

function addStopwatchLap() {
  var currentElapsed = accumulatedTime;
  if (isRunning === true) {
    currentElapsed += Date.now() - startTime;
  }
  if (currentElapsed > 0) {
    lapCounter++;
    var timeString = formatTime(currentElapsed);
    laps.push(timeString);
    var lapsList = document.getElementById("lapsList");
    var li = document.createElement("li");
    li.innerHTML =
      "<span>Lap " + lapCounter + "</span><span>" + timeString + "</span>";
    lapsList.insertBefore(li, lapsList.firstChild);
    saveStopwatchState();
  }
}

function resetStopwatch() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  startTime = 0;
  accumulatedTime = 0;
  lapCounter = 0;
  laps = [];
  document.getElementById("display").innerText = "00:00:00";
  var startStopBtn = document.getElementById("startStopBtn");
  startStopBtn.innerText = "Start";
  startStopBtn.classList.remove("stop");
  startStopBtn.classList.add("start");
  document.getElementById("lapsList").innerHTML = "";
  localStorage.removeItem(getStopwatchKey("isRunning"));
  localStorage.removeItem(getStopwatchKey("startTime"));
  localStorage.removeItem(getStopwatchKey("accumulatedTime"));
  localStorage.removeItem(getStopwatchKey("laps"));
}

var editingEmpId = null;

function openAddEmployeeModal() {
  editingEmpId = null;
  document.getElementById("modal-title").innerText = "Add Employee";
  document.getElementById("emp-id").value = "";
  document.getElementById("emp-id").disabled = false;
  document.getElementById("emp-name").value = "";
  document.getElementById("emp-dob").value = "";
  document.getElementById("emp-gender").value = "Male";
  document.getElementById("emp-dept").value = "";
  document.getElementById("emp-role").value = "";
  document.getElementById("emp-email").value = "";
  document.getElementById("emp-status").value = "Present";
  document.getElementById("employee-modal").style.display = "flex";
}

function closeEmployeeModal() {
  document.getElementById("employee-modal").style.display = "none";
}

function saveEmployee() {
  var id = document.getElementById("emp-id").value.trim();
  var name = document.getElementById("emp-name").value.trim();
  var dob = document.getElementById("emp-dob").value;
  var gender = document.getElementById("emp-gender").value;
  var dept = document.getElementById("emp-dept").value.trim();
  var role = document.getElementById("emp-role").value.trim();
  var email = document.getElementById("emp-email").value.trim();
  var status = document.getElementById("emp-status").value;

  if (!id || !name || !dob || !dept || !role || !email) {
    alert("Please fill all fields!");
    return;
  }

  // Check duplicate ID
  for (var i = 0; i < employees.length; i++) {
    if (employees[i].id.toLowerCase() === id.toLowerCase()) {
      alert("Employee ID already exists!");
      return;
    }
  }

  employees.push({
    id: id,
    name: name,
    dob: dob,
    gender: gender,
    department: dept,
    role: role,
    email: email,
    status: status
  });

  localStorage.setItem("employees", JSON.stringify(employees));
  closeEmployeeModal();
  applyFilters();
}
