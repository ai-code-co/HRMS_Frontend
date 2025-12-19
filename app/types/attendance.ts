export type AttendanceStatus =
    | 'working'
    | 'off'
    | 'holiday'
    | 'weekend'

export type ViewType = 'month' | 'week'

export interface AttendanceDay {
    day: number;
    date: string;
    dateStr: string;
    inTime?: string;
    outTime?: string;
    totalHours: number;
    totalFormatted?: string;
    status: AttendanceStatus;
    isLate: boolean;
    isCurrent?: boolean;
    isOutsideMonth?: boolean;
}
