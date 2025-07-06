export interface Event {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  location?: string;
  status?: string;
  htmlLink?: string;
}

export interface CalendarConfig {
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
} 