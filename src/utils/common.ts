import { LANGUAGE } from '@/config'

/**
 *
 * @param date
 * @param format
 * @returns
 * @Description y:Year M:Month d:Day h:Hour m:Minute s:Second q:Quarter S:Milliseconds
 */
export function formatTime(timestamp: any, format: string): string {
  if (LANGUAGE === 'en' && format) {
    const parts = format.split(' ')
    const datePart = parts[0]
    const dateParts = datePart.split('-')
    const year = dateParts[0]
    const month = dateParts[1]
    const day = dateParts[2]
    if (month && year) {
      format = `${month}-${day}-${year}`
      if (parts[1]) {
        format += ` ${parts[1]}`
      }
    }
  }
  if (!timestamp) return '--'
  if (timestamp.length === 10) {
    timestamp = timestamp + '000'
  }
  if (typeof timestamp == 'string') {
    timestamp = parseInt(timestamp)
  }
  const date = new Date(timestamp)

  const map: any = {
    M: date.getMonth() + 1, // Month
    d: date.getDate(), // Day
    h: date.getHours(), // Hour
    m: date.getMinutes(), // Minute
    s: date.getSeconds(), // Seconds
    q: Math.floor((date.getMonth() + 3) / 3), // Quarter
    S: date.getMilliseconds(), // Milliseconds
  }
  format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
    let v = map[t]
    if (v !== undefined) {
      if (all.length > 1) {
        v = '0' + v
        v = v.substr(v.length - 2)
      }
      return v
    } else if (t === 'y') {
      return (date.getFullYear() + '').substr(4 - all.length)
    }
    return all
  })
  return format
}

/**
 *
 * @param hour
 * @returns
 */
export const convertTime = (hour: number) => {
  const date = new Date()
  date.setHours(hour)
  date.setMinutes(0)
  return formatTime(date.getTime(), 'hh:mm')
}
