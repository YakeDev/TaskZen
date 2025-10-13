// taskManager.js
import { v4 as uuidv4 } from 'uuid'
import {
	isToday,
	isTomorrow,
	isThisWeek,
	isThisMonth,
	parseISO,
	isValid as isValidDate,
} from 'date-fns'

function toDateOrNull(value) {
	if (!value) return null
	if (value instanceof Date) return isValidDate(value) ? value : null
	try {
		const d = parseISO(value)
		return isValidDate(d) ? d : null
	} catch {
		return null
	}
}

const TaskManager = (() => {
	const tasks = []
	const categories = ['Par defaut', 'Étude', 'Travail', 'Santé', 'Personnel']

	// ✅ Codes internes + labels FR pour l'affichage
	const STATUS = {
		PENDING: 'pending',
		IN_PROGRESS: 'in-progress',
		COMPLETED: 'completed',
		BLOCKED: 'blocked',
	}

	const STATUS_LABELS = {
		pending: 'A faire',
		'in-progress': 'En cours',
		completed: 'Terminée',
		blocked: 'Bloquée',
	}

	function addTask(
		title,
		description = '',
		category = categories[0],
		dueDate = null,
		status = STATUS.PENDING
	) {
		const due = toDateOrNull(dueDate)
		const newTask = {
			id: uuidv4(),
			title,
			description,
			category,
			dueDate: due,
			status,
			createdAt: new Date(),
		}
		tasks.push(newTask)
		return { ...newTask }
	}

	function deleteTask(id) {
		const index = tasks.findIndex((task) => task.id === id)
		if (index !== -1) {
			tasks.splice(index, 1)
			return true
		}
		return false
	}

	function toggleComplete(id) {
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		task.status =
			task.status === STATUS.COMPLETED ? STATUS.PENDING : STATUS.COMPLETED
		return { ...task }
	}

	function updateStatus(id, newStatus) {
		const valid = Object.values(STATUS)
		if (!valid.includes(newStatus)) {
			console.warn(`Statut invalide : ${newStatus}`)
			return null
		}
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		task.status = newStatus
		return { ...task }
	}

	function updateTask(id, patch = {}) {
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		if (patch.title !== undefined) task.title = patch.title
		if (patch.description !== undefined) task.description = patch.description
		if (patch.category !== undefined) task.category = patch.category
		if (patch.dueDate !== undefined) task.dueDate = toDateOrNull(patch.dueDate)
		if (patch.status !== undefined) task.status = patch.status // <-- pris en charge
		return { ...task }
	}

	function getTasks() {
		return tasks.map((t) => ({ ...t }))
	}

	function getCategories() {
		return [...categories]
	}

	function getTasksByCategory(categoryName) {
		return tasks
			.filter(
				(task) =>
					(task.category || '').toLowerCase() ===
					(categoryName || '').toLowerCase()
			)
			.map((t) => ({ ...t }))
	}

	function getTasksByStatus(status) {
		return tasks.filter((task) => task.status === status).map((t) => ({ ...t }))
	}

	function filterTasksByPeriod(period) {
		return tasks
			.filter((task) => {
				if (!task.dueDate) return false
				const due =
					task.dueDate instanceof Date
						? task.dueDate
						: toDateOrNull(task.dueDate)
				if (!due) return false
				if (period === 'today') return isToday(due)
				if (period === 'tomorrow') return isTomorrow(due)
				if (period === 'week') return isThisWeek(due)
				if (period === 'month') return isThisMonth(due)
				return true
			})
			.map((t) => ({ ...t }))
	}

	function getStats() {
		const all = getTasks()
		const stats = {
			total: all.length,
			completed: 0,
			pending: 0,
			inProgress: 0,
			blocked: 0,
			byCategory: {},
		}

		all.forEach((task) => {
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
			stats.byCategory[task.category] =
				(stats.byCategory[task.category] || 0) + 1
		})

		return stats
	}

	return {
		addTask,
		deleteTask,
		toggleComplete,
		updateTask,
		updateStatus,
		getTasks,
		getCategories,
		getTasksByCategory,
		getTasksByStatus,
		filterTasksByPeriod,
		getStats,
		STATUS,
		STATUS_LABELS,
	}
})()

export default TaskManager
