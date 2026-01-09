export function extractErrorMessage(err: any, fallback: string = 'An error occurred'): string {
    const message = err?.data?.message

    if (!message) {
        return err?.message || fallback
    }

    if (typeof message === 'string') {
        return message
    }

    if (typeof message === 'object') {
        const errors = Object.values(message)
            .flat()
            .filter((val): val is string => typeof val === 'string')
        return errors.length > 0 ? errors.join(', ') : fallback
    }

    return fallback
}
