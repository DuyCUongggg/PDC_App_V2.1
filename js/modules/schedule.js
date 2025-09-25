// ===== SCHEDULE MODULE =====
let currentWeek = 0; // 0 = current week, -1 = previous week, 1 = next week
let currentMonth = 0; // 0 = current month, -1 = previous month, 1 = next month
let scheduleData = {
    shifts: [],
    people: [
        { id: 'person1', name: 'Người 1', color: '#3b82f6' },
        { id: 'person2', name: 'Người 2', color: '#10b981' },
        { id: 'person3', name: 'Người 3', color: '#f59e0b' },
        { id: 'person4', name: 'Người 4', color: '#ef4444' }
    ]
};

// Salary configuration
const SALARY_CONFIG = {
    SHIFT_RATE: 120000, // 120k per shift
    MEAL_ALLOWANCE: 40000 // 40k meal allowance
};

// Shift configurations
const shiftConfigs = {
    'shift1': { name: 'Ca 1', start: '08:00', end: '12:00', color: 'shift1' },
    'shift2': { name: 'Ca 2', start: '13:00', end: '17:00', color: 'shift2' },
    'shift3': { name: 'Ca 3', start: '18:00', end: '22:00', color: 'shift3' },
    'shift1-2': { name: 'Ca 1+2', start: '08:00', end: '17:00', color: 'shift1-2' },
    'shift2-3': { name: 'Ca 2+3', start: '13:00', end: '22:00', color: 'shift2-3' },
    'shift1-3': { name: 'Ca 1+3', start: '08:00-12:00, 18:00-22:00', end: '', color: 'shift1-3' },
    'all': { name: 'Cả ngày', start: '08:00', end: '22:00', color: 'all' }
};

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

(function initSchedule() {
    // Load schedule data from localStorage
    loadScheduleData();
    
    // Set initial month to May 2025 if current month is before May 2025
    const today = new Date();
    const may2025 = new Date(2025, 4, 1); // Tháng 5/2025 (tháng 4 vì index từ 0)
    
    if (today < may2025) {
        currentMonth = 0; // Reset to current month, but will be limited by changeMonth function
    }
    
    // Initialize schedule views
    renderTeamSchedule();
    renderPersonalSchedule();
    updateScheduleStats();
    
    // Set up event listeners
    setupScheduleEventListeners();
})();

function loadScheduleData() {
    try {
        const saved = localStorage.getItem('schedule_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            scheduleData.shifts = parsed.shifts || [];
            scheduleData.people = parsed.people || scheduleData.people;
        }
    } catch (e) {
        console.log('No saved schedule data found');
    }
}

function saveScheduleData() {
    try {
        localStorage.setItem('schedule_data', JSON.stringify(scheduleData));
    } catch (e) {
        console.error('Error saving schedule data:', e);
    }
}

function setupScheduleEventListeners() {
    // Week navigation
    document.getElementById('changeWeek')?.addEventListener('click', () => changeWeek(1));
    
    // Person selection
    document.getElementById('personSelect')?.addEventListener('change', loadPersonalSchedule);
}

function switchScheduleView(view) {
    // Update button states
    document.getElementById('teamViewBtn').classList.toggle('active', view === 'team');
    document.getElementById('personalViewBtn').classList.toggle('active', view === 'personal');
    
    // Show/hide views
    document.getElementById('teamScheduleView').classList.toggle('active', view === 'team');
    document.getElementById('personalScheduleView').classList.toggle('active', view === 'personal');
    
    if (view === 'team') {
        switchTeamViewMode('week');
    } else if (view === 'personal') {
        switchPersonalViewMode('week');
    }
}

function switchTeamViewMode(mode) {
    // Update button states
    document.getElementById('teamWeekBtn').classList.toggle('active', mode === 'week');
    document.getElementById('teamMonthBtn').classList.toggle('active', mode === 'month');
    
    // Show/hide sub-views
    document.getElementById('teamWeekView').classList.toggle('active', mode === 'week');
    document.getElementById('teamMonthView').classList.toggle('active', mode === 'month');
    
    if (mode === 'week') {
        renderTeamSchedule();
    } else {
        renderTeamMonthlySchedule();
    }
}
window.switchTeamViewMode = switchTeamViewMode;

function switchPersonalViewMode(mode) {
    // Update button states
    document.getElementById('personalWeekBtn').classList.toggle('active', mode === 'week');
    document.getElementById('personalMonthBtn').classList.toggle('active', mode === 'month');
    
    // Show/hide sub-views
    document.getElementById('personalWeekView').classList.toggle('active', mode === 'week');
    document.getElementById('personalMonthView').classList.toggle('active', mode === 'month');
    
    if (mode === 'week') {
        renderPersonalSchedule();
    } else {
        renderPersonalMonthlySchedule();
    }
}
window.switchPersonalViewMode = switchPersonalViewMode;
window.switchScheduleView = switchScheduleView;

function changeWeek(direction) {
    currentWeek += direction;
    updateWeekDisplay();
    renderTeamSchedule();
    renderPersonalSchedule();
}
window.changeWeek = changeWeek;

function updateWeekDisplay() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + (currentWeek * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekDisplay = document.getElementById('currentWeek');
    const personalWeekDisplay = document.getElementById('personalCurrentWeek');
    
    if (weekDisplay) {
        weekDisplay.textContent = `Tuần ${weekStart.getDate()}-${weekEnd.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
    }
    if (personalWeekDisplay) {
        personalWeekDisplay.textContent = `Tuần ${weekStart.getDate()}-${weekEnd.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
    }
}

function renderTeamSchedule() {
    const grid = document.getElementById('teamScheduleGrid');
    if (!grid) return;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add header row
    grid.appendChild(createScheduleHeader());
    
    // Add time slots
    const timeSlots = [
        { time: '08:00', label: 'Ca 1' },
        { time: '12:00', label: 'Nghỉ trưa' },
        { time: '13:00', label: 'Ca 2' },
        { time: '17:00', label: 'Nghỉ tối' },
        { time: '18:00', label: 'Ca 3' },
        { time: '22:00', label: 'Kết thúc' }
    ];
    
    timeSlots.forEach(slot => {
        const timeCell = document.createElement('div');
        timeCell.className = 'schedule-time-cell';
        timeCell.innerHTML = `
            <div>${slot.time}</div>
            <div style="font-size: 10px; opacity: 0.7;">${slot.label}</div>
        `;
        grid.appendChild(timeCell);
        
        // Add day cells for this time slot
        days.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.className = 'schedule-slot';
            dayCell.dataset.day = day;
            dayCell.dataset.time = slot.time;
            
            // Check if there's a shift at this time
            const shifts = getShiftsForDayAndTime(day, slot.time);
            if (shifts.length > 0) {
                dayCell.classList.add('occupied');
                const shift = shifts[0];
                const person = scheduleData.people.find(p => p.id === shift.personId);
                const personColor = person ? person.color : '#3b82f6';
                
                dayCell.innerHTML = `
                    <div class="shift-info">${getPersonName(shift.personId)}</div>
                    <div class="shift-time">${shiftConfigs[shift.shiftType].name}</div>
                    ${shift.note ? `<div class="shift-note">${shift.note}</div>` : ''}
                `;
                dayCell.style.borderLeftColor = personColor;
                dayCell.style.borderLeftWidth = '4px';
                dayCell.onclick = () => openEditShiftModal(shift.id);
            } else {
                dayCell.innerHTML = '<div style="opacity: 0.3;">Trống</div>';
                dayCell.onclick = () => openAddShiftModal(day, slot.time);
            }
            
            grid.appendChild(dayCell);
        });
    });
}

function renderPersonalSchedule() {
    const grid = document.getElementById('personalScheduleGrid');
    if (!grid) return;
    
    const selectedPerson = document.getElementById('personSelect')?.value || 'person1';
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add header row
    grid.appendChild(createScheduleHeader());
    
    // Add time slots
    const timeSlots = [
        { time: '08:00', label: 'Ca 1' },
        { time: '12:00', label: 'Nghỉ trưa' },
        { time: '13:00', label: 'Ca 2' },
        { time: '17:00', label: 'Nghỉ tối' },
        { time: '18:00', label: 'Ca 3' },
        { time: '22:00', label: 'Kết thúc' }
    ];
    
    timeSlots.forEach(slot => {
        const timeCell = document.createElement('div');
        timeCell.className = 'schedule-time-cell';
        timeCell.innerHTML = `
            <div>${slot.time}</div>
            <div style="font-size: 10px; opacity: 0.7;">${slot.label}</div>
        `;
        grid.appendChild(timeCell);
        
        // Add day cells for this time slot
        days.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.className = 'schedule-slot';
            dayCell.dataset.day = day;
            dayCell.dataset.time = slot.time;
            
            // Check if this person has a shift at this time
            const shifts = getShiftsForDayAndTime(day, slot.time).filter(shift => shift.personId === selectedPerson);
            if (shifts.length > 0) {
                dayCell.classList.add('occupied');
                const shift = shifts[0];
                const person = scheduleData.people.find(p => p.id === shift.personId);
                const personColor = person ? person.color : '#3b82f6';
                
                dayCell.innerHTML = `
                    <div class="shift-info">${shiftConfigs[shift.shiftType].name}</div>
                    <div class="shift-time">${shiftConfigs[shift.shiftType].start} - ${shiftConfigs[shift.shiftType].end}</div>
                    ${shift.note ? `<div class="shift-note">${shift.note}</div>` : ''}
                `;
                dayCell.style.borderLeftColor = personColor;
                dayCell.style.borderLeftWidth = '4px';
                dayCell.onclick = () => openEditShiftModal(shift.id);
            } else {
                dayCell.innerHTML = '<div style="opacity: 0.3;">Trống</div>';
                dayCell.onclick = () => openAddShiftModal(day, slot.time, selectedPerson);
            }
            
            grid.appendChild(dayCell);
        });
    });
}

function createScheduleHeader() {
    const headerRow = document.createElement('div');
    headerRow.style.gridColumn = '1 / -1';
    headerRow.style.display = 'grid';
    headerRow.style.gridTemplateColumns = '120px repeat(7, 1fr)';
    headerRow.style.gap = '1px';
    headerRow.style.background = 'var(--border-primary)';
    
    // Time column header
    const timeHeader = document.createElement('div');
    timeHeader.className = 'schedule-header-cell';
    timeHeader.textContent = 'Thời gian';
    headerRow.appendChild(timeHeader);
    
    // Day headers
    dayNames.forEach(dayName => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'schedule-header-cell';
        dayHeader.textContent = dayName;
        headerRow.appendChild(dayHeader);
    });
    
    return headerRow;
}

function getShiftsForDayAndTime(day, time) {
    return scheduleData.shifts.filter(shift => {
        if (shift.day !== day) return false;
        
        const shiftConfig = shiftConfigs[shift.shiftType];
        if (!shiftConfig) return false;
        
        // Check if the time falls within the shift
        return isTimeInShift(time, shiftConfig);
    });
}

function isTimeInShift(time, shiftConfig) {
    if (shiftConfig.start === '08:00-12:00, 18:00-22:00') {
        return time === '08:00' || time === '18:00';
    }
    
    return time === shiftConfig.start;
}

function getPersonName(personId) {
    const person = scheduleData.people.find(p => p.id === personId);
    return person ? person.name : personId;
}

function openAddShiftModal(day = null, time = null, person = null) {
    const modal = document.getElementById('addShiftModal');
    if (!modal) return;
    
    // Pre-fill form if parameters provided
    if (day) {
        const daySelect = document.getElementById('shiftDay');
        if (daySelect) daySelect.value = day;
    }
    
    if (person) {
        const personSelect = document.getElementById('shiftPerson');
        if (personSelect) personSelect.value = person;
    }
    
    modal.classList.add('show');
}
window.openAddShiftModal = openAddShiftModal;

function closeAddShiftModal() {
    const modal = document.getElementById('addShiftModal');
    if (modal) modal.classList.remove('show');
}
window.closeAddShiftModal = closeAddShiftModal;

function updateShiftTimes() {
    const shiftType = document.getElementById('shiftType')?.value;
    if (!shiftType) return;
    
    const shiftConfig = shiftConfigs[shiftType];
    if (!shiftConfig) return;
    
    // Update the select options to show the correct times
    const select = document.getElementById('shiftType');
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === shiftType) {
            option.textContent = `${shiftConfig.name} (${shiftConfig.start}${shiftConfig.end ? '-' + shiftConfig.end : ''})`;
        }
    });
}

function addShift() {
    const personId = document.getElementById('shiftPerson')?.value;
    const day = document.getElementById('shiftDay')?.value;
    const shiftType = document.getElementById('shiftType')?.value;
    const note = document.getElementById('shiftNote')?.value;
    const mealAllowance = document.querySelector('input[name="mealAllowance"]:checked')?.value;
    
    if (!personId || !day || !shiftType) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Check for conflicts
    const conflicts = checkShiftConflicts(personId, day, shiftType);
    if (conflicts.length > 0) {
        const personName = getPersonName(personId);
        const dayName = dayNames[days.indexOf(day)];
        showNotification(`${personName} đã có ca ${conflicts.join(', ')} vào ${dayName}. Một người không thể làm 2 ca trùng giờ!`, 'error');
        return;
    }
    
    // Add shift
    const shift = {
        id: generateShiftId(),
        personId,
        day,
        shiftType,
        note: note.trim() || null,
        mealAllowance: mealAllowance || 'company',
        createdAt: new Date().toISOString()
    };
    
    scheduleData.shifts.push(shift);
    saveScheduleData();
    
    // Refresh views
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
    
    closeAddShiftModal();
    showNotification('Đã thêm ca làm việc!');
}
window.addShift = addShift;

function checkShiftConflicts(personId, day, shiftType) {
    const existingShifts = scheduleData.shifts.filter(shift => 
        shift.personId === personId && shift.day === day
    );
    
    const conflicts = [];
    const newShiftConfig = shiftConfigs[shiftType];
    
    existingShifts.forEach(existingShift => {
        const existingConfig = shiftConfigs[existingShift.shiftType];
        if (isShiftOverlapping(newShiftConfig, existingConfig)) {
            conflicts.push(existingConfig.name);
        }
    });
    
    return conflicts;
}

function checkShiftConflictsForEdit(personId, day, shiftType, excludeShiftId) {
    const existingShifts = scheduleData.shifts.filter(shift => 
        shift.personId === personId && 
        shift.day === day && 
        shift.id !== excludeShiftId
    );
    
    const conflicts = [];
    const newShiftConfig = shiftConfigs[shiftType];
    
    existingShifts.forEach(existingShift => {
        const existingConfig = shiftConfigs[existingShift.shiftType];
        if (isShiftOverlapping(newShiftConfig, existingConfig)) {
            conflicts.push(existingConfig.name);
        }
    });
    
    return conflicts;
}

function isShiftOverlapping(shift1, shift2) {
    // Define time ranges for each shift type
    const getTimeRanges = (shift) => {
        switch (shift.start) {
            case '08:00':
                return [{ start: 8, end: 12 }]; // Ca 1: 8h-12h
            case '13:00':
                return [{ start: 13, end: 17 }]; // Ca 2: 13h-17h
            case '18:00':
                return [{ start: 18, end: 22 }]; // Ca 3: 18h-22h
            case '08:00-12:00, 18:00-22:00':
                return [{ start: 8, end: 12 }, { start: 18, end: 22 }]; // Ca 1+3: 8h-12h, 18h-22h
            default:
                return [];
        }
    };
    
    const ranges1 = getTimeRanges(shift1);
    const ranges2 = getTimeRanges(shift2);
    
    // Check if any time ranges overlap
    for (const range1 of ranges1) {
        for (const range2 of ranges2) {
            if (range1.start < range2.end && range2.start < range1.end) {
                return true;
            }
        }
    }
    
    return false;
}

function generateShiftId() {
    return 'shift_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSchedule() {
    // Simple auto-schedule algorithm
    const people = scheduleData.people;
    const shifts = ['shift1', 'shift2', 'shift3'];
    
    // Clear existing shifts for the week
    scheduleData.shifts = scheduleData.shifts.filter(shift => {
        const shiftDate = new Date(shift.createdAt);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return shiftDate > weekAgo;
    });
    
    // Generate random schedule
    days.forEach(day => {
        shifts.forEach(shiftType => {
            const randomPerson = people[Math.floor(Math.random() * people.length)];
            const shift = {
                id: generateShiftId(),
                personId: randomPerson.id,
                day,
                shiftType,
                note: 'Tự động tạo',
                createdAt: new Date().toISOString()
            };
            scheduleData.shifts.push(shift);
        });
    });
    
    saveScheduleData();
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
    
    showNotification('Đã tạo lịch tự động!');
}
window.generateSchedule = generateSchedule;

function loadPersonalSchedule() {
    renderPersonalSchedule();
    renderPersonalMonthlySchedule();
}
window.loadPersonalSchedule = loadPersonalSchedule;

function updateScheduleStats() {
    const totalHours = calculateTotalHours();
    const activePeople = getActivePeopleCount();
    const coverageRate = calculateCoverageRate();
    const totalSalary = calculateTotalSalary();
    const totalMealAllowance = calculateTotalMealAllowance();
    
    const totalHoursEl = document.getElementById('totalHours');
    const activePeopleEl = document.getElementById('activePeople');
    const coverageRateEl = document.getElementById('coverageRate');
    const totalSalaryEl = document.getElementById('totalSalary');
    const totalMealAllowanceEl = document.getElementById('totalMealAllowance');
    
    if (totalHoursEl) totalHoursEl.textContent = totalHours + 'h';
    if (activePeopleEl) activePeopleEl.textContent = activePeople;
    if (coverageRateEl) coverageRateEl.textContent = coverageRate + '%';
    if (totalSalaryEl) totalSalaryEl.textContent = formatCurrency(totalSalary);
    if (totalMealAllowanceEl) totalMealAllowanceEl.textContent = formatCurrency(totalMealAllowance);
}

function calculateTotalSalary() {
    return scheduleData.shifts.length * SALARY_CONFIG.SHIFT_RATE;
}

function calculateTotalMealAllowance() {
    return scheduleData.shifts.length * SALARY_CONFIG.MEAL_ALLOWANCE;
}

function calculateTotalHours() {
    let totalHours = 0;
    
    scheduleData.shifts.forEach(shift => {
        const config = shiftConfigs[shift.shiftType];
        if (config) {
            if (config.start === '08:00-12:00, 18:00-22:00') {
                totalHours += 8; // 4 hours morning + 4 hours evening
            } else if (config.end) {
                const start = parseInt(config.start.split(':')[0]);
                const end = parseInt(config.end.split(':')[0]);
                totalHours += end - start;
            } else {
                totalHours += 4; // Default 4 hours
            }
        }
    });
    
    return totalHours;
}

function getActivePeopleCount() {
    const activePeople = new Set(scheduleData.shifts.map(shift => shift.personId));
    return activePeople.size;
}

function calculateCoverageRate() {
    const totalSlots = days.length * 3; // 3 shifts per day
    const occupiedSlots = scheduleData.shifts.length;
    return Math.round((occupiedSlots / totalSlots) * 100);
}

function changeMonth(direction) {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth + direction, 1);
    const minDate = new Date(2025, 4, 1); // Tháng 5/2025 (tháng 4 vì index từ 0)
    
    // Kiểm tra giới hạn tháng 5/2025
    if (targetMonth < minDate) {
        showNotification('Không thể xem trước tháng 5/2025!', 'error');
        return;
    }
    
    currentMonth += direction;
    updateMonthDisplay();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
}
window.changeMonth = changeMonth;

function updateMonthDisplay() {
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    const may2025 = new Date(2025, 4, 1); // Tháng 5/2025
    
    // Nếu tháng hiện tại trước tháng 5/2025, hiển thị tháng 5/2025
    const displayMonth = targetMonth < may2025 ? may2025 : targetMonth;
    
    const monthDisplay = document.getElementById('currentMonth');
    const personalMonthDisplay = document.getElementById('personalCurrentMonth');
    
    if (monthDisplay) {
        monthDisplay.textContent = `Tháng ${displayMonth.getMonth() + 1}/${displayMonth.getFullYear()}`;
    }
    if (personalMonthDisplay) {
        personalMonthDisplay.textContent = `Tháng ${displayMonth.getMonth() + 1}/${displayMonth.getFullYear()}`;
    }
}

function renderTeamMonthlySchedule() {
    const calendar = document.getElementById('teamMonthlyCalendar');
    if (!calendar) return;
    
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    const may2025 = new Date(2025, 4, 1); // Tháng 5/2025
    
    // Sử dụng tháng 5/2025 nếu tháng hiện tại trước tháng 5/2025
    const displayMonth = targetMonth < may2025 ? may2025 : targetMonth;
    const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = displayMonth.getDay();
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'monthly-grid';
    
    // Add day headers
    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'schedule-header-cell';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'monthly-day other-month';
        grid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'monthly-day';
        
        // Check if it's today
        const currentDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'monthly-day-header';
        dayHeader.innerHTML = `
            <span class="monthly-day-number">${day}</span>
        `;
        dayElement.appendChild(dayHeader);
        
        // Get shifts for this day
        const dayShifts = getShiftsForDate(currentDate);
        if (dayShifts.length > 0) {
            const shiftsContainer = document.createElement('div');
            shiftsContainer.className = 'monthly-day-shifts';
            
            dayShifts.forEach(shift => {
                const shiftElement = document.createElement('div');
                const person = scheduleData.people.find(p => p.id === shift.personId);
                const personColor = person ? person.color : '#3b82f6';
                
                shiftElement.className = 'monthly-shift';
                shiftElement.style.backgroundColor = personColor;
                shiftElement.textContent = `${getPersonName(shift.personId)} - ${shiftConfigs[shift.shiftType].name}`;
                shiftElement.onclick = () => openEditShiftModal(shift.id);
                shiftsContainer.appendChild(shiftElement);
            });
            
            dayElement.appendChild(shiftsContainer);
        }
        
        grid.appendChild(dayElement);
    }
    
    calendar.appendChild(grid);
}

function renderPersonalMonthlySchedule() {
    const calendar = document.getElementById('personalMonthlyCalendar');
    if (!calendar) return;
    
    const selectedPerson = document.getElementById('personSelect')?.value || 'person1';
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + currentMonth, 1);
    const may2025 = new Date(2025, 4, 1); // Tháng 5/2025
    
    // Sử dụng tháng 5/2025 nếu tháng hiện tại trước tháng 5/2025
    const displayMonth = targetMonth < may2025 ? may2025 : targetMonth;
    const lastDay = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = displayMonth.getDay();
    
    // Clear calendar
    calendar.innerHTML = '';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'monthly-grid';
    
    // Add day headers
    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'schedule-header-cell';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'monthly-day other-month';
        grid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'monthly-day';
        
        // Check if it's today
        const currentDate = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'monthly-day-header';
        dayHeader.innerHTML = `
            <span class="monthly-day-number">${day}</span>
        `;
        dayElement.appendChild(dayHeader);
        
        // Get shifts for this day and person
        const dayShifts = getShiftsForDate(currentDate).filter(shift => shift.personId === selectedPerson);
        if (dayShifts.length > 0) {
            const shiftsContainer = document.createElement('div');
            shiftsContainer.className = 'monthly-day-shifts';
            
            dayShifts.forEach(shift => {
                const shiftElement = document.createElement('div');
                const person = scheduleData.people.find(p => p.id === shift.personId);
                const personColor = person ? person.color : '#3b82f6';
                
                shiftElement.className = 'monthly-shift';
                shiftElement.style.backgroundColor = personColor;
                shiftElement.textContent = shiftConfigs[shift.shiftType].name;
                shiftElement.onclick = () => openEditShiftModal(shift.id);
                shiftsContainer.appendChild(shiftElement);
            });
            
            dayElement.appendChild(shiftsContainer);
        }
        
        grid.appendChild(dayElement);
    }
    
    calendar.appendChild(grid);
}

function getShiftsForDate(date) {
    const dateStr = date.toISOString().slice(0, 10);
    return scheduleData.shifts.filter(shift => {
        const shiftDate = new Date(shift.createdAt);
        return shiftDate.toISOString().slice(0, 10) === dateStr;
    });
}

function openManagePeopleModal() {
    const modal = document.getElementById('managePeopleModal');
    if (!modal) return;
    
    renderPeopleManagement();
    modal.classList.add('show');
}
window.openManagePeopleModal = openManagePeopleModal;

function closeManagePeopleModal() {
    const modal = document.getElementById('managePeopleModal');
    if (modal) modal.classList.remove('show');
}
window.closeManagePeopleModal = closeManagePeopleModal;

function renderPeopleManagement() {
    const peopleList = document.getElementById('peopleList');
    if (!peopleList) return;
    
    peopleList.innerHTML = '';
    
    scheduleData.people.forEach(person => {
        const personItem = document.createElement('div');
        personItem.className = 'person-edit-item';
        personItem.innerHTML = `
            <input type="color" class="person-color-picker" value="${person.color}" 
                   onchange="updatePersonColor('${person.id}', this.value)">
            <input type="text" class="person-name-input" value="${person.name}" 
                   onchange="updatePersonName('${person.id}', this.value)">
        `;
        peopleList.appendChild(personItem);
    });
}

function updatePersonColor(personId, color) {
    const person = scheduleData.people.find(p => p.id === personId);
    if (person) {
        person.color = color;
        saveScheduleData();
        updatePeopleSelects();
    }
}

function updatePersonName(personId, name) {
    const person = scheduleData.people.find(p => p.id === personId);
    if (person) {
        person.name = name;
        saveScheduleData();
        updatePeopleSelects();
    }
}

function updatePeopleSelects() {
    // Update all select elements with people
    const selects = document.querySelectorAll('#shiftPerson, #personSelect');
    selects.forEach(select => {
        select.innerHTML = '';
        scheduleData.people.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = person.name;
            select.appendChild(option);
        });
    });
}

function savePeopleChanges() {
    saveScheduleData();
    closeManagePeopleModal();
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
    showNotification('Đã lưu thay đổi thông tin người!');
}
window.savePeopleChanges = savePeopleChanges;

function renderPeopleSummary() {
    const peopleGrid = document.getElementById('peopleGrid');
    if (!peopleGrid) return;
    
    peopleGrid.innerHTML = '';
    
    scheduleData.people.forEach(person => {
        const personCard = document.createElement('div');
        personCard.className = 'person-card';
        
        const personShifts = scheduleData.shifts.filter(shift => shift.personId === person.id);
        const totalShifts = personShifts.length;
        const totalSalary = totalShifts * SALARY_CONFIG.SHIFT_RATE;
        const totalMealAllowance = personShifts.length * SALARY_CONFIG.MEAL_ALLOWANCE;
        
        personCard.innerHTML = `
            <div class="person-card-header">
                <div class="person-avatar" style="background-color: ${person.color}">
                    ${person.name.charAt(0).toUpperCase()}
                </div>
                <h4 class="person-name">${person.name}</h4>
            </div>
            <div class="person-stats">
                <div class="person-stat">
                    <div class="person-stat-value">${totalShifts}</div>
                    <div class="person-stat-label">Ca làm</div>
                </div>
                <div class="person-stat">
                    <div class="person-stat-value">${formatCurrency(totalSalary)}</div>
                    <div class="person-stat-label">Lương ca</div>
                </div>
                <div class="person-stat">
                    <div class="person-stat-value">${formatCurrency(totalMealAllowance)}</div>
                    <div class="person-stat-label">Trợ cấp ăn</div>
                </div>
                <div class="person-stat">
                    <div class="person-stat-value">${formatCurrency(totalSalary + totalMealAllowance)}</div>
                    <div class="person-stat-label">Tổng cộng</div>
                </div>
            </div>
        `;
        
        peopleGrid.appendChild(personCard);
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// ===== EDIT SHIFT FUNCTIONS =====
let currentEditingShift = null;

function openEditShiftModal(shiftId) {
    const shift = scheduleData.shifts.find(s => s.id === shiftId);
    if (!shift) return;
    
    currentEditingShift = shift;
    const modal = document.getElementById('editShiftModal');
    if (!modal) return;
    
    // Fill form with shift data
    document.getElementById('editShiftPerson').value = shift.personId;
    document.getElementById('editShiftDay').value = shift.day;
    document.getElementById('editShiftType').value = shift.shiftType;
    document.getElementById('editShiftNote').value = shift.note || '';
    
    // Set meal allowance
    const mealAllowance = shift.mealAllowance || 'company';
    document.querySelector(`input[name="editMealAllowance"][value="${mealAllowance}"]`).checked = true;
    
    modal.classList.add('show');
}
window.openEditShiftModal = openEditShiftModal;

function closeEditShiftModal() {
    const modal = document.getElementById('editShiftModal');
    if (modal) modal.classList.remove('show');
    currentEditingShift = null;
}
window.closeEditShiftModal = closeEditShiftModal;

function saveShift() {
    if (!currentEditingShift) return;
    
    const personId = document.getElementById('editShiftPerson')?.value;
    const day = document.getElementById('editShiftDay')?.value;
    const shiftType = document.getElementById('editShiftType')?.value;
    const note = document.getElementById('editShiftNote')?.value;
    const mealAllowance = document.querySelector('input[name="editMealAllowance"]:checked')?.value;
    
    if (!personId || !day || !shiftType) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    // Check for conflicts (excluding current shift)
    const conflicts = checkShiftConflictsForEdit(personId, day, shiftType, currentEditingShift.id);
    if (conflicts.length > 0) {
        const personName = getPersonName(personId);
        const dayName = dayNames[days.indexOf(day)];
        showNotification(`${personName} đã có ca ${conflicts.join(', ')} vào ${dayName}. Một người không thể làm 2 ca trùng giờ!`, 'error');
        return;
    }
    
    // Update shift
    currentEditingShift.personId = personId;
    currentEditingShift.day = day;
    currentEditingShift.shiftType = shiftType;
    currentEditingShift.note = note.trim() || null;
    currentEditingShift.mealAllowance = mealAllowance || 'company';
    
    saveScheduleData();
    
    // Refresh all views
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
    
    closeEditShiftModal();
    showNotification('Đã cập nhật ca làm việc!');
}
window.saveShift = saveShift;

function deleteShift() {
    if (!currentEditingShift) return;
    
    if (confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
        const index = scheduleData.shifts.findIndex(s => s.id === currentEditingShift.id);
        if (index > -1) {
            scheduleData.shifts.splice(index, 1);
            saveScheduleData();
            
    // Refresh all views
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
    
    closeEditShiftModal();
    showNotification('Đã xóa ca làm việc!');
        }
    }
}
window.deleteShift = deleteShift;

function updateEditShiftTimes() {
    const shiftType = document.getElementById('editShiftType')?.value;
    if (!shiftType) return;
    
    const shiftConfig = shiftConfigs[shiftType];
    if (!shiftConfig) return;
    
    // Update the select options to show the correct times
    const select = document.getElementById('editShiftType');
    const options = select.querySelectorAll('option');
    
    options.forEach(option => {
        if (option.value === shiftType) {
            option.textContent = `${shiftConfig.name} (${shiftConfig.start}${shiftConfig.end ? '-' + shiftConfig.end : ''})`;
        }
    });
}
window.updateEditShiftTimes = updateEditShiftTimes;

// ===== CONFLICT DETECTION =====
// Only show error messages, no visual highlighting

function updateScheduleTab() {
    // This function is called when switching to schedule tab
    renderTeamSchedule();
    renderPersonalSchedule();
    renderTeamMonthlySchedule();
    renderPersonalMonthlySchedule();
    renderPeopleSummary();
    updateScheduleStats();
}
window.updateScheduleTab = updateScheduleTab;