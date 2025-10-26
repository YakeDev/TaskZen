export const MS_IN_DAY = 24 * 60 * 60 * 1000

export const getPastDaysDiff = (value, referenceDate = new Date()) => {
	if (!value) return 0
	const selected = new Date(value)
	if (Number.isNaN(selected.getTime())) return 0
	const today = new Date(referenceDate)
	selected.setHours(0, 0, 0, 0)
	today.setHours(0, 0, 0, 0)
	if (selected >= today) return 0
	return Math.round((today.getTime() - selected.getTime()) / MS_IN_DAY)
}

