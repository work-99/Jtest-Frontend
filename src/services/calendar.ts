import axios from 'axios';
import { Event } from '../types/calendarTypes';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Calendar Service for interacting with Google Calendar API
 */
export const CalendarService = {
  /**
   * Fetch events from Google Calendar
   * @param params { timeMin?: string; timeMax?: string; maxResults?: number }
   * @returns Promise<Event[]>
   */
  async getEvents(params: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
  }): Promise<Event[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/events`, {
        params: {
          timeMin: params.timeMin || new Date().toISOString(),
          timeMax: params.timeMax,
          maxResults: params.maxResults || 50,
        },
        headers: await CalendarService.getAuthHeader(),
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  },

  /**
   * Create a new calendar event
   * @param eventData Partial<Event>
   * @returns Promise<Event>
   */
  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/calendar/events`,
        eventData,
        {
          headers: await CalendarService.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw new Error('Failed to create calendar event');
    }
  },

  /**
   * Update an existing calendar event
   * @param eventId string
   * @param eventData Partial<Event>
   * @returns Promise<Event>
   */
  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/calendar/events/${eventId}`,
        eventData,
        {
          headers: await CalendarService.getAuthHeader(),
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw new Error('Failed to update calendar event');
    }
  },

  /**
   * Delete a calendar event
   * @param eventId string
   * @returns Promise<void>
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/calendar/events/${eventId}`, {
        headers: await CalendarService.getAuthHeader(),
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw new Error('Failed to delete calendar event');
    }
  },

  /**
   * Get available time slots
   * @param params { timeMin: string; timeMax: string; duration: number }
   * @returns Promise<{ start: string; end: string }[]>
   */
  async getAvailableSlots(params: {
    timeMin: string;
    timeMax: string;
    duration: number; // in minutes
  }): Promise<{ start: string; end: string }[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/calendar/availability`, {
        params: {
          timeMin: params.timeMin,
          timeMax: params.timeMax,
          duration: params.duration,
        },
        headers: await CalendarService.getAuthHeader(),
      });
      return response.data.availableSlots;
    } catch (error) {
      console.error('Error fetching available slots:', error);
      throw new Error('Failed to fetch available time slots');
    }
  },

  /**
   * Schedule a meeting with a client
   * @param clientEmail string
   * @param slot { start: string; end: string }
   * @param summary string
   * @param description string
   * @returns Promise<Event>
   */
  async scheduleMeeting(
    clientEmail: string,
    slot: { start: string; end: string },
    summary: string,
    description: string = ''
  ): Promise<Event> {
    try {
      const eventData = {
        summary,
        description,
        start: {
          dateTime: slot.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: slot.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: [{ email: clientEmail }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      return await CalendarService.createEvent(eventData);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      throw new Error('Failed to schedule meeting');
    }
  },

  /**
   * Get authorization header with token
   * @returns Promise<{ Authorization: string }>
   */
  private async getAuthHeader(): Promise<{ Authorization: string }> {
    const { user } = useAuth(); // Your auth hook
    if (!user?.accessToken) {
      throw new Error('No access token available');
    }
    return { Authorization: `Bearer ${user.accessToken}` };
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