// Kitchen HQ — Google Calendar
const Calendar = {
  currentMonth: null, // Date object set to 1st of displayed month
  events: [],         // Cached events for current range
  calendarColors: {}, // Calendar ID → color mapping
  syncInterval: null,
  selectedDay: null,
  editingEvent: null,

  init() {
    this.monthView = document.getElementById('calendar-month');
    this.dayView = document.getElementById('calendar-day');
    this.monthTitle = document.getElementById('month-title');
    this.monthGrid = document.getElementById('month-grid');
    this.prevBtn = document.getElementById('month-prev');
    this.nextBtn = document.getElementById('month-next');
    this.dayTitle = document.getElementById('day-title');
    this.dayEvents = document.getElementById('day-events');
    this.dayBackBtn = document.getElementById('day-back');
    this.addEventBtn = document.getElementById('add-event-btn');
    this.eventModal = document.getElementById('event-modal');
    this.eventModalTitle = document.getElementById('event-modal-title');
    this.eventTitleInput = document.getElementById('event-title-input');
    this.eventDateInput = document.getElementById('event-date-input');
    this.eventStartInput = document.getElementById('event-start-input');
    this.eventEndInput = document.getElementById('event-end-input');
    this.eventCalendarInput = document.getElementById('event-calendar-input');
    this.eventDeleteBtn = document.getElementById('event-delete-btn');
    this.eventCancelBtn = document.getElementById('event-cancel-btn');
    this.eventSaveBtn = document.getElementById('event-save-btn');
    this.weekView = document.getElementById('calendar-week');
    this.weekTitle = document.getElementById('week-title');
    this.weekDayHeaders = document.getElementById('week-day-headers');
    this.weekGrid = document.getElementById('week-grid');
    this.weekViewBtn = document.getElementById('week-view-btn');
    this.weekBackBtn = document.getElementById('week-back');
    this.weekPrevBtn = document.getElementById('week-prev');
    this.weekNextBtn = document.getElementById('week-next');
    this.currentWeekStart = null;

    // Set to current month
    const now = new Date();
    this.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Load cached events
    this.loadCachedEvents();

    // Render
    this.renderMonth();

    // Event listeners
    this.prevBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextBtn.addEventListener('click', () => this.changeMonth(1));
    this.dayBackBtn.addEventListener('click', () => this.showMonthView());
    this.addEventBtn.addEventListener('click', () => this.openNewEvent());
    this.eventCancelBtn.addEventListener('click', () => this.closeModal());
    this.eventSaveBtn.addEventListener('click', () => this.saveEvent());
    this.eventDeleteBtn.addEventListener('click', () => this.deleteEvent());
    this.weekViewBtn.addEventListener('click', () => this.showWeekView());
    this.weekBackBtn.addEventListener('click', () => this.showMonthView());
    this.weekPrevBtn.addEventListener('click', () => this.changeWeek(-1));
    this.weekNextBtn.addEventListener('click', () => this.changeWeek(1));

    // Start sync if authenticated
    this.startSync();
  },

  // --- Month Rendering ---
  renderMonth() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    this.monthTitle.textContent = `${monthNames[month]} ${year}`;

    // First day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    this.monthGrid.innerHTML = '';

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const cell = this.createDayCell(day, true, false);
      this.monthGrid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const date = new Date(year, month, day);
      const cell = this.createDayCell(day, false, isToday);
      this.addEventDots(cell, date);
      cell.addEventListener('click', () => this.showDayView(date));
      this.monthGrid.appendChild(cell);
    }

    // Next month leading days (fill to complete 6 rows)
    const totalCells = this.monthGrid.children.length;
    const remaining = (Math.ceil(totalCells / 7) * 7) - totalCells;
    for (let day = 1; day <= remaining; day++) {
      const cell = this.createDayCell(day, true, false);
      this.monthGrid.appendChild(cell);
    }
  },

  createDayCell(day, isOtherMonth, isToday) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isOtherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');
    cell.innerHTML = `<span class="day-number">${day}</span><div class="day-dots"></div>`;
    return cell;
  },

  addEventDots(cell, date) {
    const dateStr = this.toDateString(date);
    const dayEvents = this.events.filter(e => {
      const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
      return eventDate === dateStr;
    });

    if (dayEvents.length === 0) return;

    const dotsContainer = cell.querySelector('.day-dots');
    // Show up to 4 dots
    const uniqueColors = [...new Set(dayEvents.map(e => this.getEventColor(e)))];
    uniqueColors.slice(0, 4).forEach(color => {
      const dot = document.createElement('div');
      dot.className = 'event-dot';
      dot.style.backgroundColor = color;
      dotsContainer.appendChild(dot);
    });
  },

  getEventColor(event) {
    // Use calendar-specific color or default to accent
    const calId = event.organizer?.email || 'default';
    return this.calendarColors[calId] || '#e94560';
  },

  changeMonth(delta) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
    this.renderMonth();
    this.fetchEvents();
  },

  // --- Day View ---
  showDayView(date) {
    this.selectedDay = date;
    this.monthView.hidden = true;
    this.dayView.hidden = false;

    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    this.dayTitle.textContent = date.toLocaleDateString('en-US', options);

    this.renderDayEvents(date);
  },

  showMonthView() {
    this.dayView.hidden = true;
    this.weekView.hidden = true;
    this.monthView.hidden = false;
  },

  renderDayEvents(date) {
    const dateStr = this.toDateString(date);
    const dayEvents = this.events
      .filter(e => {
        const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
        return eventDate === dateStr;
      })
      .sort((a, b) => {
        const aTime = a.start.dateTime || a.start.date;
        const bTime = b.start.dateTime || b.start.date;
        return aTime.localeCompare(bTime);
      });

    if (dayEvents.length === 0) {
      this.dayEvents.innerHTML = '<p class="no-events">No events this day</p>';
      return;
    }

    this.dayEvents.innerHTML = dayEvents.map(event => {
      const color = this.getEventColor(event);
      const time = event.start.dateTime
        ? `${this.formatTime(event.start.dateTime)} – ${this.formatTime(event.end.dateTime)}`
        : 'All day';
      return `
        <div class="event-card" data-event-id="${event.id}" style="border-left-color: ${color}">
          <div class="event-card-title">${event.summary || '(No title)'}</div>
          <div class="event-card-time">${time}</div>
        </div>
      `;
    }).join('');

    // Bind click to edit
    this.dayEvents.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        const event = dayEvents.find(e => e.id === card.dataset.eventId);
        if (event) this.openEditEvent(event);
      });
    });
  },

  // --- Event CRUD ---
  openNewEvent() {
    this.editingEvent = null;
    this.eventModalTitle.textContent = 'New Event';
    this.eventTitleInput.value = '';
    this.eventDateInput.value = this.toDateString(this.selectedDay || new Date());
    this.eventStartInput.value = '09:00';
    this.eventEndInput.value = '10:00';
    this.eventDeleteBtn.hidden = true;
    this.eventModal.hidden = false;
    this.loadCalendarList();
  },

  openEditEvent(event) {
    this.editingEvent = event;
    this.eventModalTitle.textContent = 'Edit Event';
    this.eventTitleInput.value = event.summary || '';
    this.eventDateInput.value = event.start.dateTime ? event.start.dateTime.slice(0, 10) : event.start.date;
    this.eventStartInput.value = event.start.dateTime ? event.start.dateTime.slice(11, 16) : '';
    this.eventEndInput.value = event.end.dateTime ? event.end.dateTime.slice(11, 16) : '';
    this.eventDeleteBtn.hidden = false;
    this.eventModal.hidden = false;
    this.loadCalendarList();
  },

  closeModal() {
    this.eventModal.hidden = true;
    this.editingEvent = null;
  },

  async loadCalendarList() {
    try {
      const data = await GoogleAuth.fetchJSON('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      this.eventCalendarInput.innerHTML = data.items
        .filter(c => c.accessRole === 'owner' || c.accessRole === 'writer')
        .map(c => {
          this.calendarColors[c.id] = c.backgroundColor;
          return `<option value="${c.id}">${c.summary}</option>`;
        }).join('');

      // Pre-select the editing event's calendar
      if (this.editingEvent) {
        this.eventCalendarInput.value = this.editingEvent.organizer?.email || '';
      }
    } catch (err) {
      console.error('Failed to load calendar list:', err);
    }
  },

  async saveEvent() {
    const calendarId = this.eventCalendarInput.value || 'primary';
    const date = this.eventDateInput.value;
    const body = {
      summary: this.eventTitleInput.value,
      start: {
        dateTime: `${date}T${this.eventStartInput.value}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: `${date}T${this.eventEndInput.value}:00`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    try {
      if (this.editingEvent) {
        await GoogleAuth.putJSON(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${this.editingEvent.id}`,
          body
        );
      } else {
        await GoogleAuth.postJSON(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
          body
        );
      }
      this.closeModal();
      await this.fetchEvents();
      if (this.selectedDay) this.renderDayEvents(this.selectedDay);
      this.renderMonth();
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  },

  async deleteEvent() {
    if (!this.editingEvent) return;
    const calendarId = this.editingEvent.organizer?.email || 'primary';
    try {
      await GoogleAuth.deleteRequest(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${this.editingEvent.id}`
      );
      this.closeModal();
      await this.fetchEvents();
      if (this.selectedDay) this.renderDayEvents(this.selectedDay);
      this.renderMonth();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  },

  // --- Data Sync ---
  async fetchEvents() {
    if (!GoogleAuth.isAuthenticated()) return;

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    // Fetch 6 weeks around the displayed month
    const timeMin = new Date(year, month - 1, 1).toISOString();
    const timeMax = new Date(year, month + 2, 0).toISOString();

    try {
      // Get calendar list for colors
      const calList = await GoogleAuth.fetchJSON('https://www.googleapis.com/calendar/v3/users/me/calendarList');
      calList.items.forEach(c => {
        this.calendarColors[c.id] = c.backgroundColor;
      });

      // Fetch events from primary calendar and all visible calendars
      const allEvents = [];
      for (const cal of calList.items) {
        try {
          const data = await GoogleAuth.fetchJSON(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250`
          );
          if (data.items) {
            data.items.forEach(e => {
              e._calendarId = cal.id;
              e._calendarColor = cal.backgroundColor;
            });
            allEvents.push(...data.items);
          }
        } catch (e) {
          // Skip calendars we can't read
        }
      }

      this.events = allEvents;
      this.cacheEvents();
      this.renderMonth();
      if (this.selectedDay && !this.dayView.hidden) {
        this.renderDayEvents(this.selectedDay);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  },

  startSync() {
    // Initial fetch
    if (GoogleAuth.isAuthenticated()) {
      this.fetchEvents();
    }
    // Periodic sync every 5 minutes
    this.syncInterval = setInterval(() => {
      if (GoogleAuth.isAuthenticated()) {
        this.fetchEvents();
      }
    }, 5 * 60 * 1000);
  },

  cacheEvents() {
    try {
      localStorage.setItem('khq-calendar-events', JSON.stringify(this.events));
    } catch (e) {
      // localStorage might be full — ignore
    }
  },

  loadCachedEvents() {
    try {
      const cached = localStorage.getItem('khq-calendar-events');
      if (cached) this.events = JSON.parse(cached);
    } catch (e) {
      this.events = [];
    }
  },

  // --- Helpers ---
  toDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  formatTime(isoString) {
    const date = new Date(isoString);
    let hours = date.getHours();
    const mins = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mins} ${ampm}`;
  },

  // --- Week View ---
  showWeekView(startDate) {
    // Default to current week
    if (!startDate) {
      const today = new Date();
      const day = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day); // Start on Sunday
    }
    this.currentWeekStart = startDate;
    this.monthView.hidden = true;
    this.dayView.hidden = true;
    this.weekView.hidden = false;
    this.renderWeek();
  },

  changeWeek(delta) {
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(newStart.getDate() + (delta * 7));
    this.currentWeekStart = newStart;
    this.renderWeek();
  },

  renderWeek() {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    this.weekTitle.textContent = `${startMonth} – ${endMonth}`;

    const today = new Date();
    const todayStr = this.toDateString(today);

    // Day headers
    this.weekDayHeaders.innerHTML = '<div></div>'; // Empty cell for time column
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const isToday = this.toDateString(date) === todayStr;
      this.weekDayHeaders.innerHTML += `
        <div class="week-day-header ${isToday ? 'today' : ''}">${dayNames[i]}<br>${date.getDate()}</div>
      `;
    }

    // Grid: time labels + cells
    this.weekGrid.innerHTML = '';
    for (let hour = 0; hour < 24; hour++) {
      // Time label
      const label = document.createElement('div');
      label.className = 'week-time-label';
      label.style.gridRow = `${hour + 1}`;
      label.style.gridColumn = '1';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      label.textContent = `${displayHour} ${ampm}`;
      this.weekGrid.appendChild(label);

      // Day cells
      for (let day = 0; day < 7; day++) {
        const cell = document.createElement('div');
        cell.className = 'week-cell';
        cell.style.gridRow = `${hour + 1}`;
        cell.style.gridColumn = `${day + 2}`;
        const cellDate = new Date(start);
        cellDate.setDate(cellDate.getDate() + day);
        cell.addEventListener('click', () => {
          this.selectedDay = cellDate;
          this.eventStartInput.value = `${String(hour).padStart(2, '0')}:00`;
          this.eventEndInput.value = `${String(hour + 1).padStart(2, '0')}:00`;
          this.openNewEvent();
        });
        this.weekGrid.appendChild(cell);
      }
    }

    // Overlay events
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(date.getDate() + day);
      const dateStr = this.toDateString(date);
      const dayEvents = this.events.filter(e => {
        const eventDate = e.start.dateTime ? e.start.dateTime.slice(0, 10) : e.start.date;
        return eventDate === dateStr;
      });

      for (const event of dayEvents) {
        if (!event.start.dateTime) continue; // Skip all-day events in grid
        const startHour = parseInt(event.start.dateTime.slice(11, 13));
        const startMin = parseInt(event.start.dateTime.slice(14, 16));
        const endHour = parseInt(event.end.dateTime.slice(11, 13));
        const endMin = parseInt(event.end.dateTime.slice(14, 16));

        const topOffset = (startMin / 60) * 48;
        const duration = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 48;

        const el = document.createElement('div');
        el.className = 'week-event';
        el.style.gridColumn = `${day + 2}`;
        el.style.gridRow = `${startHour + 1}`;
        el.style.top = `${topOffset}px`;
        el.style.height = `${Math.max(duration, 20)}px`;
        el.style.backgroundColor = this.getEventColor(event);
        el.textContent = event.summary || '(No title)';
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditEvent(event);
        });
        this.weekGrid.appendChild(el);
      }
    }

    // Scroll to 8 AM by default
    this.weekGrid.scrollTop = 8 * 48;
  }
};
