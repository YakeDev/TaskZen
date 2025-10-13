//stats.js

export function getStats(tasks) {
	const stats = {
		total: tasks.length,
		completed: 0,
		pending: 0,
		inProgress: 0,
		blocked: 0,
		byCategory: {},
	}

	tasks.forEach((task) => {
		switch (task.status) {
			case STATUS.COMPLETED:
				stats.completed++
				break
			case STATUS.IN_PROGRESS:
				stats.inProgress++
				break
			case STATUS.BLOCKED:
				stats.blocked++
				break
			default:
				stats.pending++
				break
		}
		stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1
	})

	return stats
}
