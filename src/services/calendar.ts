import axios from 'axios';
import { Event as CalendarEvent } from '../types/calendarTypes';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * Calendar Service for interacting with Google Calendar API
 */
export const CalendarService = {
  /**
   * Get user's calendar events
   * @param timeMin - Start time for events
   * @param timeMax - End time for events
   * @returns Promise<CalendarEvent[]>
   */
  async getEvents(timeMin?: string, timeMax?: string): Promise<CalendarEvent[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
        params: { timeMin, timeMax },
        headers: await this.getAuthHeader()
      });
      return response.data.events;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  /**
   * Create a new calendar event
   * @param eventData - Event data
   * @returns Promise<CalendarEvent>
   */
  async createEvent(eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await axios.post(`${API_BASE_URL}/calendar/events`, eventData, {
        headers: await this.getAuthHeader()
      });
      return response.data.event;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  /**
   * Update an existing calendar event
   * @param eventId - Event ID
   * @param eventData - Updated event data
   * @returns Promise<CalendarEvent>
   */
  async updateEvent(eventId: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await axios.put(`${API_BASE_URL}/calendar/events/${eventId}`, eventData, {
        headers: await this.getAuthHeader()
      });
      return response.data.event;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  /**
   * Delete a calendar event
   * @param eventId - Event ID
   * @returns Promise<void>
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/calendar/events/${eventId}`, {
        headers: await this.getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  /**
   * Get available time slots for scheduling
   * @param date - Date to check availability
   * @param duration - Duration in minutes
   * @returns Promise<string[]>
   */
  async getAvailableSlots(date: string, duration: number = 30): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/available-slots`, {
        params: { date, duration },
        headers: await this.getAuthHeader()
      });
      return response.data.slots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw error;
    }
  },

  /**
   * Schedule an appointment
   * @param appointmentData - Appointment data
   * @returns Promise<CalendarEvent>
   */
  async scheduleAppointment(appointmentData: {
    clientEmail: string;
    clientName: string;
    dateTime: string;
    duration: number;
    description?: string;
  }): Promise<CalendarEvent> {
    try {
      const response = await axios.post(`${API_BASE_URL}/calendar/schedule`, appointmentData, {
        headers: await this.getAuthHeader()
      });
      return response.data.event;
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  },

  /**
   * Get calendar settings
   * @returns Promise<any>
   */
  async getSettings(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/settings`, {
        headers: await this.getAuthHeader()
      });
      return response.data.settings;
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
      throw error;
    }
  },

  /**
   * Update calendar settings
   * @param settings - Settings data
   * @returns Promise<any>
   */
  async updateSettings(settings: any): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/calendar/settings`, settings, {
        headers: await this.getAuthHeader()
      });
      return response.data.settings;
    } catch (error) {
      console.error('Error updating calendar settings:', error);
      throw error;
    }
  },

  /**
   * Get authentication header
   * @returns Promise<{ Authorization: string }>
   */
  async getAuthHeader(): Promise<{ Authorization: string }> {
    // Get token from localStorage or your auth context
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token available');
    }
    return { Authorization: `Bearer ${token}` };
  },
};

// Type definitions (calendarTypes.ts)
export interface Event {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  created?: string;
  updated?: string;
}