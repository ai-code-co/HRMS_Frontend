import { format, parseISO, isValid } from 'date-fns'

export const capitalize = (str: string | undefined | null): string => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function formatTimeFromISO(timeStr: string | undefined | null): string {
    if (!timeStr) return '--:--'
    const date = parseISO(timeStr)
    return isValid(date) ? format(date, 'hh:mm a') : '--:--'
}

export function formatDateFromISO(dateStr: string | Date | undefined | null): string {
    if (!dateStr) return '--'
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return isValid(date) ? format(date, 'dd MMM yyyy') : '--'
}

export function formatTime24ToAmPm(time24: string | undefined | null): string {
    if (!time24) return ''
    const [hours, minutes] = time24.split(':').map(Number)
    const ampm = (hours ?? 0) >= 12 ? 'PM' : 'AM'
    const displayHours = (hours ?? 0) % 12 || 12
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`
}

export function calculateTotalHours(clockIn: string, clockOut: string): string {
    if (!clockIn || !clockOut) return '0'

    const [inHours, inMinutes] = clockIn.split(':').map(Number)
    const [outHours, outMinutes] = clockOut.split(':').map(Number)

    const inTotalMinutes = (inHours ?? 0) * 60 + (inMinutes ?? 0)
    const outTotalMinutes = (outHours ?? 0) * 60 + (outMinutes ?? 0)

    const diffMinutes = outTotalMinutes - inTotalMinutes
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    const totalHours = hours + (minutes / 60)
    return totalHours.toFixed(1)
}

export function getStatusMeta(
    submission: any,
    baseLabel: string,
    baseClass: string
) {
    if (!submission) return null

    const status = submission.status?.toLowerCase() ?? ''

    const map: Record<string, { text: string; labelClass: string }> = {
        pending: {
            text: `${baseLabel} Pending`,
            labelClass: 'text-amber-700'
        },
        approved: {
            text: `${baseLabel} Approved`,
            labelClass: 'text-emerald-700'
        },
        rejected: {
            text: `${baseLabel} Rejected`,
            labelClass: 'text-rose-700'
        }
    }

    return map[status] ?? {
        text: baseLabel,
        labelClass: baseClass
    }
}

