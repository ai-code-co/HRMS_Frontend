import { z } from 'zod'
import type { AnyCalendarDate } from '@internationalized/date'
import { CalendarDate } from '@internationalized/date'

export const leaveSchema = z.object({
    leave_type: z.string().min(1, 'Please select leave type'),
    from_date: z.custom<AnyCalendarDate>((val) => val instanceof CalendarDate, {
        message: "Start date is required",
    }),

    to_date: z.custom<AnyCalendarDate>((val) => val instanceof CalendarDate, {
        message: "End date is required",
    }),
    reason: z.string().min(5, 'Reason is too short'),
    is_first_half: z.boolean().optional(),
    is_second_half: z.boolean().optional(),
}).refine((data) => data.to_date >= data.from_date, {
    message: "End date cannot be before start date",
    path: ["to_date"],
})

export type LeaveForm = z.infer<typeof leaveSchema>