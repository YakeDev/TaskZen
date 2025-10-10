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

/**
 * Small helper: normalize any incoming date-like value to a Date or null.
 * Accepts Date | string (ISO) | null/undefined.
 */
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
	const categories = ['Par defaut', 'Étude', 'Travail', 'Santé']

	const STATUS = {
		PENDING: 'A faire',
		IN_PROGRESS: 'En cours',
		COMPLETED: 'Terminée',
		BLOCKED: 'Bloquée',
	}

	/**
	 * Add new task
	 * @param {string} title
	 * @param {string} [description]
	 * @param {string} [category]
	 * @param {Date|string|null} [dueDate]
	 * @returns {object} the created task
	 */
	function addTask(
		title,
		description = '',
		category = categories[0],
		dueDate = null
	) {
		const due = toDateOrNull(dueDate)
		const newTask = {
			id: uuidv4(),
			title,
			description,
			category,
			dueDate: due,
			status: STATUS.PENDING,
			createdAt: new Date(),
		}
		tasks.push(newTask)
		console.log(`Tâche ajoutée : ${newTask.title} (${newTask.category})`)
		return { ...newTask }
	}

	/**
	 * Supprimer une tâche
	 * @param {string} id
	 * @returns {boolean} true si supprimée
	 */
	function deleteTask(id) {
		const index = tasks.findIndex((task) => task.id === id)
		if (index !== -1) {
			tasks.splice(index, 1)
			return true
		}
		return false
	}

	/**
	 * Marquer comme terminée / revenir à "A faire"
	 * (toggle utile pour UI simples)
	 * @param {string} id
	 * @returns {object|null} tâche mise à jour ou null si introuvable
	 */
	function toggleComplete(id) {
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		task.status =
			task.status === STATUS.COMPLETED ? STATUS.PENDING : STATUS.COMPLETED
		return { ...task }
	}

	/**
	 * Mettre à jour le statut d'une tâche
	 * @param {string} id
	 * @param {string} newStatus one of STATUS values
	 * @returns {object|null} tâche mise à jour ou null si introuvable
	 */
	function updateStatus(id, newStatus) {
		const validStatuses = Object.values(STATUS)
		if (!validStatuses.includes(newStatus)) {
			console.warn(`Statut invalide : ${newStatus}`)
			return null
		}
		const task = tasks.find((t) => t.id === id)
		if (task) {
			task.status = newStatus
			console.log(`Tâche "${task.title}" est maintenant : ${newStatus}`)
			return { ...task }
		} else {
			console.log(`Tâche avec id ${id} non trouvée`)
			return null
		}
	}

	/**
	 * Mettre à jour les champs d'une tâche (titre, description, catégorie, dueDate)
	 * @param {string} id
	 * @param {{title?: string, description?: string, category?: string, dueDate?: Date|string|null}} patch
	 * @returns {object|null}
	 */
	function updateTask(id, patch = {}) {
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		if (patch.title !== undefined) task.title = patch.title
		if (patch.description !== undefined) task.description = patch.description
		if (patch.category !== undefined) task.category = patch.category
		if (patch.dueDate !== undefined) task.dueDate = toDateOrNull(patch.dueDate)
		return { ...task }
	}

	// Afficher toutes les tâches (copie défensive)
	function getTasks() {
		return tasks.map((t) => ({ ...t }))
	}

	// Lire les catégories disponibles
	function getCategories() {
		return [...categories]
	}

	// Trier les tâches par catégorie
	function getTasksByCategory(categoryName) {
		return tasks
			.filter(
				(task) =>
					(task.category || '').toLowerCase() ===
					(categoryName || '').toLowerCase()
			)
			.map((t) => ({ ...t }))
	}

	// Filtrer les tâches par statut
	function getTasksByStatus(status) {
		return tasks.filter((task) => task.status === status).map((t) => ({ ...t }))
	}

	/**
	 * Filtrer par today, tomorrow, week, month
	 * @param {'today'|'tomorrow'|'week'|'month'} period
	 */
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
		STATUS,
	}
})()

export default TaskManager
