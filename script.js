document.addEventListener('DOMContentLoaded', () => {

    const paymentModal = document.getElementById('paymentModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const quickAddPayment = document.getElementById('quickAddPayment');
    const closeModal = document.getElementById('closeModal');

    const paymentForm = document.getElementById('paymentForm');

    const studentNameInput = document.getElementById('studentName');
    const categorySelect = document.getElementById('categorySelect');
    const otherCategoryWrapper = document.getElementById('otherCategoryWrapper');
    const otherCategoryText = document.getElementById('otherCategoryText');

    const amountPaidInput = document.getElementById('amountPaid');
    const balanceDueInput = document.getElementById('balanceDue');
    const paymentNoteInput = document.getElementById('paymentNote');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentDateInput = document.getElementById('paymentDate');

    const receiptModal = document.getElementById('receiptModal');
    const closeReceiptModal = document.getElementById('closeReceiptModal');
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');

    const paymentsTableBody = document.getElementById('paymentsTableBody');
    const allPaymentsTableBody = document.getElementById('allPaymentsTableBody');
    const studentsTableBody = document.getElementById('studentsTableBody');

    const totalStudentsSpan = document.getElementById('totalStudents');
    const totalPaymentsCountSpan = document.getElementById('totalPaymentsCount');
    const totalCollectedSpan = document.getElementById('totalCollected');
    const thisMonthCollectedSpan = document.getElementById('thisMonthCollected');

    const activityList = document.getElementById('activityList');
    const pageTitle = document.getElementById('pageTitle');

    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    const studentSearchInput = document.getElementById('studentSearchInput');
    const studentCategoryFilter = document.getElementById('studentCategoryFilter');
    const paymentSearchInput = document.getElementById('paymentSearchInput');
    const paymentBalanceFilter = document.getElementById('paymentBalanceFilter');

    const reportTotalRevenue = document.getElementById('reportTotalRevenue');
    const reportTotalCount = document.getElementById('reportTotalCount');
    const reportUniqueStudents = document.getElementById('reportUniqueStudents');
    const categoryBreakdownContainer = document.getElementById('categoryBreakdownContainer');

    const exportMonthSelect = document.getElementById('exportMonthSelect');
    const exportCategorySelect = document.getElementById('exportCategorySelect');
    const downloadMonthExcelBtn = document.getElementById('downloadMonthExcelBtn');
    const downloadCategoryExcelBtn = document.getElementById('downloadCategoryExcelBtn');

    const staffAttendanceTableBody = document.getElementById('staffAttendanceTableBody');
    const openAddStaffModal = document.getElementById('openAddStaffModal');
    const staffModal = document.getElementById('staffModal');
    const closeStaffModal = document.getElementById('closeStaffModal');
    const staffForm = document.getElementById('staffForm');
    const staffNameInput = document.getElementById('staffNameInput');

    const timingModal = document.getElementById('timingModal');
    const closeTimingModal = document.getElementById('closeTimingModal');
    const timingForm = document.getElementById('timingForm');
    const timingStaffId = document.getElementById('timingStaffId');
    const arrivedAtInput = document.getElementById('arrivedAtInput');
    const departureAtInput = document.getElementById('departureAtInput');

    const studentAttendanceTableBody = document.getElementById('studentAttendanceTableBody');
    const openAddStudentAttendance = document.getElementById('openAddStudentAttendanceModal');
    const studentAttendanceModal = document.getElementById('studentAttendanceModal');
    const closeStudentAttendanceModal = document.getElementById('closeStudentAttendanceModal');
    const studentAttendanceForm = document.getElementById('studentAttendanceForm');

    const attendanceStudentName = document.getElementById('attendanceStudentName');
    const attendanceMobile = document.getElementById('attendanceStudentPhone');
    const attendanceCategory = document.getElementById('attendanceStudentCategory');
    const attendanceGroup = document.getElementById('attendanceStudentGroup');
    const attendanceTime = document.getElementById('attendanceCourseTime');

    const attendanceSearch = document.getElementById('attendanceStudentSearch');
    const attendanceCategoryFilter = document.getElementById('attendanceCategoryFilter');
    const attendanceGroupFilter = document.getElementById('attendanceGroupFilter');

    const dayCheckboxes = document.querySelectorAll('input[name="attendanceDay"]');

    let monthlyChartInstance = null;
    let lastAddedPayment = null;

    paymentDateInput.value = new Date().toISOString().split('T')[0];

    let payments = JSON.parse(localStorage.getItem('coursado_dashboard_payments')) || [];
    let staffList = JSON.parse(localStorage.getItem('coursado_dashboard_staff')) || [];
    let studentAttendanceList = JSON.parse(localStorage.getItem('coursado_student_attendance')) || [];

    /* ---------- Books inventory (stages only, no groups) ---------- */
    const BOOK_STAGES = ['Juniors', 'Kiddos', 'Beginners', 'Movers', 'Flyers', 'Supers'];
    let booksStock = JSON.parse(localStorage.getItem('coursado_books_stock')) || {};
    BOOK_STAGES.forEach(stage => { booksStock[stage] = Math.max(0, parseInt(booksStock[stage], 10) || 0); });

    function saveBooksStock() {
        localStorage.setItem('coursado_books_stock', JSON.stringify(booksStock));
    }

    /* ---------- Weekly attendance helpers (week = Saturday to Thursday) ---------- */
    const DAY_KEYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const isoDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
    const weekStartOf = d => addDays(d, -((d.getDay() + 1) % 7));
    const dayKeyOf = d => ['sun', 'mon', 'tue', 'wed', 'thu', null, 'sat'][d.getDay()];
    const fmtShort = d => d.getDate() + ' ' + MONTHS[d.getMonth()];
    const currentWeekStart = () => weekStartOf(new Date());
    let viewWeekStart = currentWeekStart();
    const weekKeyView = () => isoDate(viewWeekStart);

    // old data had one single week; keep it as the current week
    studentAttendanceList.forEach(s => {
        if (!s.attendanceByWeek) {
            s.attendanceByWeek = {};
            if (s.attendance) s.attendanceByWeek[isoDate(currentWeekStart())] = s.attendance;
        }
        delete s.attendance;
    });

    // old staff data had one single week; keep it as the current week
    staffList.forEach(st => {
        if (!st.weeks) {
            st.weeks = {};
            const hasOld = st.attendance && Object.values(st.attendance).some(Boolean);
            if (hasOld) {
                st.weeks[isoDate(currentWeekStart())] = { attendance: st.attendance, timings: st.timings || {} };
            }
        }
        delete st.attendance;
        delete st.timings;
        delete st.monthlyDays;
    });
    localStorage.setItem('coursado_dashboard_staff', JSON.stringify(staffList));

    function renderWeekHeader() {
        const end = addDays(viewWeekStart, 5);
        const isCurrent = weekKeyView() === isoDate(currentWeekStart());
        document.getElementById('weekLabel').innerHTML =
            '<strong>' + fmtShort(viewWeekStart) + ' - ' + fmtShort(end) + ' ' + end.getFullYear() + '</strong>' +
            (isCurrent ? ' <span class="method-badge">This week</span>' : '');
        document.getElementById('nextWeekBtn').disabled = isCurrent;
        DAY_KEYS.forEach((k, i) => {
            const th = document.getElementById('dayHead_' + k);
            if (th) th.innerHTML = k.toUpperCase() + '<small>' + fmtShort(addDays(viewWeekStart, i)) + '</small>';
        });
    }

    document.getElementById('prevWeekBtn').addEventListener('click', () => { viewWeekStart = addDays(viewWeekStart, -7); renderStudentAttendance(); });
    document.getElementById('nextWeekBtn').addEventListener('click', () => { viewWeekStart = addDays(viewWeekStart, 7); renderStudentAttendance(); });
    document.getElementById('currentWeekBtn').addEventListener('click', () => { viewWeekStart = currentWeekStart(); renderStudentAttendance(); });

    function switchView(targetViewId) {
        viewSections.forEach(section => {
            section.style.display = 'none';
        });

        navItems.forEach(item => {
            item.classList.remove('active');
        });

        const targetSection = document.getElementById(`${targetViewId}View`);
        const targetNav = document.querySelector(`.nav-menu .nav-item[data-view="${targetViewId}"]`);

        if (targetSection) targetSection.style.display = 'block';
        if (targetNav) targetNav.classList.add('active');

        const titles = {
            dashboard: 'Dashboard Overview',
            students: 'Students Directory',
            payments: 'Payment Records',
            attendance: 'Staff Attendance Tracker',
            books: 'Books Inventory',
            'student-attendance': 'Student Attendance',
            reports: 'Financial Reports & Exports'
        };

        pageTitle.textContent = titles[targetViewId] || 'Dashboard Overview';

        renderAllViews();
    }

    navItems.forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();

            const view = item.getAttribute('data-view');

            if (view) {
                switchView(view);
            }
        });
    });

    document.querySelectorAll('[data-target]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();

            const target = el.getAttribute('data-target');

            switchView(target);
        });
    });

    const toggleModal = show => {
        paymentModal.style.display = show ? 'flex' : 'none';
    };

    openModalBtn.addEventListener('click', () => toggleModal(true));
    quickAddPayment.addEventListener('click', () => toggleModal(true));
    closeModal.addEventListener('click', () => toggleModal(false));

    openAddStaffModal.addEventListener('click', () => {
        staffModal.style.display = 'flex';
    });

    closeStaffModal.addEventListener('click', () => {
        staffModal.style.display = 'none';
    });

    closeTimingModal.addEventListener('click', () => {
        timingModal.style.display = 'none';
    });

    openAddStudentAttendance.addEventListener('click', () => {
        studentAttendanceModal.style.display = 'flex';
    });

    closeStudentAttendanceModal.addEventListener('click', () => {
        studentAttendanceModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === paymentModal) {
            toggleModal(false);
        }

        if (e.target === receiptModal) {
            receiptModal.style.display = 'none';
        }

        if (e.target === staffModal) {
            staffModal.style.display = 'none';
        }

        if (e.target === timingModal) {
            timingModal.style.display = 'none';
        }

        if (e.target === studentAttendanceModal) {
            studentAttendanceModal.style.display = 'none';
        }
    });

    closeReceiptModal.addEventListener('click', () => {
        receiptModal.style.display = 'none';
    });

    staffForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = staffNameInput.value.trim();

        if (!name) return;

        const newStaff = {
            id: Date.now(),
            name: name,
            weeks: {},
            arrivedAt: '09:00',
            departureAt: '17:00'
        };

        staffList.push(newStaff);

        saveAndRenderStaff();

        staffForm.reset();

        staffModal.style.display = 'none';
    });

    timingForm.addEventListener('submit', e => {
        e.preventDefault();

        const id = Number(timingStaffId.value);

        const staff = staffList.find(s => s.id === id);

        if (staff) {
            staff.arrivedAt = arrivedAtInput.value || '09:00';
            staff.departureAt = departureAtInput.value || '17:00';

            saveAndRenderStaff();
        }

        timingModal.style.display = 'none';
    });

    const WEEK_DAYS = DAY_KEYS;

    let staffViewWeekStart = currentWeekStart();
    const staffWeekKey = () => isoDate(staffViewWeekStart);

    // Returns the record of one staff member for one week (created only when create = true)
    function staffWeekRec(staff, wk, create) {
        staff.weeks = staff.weeks || {};
        let rec = staff.weeks[wk];
        if (!rec && create) rec = staff.weeks[wk] = { attendance: {}, timings: {} };
        if (rec) {
            rec.attendance = rec.attendance || {};
            rec.timings = rec.timings || {};
            return rec;
        }
        return { attendance: {}, timings: {} };
    }

    // Number of attended days that fall inside the month of `ref`, across all saved weeks
    function staffMonthCount(staff, ref) {
        let n = 0;
        Object.entries(staff.weeks || {}).forEach(([wk, rec]) => {
            const start = new Date(wk + 'T12:00:00');
            WEEK_DAYS.forEach((k, i) => {
                if (rec.attendance && rec.attendance[k]) {
                    const d = addDays(start, i);
                    if (d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()) n++;
                }
            });
        });
        return n;
    }

    function renderStaffWeekHeader() {
        const end = addDays(staffViewWeekStart, 5);
        const isCurrent = staffWeekKey() === isoDate(currentWeekStart());
        document.getElementById('staffWeekLabel').innerHTML =
            '<strong>' + fmtShort(staffViewWeekStart) + ' - ' + fmtShort(end) + ' ' + end.getFullYear() + '</strong>' +
            (isCurrent ? ' <span class="method-badge">This week</span>' : '');
        document.getElementById('staffNextWeekBtn').disabled = isCurrent;
        WEEK_DAYS.forEach((k, i) => {
            const th = document.getElementById('staffDayHead_' + k);
            if (th) th.innerHTML = k.toUpperCase() + '<small>' + fmtShort(addDays(staffViewWeekStart, i)) + '</small>';
        });
        document.getElementById('staffMonthHead').innerHTML =
            'MONTHLY TOTAL<small>' + MONTHS[end.getMonth()] + ' ' + end.getFullYear() + '</small>';
    }

    document.getElementById('staffPrevWeekBtn').addEventListener('click', () => { staffViewWeekStart = addDays(staffViewWeekStart, -7); renderStaffAttendance(); });
    document.getElementById('staffNextWeekBtn').addEventListener('click', () => { staffViewWeekStart = addDays(staffViewWeekStart, 7); renderStaffAttendance(); });
    document.getElementById('staffCurrentWeekBtn').addEventListener('click', () => { staffViewWeekStart = currentWeekStart(); renderStaffAttendance(); });

    window.updateStaffTiming = function(staffId, day, field, value) {
        const staff = staffList.find(s => s.id === staffId);

        if (!staff) return;

        const rec = staffWeekRec(staff, staffWeekKey(), true);
        rec.timings[day] = rec.timings[day] || { arr: '', dep: '' };
        rec.timings[day][field] = value;

        localStorage.setItem(
            'coursado_dashboard_staff',
            JSON.stringify(staffList)
        );
    };

    window.openTimingModal = function(id) {
        const staff = staffList.find(s => s.id === id);

        if (staff) {
            timingStaffId.value = staff.id;
            arrivedAtInput.value = staff.arrivedAt || '09:00';
            departureAtInput.value = staff.departureAt || '17:00';

            timingModal.style.display = 'flex';
        }
    };

    window.toggleStaffAttendance = function(staffId, dayKey) {
        const staff = staffList.find(s => s.id === staffId);

        if (!staff) return;

        const rec = staffWeekRec(staff, staffWeekKey(), true);

        rec.attendance[dayKey] = !rec.attendance[dayKey];

        if (rec.attendance[dayKey]) {
            rec.timings[dayKey] = rec.timings[dayKey] || { arr: '', dep: '' };
            if (!rec.timings[dayKey].arr) {
                rec.timings[dayKey].arr = staff.arrivedAt || '09:00';
            }
            if (!rec.timings[dayKey].dep) {
                rec.timings[dayKey].dep = staff.departureAt || '17:00';
            }
        }

        saveAndRenderStaff();
    };

    window.deleteStaff = function(id) {
        if (confirm('Are you sure you want to remove this staff member? Their attendance history for all weeks will be deleted too.')) {
            staffList = staffList.filter(s => s.id !== id);

            saveAndRenderStaff();
        }
    };

    function saveAndRenderStaff() {
        localStorage.setItem(
            'coursado_dashboard_staff',
            JSON.stringify(staffList)
        );

        renderStaffAttendance();
    }

    function renderStaffAttendance() {
        renderStaffWeekHeader();

        staffAttendanceTableBody.innerHTML = '';

        if (staffList.length === 0) {
            staffAttendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align:center;">
                        No staff members added yet.
                    </td>
                </tr>
            `;

            return;
        }

        const monthRef = addDays(staffViewWeekStart, 5);

        staffList.forEach(staff => {

            const rec = staffWeekRec(staff, staffWeekKey(), false);

            let weeklyTotal = 0;

            WEEK_DAYS.forEach(day => {
                if (rec.attendance[day]) {
                    weeklyTotal++;
                }
            });

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(staff.name)}</strong>
                </td>

                ${WEEK_DAYS.map(day => {
                    const t = rec.timings[day] || { arr: '', dep: '' };
                    return `
                    <td class="staff-day-cell">
                        <input
                            type="checkbox"
                            class="attendance-checkbox"
                            ${rec.attendance[day] ? 'checked' : ''}
                            onchange="toggleStaffAttendance(${staff.id}, '${day}')"
                        >
                        ${rec.attendance[day] ? `
                            <div class="time-pair">
                                <label>Arr
                                    <input
                                        type="time"
                                        value="${escapeHtml(t.arr || '')}"
                                        onchange="updateStaffTiming(${staff.id}, '${day}', 'arr', this.value)"
                                    >
                                </label>
                                <label>Dep
                                    <input
                                        type="time"
                                        value="${escapeHtml(t.dep || '')}"
                                        onchange="updateStaffTiming(${staff.id}, '${day}', 'dep', this.value)"
                                    >
                                </label>
                            </div>
                        ` : ''}
                    </td>
                `;
                }).join('')}

                <td>
                    ${weeklyTotal} day(s)
                </td>

                <td>
                    ${staffMonthCount(staff, monthRef)} day(s)
                </td>

                <td>
                    <button
                        class="btn"
                        onclick="deleteStaff(${staff.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            staffAttendanceTableBody.appendChild(row);
        });
    }

    function getSelectedDays() {
        const selected = [];

        dayCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selected.push(checkbox.value);
            }
        });

        return selected;
    }

    function updateAttendanceDayLimit() {
        const selected = getSelectedDays();

        if (selected.length > 2) {
            alert('A student can attend only 1 or 2 days.');

            const checkedBoxes = [...dayCheckboxes]
                .filter(box => box.checked);

            checkedBoxes[checkedBoxes.length - 1].checked = false;
        }
    }

    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateAttendanceDayLimit);
    });

    studentAttendanceForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = attendanceStudentName.value.trim();
        const mobile = attendanceMobile.value.trim();
        const category = attendanceCategory.value;
        const group = attendanceGroup.value.trim().toUpperCase();
        const courseTime = attendanceTime.value;
        const selectedDays = getSelectedDays();

        if (!name || !mobile || !category || !group || !courseTime) {
            alert('Please complete all student information.');
            return;
        }

        const dayError = document.getElementById('attendanceDayError');

        if (selectedDays.length < 1 || selectedDays.length > 2) {
            if (dayError) dayError.style.display = 'block';
            return;
        }

        if (dayError) dayError.style.display = 'none';

        const duplicate = studentAttendanceList.some(student =>
            student.name.toLowerCase() === name.toLowerCase() &&
            student.mobile === mobile
        );

        if (duplicate) {
            alert('This student is already in attendance.');
            return;
        }

        const newStudent = {
            id: Date.now(),
            name,
            mobile,
            category,
            group,
            courseTime,
            courseDays: selectedDays,
            attendanceByWeek: {},
            bookTaken: false
        };

        studentAttendanceList.push(newStudent);

        localStorage.setItem(
            'coursado_student_attendance',
            JSON.stringify(studentAttendanceList)
        );

        renderStudentAttendance();

        studentAttendanceForm.reset();

        studentAttendanceModal.style.display = 'none';
    });

    function refreshGroupFilter() {
        const current = attendanceGroupFilter.value;

        const groups = [...new Set(
            studentAttendanceList
                .map(student => (student.group || '').toUpperCase())
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        attendanceGroupFilter.innerHTML = '<option value="all">All Groups</option>';

        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            attendanceGroupFilter.appendChild(option);
        });

        attendanceGroupFilter.value = groups.includes(current) ? current : 'all';
    }

    function renderStudentAttendance() {
        studentAttendanceTableBody.innerHTML = '';

        renderWeekHeader();
        refreshGroupFilter();

        const searchValue = attendanceSearch.value.toLowerCase().trim();
        const categoryValue = attendanceCategoryFilter.value;
        const groupValue = attendanceGroupFilter.value;

        let filtered = studentAttendanceList.filter(student => {

            const matchesSearch =
                student.name.toLowerCase().includes(searchValue) ||
                student.mobile.includes(searchValue);

            const matchesCategory =
                categoryValue === 'all' ||
                student.category === categoryValue;

            const matchesGroup =
                groupValue === 'all' ||
                (student.group || '').toUpperCase() === groupValue;

            return matchesSearch &&
                   matchesCategory &&
                   matchesGroup;
        });

        if (filtered.length === 0) {
            studentAttendanceTableBody.innerHTML = `
                <tr>
                    <td colspan="13" style="text-align:center;">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }

        filtered.forEach(student => {

            const row = document.createElement('tr');

            const dayColumns = [
                'sat',
                'sun',
                'mon',
                'tue',
                'wed',
                'thu'
            ];

            const courseDays = student.courseDays || [];
            const studentAttendance = (student.attendanceByWeek || {})[weekKeyView()] || {};

            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(student.name)}</strong>
                </td>

                <td>
                    ${escapeHtml(student.mobile)}
                </td>

                <td>
                    ${escapeHtml(student.category)}
                </td>

                <td>
                    ${escapeHtml((student.group || '').toUpperCase())}
                </td>

                ${dayColumns.map(day => {

                    if (!courseDays.includes(day)) {
                        return `<td>&mdash;</td>`;
                    }

                    if (studentAttendance[day] === 'cancelled') {
                        return `<td class="cancelled-cell" title="Class cancelled - click to reset" onclick="toggleStudentAttendance(${student.id}, '${day}')">Cancelled</td>`;
                    }

                    return `
                        <td>
                            <input
                                type="checkbox"
                                class="attendance-checkbox"
                                ${studentAttendance[day] ? 'checked' : ''}
                                onchange="toggleStudentAttendance(${student.id}, '${day}')"
                            >
                        </td>
                    `;
                }).join('')}

                <td>
                    ${escapeHtml(student.courseTime || '-')}
                </td>

                <td>
                    ${BOOK_STAGES.includes(student.category)
                        ? `<input
                                type="checkbox"
                                class="attendance-checkbox"
                                title="Student received the book"
                                ${student.bookTaken ? 'checked' : ''}
                                onchange="toggleStudentBook(${student.id})"
                            >`
                        : '&mdash;'}
                </td>

                <td>
                    <button
                        class="btn"
                        onclick="deleteStudentAttendance(${student.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            studentAttendanceTableBody.appendChild(row);
        });
    }

    window.toggleStudentAttendance = function(studentId, day) {

        const student = studentAttendanceList.find(
            s => s.id === studentId
        );

        if (!student) return;

        if (!student.courseDays.includes(day)) {
            return;
        }

        const wk = weekKeyView();
        student.attendanceByWeek = student.attendanceByWeek || {};
        const rec = student.attendanceByWeek[wk] = student.attendanceByWeek[wk] || {};
        rec[day] = rec[day] === 'cancelled' ? false : !rec[day];

        localStorage.setItem(
            'coursado_student_attendance',
            JSON.stringify(studentAttendanceList)
        );

        renderStudentAttendance();
    };

    window.toggleStudentBook = function(studentId) {
        const student = studentAttendanceList.find(s => s.id === studentId);
        if (!student || !BOOK_STAGES.includes(student.category)) return;

        const stage = student.category;

        if (!student.bookTaken) {
            if ((booksStock[stage] || 0) < 1) {
                alert('No ' + stage + ' books left in stock. Add books in the Books tab first.');
                renderStudentAttendance();
                return;
            }
            booksStock[stage] -= 1;
            student.bookTaken = true;
        } else {
            booksStock[stage] += 1;
            student.bookTaken = false;
        }

        localStorage.setItem('coursado_student_attendance', JSON.stringify(studentAttendanceList));
        saveBooksStock();

        renderStudentAttendance();
        renderBooks();
    };

    function renderBooks() {
        const grid = document.getElementById('booksGrid');
        if (!grid) return;

        grid.innerHTML = BOOK_STAGES.map(stage => `
            <div class="book-card">
                <div class="book-card-title">
                    <i class="fa-solid fa-book"></i> ${stage}
                </div>
                <div class="book-count ${booksStock[stage] === 0 ? 'empty' : ''}">${booksStock[stage]}</div>
                <div class="book-count-label">books available</div>
                <input type="number" min="0" step="1" id="bookInput_${stage}" placeholder="Number of books">
                <div class="book-card-actions">
                    <button type="button" class="btn primary-btn" data-book-action="add" data-stage="${stage}">Add</button>
                    <button type="button" class="btn" data-book-action="set" data-stage="${stage}">Set total</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('booksGrid').addEventListener('click', e => {
        const btn = e.target.closest('button[data-book-action]');
        if (!btn) return;

        const stage = btn.dataset.stage;
        const input = document.getElementById('bookInput_' + stage);
        const amount = parseInt(input.value, 10);
        const action = btn.dataset.bookAction;

        if (isNaN(amount) || amount < 0 || (action === 'add' && amount < 1)) {
            alert('Please enter a valid number of books.');
            return;
        }

        booksStock[stage] = action === 'add' ? booksStock[stage] + amount : amount;
        saveBooksStock();
        renderBooks();
    });

    window.deleteStudentAttendance = function(id) {

        if (
            confirm(
                'Are you sure you want to remove this student from attendance?'
            )
        ) {
            studentAttendanceList =
                studentAttendanceList.filter(
                    student => student.id !== id
                );

            localStorage.setItem(
                'coursado_student_attendance',
                JSON.stringify(studentAttendanceList)
            );

            renderStudentAttendance();
        }
    };

    attendanceSearch.addEventListener(
        'input',
        renderStudentAttendance
    );

    attendanceCategoryFilter.addEventListener(
        'change',
        renderStudentAttendance
    );

    attendanceGroupFilter.addEventListener(
        'change',
        renderStudentAttendance
    );

    // Force the Group input to uppercase while typing
    attendanceGroup.addEventListener('input', () => {
        const start = attendanceGroup.selectionStart;
        const end = attendanceGroup.selectionEnd;
        attendanceGroup.value = attendanceGroup.value.toUpperCase();
        attendanceGroup.setSelectionRange(start, end);
    });

    categorySelect.addEventListener('change', e => {

        if (e.target.value === 'Other') {
            otherCategoryWrapper.style.display = 'flex';

            otherCategoryText.setAttribute(
                'required',
                'true'
            );

        } else {

            otherCategoryWrapper.style.display = 'none';

            otherCategoryText.removeAttribute(
                'required'
            );

            otherCategoryText.value = '';
        }
    });

    paymentForm.addEventListener('submit', e => {

        e.preventDefault();

        let categoryValue = categorySelect.value;

        if (categoryValue === 'Other') {
            categoryValue =
                otherCategoryText.value.trim() || 'Other';
        }

        const newPayment = {
            id: Date.now(),
            name: studentNameInput.value.trim(),
            category: categoryValue,
            amount: parseFloat(amountPaidInput.value),
            balanceDue: balanceDueInput.value
                ? parseFloat(balanceDueInput.value)
                : 0,
            note: paymentNoteInput.value.trim() || '-',
            method: paymentMethodSelect.value,
            date: paymentDateInput.value
        };

        payments.unshift(newPayment);

        lastAddedPayment = newPayment;

        saveAndRender();

        paymentForm.reset();

        paymentDateInput.value =
            new Date().toISOString().split('T')[0];

        otherCategoryWrapper.style.display = 'none';

        toggleModal(false);

        showReceiptPopup(newPayment);
    });

    function showReceiptPopup(p) {

        document.getElementById('recNo').textContent =
            `#${p.id}`;

        document.getElementById('recStudent').textContent =
            p.name;

        document.getElementById('recCategory').textContent =
            p.category;

        document.getElementById('recAmount').textContent =
            `EGP ${p.amount.toLocaleString()}`;

        document.getElementById('recBalance').textContent =
            `EGP ${p.balanceDue.toLocaleString()}`;

        document.getElementById('recMethod').textContent =
            p.method;

        document.getElementById('recNote').textContent =
            p.note;

        document.getElementById('recDate').textContent =
            p.date;

        receiptModal.style.display = 'flex';
    }

    downloadReceiptBtn.addEventListener('click', () => {

        const receiptCard =
            document.getElementById('receiptCard');

        html2canvas(receiptCard).then(canvas => {

            const link =
                document.createElement('a');

            link.download =
                `Receipt_${lastAddedPayment ? lastAddedPayment.name.replace(/\s+/g, '_') : 'Payment'}.png`;

            link.href =
                canvas.toDataURL('image/png');

            link.click();
        });
    });

    window.deletePayment = function(id) {

        if (
            confirm(
                'Are you sure you want to delete this payment record?'
            )
        ) {
            payments =
                payments.filter(p => p.id !== id);

            saveAndRender();
        }
    };

    function saveAndRender() {

        localStorage.setItem(
            'coursado_dashboard_payments',
            JSON.stringify(payments)
        );

        renderAllViews();
    }

    function renderAllViews() {

        renderDashboard();

        const categoryFilterVal =
            studentCategoryFilter
                ? studentCategoryFilter.value
                : 'all';

        const studentSearchVal =
            studentSearchInput
                ? studentSearchInput.value
                : '';

        const balanceFilterVal =
            document.getElementById('studentBalanceFilter')
                ? document.getElementById('studentBalanceFilter').value
                : 'all';

        renderStudentsTable(
            payments,
            categoryFilterVal,
            studentSearchVal,
            balanceFilterVal
        );

        filterPayments();

        renderStaffAttendance();

        renderStudentAttendance();

        renderBooks();

        renderReports();

        populateExportDropdowns();
    }

    function renderDashboard() {

        paymentsTableBody.innerHTML = '';

        if (payments.length === 0) {

            paymentsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No payment records found.
                    </td>
                </tr>
            `;

            totalStudentsSpan.textContent = '0';
            totalPaymentsCountSpan.textContent = '0';
            totalCollectedSpan.textContent = 'EGP 0';
            thisMonthCollectedSpan.textContent = 'EGP 0';

            activityList.innerHTML =
                `<p class="empty-activity">No recent activity recorded yet.</p>`;

            return;
        }

        let totalSum = 0;
        let currentMonthSum = 0;

        const uniqueStudents = new Set();

        const currentMonthStr =
            new Date().toISOString().slice(0, 7);

        payments.forEach(p => {

            totalSum += p.amount;

            uniqueStudents.add(
                p.name.toLowerCase().trim()
            );

            if (
                p.date &&
                p.date.startsWith(currentMonthStr)
            ) {
                currentMonthSum += p.amount;
            }
        });

        totalStudentsSpan.textContent =
            uniqueStudents.size;

        totalPaymentsCountSpan.textContent =
            payments.length;

        totalCollectedSpan.textContent =
            `EGP ${totalSum.toLocaleString()}`;

        thisMonthCollectedSpan.textContent =
            `EGP ${currentMonthSum.toLocaleString()}`;

        const recentSlice =
            payments.slice(0, 5);

        recentSlice.forEach(p => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>${escapeHtml(p.name)}</strong>
                </td>

                <td>
                    ${escapeHtml(p.date)}
                </td>

                <td class="amount-paid">
                    EGP ${p.amount.toLocaleString()}
                </td>

                <td class="${(p.balanceDue || 0) > 0 ? 'balance-due' : 'balance-clear'}">
                    EGP ${(p.balanceDue || 0).toLocaleString()}
                </td>

                <td>
                    ${escapeHtml(p.category)}
                </td>

                <td>
                    <span class="method-badge">
                        ${escapeHtml(p.method)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(p.note || '-')}
                </td>

                <td>
                    <button
                        class="btn"
                        onclick="deletePayment(${p.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            paymentsTableBody.appendChild(row);
        });

        const latest = payments[0];

        activityList.innerHTML = `
            <div style="display:flex;align-items:start;gap:.5rem;">
                <i class="fa-solid fa-circle-check"></i>

                <div>
                    <p>
                        Payment of
                        <strong>
                            EGP ${latest.amount.toLocaleString()}
                        </strong>
                        recorded for
                        <strong>
                            ${escapeHtml(latest.name)}
                        </strong>.
                    </p>

                    <span>
                        Note:
                        ${escapeHtml(latest.note || '-')}
                    </span>
                </div>
            </div>
        `;
    }

    function renderStudentsTable(
        data,
        selectedCategory = 'all',
        searchQuery = '',
        balanceFilter = 'all'
    ) {

        studentsTableBody.innerHTML = '';

        const categoryVal =
            selectedCategory.toLowerCase().trim();

        const searchVal =
            searchQuery.toLowerCase().trim();

        let filteredPayments = data;

        if (categoryVal !== 'all') {
            filteredPayments =
                filteredPayments.filter(
                    p =>
                        p.category
                            .toLowerCase()
                            .trim() === categoryVal
                );
        }

        // typing a number (500) or a comparison (>0, <=200) searches the balance due
        const balanceQuery = parseBalanceQuery(searchVal);

        if (searchVal !== '' && !balanceQuery) {
            filteredPayments =
                filteredPayments.filter(
                    p =>
                        p.name
                            .toLowerCase()
                            .includes(searchVal)
                );
        }

        const studentMap = {};

        // oldest -> newest, so the last payment processed is the real latest one
        [...filteredPayments].sort(byDateAsc).forEach(p => {

            const key =
                p.name.toLowerCase().trim();

            if (!studentMap[key]) {

                studentMap[key] = {
                    name: p.name,
                    count: 0,
                    total: 0,
                    latestBalance: p.balanceDue || 0,
                    lastCategory: p.category
                };
            }

            studentMap[key].count += 1;
            studentMap[key].total += p.amount;
            studentMap[key].latestBalance =
                p.balanceDue || 0;

            studentMap[key].lastCategory =
                p.category;
        });

        let studentList =
            Object.values(studentMap);

        if (balanceQuery) {
            studentList = studentList.filter(s => balanceQuery.test(s.latestBalance));
        }

        if (balanceFilter === 'due') {
            studentList = studentList.filter(s => s.latestBalance > 0);
        } else if (balanceFilter === 'clear') {
            studentList = studentList.filter(s => !(s.latestBalance > 0));
        }

        if (studentList.length === 0) {

            studentsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No matching students found.
                    </td>
                </tr>
            `;

            return;
        }

        studentList.forEach(s => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>
                        ${escapeHtml(s.name)}
                    </strong>
                </td>

                <td>
                    ${s.count} payment(s)
                </td>

                <td class="amount-paid">
                    EGP ${s.total.toLocaleString()}
                </td>

                <td class="${s.latestBalance > 0 ? 'balance-due' : 'balance-clear'}">
                    EGP ${s.latestBalance.toLocaleString()}
                </td>

                <td>
                    <span class="method-badge">
                        ${escapeHtml(s.lastCategory)}
                    </span>
                </td>
            `;

            studentsTableBody.appendChild(row);
        });
    }

    function filterStudents() {

        renderStudentsTable(
            payments,
            studentCategoryFilter.value,
            studentSearchInput.value,
            document.getElementById('studentBalanceFilter').value
        );
    }

    studentSearchInput.addEventListener(
        'input',
        filterStudents
    );

    studentCategoryFilter.addEventListener(
        'change',
        filterStudents
    );

    document.getElementById('studentBalanceFilter').addEventListener(
        'change',
        filterStudents
    );

    function renderPaymentsTable(data) {

        allPaymentsTableBody.innerHTML = '';

        if (data.length === 0) {

            allPaymentsTableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No payment records found.
                    </td>
                </tr>
            `;

            return;
        }

        data.forEach(p => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>
                    <strong>
                        ${escapeHtml(p.name)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(p.date)}
                </td>

                <td class="amount-paid">
                    EGP ${p.amount.toLocaleString()}
                </td>

                <td class="${(p.balanceDue || 0) > 0 ? 'balance-due' : 'balance-clear'}">
                    EGP ${(p.balanceDue || 0).toLocaleString()}
                </td>

                <td>
                    ${escapeHtml(p.category)}
                </td>

                <td>
                    <span class="method-badge">
                        ${escapeHtml(p.method)}
                    </span>
                </td>

                <td>
                    ${escapeHtml(p.note || '-')}
                </td>

                <td>
                    <button
                        class="btn"
                        onclick="deletePayment(${p.id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;

            allPaymentsTableBody.appendChild(row);
        });
    }

    /* ---------- Balance search helpers ---------- */
    // "500" -> balance equals 500 | ">0", ">=500", "<200", "=0" -> comparison
    function parseBalanceQuery(q) {
        const t = String(q || '').trim().replace(/,/g, '');
        const op = t.match(/^(>=|<=|>|<|=)\s*(\d+(?:\.\d+)?)$/);
        if (op) {
            const n = parseFloat(op[2]);
            const tests = {
                '>': b => b > n, '>=': b => b >= n,
                '<': b => b < n, '<=': b => b <= n,
                '=': b => b === n
            };
            return { test: tests[op[1]], isOperator: true };
        }
        if (/^\d+(\.\d+)?$/.test(t)) {
            const n = parseFloat(t);
            return { test: b => b === n, isOperator: false };
        }
        return null;
    }

    function byDateAsc(a, b) {
        return String(a.date || '').localeCompare(String(b.date || '')) || (a.id - b.id);
    }

    function byDateDesc(a, b) {
        return byDateAsc(b, a);
    }

    function filterPayments() {

        const query = paymentSearchInput.value.toLowerCase().trim();
        const balanceMode = paymentBalanceFilter ? paymentBalanceFilter.value : 'all';
        const balanceQuery = parseBalanceQuery(query);

        const filtered = payments.filter(p => {

            const bal = p.balanceDue || 0;

            if (balanceMode === 'due' && !(bal > 0)) return false;
            if (balanceMode === 'clear' && bal > 0) return false;

            if (!query) return true;

            if (balanceQuery) {
                if (balanceQuery.test(bal)) return true;
                if (balanceQuery.isOperator) return false;
            }

            return [p.name, p.category, p.note, p.date].some(
                f => String(f || '').toLowerCase().includes(query)
            );
        });

        renderPaymentsTable(filtered);
    }

    paymentSearchInput.addEventListener('input', filterPayments);

    if (paymentBalanceFilter) {
        paymentBalanceFilter.addEventListener('change', filterPayments);
    }

    function renderReports() {

        let totalRev = 0;

        const uniqueStudents = new Set();

        const categoryMap = {};
        const monthlyMap = {};

        payments.forEach(p => {

            totalRev += p.amount;

            uniqueStudents.add(
                p.name.toLowerCase().trim()
            );

            categoryMap[p.category] =
                (categoryMap[p.category] || 0) +
                p.amount;

            if (p.date) {

                const monthKey =
                    p.date.slice(0, 7);

                monthlyMap[monthKey] =
                    (monthlyMap[monthKey] || 0) +
                    p.amount;
            }
        });

        reportTotalRevenue.textContent =
            `EGP ${totalRev.toLocaleString()}`;

        reportTotalCount.textContent =
            payments.length;

        reportUniqueStudents.textContent =
            uniqueStudents.size;

        categoryBreakdownContainer.innerHTML = '';

        const categories =
            Object.entries(categoryMap);

        if (categories.length === 0) {

            categoryBreakdownContainer.innerHTML =
                `<p class="empty-activity">No data available for breakdown.</p>`;

        } else {

            categories.forEach(([cat, sum]) => {

                const item =
                    document.createElement('div');

                item.className =
                    'breakdown-item';

                item.innerHTML = `
                    <span>
                        ${escapeHtml(cat)}
                    </span>

                    <strong>
                        EGP ${sum.toLocaleString()}
                    </strong>
                `;

                categoryBreakdownContainer.appendChild(item);
            });
        }

        renderMonthlyChart(monthlyMap);
    }

    function renderMonthlyChart(monthlyMap) {

        const canvas =
            document.getElementById('monthlyChart');

        if (!canvas) return;

        const ctx =
            canvas.getContext('2d');

        const sortedMonths =
            Object.keys(monthlyMap).sort();

        const labels =
            sortedMonths.map(m => {

                const [year, month] =
                    m.split('-');

                const dateObj =
                    new Date(
                        year,
                        month - 1,
                        1
                    );

                return dateObj.toLocaleString(
                    'en-US',
                    {
                        month: 'short',
                        year: 'numeric'
                    }
                );
            });

        const dataValues =
            sortedMonths.map(m =>
                monthlyMap[m]
            );

        if (monthlyChartInstance) {
            monthlyChartInstance.destroy();
        }

        monthlyChartInstance =
            new Chart(
                ctx,
                {
                    type: 'bar',

                    data: {
                        labels:
                            labels.length > 0
                                ? labels
                                : ['No Data'],

                        datasets: [{
                            label: 'Revenue (EGP)',

                            data:
                                dataValues.length > 0
                                    ? dataValues
                                    : [0],

                            backgroundColor:
                                '#2563eb',

                            borderRadius: 6
                        }]
                    },

                    options: {
                        responsive: true,
                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                display: false
                            }
                        },

                        scales: {
                            y: {
                                beginAtZero: true
                            },

                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                }
            );
    }

    function populateExportDropdowns() {

        const monthsSet =
            new Set();

        payments.forEach(p => {

            if (p.date) {
                monthsSet.add(
                    p.date.slice(0, 7)
                );
            }
        });

        const sortedMonths =
            Array.from(monthsSet)
                .sort()
                .reverse();

        const currentSelectedMonth =
            exportMonthSelect.value;

        exportMonthSelect.innerHTML =
            `<option value="all">All Months (Lifetime)</option>`;

        sortedMonths.forEach(m => {

            const [year, month] =
                m.split('-');

            const dateObj =
                new Date(
                    year,
                    month - 1,
                    1
                );

            const monthName =
                dateObj.toLocaleString(
                    'en-US',
                    {
                        month: 'long',
                        year: 'numeric'
                    }
                );

            const opt =
                document.createElement('option');

            opt.value = m;
            opt.textContent = monthName;

            exportMonthSelect.appendChild(opt);
        });

        if (currentSelectedMonth) {
            exportMonthSelect.value =
                currentSelectedMonth;
        }
    }

    function downloadCSV(
        dataArray,
        filename
    ) {

        if (dataArray.length === 0) {

            alert(
                'No data available to export for this selection.'
            );

            return;
        }

        let csvContent =
            'data:text/csv;charset=utf-8,' +
            'Student Name,Category,Amount (EGP),Balance Due (EGP),Payment Method,Note,Date\n';

        dataArray.forEach(p => {

            const row = [
                `"${p.name.replace(/"/g, '""')}"`,
                `"${p.category.replace(/"/g, '""')}"`,
                p.amount,
                p.balanceDue || 0,
                `"${p.method}"`,
                `"${(p.note || '').replace(/"/g, '""')}"`,
                `"${p.date}"`
            ];

            csvContent +=
                row.join(',') +
                '\n';
        });

        const encodedUri =
            encodeURI(csvContent);

        const link =
            document.createElement('a');

        link.setAttribute(
            'href',
            encodedUri
        );

        link.setAttribute(
            'download',
            filename
        );

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    }

    downloadMonthExcelBtn.addEventListener(
        'click',
        () => {

            const selectedMonth =
                exportMonthSelect.value;

            let filtered =
                payments;

            let fileSuffix =
                'All_Months';

            if (selectedMonth !== 'all') {

                filtered =
                    payments.filter(
                        p =>
                            p.date &&
                            p.date.startsWith(
                                selectedMonth
                            )
                    );

                fileSuffix =
                    selectedMonth;
            }

            downloadCSV(
                filtered,
                `Coursado_Payments_${fileSuffix}.csv`
            );
        }
    );

    downloadCategoryExcelBtn.addEventListener(
        'click',
        () => {

            const selectedCategory =
                exportCategorySelect.value;

            let filtered =
                payments;

            let fileSuffix =
                'All_Categories';

            if (selectedCategory !== 'all') {

                filtered =
                    payments.filter(
                        p =>
                            p.category
                                .toLowerCase() ===
                            selectedCategory
                                .toLowerCase()
                    );

                fileSuffix =
                    selectedCategory;
            }

            downloadCSV(
                filtered,
                `Coursado_Payments_Category_${fileSuffix}.csv`
            );
        }
    );

    const openImportBtn =
        document.getElementById('openImportBtn');

    const importDropZone =
        document.getElementById('importDropZone');

    const excelFileInput =
        document.getElementById('excelFileInput');

    const importPreviewModal =
        document.getElementById(
            'importPreviewModal'
        );

    const closeImportPreview =
        document.getElementById(
            'closeImportPreview'
        );

    const cancelImportBtn =
        document.getElementById(
            'cancelImportBtn'
        );

    const confirmImportBtn =
        document.getElementById(
            'confirmImportBtn'
        );

    const importPreviewBody =
        document.getElementById(
            'importPreviewBody'
        );

    const importSummary =
        document.getElementById(
            'importSummary'
        );

    const importStatus =
        document.getElementById(
            'importStatus'
        );

    let parsedImportData = [];

    openImportBtn.addEventListener(
        'click',
        () => excelFileInput.click()
    );

    importDropZone.addEventListener(
        'click',
        () => excelFileInput.click()
    );

    importDropZone.addEventListener(
        'dragover',
        e => {

            e.preventDefault();

            importDropZone.style.borderColor =
                '#2563eb';

            importDropZone.style.background =
                '#eff6ff';
        }
    );

    importDropZone.addEventListener(
        'dragleave',
        () => {

            importDropZone.style.borderColor =
                '#cbd5e1';

            importDropZone.style.background =
                '#f8fafc';
        }
    );

    importDropZone.addEventListener(
        'drop',
        e => {

            e.preventDefault();

            importDropZone.style.borderColor =
                '#cbd5e1';

            importDropZone.style.background =
                '#f8fafc';

            if (e.dataTransfer.files.length > 0) {

                handleFile(
                    e.dataTransfer.files[0]
                );
            }
        }
    );

    excelFileInput.addEventListener(
        'change',
        e => {

            if (e.target.files.length > 0) {

                handleFile(
                    e.target.files[0]
                );
            }
        }
    );

    function getCategoryFromFileTitle(fileName) {

        const fname =
            String(fileName || '')
                .trim()
                .toLowerCase();

        if (fname.startsWith('m.')) {
            return 'Movers';
        }

        if (fname.startsWith('f.')) {
            return 'Flyers';
        }

        if (fname.startsWith('k.')) {
            return 'Kiddos';
        }

        if (fname.startsWith('j.')) {
            return 'Juniors';
        }

        if (fname.startsWith('b.')) {
            return 'Beginners';
        }

        if (fname.startsWith('s.')) {
            return 'Supers';
        }

        return 'Other';
    }

    const importSheetSelect = document.getElementById('importSheetSelect');
    const importCategory = document.getElementById('importCategory');
    const importGroup = document.getElementById('importGroup');
    const importTime = document.getElementById('importTime');
    const importPayDate = document.getElementById('importPayDate');

    let importWB = null;
    let importParsed = { students: [], days: [], dates: 0, cancelled: 0 };
    let importFileName = '';

    importCategory.innerHTML = [...attendanceCategoryFilter.options]
        .map(o => o.value).filter(v => v !== 'all')
        .concat('Other')
        .map(v => `<option value="${v}">${v}</option>`).join('');

    const findAttStudent = s => studentAttendanceList.find(x =>
        x.name.trim().toLowerCase() === s.name.toLowerCase() &&
        (!x.mobile || !s.mobile || x.mobile === s.mobile));

    function serialToDate(n) {
        const p = XLSX.SSF.parse_date_code(n);
        return p ? new Date(p.y, p.m - 1, p.d, 12) : null;
    }

    function parseHeaderDate(v, refYear) {
        if (v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 12);
        if (typeof v === 'number') return v > 30000 && v < 80000 ? serialToDate(v) : null;
        if (v == null) return null;
        // "15/3", "Sat 15/3", "15-Mar", "15 Mar 2025", "2025-03-15" ...
        const raw = toAsciiDigits(v);
        const wd = raw.match(WEEKDAY_WORDS);
        let s = raw.replace(WEEKDAY_WORDS, ' ').trim();
        if (!/\d/.test(s)) return null;
        // letters are only allowed when they are a real month name ("15 Mar"), so "Mark 1" is not a date
        if (/[a-z]/i.test(s) && !/\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/i.test(s)) return null;
        const d = parsePayDate(s, refYear);
        // no year written but a weekday is (e.g. "Sat 1/3"): pick the year where that weekday is right
        if (d && wd && !/\b(19|20)\d\d\b/.test(s)) {
            const w = wd[0].toLowerCase();
            const idx = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].findIndex(x => w.startsWith(x));
            const arIdx = ['الاحد', 'الأحد', 'الاثنين', 'الإثنين', 'الثلاثاء', 'الاربعاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            const arMap = [0, 0, 1, 1, 2, 3, 3, 4, 5, 6];
            const want = idx >= 0 ? idx : (arIdx.indexOf(wd[0]) >= 0 ? arMap[arIdx.indexOf(wd[0])] : -1);
            if (want >= 0 && d.getDay() !== want) {
                for (const dy of [-1, 1, -2, 2, -3, 3]) {
                    const alt = parsePayDate(s + '/' + (+refYear + dy), refYear);
                    if (alt && alt.getDay() === want) return alt;
                }
            }
        }
        return d;
    }

    // ---- payment date parsing (Excel serial, Date, 15/3/2025, 2025-03-15, "March", "15 Mar 2025") ----
    const MONTH_PATTERNS = [
        /^jan|^يناير|^كانون\s*الثاني/i, /^feb|^فبراير|^شباط/i, /^mar|^مارس|^آذار/i,
        /^apr|^أبريل|^ابريل|^نيسان/i, /^may|^مايو|^أيار/i, /^jun|^يونيو|^يونيه|^حزيران/i,
        /^jul|^يوليو|^يوليه|^تموز/i, /^aug|^أغسطس|^اغسطس|^آب/i, /^sep|^سبتمبر|^أيلول/i,
        /^oct|^أكتوبر|^اكتوبر|^تشرين\s*الأول/i, /^nov|^نوفمبر|^تشرين\s*الثاني/i, /^dec|^ديسمبر|^كانون\s*الأول/i
    ];

    function mkDate(y, m, d) {
        const dt = new Date(y, m - 1, d, 12);
        return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d ? dt : null;
    }

    function parsePayDate(v, refYear) {
        if (v == null || v === '') return null;
        if (v instanceof Date && !isNaN(v)) return new Date(v.getFullYear(), v.getMonth(), v.getDate(), 12);
        if (typeof v === 'number') return v > 30000 && v < 80000 ? serialToDate(v) : null;

        const s = String(v).trim();
        let m;

        if ((m = s.match(/^(\d{4})\s*[\/\-.]\s*(\d{1,2})\s*[\/\-.]\s*(\d{1,2})/))) {
            return mkDate(+m[1], +m[2], +m[3]);
        }

        // day/month/year (Egypt style). If the month part is > 12 we swap automatically.
        if ((m = s.match(/^(\d{1,2})\s*[\/\-.]\s*(\d{1,2})(?:\s*[\/\-.]\s*(\d{2,4}))?$/))) {
            let d = +m[1], mo = +m[2];
            let y = m[3] ? +m[3] : +refYear;
            if (y < 100) y += 2000;
            if (mo > 12 && d <= 12) [d, mo] = [mo, d];
            return mkDate(y, mo, d);
        }

        // text month: "March", "Mar 2025", "15 March 2025", "مارس"
        const words = s.split(/[\s,\-\/.]+/).filter(Boolean);
        const mi = MONTH_PATTERNS.findIndex(re => words.some(w => re.test(w)));
        if (mi >= 0) {
            const nums = words.filter(w => /^\d+$/.test(w));
            const yearTok = nums.find(w => w.length === 4);
            const dayTok = nums.find(w => w.length <= 2);
            return mkDate(yearTok ? +yearTok : +refYear, mi + 1, dayTok ? +dayTok : 1);
        }
        return null;
    }

    const toAsciiDigits = s => String(s)
        .replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x660)
        .replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 0x6F0)
        .replace(/\u066B/g, '.')
        .replace(/\u066C/g, ',');

    const parseMoney = v => {
        if (typeof v === 'number') return isFinite(v) ? v : 0;
        const s = toAsciiDigits(v == null ? '' : v).replace(/,/g, '');
        const m = s.match(/-?\d+(\.\d+)?/);
        return m ? parseFloat(m[0]) : 0;
    };

    function normalizePhone(v) {
        let raw = toAsciiDigits(v == null ? '' : v);
        // a cell may hold two numbers ("0101... / 0111...") - keep the first
        const first = raw.split(/[\/,;\n]|\s-\s/).map(x => x.replace(/\D/g, '')).find(x => x.length >= 7);
        let s = first || raw.replace(/\D/g, '');
        if (s.startsWith('20') && s.length === 12) s = '0' + s.slice(2);
        if (s.length === 10 && s[0] === '1') s = '0' + s;
        return s;
    }

    // ---- flexible header matching (English + Arabic, extra words allowed) ----
    const normText = v => String(v == null ? '' : v)
        .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
        .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
        .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();

    const hasWord = (text, kws) => {
        const t = ' ' + text + ' ';
        return kws.some(k => t.includes(' ' + k + ' '));
    };

    const KW = {
        name: ['name', 'names', 'student', 'students', 'اسم', 'الاسم', 'الاسماء', 'الطالب', 'طالب', 'الطالبه', 'طالبه', 'الطلاب'],
        nameAvoid: ['teacher', 'parent', 'father', 'mother', 'guardian', 'مدرس', 'المدرس', 'والد', 'الوالد', 'ولي', 'والده', 'الام', 'الاب'],
        phone: ['mobile', 'phone', 'tel', 'telephone', 'whatsapp', 'cell', 'contact', 'موبايل', 'الموبايل', 'محمول', 'المحمول', 'تليفون', 'التليفون', 'هاتف', 'الهاتف', 'واتس', 'واتساب', 'الواتس', 'الواتساب'],
        balance: ['balance', 'due', 'remaining', 'remain', 'rest', 'outstanding', 'left', 'المتبقي', 'متبقي', 'الباقي', 'باقي', 'المطلوب', 'مطلوب'],
        date: ['date', 'paid on', 'تاريخ', 'التاريخ'],
        month: ['month', 'الشهر', 'شهر'],
        books: ['book', 'books', 'كتاب', 'الكتاب', 'كتب', 'الكتب'],
        fee: ['fees', 'fee', 'amount', 'paid', 'price', 'cost', 'tuition', 'الرسوم', 'رسوم', 'المبلغ', 'مبلغ', 'المدفوع', 'مدفوع', 'دفع', 'الدفع', 'المصروفات', 'مصروفات', 'سعر', 'السعر', 'الاشتراك', 'اشتراك'],
        feeAvoid: ['method', 'note', 'notes', 'طريقه', 'ملاحظات', 'ملاحظه']
    };

    const WEEKDAY_WORDS = /\b(sat|sun|mon|tue|tues|wed|thu|thur|thurs|fri|saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b|السبت|الاحد|الأحد|الاثنين|الإثنين|الثلاثاء|الاربعاء|الأربعاء|الخميس|الجمعة/gi;

    // Reads one sheet: Name column, date columns (attendance), mobile, fees, books.
    // Works with: header on any of the first 30 rows, English/Arabic headers,
    // extra words in headers, ticks/yes/present marks, Arabic digits.
    function parseSheet(ws, fileName) {
        if (!ws) return null;
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null })
            .map(r => Array.isArray(r) ? r : []);
        if (!rows.length) return null;

        const cellStr = c => String(c == null ? '' : c).trim();
        const nonEmpty = r => r.filter(c => cellStr(c) !== '').length;
        const isTotalName = n => /^(total|totals|sum|grand total|المجموع|مجموع|الاجمالي|اجمالي)( |$)/.test(normText(n));

        let refYear = (String(fileName).match(/20\d\d/) || [new Date().getFullYear()])[0];
        for (const r of rows.slice(0, 30)) {
            const serial = r.find(c => typeof c === 'number' && c > 30000 && c < 80000);
            if (serial) { refYear = serialToDate(serial).getFullYear(); break; }
        }

        // 1) find the header row = the row with the most recognisable headers
        const rowScore = r => {
            let s = 0, hasName = false;
            r.forEach(c => {
                const t = normText(c);
                if (!t) return;
                const isName = hasWord(t, KW.name);
                if (isName) hasName = true;
                if (isName || hasWord(t, KW.phone) || hasWord(t, KW.balance) || hasWord(t, KW.date) ||
                    hasWord(t, KW.books) || hasWord(t, KW.fee)) s += 1;
                else if (parseHeaderDate(c, +refYear)) s += 0.5;
            });
            return { score: s + nonEmpty(r) * 0.01, hasName };
        };

        let hi = -1, bestScore = 0;
        rows.slice(0, 30).forEach((r, i) => {
            const { score, hasName } = rowScore(r);
            if (hasName && score > bestScore) { bestScore = score; hi = i; }
        });

        let guessed = false;
        let head, nameCol = -1;

        if (hi >= 0) {
            head = rows[hi];
        } else {
            // 2) no "Name" header at all: guess the column that is mostly text
            hi = rows.findIndex((r, i) => i < 30 && nonEmpty(r) >= 2);
            if (hi < 0) return null;
            head = rows[hi];
            const body = rows.slice(hi + 1, hi + 400);
            const width = Math.max(head.length, ...body.map(r => r.length));
            let bestN = 0;
            for (let j = 0; j < width; j++) {
                const n = body.filter(r => typeof r[j] === 'string' && /\p{L}{2,}/u.test(r[j]) && !isTotalName(r[j])).length;
                if (n > bestN) { bestN = n; nameCol = j; }
            }
            if (bestN < 1) return null;
            guessed = true;
        }

        // 3) map the other columns (each column used once)
        const taken = new Set();
        const findCol = (kws, avoid) => {
            for (let j = 0; j < head.length; j++) {
                if (taken.has(j) || j === nameCol) continue;
                const t = normText(head[j]);
                if (!t) continue;
                if (hasWord(t, kws) && !(avoid && hasWord(t, avoid))) { taken.add(j); return j; }
            }
            return -1;
        };

        let phoneCol = findCol(KW.phone);
        let payDateCol = findCol(KW.date);
        if (payDateCol < 0) payDateCol = findCol(KW.month);
        const balanceCol = findCol(KW.balance);
        const booksCol = findCol(KW.books);
        const feeCol = findCol(KW.fee, KW.feeAvoid);

        if (nameCol < 0) {
            const cands = [];
            head.forEach((c, j) => {
                if (taken.has(j)) return;
                if (hasWord(normText(c), KW.name)) cands.push(j);
            });
            const good = cands.filter(j => !hasWord(normText(head[j]), KW.nameAvoid));
            nameCol = (good.length ? good : cands)[0];
        }
        if (nameCol == null || nameCol < 0) return null;
        taken.add(nameCol);

        // no "Mobile" header? look for a column full of phone numbers
        if (phoneCol < 0) {
            const body = rows.slice(hi + 1, hi + 200);
            const width = Math.max(head.length, ...body.map(r => r.length));
            for (let j = 0; j < width; j++) {
                if (taken.has(j)) continue;
                const vals = body.map(r => r[j]).filter(v => cellStr(v) !== '');
                if (vals.length < 2) continue;
                const ok = vals.filter(v => /^(0?1[0125]\d{8}|20 ?1[0125]\d{8})$/.test(normalizePhone(v))).length;
                if (ok / vals.length >= 0.6) { phoneCol = j; taken.add(j); break; }
            }
        }

        // 4) attendance date columns (header row, or the row just above it)
        const dateCols = [];
        const addDates = r => r.forEach((c, j) => {
            if (j === nameCol || taken.has(j) || dateCols.some(x => x.j === j)) return;
            const d = parseHeaderDate(c, +refYear);
            if (d) dateCols.push({ j, d });
        });
        addDates(head);
        if (!dateCols.length && hi > 0) addDates(rows[hi - 1]);
        dateCols.sort((a, b) => a.j - b.j);

        // a cell like "ملغي" (cancelled) means there was no class on that date
        const dataRows = rows.slice(hi + 1);
        const cancelledCols = new Set();
        dataRows.forEach(r => r.forEach((v, j) => {
            if (typeof v === 'string' && /ملغ|ملع|cancel/i.test(v)) cancelledCols.add(j);
        }));

        const isPresent = v => {
            if (v === true) return true;
            if (typeof v === 'number') return v > 0;
            const s = toAsciiDigits(cellStr(v)).toLowerCase();
            if (!s) return false;
            if (/^[✓✔☑✅√]/.test(s)) return true;
            if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s) > 0;
            return ['v', 'p', 'y', 'yes', 'true', 'present', 'attended', 'حاضر', 'حضر', 'حاضره', 'ح'].includes(s);
        };

        const students = [];
        let badDates = 0;
        const nameExact = ['name', 'student name', 'students', 'student', 'الاسم', 'اسم الطالب', 'الطالب'];

        dataRows.forEach(r => {
            const name = cellStr(r[nameCol]).replace(/\s+/g, ' ');
            if (!name || /^[\d\s.]+$/.test(name) || isTotalName(name)) return;
            if (nameExact.includes(normText(name))) return; // repeated header row

            const weeks = {};
            let attended = 0;
            dateCols.forEach(({ j, d }) => {
                const k = dayKeyOf(d);
                if (!k) return;
                const wk = isoDate(weekStartOf(d));
                const rec = weeks[wk] = weeks[wk] || {};
                if (cancelledCols.has(j)) { rec[k] = 'cancelled'; return; }
                rec[k] = isPresent(r[j]);
                if (rec[k]) attended++;
            });

            const fee = feeCol >= 0 ? parseMoney(r[feeCol]) : 0;
            const rawDate = payDateCol >= 0 ? r[payDateCol] : null;
            const payDate = parsePayDate(rawDate, +refYear);
            if (rawDate != null && cellStr(rawDate) !== '' && !payDate) badDates++;
            students.push({
                name,
                mobile: phoneCol >= 0 ? normalizePhone(r[phoneCol]) : '',
                fee,
                balance: balanceCol >= 0 ? parseMoney(r[balanceCol]) : 0,
                payDate,
                books: booksCol >= 0 && isPresent(r[booksCol]),
                weeks,
                attended
            });
        });

        if (!students.length) return null;

        const cnt = {};
        dateCols.forEach(({ d }) => { const k = dayKeyOf(d); if (k) cnt[k] = (cnt[k] || 0) + 1; });

        return {
            students,
            days: Object.keys(cnt).sort((x, y) => cnt[y] - cnt[x]).slice(0, 2),
            dates: dateCols.length,
            cancelled: dateCols.filter(c => cancelledCols.has(c.j)).length,
            hasFees: feeCol >= 0,
            hasPhone: phoneCol >= 0,
            hasDate: payDateCol >= 0,
            hasBalance: balanceCol >= 0,
            dateHeader: payDateCol >= 0 ? cellStr(head[payDateCol]) : '',
            badDates,
            guessed,
            title: String((rows[0] || []).find(c => c != null) || '')
        };
    }

    function handleFile(file) {
        const isText = /\.(csv|tsv|txt)$/i.test(file.name || '');
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const buf = new Uint8Array(e.target.result);

                if (isText) {
                    // decode CSV ourselves so Arabic text is not garbled
                    let text = new TextDecoder('utf-8').decode(buf);
                    if (text.includes('\uFFFD')) {
                        try { text = new TextDecoder('windows-1256').decode(buf); } catch (_) { /* keep utf-8 */ }
                    }
                    importWB = XLSX.read(text.replace(/^\uFEFF/, ''), { type: 'string', raw: true });
                } else {
                    importWB = XLSX.read(buf, { type: 'array' });
                }
                importFileName = file.name;

                importSheetSelect.innerHTML = importWB.SheetNames
                    .map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');

                // open the sheet that looks most like a student list
                let bestName = null, bestScore = -1;
                importWB.SheetNames.forEach(n => {
                    const p = parseSheet(importWB.Sheets[n], file.name);
                    if (!p) return;
                    const score = p.students.length + (p.hasFees ? 1000 : 0) + (p.hasPhone ? 1000 : 0) + (p.dates ? 500 : 0);
                    if (score > bestScore) { bestScore = score; bestName = n; }
                });

                if (!bestName) {
                    alert('Could not find any student names in this file. Make sure the sheet has a column of student names (e.g. "Name" / "الاسم").');
                    return;
                }

                importSheetSelect.value = bestName;
                loadImportSheet(true);
                importPreviewModal.style.display = 'flex';
            } catch (err) {
                console.error(err);
                alert('Error parsing file. Please check file format.');
            } finally {
                excelFileInput.value = ''; // allow choosing the same file again
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function loadImportSheet(first) {
        importParsed = parseSheet(importWB.Sheets[importSheetSelect.value], importFileName);
        if (!importParsed) {
            alert('Could not find any student names in this sheet. Try another sheet from the list.');
            importParsed = { students: [], days: [], dates: 0, cancelled: 0 };
        }
        if (first) {
            importPayDate.value = isoDate(new Date());
            let cat = getCategoryFromFileTitle(importFileName.replace(/^([a-z])[\s_]/i, '$1.'));
            if (cat === 'Other') cat = getCategoryFromFileTitle(importParsed.title || '');
            importCategory.value = cat;
            const g = importFileName.match(/^([a-z])[\s._-]*(\d+)[\s._-]*([a-z])?/i);
            importGroup.value = g ? (g[1] + '.' + g[2] + (g[3] || '')).toUpperCase() : '';
        }
        document.querySelectorAll('input[name="importDay"]').forEach(cb => {
            cb.checked = importParsed.days.includes(cb.value);
        });
        renderImportPreview();
    }

    importSheetSelect.addEventListener('change', () => loadImportSheet(false));
    document.querySelectorAll('input[name="importMode"]').forEach(r => r.addEventListener('change', renderImportPreview));
    importPayDate.addEventListener('change', renderImportPreview);

    function renderImportPreview() {
        const mode = document.querySelector('input[name="importMode"]:checked').value;
        const doFees = mode !== 'attendance';
        const doAtt = mode !== 'fees';
        const list = importParsed.students;
        const fallbackDate = importPayDate.value || isoDate(new Date());
        const hasPay = s => s.fee > 0 || s.balance > 0;

        importPreviewBody.innerHTML = list.map(s => {
            const status = [
                doFees ? (hasPay(s) ? 'Fees' : 'No fee (skipped)') : '',
                doAtt ? (findAttStudent(s) ? 'Attendance (update)' : 'Attendance') : ''
            ].filter(Boolean).join(' + ');

            const dateCell = s.payDate
                ? isoDate(s.payDate)
                : `<span style="color:#9ca3af;" title="No date in the sheet - using the default date">${fallbackDate} (default)</span>`;

            return `<tr>
                <td><strong>${escapeHtml(s.name)}</strong></td>
                <td>${escapeHtml(s.mobile || '-')}</td>
                <td>${s.fee > 0 ? 'EGP ' + s.fee.toLocaleString() : '-'}</td>
                <td class="${s.balance > 0 ? 'balance-due' : ''}">${s.balance > 0 ? 'EGP ' + s.balance.toLocaleString() : '-'}</td>
                <td>${doFees && hasPay(s) ? dateCell : '-'}</td>
                <td>${s.attended} / ${importParsed.dates - importParsed.cancelled}</td>
                <td>${status}</td>
            </tr>`;
        }).join('');

        const withDate = list.filter(s => s.payDate && hasPay(s)).length;
        const paying = list.filter(hasPay).length;
        const dateNote = importParsed.hasDate
            ? `payment date read from "<strong>${escapeHtml(importParsed.dateHeader)}</strong>" for ${withDate} of ${paying} payments` +
              (importParsed.badDates ? ` <span style="color:#dc2626;">(${importParsed.badDates} date(s) could not be read - default date used)</span>` : '')
            : `<span style="color:#dc2626;">no Date column found - all payments use the default date ${fallbackDate}</span>`;

        importSummary.innerHTML =
            `<strong>${list.length}</strong> students found &middot; ` +
            `${importParsed.dates} class dates (${importParsed.cancelled} cancelled) &middot; ` +
            `class days: ${importParsed.days.map(d => d.toUpperCase()).join(', ') || 'none'}` +
            `<br>${dateNote}` +
            (importParsed.hasBalance ? ' &middot; balance due column detected' : ' &middot; no Balance column found (balance = 0)') +
            (importParsed.guessed ? '<br><span style="color:#d97706;">No "Name" header found - the name column was guessed. Please check the preview before importing.</span>' : '');
    }

    closeImportPreview.addEventListener(
        'click',
        () => {
            importPreviewModal.style.display =
                'none';
        }
    );

    cancelImportBtn.addEventListener(
        'click',
        () => {
            importPreviewModal.style.display =
                'none';
        }
    );

    confirmImportBtn.addEventListener('click', () => {
        const list = importParsed.students;
        if (!list.length) return;

        const mode = document.querySelector('input[name="importMode"]:checked').value;
        const doFees = mode !== 'attendance';
        const doAtt = mode !== 'fees';
        const category = importCategory.value;
        const group = importGroup.value.trim().toUpperCase();
        const courseTime = importTime.value;
        const days = [...document.querySelectorAll('input[name="importDay"]')]
            .filter(c => c.checked).map(c => c.value);

        if (doAtt && (days.length < 1 || days.length > 2)) {
            alert('Please choose 1 or 2 class days for attendance.');
            return;
        }
        if (doAtt && !group) {
            alert('Please enter a group for attendance.');
            return;
        }

        let uid = Date.now();
        let nPay = 0, nNew = 0, nUpd = 0;

        if (doFees) {
            const fallbackDate = importPayDate.value || isoDate(new Date());
            const fresh = [];
            list.forEach(s => {
                if (!(s.fee > 0 || s.balance > 0)) return;
                // the payment goes to the month of the date written in the Excel row
                const date = s.payDate ? isoDate(s.payDate) : fallbackDate;
                const dup = payments.some(p =>
                    p.name.toLowerCase() === s.name.toLowerCase() &&
                    p.category === category &&
                    p.amount === s.fee &&
                    p.date === date &&
                    String(p.note).startsWith('Imported from Excel'));
                if (dup) return;
                fresh.push({
                    id: uid++,
                    name: s.name,
                    category,
                    amount: s.fee,
                    balanceDue: s.balance,
                    note: 'Imported from Excel' + (s.books ? ' - Books' : ''),
                    method: 'Cash',
                    date
                });
            });
            nPay = fresh.length;
            // newest payment date first, so "Recent Payments" shows the latest dates
            payments = [...fresh, ...payments].sort(byDateDesc);
        }

        if (doAtt) {
            list.forEach(s => {
                let st = findAttStudent(s);
                if (st) {
                    nUpd++;
                    if (!st.mobile && s.mobile) st.mobile = s.mobile;
                } else {
                    st = { id: uid++, name: s.name, mobile: s.mobile, category, group, courseTime, courseDays: days, attendanceByWeek: {} };
                    studentAttendanceList.push(st);
                    nNew++;
                }
                st.attendanceByWeek = st.attendanceByWeek || {};
                Object.entries(s.weeks).forEach(([wk, rec]) => {
                    st.attendanceByWeek[wk] = { ...(st.attendanceByWeek[wk] || {}), ...rec };
                });
            });
            localStorage.setItem('coursado_student_attendance', JSON.stringify(studentAttendanceList));
        }

        saveAndRender();

        importPreviewModal.style.display = 'none';
        excelFileInput.value = '';

        const parts = [];
        if (doFees) parts.push(`${nPay} payments`);
        if (doAtt) parts.push(`${nNew} new students in attendance${nUpd ? ` (${nUpd} updated)` : ''}`);
        importStatus.innerHTML =
            `<span><i class="fa-solid fa-circle-check"></i> Imported ${parts.join(' and ')}.</span>`;
    });

    function escapeHtml(str) {

        return String(str)
            .replace(
                /&/g,
                '&amp;'
            )
            .replace(
                /</g,
                '&lt;'
            )
            .replace(
                />/g,
                '&gt;'
            )
            .replace(
                /"/g,
                '&quot;'
            )
            .replace(
                /'/g,
                '&#039;'
            );
    }

    /* ---------- Clear data (per section) ---------- */
    const BACKUP_HINT = '\n\nThis cannot be undone. Tip: download a backup first (Reports & Exports page).';

    document.getElementById('clearPaymentsBtn').addEventListener('click', () => {
        if (payments.length === 0) { alert('There are no payments to clear.'); return; }
        if (!confirm('Delete ALL ' + payments.length + ' payment records?\n\nThe Dashboard, Students directory and Reports are built from payments, so they will go back to 0 too.' + BACKUP_HINT)) return;
        payments = [];
        lastAddedPayment = null;
        saveAndRender();
    });

    document.getElementById('clearStudentWeekBtn').addEventListener('click', () => {
        const wk = weekKeyView();
        if (!confirm('Clear all student attendance ticks for the week of ' + fmtShort(viewWeekStart) + '?\n\nStudents stay in the list; other weeks are not touched.' + BACKUP_HINT)) return;
        studentAttendanceList.forEach(st => { if (st.attendanceByWeek) delete st.attendanceByWeek[wk]; });
        localStorage.setItem('coursado_student_attendance', JSON.stringify(studentAttendanceList));
        renderStudentAttendance();
    });

    document.getElementById('clearStudentAllBtn').addEventListener('click', () => {
        if (studentAttendanceList.length === 0) { alert('There are no students to clear.'); return; }
        if (!confirm('Remove ALL ' + studentAttendanceList.length + ' students and their attendance history for every week?\n\nBook stock counts are not changed.' + BACKUP_HINT)) return;
        studentAttendanceList = [];
        localStorage.setItem('coursado_student_attendance', JSON.stringify(studentAttendanceList));
        renderStudentAttendance();
    });

    document.getElementById('clearStaffWeekBtn').addEventListener('click', () => {
        const wk = staffWeekKey();
        if (!confirm('Clear all staff attendance and times for the week of ' + fmtShort(staffViewWeekStart) + '?\n\nStaff members stay in the list; other weeks are not touched.' + BACKUP_HINT)) return;
        staffList.forEach(st => { if (st.weeks) delete st.weeks[wk]; });
        saveAndRenderStaff();
    });

    document.getElementById('clearStaffAllBtn').addEventListener('click', () => {
        if (staffList.length === 0) { alert('There are no staff members to clear.'); return; }
        if (!confirm('Remove ALL ' + staffList.length + ' staff members and their attendance history for every week?' + BACKUP_HINT)) return;
        staffList = [];
        saveAndRenderStaff();
    });

    document.getElementById('clearBooksBtn').addEventListener('click', () => {
        if (!confirm('Reset the book count of every stage to 0?' + BACKUP_HINT)) return;
        BOOK_STAGES.forEach(stage => { booksStock[stage] = 0; });
        saveBooksStock();
        renderBooks();
    });

    /* ---------- Backup & Restore ---------- */
    const BACKUP_KEYS = [
        'coursado_dashboard_payments',
        'coursado_dashboard_staff',
        'coursado_student_attendance',
        'coursado_books_stock'
    ];

    // Ask the browser not to clear this site's data automatically
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }

    const backupStatus = document.getElementById('backupStatus');
    const restoreFileInput = document.getElementById('restoreFileInput');

    document.getElementById('backupDataBtn').addEventListener('click', () => {
        const backup = { app: 'coursado', version: 1, savedAt: new Date().toISOString(), data: {} };
        BACKUP_KEYS.forEach(key => {
            try { backup.data[key] = JSON.parse(localStorage.getItem(key)); }
            catch (e) { backup.data[key] = null; }
        });

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'coursado-backup-' + isoDate(new Date()) + '.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);

        backupStatus.textContent = 'Backup downloaded on ' + new Date().toLocaleString() + '.';
    });

    document.getElementById('restoreDataBtn').addEventListener('click', () => restoreFileInput.click());

    restoreFileInput.addEventListener('change', () => {
        const file = restoreFileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const backup = JSON.parse(reader.result);
                if (!backup || backup.app !== 'coursado' || typeof backup.data !== 'object') {
                    throw new Error('Not a Coursado backup file');
                }
                if (!confirm('Restoring will REPLACE all current data with the data in this backup. Continue?')) {
                    restoreFileInput.value = '';
                    return;
                }
                BACKUP_KEYS.forEach(key => {
                    const value = backup.data[key];
                    if (value === null || typeof value === 'undefined') localStorage.removeItem(key);
                    else localStorage.setItem(key, JSON.stringify(value));
                });
                location.reload();
            } catch (err) {
                restoreFileInput.value = '';
                alert('Could not restore: this is not a valid Coursado backup file.');
            }
        };
        reader.readAsText(file);
    });

    renderAllViews();

});