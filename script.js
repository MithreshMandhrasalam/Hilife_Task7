var employees = [
  { id:"EMP101", name:"Arun",      dob:"1999-02-15", gender:"Male",   department:"Software Development",    role:"Frontend Developer",     email:"arun@example.com",      status:"Present" },
  { id:"EMP102", name:"Priya",     dob:"1998-07-22", gender:"Female", department:"Web Development",         role:"UI/UX Designer",         email:"priya@example.com",     status:"Present" },
  { id:"EMP103", name:"Karthik",   dob:"1997-11-10", gender:"Male",   department:"Cyber Security",          role:"Security Analyst",       email:"karthik@example.com",   status:"Present" },
  { id:"EMP104", name:"Divya",     dob:"2000-04-03", gender:"Female", department:"Data Science",            role:"Data Analyst",           email:"divya@example.com",     status:"Present" },
  { id:"EMP105", name:"Surya",     dob:"1996-09-18", gender:"Male",   department:"Cloud Computing",         role:"Cloud Engineer",         email:"surya@example.com",     status:"On Permission" },
  { id:"EMP106", name:"Keerthi",   dob:"1999-01-27", gender:"Female", department:"Artificial Intelligence", role:"ML Engineer",            email:"keerthi@example.com",   status:"Present" },
  { id:"EMP107", name:"Vignesh",   dob:"1998-06-05", gender:"Male",   department:"IT Support",              role:"System Administrator",   email:"vignesh@example.com",   status:"Present" },
  { id:"EMP108", name:"Nisha",     dob:"2001-12-14", gender:"Female", department:"Mobile App Development",  role:"Android Developer",      email:"nisha@example.com",     status:"Present" },
  { id:"EMP109", name:"Hari",      dob:"1997-08-29", gender:"Male",   department:"DevOps",                  role:"DevOps Engineer",        email:"hari@example.com",      status:"On Leave" },
  { id:"EMP110", name:"Aishwarya", dob:"2000-03-11", gender:"Female", department:"Database Management",     role:"Database Administrator", email:"aishwarya@example.com", status:"Present" }
];

var clockTimer = null, timerId = null, attendanceInterval = null;
var isRunning = false, startTime = 0, accumulatedTime = 0, lapCounter = 0, laps = [];

var $ = function(id) { return document.getElementById(id); };

window.onload = function () {
  var users = JSON.parse(localStorage.getItem("users") || "{}");
  if (!Object.keys(users).length) {
    users["hilife"] = { firstName:"HiLife", lastName:"User", email:"user@hilife.ai", password:"password123" };
    localStorage.setItem("users", JSON.stringify(users));
  }
  var rem = localStorage.getItem("rememberedUsername");
  if (rem) { $("signin-username").value = rem; $("signin-remember").checked = true; }

  var cu = localStorage.getItem("currentUser");
  var su = JSON.parse(localStorage.getItem("users") || "{}");
  cu && su[cu] ? showDashboard(cu, su[cu].firstName + " " + su[cu].lastName) : showLoginScreen();

  ["searchName","filterDept","filterRole","filterGender","filterStatus"].forEach(function(id) {
    $( id).addEventListener(id === "searchName" ? "input" : "change", applyFilters);
  });
  $("clearBtn").addEventListener("click", clearFilters);
  $("startStopBtn").addEventListener("click", toggleStopwatch);
  $("lapBtn").addEventListener("click", addStopwatchLap);
  $("resetBtn").addEventListener("click", resetStopwatch);
};

function showLoginScreen() {
  $("login-screen").classList.remove("hidden");
  $("dashboard-screen").classList.add("hidden");
  $("greeting-overlay").classList.add("overlay-hidden");
  if (attendanceInterval) { clearInterval(attendanceInterval); attendanceInterval = null; }
}

function showDashboard(username, fullName) {
  $("login-screen").classList.add("hidden");
  $("dashboard-screen").classList.remove("hidden");
  $("user-greeting").textContent = "Hello, " + fullName;
  updateClockUI(username);
  updateAttendanceStats(username);
  if (attendanceInterval) clearInterval(attendanceInterval);
  attendanceInterval = setInterval(function() {
    var u = localStorage.getItem("currentUser");
    if (u) updateAttendanceStats(u);
  }, 1000);
  switchDashboardTab(localStorage.getItem("active_tab_" + username) || "directory");
}

function switchLoginTab(tab) {
  var s = tab === "signin";
  $("tab-signin").classList.toggle("active", s);   $("tab-signup").classList.toggle("active", !s);
  $("panel-signin").classList.toggle("active", s); $("panel-signup").classList.toggle("active", !s);
}

function switchDashboardTab(tab) {
  var d = tab === "directory";
  var cu = localStorage.getItem("currentUser") || "hilife";
  localStorage.setItem("active_tab_" + cu, tab);
  $("tab-btn-directory").classList.toggle("active", d); $("tab-btn-timer").classList.toggle("active", !d);
  $("directory-tab").classList.toggle("active", d);     $("timer-tab").classList.toggle("active", !d);
  if (d) { showTable(employees); clearFilters(); } else { loadStopwatchState(); updateAttendanceStats(cu); }
}

function togglePassword(id, btn) {
  var inp = $(id);
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "password" ? "Show" : "Hide";
}

function getUsers() { return JSON.parse(localStorage.getItem("users") || "{}"); }
function saveUsers(u) { localStorage.setItem("users", JSON.stringify(u)); }

function handleSignIn(e) {
  e.preventDefault();
  var u = $("signin-username").value.trim(), p = $("signin-password").value;
  if (!u || !p) return alert("Please fill in all fields.");
  var users = getUsers();
  if (!users[u] || users[u].password !== p) return alert("Invalid username or password.");
  localStorage[document.getElementById("signin-remember").checked ? "setItem" : "removeItem"]("rememberedUsername", u);
  localStorage.setItem("currentUser", u);
  showGreeting(u, users[u].firstName + " " + users[u].lastName);
  $("signin-username").value = $("signin-password").value = "";
}

function handleSignUp(e) {
  e.preventDefault();
  var f=$("signup-firstname").value.trim(), l=$("signup-lastname").value.trim(),
      u=$("signup-username").value.trim(), em=$("signup-email").value.trim(),
      p=$("signup-password").value, c=$("signup-confirm").value;
  if (!f||!l||!u||!em||!p||!c) return alert("Please fill in all fields.");
  if (p.length < 6) return alert("Password must be at least 6 characters.");
  if (p !== c) return alert("Passwords do not match.");
  var users = getUsers();
  if (users[u]) return alert("Username is already taken.");
  users[u] = { firstName:f, lastName:l, email:em, password:p };
  saveUsers(users);
  localStorage.setItem("currentUser", u);
  showGreeting(u, f + " " + l);
  ["signup-firstname","signup-lastname","signup-username","signup-email","signup-password","signup-confirm"]
    .forEach(function(id) { $(id).value = ""; });
}

function handleSignOut() {
  if (isRunning) { clearInterval(timerId); isRunning = false; saveStopwatchState(); }
  if (attendanceInterval) { clearInterval(attendanceInterval); attendanceInterval = null; }
  var cu = localStorage.getItem("currentUser");
  if (cu) localStorage.removeItem("active_tab_" + cu);
  localStorage.removeItem("currentUser");
  showLoginScreen();
}

function forgotPassword() {
  var u = $("signin-username").value.trim();
  if (!u) return alert("Please enter your username first.");
  var users = getUsers();
  if (!users[u]) return alert("No account found with that username.");
  alert("Password reset link sent to: " + users[u].email);
}

function getGreeting() {
  var h = new Date().getHours();
  return h < 5 ? "Good Night," : h < 12 ? "Good Morning," : h < 17 ? "Good Afternoon," : h < 21 ? "Good Evening," : "Good Night,";
}

function showGreeting(username, name) {
  $("greeting-text").textContent = getGreeting();
  $("greeting-name").textContent = name;
  var el = $("greeting-time");
  function tick() {
    var n = new Date(), h = n.getHours(), m = n.getMinutes(), s = n.getSeconds();
    var ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    var p = function(x) { return x < 10 ? "0"+x : ""+x; };
    el.textContent = p(h)+":"+p(m)+":"+p(s)+" "+ap;
    $("greeting-text").textContent = getGreeting();
  }
  tick();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
  $("greeting-overlay").classList.remove("overlay-hidden");
  updateClockUI(username);
}

function closeGreeting() {
  $("greeting-overlay").classList.add("overlay-hidden");
  if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
  var cu = localStorage.getItem("currentUser"), users = getUsers();
  if (cu && users[cu]) showDashboard(cu, users[cu].firstName + " " + users[cu].lastName);
}

function handleClockToggle() {
  var u = localStorage.getItem("currentUser");
  if (!u) return;
  var time = new Date().toLocaleTimeString("en-IN");
  var date = new Date().toLocaleDateString("en-CA");
  var cd = JSON.parse(localStorage.getItem("clock") || "{}");
  var next = ((cd[u] && cd[u].status) || "Out") === "In" ? "Out" : "In";
  cd[u] = { status:next, time:time };
  localStorage.setItem("clock", JSON.stringify(cd));
  var key = "attendance_logs_" + u;
  var logs = JSON.parse(localStorage.getItem(key) || "[]");
  if (next === "In") {
    logs.push({ date:date, clockIn:time, clockOut:null, rawIn:Date.now(), rawOut:null, duration:null });
  } else {
    var active = null;
    for (var i = 0; i < logs.length; i++) if (!logs[i].clockOut) { active = logs[i]; break; }
    if (active) { active.clockOut = time; active.rawOut = Date.now(); active.duration = active.rawOut - active.rawIn; }
    else logs.push({ date:date, clockIn:time, clockOut:time, rawIn:Date.now(), rawOut:Date.now(), duration:0 });
  }
  localStorage.setItem(key, JSON.stringify(logs));
  if ($("greeting-overlay").classList.contains("overlay-hidden"))
    alert("You clocked " + next + " successfully at " + time + "!");
  updateClockUI(u);
  updateAttendanceStats(u);
}

function handleHeaderClockToggle() { handleClockToggle(); }

function updateClockUI(username) {
  var ck = (JSON.parse(localStorage.getItem("clock") || "{}")[username]) || { status:"Out", time:"None" };
  var inn = ck.status === "In";
  var se = $("clock-status");
  if (se) { se.textContent = "Clocked " + ck.status + " at " + ck.time; se.style.color = inn ? "#28a745" : "#dc3545"; }
  var tb = $("clock-toggle-btn");
  if (tb) { tb.textContent = inn ? "Clock Out" : "Clock In"; tb.className = inn ? "btn-primary clocked-in" : "btn-primary clocked-out"; }
  var hs = $("header-clock-status");
  if (hs) { hs.textContent = "Clocked " + ck.status; hs.className = "status-indicator " + (inn ? "clocked-in" : "clocked-out"); }
  var hb = $("header-clock-btn");
  if (hb) hb.textContent = inn ? "Clock Out" : "Clock In";
}

function pad(n) { return n < 10 ? "0"+n : ""+n; }

function formatDuration(ms) {
  if (!ms || ms < 0) return "00h 00m 00s";
  var s = Math.floor(ms/1000);
  return pad(Math.floor(s/3600))+"h "+pad(Math.floor((s%3600)/60))+"m "+pad(s%60)+"s";
}

function updateAttendanceStats(username) {
  if (!username) return;
  var logs = JSON.parse(localStorage.getItem("attendance_logs_" + username) || "[]");
  var today = new Date().toLocaleDateString("en-CA");
  var active = null;
  for (var k = 0; k < logs.length; k++) if (!logs[k].clockOut) { active = logs[k]; break; }
  var inn = !!active;
  var todayLogs = logs.filter(function(l) { return l.date === today || l === active; });
  var firstIn = "--:--", lastOut = "--:--", totalMs = 0;
  if (todayLogs.length) {
    firstIn = todayLogs[0].clockIn;
    todayLogs.forEach(function(l) {
      if (l.clockOut) { totalMs += l.duration; lastOut = l.clockOut; }
      else totalMs += Date.now() - l.rawIn;
    });
  }
  var ss = $("stats-status");
  if (ss) { ss.textContent = inn ? "Clocked In" : "Clocked Out"; ss.className = "stat-value " + (inn ? "clocked-in" : "clocked-out"); }
  var fi = $("stats-first-in"); if (fi) fi.textContent = firstIn;
  var lo = $("stats-last-out"); if (lo) lo.textContent = lastOut;
  var sw = $("stats-work-hours"); if (sw) sw.textContent = formatDuration(totalMs);
  var pct = Math.min(100, Math.floor((totalMs / (8*3600000)) * 100));
  var gp = $("goal-percentage"); if (gp) gp.textContent = pct + "% (" + (totalMs/3600000).toFixed(2) + " / 8 hrs)";
  var pf = $("goal-progress-fill"); if (pf) pf.style.width = pct + "%";
  var tb = $("attendanceLogsBody"), nm = $("noAttendanceLogs");
  if (!tb) return;
  tb.innerHTML = "";
  if (!todayLogs.length) { if (nm) nm.style.display = "block"; return; }
  if (nm) nm.style.display = "none";
  todayLogs.forEach(function(item) {
    var done = !!item.clockOut;
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>"+item.clockIn+"</td>"+
      "<td>"+(done ? item.clockOut : "Active")+"</td>"+
      "<td>"+(done ? formatDuration(item.duration) : formatDuration(Date.now()-item.rawIn))+"</td>"+
      "<td><span class='"+(done?"badge active":"badge on-leave")+"'>"+(done?"Completed":"Active")+"</span></td>";
    tb.appendChild(tr);
  });
}

function calculateAge(dob) {
  var t = new Date(), b = new Date(dob), a = t.getFullYear()-b.getFullYear();
  var m = t.getMonth()-b.getMonth();
  if (m < 0 || (m===0 && t.getDate()<b.getDate())) a--;
  return a;
}

function buildTableRows(list) {
  return list.map(function(e) {
    var bc = e.status==="Present" ? "badge active" : e.status==="On Leave" ? "badge on-leave" : "badge on-permission";
    return "<tr><td>"+e.id+"</td><td>"+e.name+"</td><td>"+e.dob.split("-").reverse().join("-")+"</td>"+
      "<td>"+calculateAge(e.dob)+"</td><td>"+e.gender+"</td><td>"+e.department+"</td>"+
      "<td>"+e.role+"</td><td>"+e.email+"</td><td><span class='"+bc+"'>"+e.status+"</span></td></tr>";
  }).join("");
}

function showTable(list) {
  $("resultCount").textContent = list.length;
  $("tableBody").innerHTML = buildTableRows(list);
  $("noResult").classList.toggle("hidden", list.length > 0);
}

function applyFilters() {
  var s=$("searchName").value.toLowerCase().trim(), d=$("filterDept").value,
      r=$("filterRole").value, g=$("filterGender").value, st=$("filterStatus").value;
  showTable(employees.filter(function(e) {
    return (e.name.toLowerCase().includes(s)||e.id.toLowerCase().includes(s)) &&
      (!d||e.department===d) && (!r||e.role===r) && (!g||e.gender===g) && (!st||e.status===st);
  }));
}

function clearFilters() {
  ["searchName","filterDept","filterRole","filterGender","filterStatus"].forEach(function(id){ $(id).value=""; });
  showTable(employees);
}

function swKey(k) { return "stopwatch_"+(localStorage.getItem("currentUser")||"default")+"_"+k; }

function formatTime(ms) {
  var s=Math.floor(ms/1000);
  return pad(Math.floor(s/3600))+":"+pad(Math.floor((s%3600)/60))+":"+pad(s%60);
}

function tickStopwatch() { $("display").textContent = formatTime(accumulatedTime+(Date.now()-startTime)); }

function saveStopwatchState() {
  localStorage.setItem(swKey("isRunning"), isRunning);
  localStorage.setItem(swKey("startTime"), startTime);
  localStorage.setItem(swKey("accumulatedTime"), accumulatedTime);
  localStorage.setItem(swKey("laps"), JSON.stringify(laps));
}

function loadStopwatchState() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  laps = JSON.parse(localStorage.getItem(swKey("laps"))) || [];
  lapCounter = laps.length;
  var ll = $("lapsList"); ll.innerHTML = "";
  laps.forEach(function(t, i) {
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap "+(i+1)+"</span><span>"+t+"</span>";
    ll.insertBefore(li, ll.firstChild);
  });
  isRunning = localStorage.getItem(swKey("isRunning")) === "true";
  startTime = parseInt(localStorage.getItem(swKey("startTime")),10) || 0;
  accumulatedTime = parseInt(localStorage.getItem(swKey("accumulatedTime")),10) || 0;
  var btn = $("startStopBtn"), dt = accumulatedTime;
  if (isRunning) { dt += Date.now()-startTime; timerId = setInterval(tickStopwatch,1000); btn.textContent="Stop"; btn.className="btn stop"; }
  else { btn.textContent="Start"; btn.className="btn start"; }
  $("display").textContent = formatTime(dt);
}

function toggleStopwatch() {
  var btn = $("startStopBtn");
  if (!isRunning) {
    isRunning=true; startTime=Date.now(); timerId=setInterval(tickStopwatch,1000); tickStopwatch();
    btn.textContent="Stop"; btn.className="btn stop";
  } else {
    isRunning=false; clearInterval(timerId); timerId=null; accumulatedTime+=Date.now()-startTime;
    btn.textContent="Start"; btn.className="btn start";
  }
  saveStopwatchState();
}

function addStopwatchLap() {
  var el = accumulatedTime + (isRunning ? Date.now()-startTime : 0);
  if (el > 0) {
    lapCounter++;
    var t = formatTime(el); laps.push(t);
    var li = document.createElement("li");
    li.innerHTML = "<span>Lap "+lapCounter+"</span><span>"+t+"</span>";
    var ll = $("lapsList"); ll.insertBefore(li, ll.firstChild);
    saveStopwatchState();
  }
}

function resetStopwatch() {
  if (timerId) { clearInterval(timerId); timerId=null; }
  isRunning=false; startTime=accumulatedTime=lapCounter=0; laps=[];
  $("display").textContent="00:00:00";
  var btn=$("startStopBtn"); btn.textContent="Start"; btn.className="btn start";
  $("lapsList").innerHTML="";
  ["isRunning","startTime","accumulatedTime","laps"].forEach(function(k){ localStorage.removeItem(swKey(k)); });
}
