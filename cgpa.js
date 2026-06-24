// Grade point map
var gradeMap = {
  "O": 10,
  "S": 9,
  "A+": 8,
  "A": 7,
  "B+": 6,
  "B": 5,
  "C+": 4,
  "C": 3
};

// Track how many subjects have been added
var subjectCounter = 0;

// ===== ADD A SINGLE SUBJECT ROW =====
function addSubjectRow() {
  subjectCounter++;
  var list = document.getElementById("subjects-list");

  var row = document.createElement("div");
  row.className = "subject-row";
  row.innerHTML =
    '<span class="subject-num">' + subjectCounter + '</span>' +
    '<input class="subject-name-input" type="text" placeholder="Subject ' + subjectCounter + '" />' +
    '<input class="subject-credits-input" type="number" min="0" max="10" placeholder="Credits" />' +
    '<select class="subject-grade-select">' +
      '<option value="">Grade</option>' +
      '<option value="O">O (10)</option>' +
      '<option value="S">S (9)</option>' +
      '<option value="A+">A+ (8)</option>' +
      '<option value="A">A (7)</option>' +
      '<option value="B+">B+ (6)</option>' +
      '<option value="B">B (5)</option>' +
      '<option value="C+">C+ (4)</option>' +
      '<option value="C">C (3)</option>' +
    '</select>' +
    '<button class="btn-delete" title="Remove" onclick="deleteRow(this)">&#x2715;</button>';

  list.appendChild(row);

  row.querySelector(".subject-name-input").focus();

  clearError();
  hideResult();
}

// ===== DELETE A ROW =====
function deleteRow(btn) {
  var row = btn.closest(".subject-row");
  row.remove();
  renumberRows();
  hideResult();
}

// ===== RENUMBER ROWS =====
function renumberRows() {
  var rows = document.querySelectorAll(".subject-row");

  rows.forEach(function(row, i) {
    row.querySelector(".subject-num").textContent = i + 1;
  });

  subjectCounter = rows.length;
}

// ===== CALCULATE CGPA =====
function calculateCGPA() {
  var rows = document.querySelectorAll(".subject-row");

  if (rows.length === 0) {
    showError('No subjects added. Click "+ Add Subject" to get started.');
    return;
  }

  var totalCredits = 0;
  var totalCreditPoints = 0;
  var hasError = false;
  var errorMessages = [];

  for (var i = 0; i < rows.length; i++) {
    var rowNum = i + 1;

    var creditInput = rows[i].querySelector(".subject-credits-input");
    var gradeSelect = rows[i].querySelector(".subject-grade-select");

    var creditVal = creditInput.value.trim();
    var gradeVal = gradeSelect.value;

    // Allow 0 credits, but not negative values
    if (creditVal === "" || isNaN(creditVal) || parseFloat(creditVal) < 0) {
      errorMessages.push(
        "Subject " + rowNum + ": enter a valid credit value."
      );
      hasError = true;
      continue;
    }

    // Grade validation
    if (gradeVal === "") {
      errorMessages.push(
        "Subject " + rowNum + ": select a grade."
      );
      hasError = true;
      continue;
    }

    var credits = parseFloat(creditVal);
    var gradePoint = gradeMap[gradeVal];

    totalCredits += credits;
    totalCreditPoints += credits * gradePoint;
  }

  if (hasError) {
    showError(errorMessages.join(" | "));
    return;
  }

  if (totalCredits === 0) {
    showError(
      "At least one subject must have credits greater than 0."
    );
    return;
  }

  var cgpa = totalCreditPoints / totalCredits;
  var cgpaRounded = Math.round(cgpa * 100) / 100;

  clearError();
  showResult(rows.length, totalCredits, cgpaRounded);
}

// ===== SHOW RESULT =====
function showResult(subjectCount, totalCredits, cgpa) {
  document.getElementById("res-subjects").textContent = subjectCount;
  document.getElementById("res-credits").textContent = totalCredits;
  document.getElementById("res-cgpa").textContent = cgpa.toFixed(2);

  var badge = document.getElementById("perf-badge");
  var perfText = document.getElementById("perf-text");
  var perfSub = document.getElementById("perf-sub");

  badge.className = "performance-badge";

  if (cgpa >= 9) {
    badge.classList.add("perf-outstanding");
    perfText.textContent = "Outstanding Performance";
    perfSub.textContent =
      "CGPA " + cgpa.toFixed(2) + " — You're in the top tier. Keep it up!";
  }
  else if (cgpa >= 8) {
    badge.classList.add("perf-excellent");
    perfText.textContent = "Excellent Performance";
    perfSub.textContent =
      "CGPA " + cgpa.toFixed(2) + " — Great work. Push a little more for the top!";
  }
  else if (cgpa >= 7) {
    badge.classList.add("perf-verygood");
    perfText.textContent = "Very Good Performance";
    perfSub.textContent =
      "CGPA " + cgpa.toFixed(2) + " — Solid result. A focused effort can take you higher.";
  }
  else if (cgpa >= 6) {
    badge.classList.add("perf-good");
    perfText.textContent = "Good Performance";
    perfSub.textContent =
      "CGPA " + cgpa.toFixed(2) + " — Decent progress. Identify weak areas and improve.";
  }
  else {
    badge.classList.add("perf-needs");
    perfText.textContent = "Needs Improvement";
    perfSub.textContent =
      "CGPA " + cgpa.toFixed(2) + " — Don't give up! Build a consistent study plan.";
  }

  var resultSection = document.getElementById("result-section");
  resultSection.classList.add("visible");

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
}

// ===== RESET ALL =====
function resetAll() {
  document.getElementById("subjects-list").innerHTML = "";
  subjectCounter = 0;

  hideResult();
  clearError();

  addSubjectRow();
}

// ===== ERROR HANDLING =====
function showError(message) {
  var el = document.getElementById("error-msg");
  el.innerHTML = "&#x26A0; " + message;
  el.classList.add("visible");
}

function clearError() {
  var el = document.getElementById("error-msg");
  el.innerHTML = "";
  el.classList.remove("visible");
}

function hideResult() {
  document.getElementById("result-section")
    .classList.remove("visible");
}

// Start with one row
addSubjectRow();
