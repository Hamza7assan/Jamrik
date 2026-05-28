"use client";
import React, { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import arLocale from '@fullcalendar/core/locales/ar';
import enLocale from '@fullcalendar/core/locales/en-gb'; // Or just use default for English
import { LanguageContext } from './LanguageContext';
import "./ShipmentCalendar.css";

const ShipmentCalendar = () => {
  const { language, t } = useContext(LanguageContext);
  const [events, setEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    start: '',
    end: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem("jamrik_calendar");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("jamrik_calendar", JSON.stringify(events));
  }, [events]);

  // NEW: When clicking a blank day (Create)
  const handleDateClick = (arg: any) => {
    setSelectedEventId(null); // Ensure we aren't in edit mode
    setNewNote({ title: '', description: '', start: arg.dateStr, end: arg.dateStr });
    setIsModalOpen(true);
  };

  // NEW: When clicking an existing note (View/Delete)
  const handleEventClick = (clickInfo: any) => {
    setSelectedEventId(clickInfo.event.id);
    setNewNote({
      title: clickInfo.event.title,
      description: clickInfo.event.extendedProps.description || '',
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr || clickInfo.event.startStr
    });
    setIsModalOpen(true);
  };

  const handleSaveNote = () => {
    if (newNote.title) {
      const eventToAdd = {
        id: Math.random().toString(36).substr(2, 9), // Give it a unique ID
        title: newNote.title,
        start: newNote.start,
        end: newNote.end,
        description: newNote.description,
        color: "#2B4B8A"
      };
      setEvents([...events, eventToAdd]);
      setIsModalOpen(false);
    }
  };

  const handleUpdateNote = () => {
    if (selectedEventId && newNote.title) {
      setEvents(events.map(event => 
        event.id === selectedEventId 
          ? { ...event, title: newNote.title, description: newNote.description, start: newNote.start, end: newNote.end }
          : event
      ));
      setIsModalOpen(false);
    }
  };

  const handleDeleteNote = () => {
    if (selectedEventId) {
      setEvents(events.filter(event => event.id !== selectedEventId));
      setIsModalOpen(false);
    }
  };

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventColor="#609DEB"
        dateClick={handleDateClick}
        eventClick={handleEventClick} // Hook up the click listener
        locale={language === 'ar' ? arLocale : undefined}
      />

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedEventId ? t("Manage Note") : t("Add New Note")}</h3>
            
            <label>{t("Title")}</label>
            <input type="text" value={newNote.title}
              onChange={(e) => setNewNote({...newNote, title: e.target.value})} />

            <label>{t("Description")}</label>
            <textarea value={newNote.description}
              onChange={(e) => setNewNote({...newNote, description: e.target.value})} />

            <div className="date-row">
              <div><label>{t("From")}</label><input type="date" value={newNote.start} onChange={(e) => setNewNote({...newNote, start: e.target.value})} /></div>
              <div><label>{t("To")}</label><input type="date" value={newNote.end} onChange={(e) => setNewNote({...newNote, end: e.target.value})} /></div>
            </div>

            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>{t("Close")}</button>
              
              {/* Show DELETE and UPDATE if editing, show SAVE if creating */}
              {selectedEventId ? (
                <>
                  <button className="btn-delete" onClick={handleDeleteNote} style={{marginRight: "8px"}}>{t("Remove Note")}</button>
                  <button className="btn-save" onClick={handleUpdateNote}>{t("Update Note")}</button>
                </>
              ) : (
                <button className="btn-save" onClick={handleSaveNote}>{t("Save Note")}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentCalendar;