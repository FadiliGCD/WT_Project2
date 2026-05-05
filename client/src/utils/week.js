export function startOfWeekMonday(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay()
  const diff = (day + 6) % 7
  date.setUTCDate(date.getUTCDate() - diff)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

export function toInputDateString(d) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
