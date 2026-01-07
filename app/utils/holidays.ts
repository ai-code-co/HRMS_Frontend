export function getIconForHoliday(name: string): string {
    const n = name.toLowerCase()
    if (n.includes('year')) return 'i-lucide-music'
    if (n.includes('republic') || n.includes('independence')) return 'i-lucide-sparkles'
    if (n.includes('christmas')) return 'i-lucide-calendar'
    if (n.includes('gandhi') || n.includes('foundation')) return 'i-lucide-heart'
    return 'i-lucide-map-pin'
}

export function formatDayName(dateStr: string): string {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(dateStr))
}

export function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr)
    const month = d.toLocaleString('default', { month: 'short' })
    const day = d.getDate().toString().padStart(2, '0')
    return `${month} ${day}`
}
