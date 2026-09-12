export const format = value => typeof value === 'number' ? value.toLocaleString('en-PH') : value
export const money = value => {
  const numValue = value ?? 0
  return `PHP ${numValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}
