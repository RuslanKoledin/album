export const formatSpreadCount = (count: number) => {
  const remainder100 = count % 100
  const remainder10 = count % 10

  if (remainder100 >= 11 && remainder100 <= 14) return `${count} разворотов`
  if (remainder10 === 1) return `${count} разворот`
  if (remainder10 >= 2 && remainder10 <= 4) return `${count} разворота`
  return `${count} разворотов`
}
