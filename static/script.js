// ── GRADE MAP ──
const gradeMap = {
  "O": 10, "A+": 9, "A": 8,
  "B+": 7.5, "B": 7, "C+": 6.5, "C": 6, "F": 0
};

// ── SUBJECT COUNTER ──
let subjectCount = 0;
let backlogCount = 0;

// ── ADD SUBJECT ROW ──
function addSubject() {
  subjectCount++;
  const container = document.getElementById("subjectsContainer");

  const row = document.createElement("div");
  row.classList.add("subject-row");
  row.id = `subject-${subjectCount}`;

  row.innerHTML = `
    <div class="input-wrap">
      <label>Subject Name | विषय का नाम</label>
      <input type="text" placeholder="e.g. Mathematics" onchange="calculateCGPA()" />
    </div>
    <div class="input-wrap">
      <label>Grade | ग्रेड</label>
      <select onchange="calculateCGPA()">
        <option value="" disabled selected>Select | चुनें</option>
        <option value="O">O — 10</option>
        <option value="A+">A+ — 9</option>
        <option value="A">A — 8</option>
        <option value="B+">B+ — 7</option>
        <option value="B">B — 6</option>
        <option value="C+">C+ — 5.5</option>
        <option value="C">C — 5</option>
        <option value="F">F — 0</option>
      </select>
    </div>
    <div class="input-wrap">
      <label>Credits | क्रेडिट</label>
      <select onchange="calculateCGPA()">
        <option value="1">1 Credit</option>
        <option value="2">2 Credits</option>
        <option value="3" selected>3 Credits</option>
        <option value="4">4 Credits</option>
        <option value="5">5 Credits</option>
      </select>
    </div>
    <button class="delete-btn" onclick="deleteSubject('subject-${subjectCount}')" title="Delete">✕</button>
  `;

  container.appendChild(row);
  calculateCGPA();
}

// ── DELETE SUBJECT ROW ──
function deleteSubject(id) {
  const row = document.getElementById(id);
  if (row) {
    row.style.opacity = "0";
    row.style.transform = "translateX(20px)";
    row.style.transition = "all 0.25s ease";
    setTimeout(() => {
      row.remove();
      calculateCGPA();
    }, 250);
  }
}

// ── CALCULATE CGPA ──
function calculateCGPA() {
  const rows = document.querySelectorAll(".subject-row");
  let totalWeighted = 0;
  let totalCredits = 0;

  rows.forEach(row => {
    const selects = row.querySelectorAll("select");
    const gradeSelect = selects[0];
    const creditSelect = selects[1];

    if (gradeSelect && creditSelect) {
      const grade = gradeSelect.value;
      const credits = parseFloat(creditSelect.value);
      const gradePoints = gradeMap[grade];
      if (grade === "" || gradePoints === undefined) return;
      totalWeighted += gradePoints * credits;
      totalCredits += credits;
    }
  });

  const cgpaDisplay = document.getElementById("cgpaDisplay");
  const cgpaValue = document.getElementById("cgpaValue");
  const cgpaStatus = document.getElementById("cgpaStatus");
  const cgpaHint = document.getElementById("cgpaHint");

  if (totalCredits === 0) {
    cgpaValue.textContent = "—";
    cgpaValue.className = "cgpa-value";
    cgpaDisplay.className = "cgpa-display";
    cgpaStatus.textContent = "";
    cgpaHint.textContent = "विषय जोड़ें और CGPA देखें";
    return;
  }

  // ── FORMULA: CGPA = Σ(Grade Points × Credits) / Σ(Credits) ──
  const cgpa = (totalWeighted / totalCredits).toFixed(2);

  cgpaValue.textContent = cgpa;

  // ── COLOR BASED ON CGPA ──
  if (cgpa >= 8.0) {
    cgpaValue.className = "cgpa-value state-good";
    cgpaDisplay.className = "cgpa-display state-good";
    cgpaStatus.className = "cgpa-status state-good";
    cgpaStatus.textContent = "🌟 Excellent | उत्कृष्ट";
    cgpaHint.textContent = "बहुत बढ़िया! आप टॉप पर हैं।";
  } else if (cgpa >= 6.5) {
    cgpaValue.className = "cgpa-value state-avg";
    cgpaDisplay.className = "cgpa-display state-avg";
    cgpaStatus.className = "cgpa-status state-avg";
    cgpaStatus.textContent = "📈 Good | अच्छा";
    cgpaHint.textContent = "अच्छा है! थोड़ी मेहनत और करें।";
  } else {
    cgpaValue.className = "cgpa-value state-low";
    cgpaDisplay.className = "cgpa-display state-low";
    cgpaStatus.className = "cgpa-status state-low";
    cgpaStatus.textContent = "💪 Needs Work | सुधार ज़रूरी";
    cgpaHint.textContent = "चिंता मत करो — Semester Saathi मदद करेगा।";
  }

  return cgpa;
}

// ── COLLECT SUBJECTS DATA ──
function collectSubjects() {
  const rows = document.querySelectorAll(".subject-row");
  const subjects = [];

  rows.forEach(row => {
    const nameInput = row.querySelector("input[type='text']");
    const selects = row.querySelectorAll("select");
    const gradeSelect = selects[0];
    const creditSelect = selects[1];

    const name = nameInput ? nameInput.value.trim() : "";
    const grade = gradeSelect ? gradeSelect.value : "A";
    const credits = creditSelect ? parseFloat(creditSelect.value) : 3;

    subjects.push({
      name: name || `Subject ${subjects.length + 1}`,
      grade,
      credits
    });
  });

  return subjects;
}

// ── ANALYZE GRADES (AI MENTORSHIP) ──
async function analyzeGrades() {
  const rows = document.querySelectorAll(".subject-row");

  if (rows.length === 0) {
    showToast("पहले कम से कम एक विषय जोड़ें! | Add at least one subject first!");
    return;
  }

  const subjects = collectSubjects();
  const cgpa = calculateCGPA();

  const btn = document.getElementById("analyzeBtn");
  const resultCard = document.getElementById("analyzeResult");
  const resultContent = document.getElementById("analyzeContent");
  const loadingWrap = document.getElementById("analyzeLoading");

  // Show loading
  btn.disabled = true;
  btn.textContent = "विश्लेषण हो रहा है... | Analyzing...";
  resultCard.classList.add("visible");
  resultContent.style.display = "none";
  loadingWrap.style.display = "flex";

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjects, cgpa })
    });

    const data = await response.json();

    if (data.error) {
      resultContent.textContent = "❌ Error: " + data.error;
      resultContent.style.display = "block";
      loadingWrap.style.display = "none";
    } else {
      loadingWrap.style.display = "none";
      resultContent.style.display = "block";
      typewriter(resultContent, data.result);
    }

  } catch (err) {
    loadingWrap.style.display = "none";
    resultContent.style.display = "block";
    resultContent.textContent = "❌ कुछ गलत हो गया। | Something went wrong. Please try again.";
  }

  btn.disabled = false;
  btn.textContent = "🤖 मेरी कहानी बनाएं | Generate My Story";
}

// ── ADD BACKLOG ROW ──
function addBacklog() {
  backlogCount++;
  const container = document.getElementById("backlogContainer");

  const row = document.createElement("div");
  row.classList.add("backlog-row");
  row.id = `backlog-${backlogCount}`;

  row.innerHTML = `
    <div class="input-wrap">
      <label>Subject Name | विषय का नाम</label>
      <input type="text" placeholder="e.g. Physics" />
    </div>
    <div class="input-wrap">
      <label>Difficulty | कठिनाई</label>
      <select>
        <option value="Easy">Easy | आसान</option>
        <option value="Medium" selected>Medium | मध्यम</option>
        <option value="Hard">Hard | कठिन</option>
      </select>
    </div>
    <button class="delete-btn" onclick="deleteBacklog('backlog-${backlogCount}')" title="Delete">✕</button>
  `;

  container.appendChild(row);
}

// ── DELETE BACKLOG ROW ──
function deleteBacklog(id) {
  const row = document.getElementById(id);
  if (row) {
    row.style.opacity = "0";
    row.style.transform = "translateX(20px)";
    row.style.transition = "all 0.25s ease";
    setTimeout(() => row.remove(), 250);
  }
}

// ── RESCUE BACKLOG (AI) ──
async function rescueBacklog() {
  const rows = document.querySelectorAll(".backlog-row");

  if (rows.length === 0) {
    showToast("पहले बैकलॉग विषय जोड़ें! | Add backlog subjects first!");
    return;
  }

  const backlogs = [];
  rows.forEach(row => {
    const nameInput = row.querySelector("input[type='text']");
    const diffSelect = row.querySelector("select");
    backlogs.push({
      name: nameInput ? nameInput.value.trim() || "Unknown Subject" : "Unknown Subject",
      difficulty: diffSelect ? diffSelect.value : "Medium"
    });
  });

  const btn = document.getElementById("rescueBtn");
  const resultCard = document.getElementById("backlogResult");
  const resultContent = document.getElementById("backlogContent");
  const loadingWrap = document.getElementById("backlogLoading");

  // Show loading
  btn.disabled = true;
  btn.textContent = "बचाव योजना बन रही है... | Creating Rescue Plan...";
  resultCard.classList.add("visible");
  resultContent.style.display = "none";
  loadingWrap.style.display = "flex";

  try {
    const response = await fetch("/backlog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backlogs })
    });

    const data = await response.json();

    if (data.error) {
      resultContent.textContent = "❌ Error: " + data.error;
      resultContent.style.display = "block";
      loadingWrap.style.display = "none";
    } else {
      loadingWrap.style.display = "none";
      resultContent.style.display = "block";
      typewriter(resultContent, data.result);
    }

  } catch (err) {
    loadingWrap.style.display = "none";
    resultContent.style.display = "block";
    resultContent.textContent = "❌ कुछ गलत हो गया। | Something went wrong. Please try again.";
  }

  btn.disabled = false;
  btn.textContent = "🆘 मुझे बचाओ | Rescue Me";
}

// ── TYPEWRITER EFFECT ──
function typewriter(element, text, speed = 8) {
  // Convert markdown to HTML first
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');

  // Set full HTML at once then animate opacity
  element.innerHTML = html;
  element.style.opacity = "0";
  element.style.transition = "opacity 0.8s ease";

  setTimeout(() => {
    element.style.opacity = "1";
    element.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 100);
}

// ── TOAST NOTIFICATION ──
function showToast(message) {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast";
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e1e2e;
    border: 1px solid #26263d;
    color: #eaeaf5;
    padding: 12px 24px;
    border-radius: 30px;
    font-size: 13px;
    font-family: 'Noto Sans Devanagari', sans-serif;
    z-index: 9999;
    animation: fadeUp 0.3s ease;
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── INIT — Add first subject on load ──
window.addEventListener("DOMContentLoaded", () => {
  addSubject();
  addSubject();
  addSubject();
  addBacklog();




// ── FLOATING PARTICLES ──
function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (Math.random() * 15 + 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.background = ['#7c6fff','#3dd68c','#f5c842'][Math.floor(Math.random()*3)];
    container.appendChild(p);
  }
}
createParticles();
});