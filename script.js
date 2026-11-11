
// =====================================
// 1. SAMPLE DATA
// =====================================

// Get saved students from localStorage
let students = JSON.parse(localStorage.getItem("students")) || [
    {
        id: 1001,
        name: "Abebe Kebede",
        email: "abebe@gmail.com",
        department: "Software Engineering",
        year: "3rd Year"
    },
    {
        id: 1002,
        name: "Mekdes Alemu",
        email: "mekdes@gmail.com",
        department: "Computer Science",
        year: "2nd Year"
    },
    {
        id: 1003,
        name: "Dawit Tadesse",
        email: "dawit@gmail.com",
        department: "Information Technology",
        year: "4th Year"
    },
    {
        id: 1004,
        name: "Hana Getachew",
        email: "hana@gmail.com",
        department: "Software Engineering",
        year: "3rd Year"
    }
];

const courses = [
    { name: "Web Development", code: "SE301", credit: 3 },
    { name: "Database Systems", code: "SE302", credit: 4 },
    { name: "Computer Networks", code: "SE303", credit: 3 },
    { name: "Software Engineering", code: "SE304", credit: 3 },
    { name: "Operating Systems", code: "SE305", credit: 4 },
    { name: "Data Structures", code: "SE306", credit: 3 }
];

const results = [
    { student: "Abebe Kebede", course: "Web Development", mark: 92 },
    { student: "Mekdes Alemu", course: "Database Systems", mark: 85 },
    { student: "Dawit Tadesse", course: "Computer Networks", mark: 78 },
    { student: "Hana Getachew", course: "Software Engineering", mark: 95 }
];

// Attendance data
let attendance = JSON.parse(localStorage.getItem("attendance")) || {};

// Save data
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

function saveAttendance() {
    localStorage.setItem("attendance", JSON.stringify(attendance));
}

// =====================================
// 2. PAGE NAVIGATION
// =====================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll(".sidebar nav a, .sidebar-bottom a")
        .forEach(link => {
            link.classList.remove("active");

            if (link.dataset.page === pageId) {
                link.classList.add("active");
            }
        });

    const titles = {
        dashboard: "Dashboard",
        students: "Students Management",
        courses: "Courses Management",
        results: "Student Results",
        attendance: "Attendance Management",
        settings: "Settings"
    };

    document.getElementById("pageTitle").textContent =
        titles[pageId] || "Dashboard";

    document.querySelector(".sidebar").classList.remove("open");
}

// Sidebar navigation
document.querySelectorAll("[data-page]").forEach(link => {

    link.addEventListener("click", function (e) {
        e.preventDefault();

        showPage(this.dataset.page);
    });

});

// Mobile menu
document.getElementById("menuBtn").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("open");
});

// =====================================
// 3. DASHBOARD STATISTICS
// =====================================

function updateDashboard() {

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("totalCourses").textContent =
        courses.length;

    const presentCount = students.filter(student => {
        return attendance[student.id] !== false;
    }).length;

    const rate = students.length
        ? Math.round((presentCount / students.length) * 100)
        : 0;

    document.getElementById("attendanceRate").textContent =
        rate + "%";

    const totalGPA = results.reduce((sum, result) => {
        return sum + getGPA(result.mark);
    }, 0);

    const average = results.length
        ? totalGPA / results.length
        : 0;

    document.getElementById("averageGPA").textContent =
        average.toFixed(2);

    renderRecentStudents();
}

// =====================================
// 4. DISPLAY RECENT STUDENTS
// =====================================

function renderRecentStudents() {

    const table = document.getElementById("recentStudents");

    table.innerHTML = students.slice(-5).reverse().map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.department)}</td>
            <td>${escapeHTML(student.year)}</td>
            <td><span class="status">Active</span></td>
        </tr>
    `).join("");
}

// =====================================
// 5. STUDENT MANAGEMENT
// =====================================

function renderStudents(search = "") {

    const table = document.getElementById("studentTable");

    const filteredStudents = students.filter(student => {

        return (
            student.name.toLowerCase().includes(search.toLowerCase()) ||
            String(student.id).includes(search) ||
            student.department.toLowerCase().includes(search.toLowerCase())
        );

    });

    if (filteredStudents.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No students found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filteredStudents.map(student => `

        <tr>
            <td>${student.id}</td>
            <td>${escapeHTML(student.name)}</td>
            <td>${escapeHTML(student.email)}</td>
            <td>${escapeHTML(student.department)}</td>
            <td>${escapeHTML(student.year)}</td>

            <td>
                <button class="action-btn"
                    onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="action-btn delete-btn"
                    onclick="deleteStudent(${student.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>

    `).join("");
}

// Escape user input before inserting it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Open student form
function openStudentForm() {
    document.getElementById("studentFormCard").hidden = false;
    document.getElementById("formTitle").textContent = "Add New Student";
    document.getElementById("studentForm").reset();
    document.getElementById("editStudentId").value = "";
}

// Add student button
document.getElementById("addStudentBtn").addEventListener("click", () => {
    openStudentForm();
});

// Save student
document.getElementById("studentForm").addEventListener("submit", function (e) {

    e.preventDefault();

    const editId = document.getElementById("editStudentId").value;

    const studentData = {
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        department: document.getElementById("studentDepartment").value.trim(),
        year: document.getElementById("studentYear").value
    };

    if (editId) {

        // Update existing student
        const student = students.find(s => s.id === Number(editId));

        if (student) {
            Object.assign(student, studentData);
        }

    } else {

        // Create new student
        const newStudent = {
            id: Date.now(),
            ...studentData
        };

        students.push(newStudent);
    }

    saveStudents();

    renderStudents();
    updateDashboard();
    renderAttendance();

    document.getElementById("studentFormCard").hidden = true;
    this.reset();

    alert("Student saved successfully!");
});

// Edit student
function editStudent(id) {

    const student = students.find(s => s.id === id);

    if (!student) return;

    document.getElementById("studentFormCard").hidden = false;
    document.getElementById("formTitle").textContent = "Edit Student";

    document.getElementById("editStudentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentDepartment").value = student.department;
    document.getElementById("studentYear").value = student.year;

    showPage("students");
}

// Delete student
function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    students = students.filter(student => student.id !== id);

    delete attendance[id];

    saveStudents();
    saveAttendance();

    renderStudents();
    updateDashboard();
    renderAttendance();

    alert("Student deleted successfully!");
}

// Cancel form
document.getElementById("cancelStudent").addEventListener("click", () => {
    document.getElementById("studentFormCard").hidden = true;
    document.getElementById("studentForm").reset();
});

// Search students
document.getElementById("searchStudent").addEventListener("input", function () {
    renderStudents(this.value);
});

// =====================================
// 6. COURSES MANAGEMENT
// =====================================

function renderCourses() {

    const courseList = document.getElementById("courseList");

    courseList.innerHTML = courses.map(course => `

        <div class="course-card">
            <i class="fas fa-book-open"></i>

            <h3>${escapeHTML(course.name)}</h3>

            <p>Course Code: ${escapeHTML(course.code)}</p>

            <p>Credit Hours: ${course.credit}</p>
        </div>

    `).join("");
}

// =====================================
// 7. RESULTS MANAGEMENT
// =====================================

// Calculate letter grade
function getGrade(mark) {

    if (mark >= 90) return "A+";
    if (mark >= 85) return "A";
    if (mark >= 80) return "B+";
    if (mark >= 75) return "B";
    if (mark >= 70) return "C+";
    if (mark >= 60) return "C";
    if (mark >= 50) return "D";

    return "F";
}

// Calculate GPA (4-point scale)
function getGPA(mark) {

    if (mark >= 90) return 4.00;
    if (mark >= 85) return 4.00;
    if (mark >= 80) return 3.75;
    if (mark >= 75) return 3.50;
    if (mark >= 70) return 3.00;
    if (mark >= 60) return 2.00;
    if (mark >= 50) return 1.00;

    return 0.00;
}

function renderResults() {

    const table = document.getElementById("resultsTable");

    table.innerHTML = results.map(result => `

        <tr>
            <td>${escapeHTML(result.student)}</td>
            <td>${escapeHTML(result.course)}</td>
            <td>${result.mark}</td>
            <td>${getGrade(result.mark)}</td>
            <td>${getGPA(result.mark).toFixed(2)}</td>
        </tr>

    `).join("");
}

// =====================================
// 8. ATTENDANCE MANAGEMENT
// =====================================

function renderAttendance() {

    const table = document.getElementById("attendanceTable");

    table.innerHTML = students.map(student => {

        const isPresent = attendance[student.id] !== false;

        return `
            <tr>
                <td>${student.id}</td>

                <td>${escapeHTML(student.name)}</td>

                <td>${escapeHTML(student.department)}</td>

                <td>
                    <button
                        class="action-btn ${isPresent ? "" : "delete-btn"}"
                        onclick="toggleAttendance(${student.id})">

                        ${isPresent ? "Present" : "Absent"}

                    </button>
                </td>
            </tr>
        `;

    }).join("");

}

// Change attendance status
function toggleAttendance(id) {

    attendance[id] = attendance[id] === false;

    saveAttendance();

    renderAttendance();
    updateDashboard();
}

// =====================================
// 9. DATE AND TIME
// =====================================

const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
});

document.getElementById("today").textContent = currentDate;
document.getElementById("attendanceDate").textContent = currentDate;

// =====================================
// 10. DARK MODE
// =====================================

document.getElementById("themeBtn").addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

});

// Restore theme
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// =====================================
// 11. INITIALIZE DASHBOARD
// =====================================

function initializeDashboard() {

    renderStudents();
    renderCourses();
    renderResults();
    renderAttendance();
    updateDashboard();

}

// Start application
initializeDashboard();
