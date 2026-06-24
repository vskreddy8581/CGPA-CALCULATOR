var gradeMap = {
  "O":  10,
  "S":   9,
  "A+":  8,
  "A":   7,
  "B+":  6,
  "B":   5,
  "C+":  4,
  "C":   3
};

var semesterCount = 0;

/* ── ADD SEMESTER ────────────────────────────────────────── */
function addSemester() {
  semesterCount++;

  var container = document.getElementById("semesters-container");

  var semester = document.createElement("div");
  semester.className = "semester-card";

  semester.innerHTML =
    '<div class="semester-header">' +
      '<h3>Semester ' + semesterCount + '</h3>' +
      '<button class="btn-delete-sem" onclick="deleteSemester(this)" title="Remove semester">✕ Remove</button>' +
    '</div>' +
    '<div class="subjects-list"></div>' +
    '<button class="btn btn-add" onclick="addSubjectRow(this)">+ Add Subject</button>' +
    '<div class="semester-result">SGPA: <span>—</span></div>';

  container.appendChild(semester);

  /* Add one blank subject row automatically */
  addSubjectRow(semester.querySelector(".btn-add"));
}

/* ── DELETE SEMESTER ─────────────────────────────────────── */
function deleteSemester(btn) {
  var semCard = btn.closest(".semester-card");
  if (semCard) semCard.remove();
}

/* ── ADD SUBJECT ROW ─────────────────────────────────────── */
function addSubjectRow(btn) {
  /* FIX: walk up to .semester-card first, then find .subjects-list.
     The old code used btn.parentElement which only went one level up
     and failed to find .subjects-list correctly once wrapped in .semester-header. */
  var semCard     = btn.closest(".semester-card");
  var subjectsList = semCard.querySelector(".subjects-list");

  var row = document.createElement("div");
  row.className = "subject-row";

  row.innerHTML =
    '<input type="text"   class="subject-name-input"    placeholder="Subject name">' +
    '<input type="number" class="subject-credits-input" min="0" placeholder="Credits">' +
    '<select class="subject-grade-select">' +
      '<option value="">Grade</option>' +
      '<option value="O">O (10)</option>'  +
      '<option value="S">S (9)</option>'   +
      '<option value="A+">A+ (8)</option>' +
      '<option value="A">A (7)</option>'   +
      '<option value="B+">B+ (6)</option>' +
      '<option value="B">B (5)</option>'   +
      '<option value="C+">C+ (4)</option>' +
      '<option value="C">C (3)</option>'   +
    '</select>' +
    '<button class="btn-delete" onclick="this.parentElement.remove()" title="Remove subject">✕</button>';

  subjectsList.appendChild(row);
}

/* ── SHOW / HIDE ERROR ───────────────────────────────────── */
function showError(msg) {
  var el = document.getElementById("error-msg");
  el.textContent = msg;
  el.style.display = "block";          /* FIX: was relying on a .visible class that had no CSS rule */
}

function clearError() {
  var el = document.getElementById("error-msg");
  el.textContent = "";
  el.style.display = "none";
}

/* ── PERFORMANCE BADGE ───────────────────────────────────── */
/* FIX: badge was never updated — text stayed "—" forever */
var perfLevels = [
  { min: 9.0,  cls: "perf-outstanding", label: "Outstanding",  sub: "Exceptional academic performance — keep it up!" },
  { min: 8.0,  cls: "perf-excellent",   label: "Excellent",    sub: "Excellent work! You're among the top performers."  },
  { min: 7.0,  cls: "perf-verygood",    label: "Very Good",    sub: "Very good performance. A little more and you'll excel!" },
  { min: 6.0,  cls: "perf-good",        label: "Good",         sub: "Good effort. Stay consistent and aim higher."   },
  { min: 0,    cls: "perf-needs",       label: "Needs Improvement", sub: "Don't give up — focus and improvement pays off." }
];

function updateBadge(cgpa) {
  var badge = document.getElementById("perf-badge");
  var text  = document.getElementById("perf-text");
  var sub   = document.getElementById("perf-sub");

  /* Remove all existing perf classes */
  perfLevels.forEach(function (p) { badge.classList.remove(p.cls); });

  var level = perfLevels[perfLevels.length - 1];   /* default: needs improvement */
  for (var i = 0; i < perfLevels.length; i++) {
    if (cgpa >= perfLevels[i].min) {
      level = perfLevels[i];
      break;
    }
  }

  badge.classList.add(level.cls);
  text.textContent = level.label;
  sub.textContent  = level.sub;
}

/* ── CALCULATE CGPA ──────────────────────────────────────── */
function calculateCGPA() {
  clearError();

  var semCards = document.querySelectorAll(".semester-card");

  /* FIX: validation — no semesters added */
  if (semCards.length === 0) {
    showError("Please add at least one semester before calculating.");
    return;
  }

  var overallCredits      = 0;
  var overallCreditPoints = 0;
  var totalSubjects       = 0;
  var hasAnyGrade         = false;

  semCards.forEach(function (semCard) {
    var rows           = semCard.querySelectorAll(".subject-row");
    var semCredits      = 0;
    var semCreditPoints = 0;

    rows.forEach(function (row) {
      var creditsRaw = row.querySelector(".subject-credits-input").value;
      var grade      = row.querySelector(".subject-grade-select").value;

      if (grade === "") return;           /* skip rows without a grade selected */

      var credits    = parseFloat(creditsRaw) || 0;
      var gradePoint = gradeMap[grade];

      hasAnyGrade = true;
      totalSubjects++;
      semCredits      += credits;
      semCreditPoints += credits * gradePoint;
    });

    var sgpa = semCredits > 0 ? semCreditPoints / semCredits : 0;

    semCard.querySelector(".semester-result span").textContent =
      semCredits > 0 ? sgpa.toFixed(2) : "—";

    overallCredits      += semCredits;
    overallCreditPoints += semCreditPoints;
  });

  /* FIX: validation — no grades entered anywhere */
  if (!hasAnyGrade) {
    showError("Please select at least one grade to calculate.");
    return;
  }

  var cgpa = overallCredits > 0 ? overallCreditPoints / overallCredits : 0;

  /* FIX: update all four stat boxes (res-semesters / res-subjects / res-credits were never set) */
  document.getElementById("res-semesters").textContent = semCards.length;
  document.getElementById("res-subjects").textContent  = totalSubjects;
  document.getElementById("res-credits").textContent   = overallCredits;
  document.getElementById("res-cgpa").textContent      = cgpa.toFixed(2);

  /* FIX: populate performance badge */
  updateBadge(cgpa);

  /* Show result section */
  var resultSection = document.getElementById("result-section");
  resultSection.style.display = "block";    /* FIX: .visible class had no display:block rule in CSS */
}

/* ── RESET ALL ───────────────────────────────────────────── */
function resetAll() {
  document.getElementById("semesters-container").innerHTML = "";
  semesterCount = 0;

  var resultSection = document.getElementById("result-section");
  resultSection.style.display = "none";
  resultSection.classList.remove("visible");

  clearError();
  addSemester();
}

/* ── INIT: start with one empty semester ─────────────────── */
addSemester();
