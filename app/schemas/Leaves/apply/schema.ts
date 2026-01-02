import { z } from 'zod'
import { CalendarDate } from '@internationalized/date'

export const leaveSchema = z.object({
    leave_type: z.string().min(1, 'Please select leave type'),
    from_date: z.any().refine((val) => val instanceof CalendarDate, "Start date is required"),
    to_date: z.any().refine((val) => val instanceof CalendarDate, "End date is required"),
    reason: z.string().min(5, 'Reason is too short'),
    is_first_half: z.boolean().optional(),
    is_second_half: z.boolean().optional(),
    doc_link: z.string().optional(),
}).refine((data) => {
    return data.to_date.compare(data.from_date) >= 0
}, {
    message: "End date cannot be before start date",
    path: ["to_date"],
})