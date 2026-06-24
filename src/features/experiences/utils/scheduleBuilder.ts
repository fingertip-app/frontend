export type TimeSlotInput = {
  startTime: string
  endTime: string
}

export type SchedulePayload = {
  scheduledAt: string
  availableSlots: number
}

const DAY_TO_WEEKDAY: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
}

export function parseTimeLabel(label: string): { hour: number; minute: number } | null {
  const value = label.trim()
  const twelveHourMatch = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value)
  if (twelveHourMatch) {
    const rawHour = Number(twelveHourMatch[1])
    const minute = Number(twelveHourMatch[2])
    if (rawHour < 1 || rawHour > 12 || minute > 59) return null

    let hour = rawHour % 12
    if (/pm/i.test(twelveHourMatch[3])) hour += 12
    return { hour, minute }
  }

  const twentyFourHourMatch = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!twentyFourHourMatch) return null

  const hour = Number(twentyFourHourMatch[1])
  const minute = Number(twentyFourHourMatch[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return date
}

export function formatLocalDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toLocalDateTimeString(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${formatLocalDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
}

export function buildRecurringSchedules(
  startDateValue: string,
  endDateValue: string,
  selectedDays: string[],
  timeSlots: TimeSlotInput[],
  availableSlots: number,
): SchedulePayload[] {
  const startDate = parseLocalDate(startDateValue)
  const endDate = parseLocalDate(endDateValue)
  if (!startDate || !endDate || endDate < startDate || availableSlots <= 0) return []

  const weekdays = new Set(
    selectedDays
      .map((day) => DAY_TO_WEEKDAY[day])
      .filter((day): day is number => day !== undefined),
  )
  const times = timeSlots
    .map((slot) => parseTimeLabel(slot.startTime))
    .filter((time): time is { hour: number; minute: number } => time !== null)

  if (weekdays.size === 0 || times.length === 0) return []

  const schedules: SchedulePayload[] = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    if (weekdays.has(cursor.getDay())) {
      for (const time of times) {
        const scheduledAt = new Date(cursor)
        scheduledAt.setHours(time.hour, time.minute, 0, 0)
        schedules.push({
          scheduledAt: toLocalDateTimeString(scheduledAt),
          availableSlots,
        })
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return schedules.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
}

export function computeDurationMinutes(timeSlots: TimeSlotInput[]): number {
  for (const slot of timeSlots) {
    const start = parseTimeLabel(slot.startTime)
    const end = parseTimeLabel(slot.endTime)
    if (!start || !end) continue

    const minutes = end.hour * 60 + end.minute - (start.hour * 60 + start.minute)
    if (minutes > 0) return minutes
  }
  return 90
}
