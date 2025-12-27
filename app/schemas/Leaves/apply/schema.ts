import { z } from 'zod'

export const leaveSchema = z.object({
    leave_type: z.string().min(1, 'Please select leave type'),
    from_date: z.date({ required_error: "Start date is required" }),
    to_date: z.date({ required_error: "End date is required" }),
    reason: z.string().min(5, 'Reason is too short'),
    is_first_half: z.boolean().optional(),
    is_second_half: z.boolean().optional(),
}).refine((data) => data.to_date >= data.from_date, {
    message: "End date cannot be before start date",
    path: ["to_date"],
})

export type LeaveForm = z.infer<typeof leaveSchema>