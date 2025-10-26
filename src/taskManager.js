// taskManager.js
import { v4 as uuidv4 } from 'uuid'
import {
	isToday,
	isTomorrow,
	isThisWeek,
	isThisMonth,
	parseISO,
	isAfter,
	isBefore,
	endOfToday,
	startOfToday,
	isValid as isValidDate,
} from 'date-fns'
import {
	loadTasks,
	saveTasks,
	loadCategories,
	saveCategories,
	loadTags,
	saveTags,
} from './storage.js'

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
	const DEFAULT_CATEGORIES = ['Par defaut', 'Étude', 'Travail', 'Santé', 'Personnel']
	const DEFAULT_TAGS = ['Important', 'Urgent']

	const categories = [...DEFAULT_CATEGORIES]
	const customTags = new Set(DEFAULT_TAGS)
	const tasks = []

	// ✅ Codes internes + labels FR pour l'affichage
	const STATUS = {
		PENDING: 'pending',
		IN_PROGRESS: 'in-progress',
		COMPLETED: 'completed',
		OVERDUE: 'overdue',
	}

	const STATUS_LABELS = {
		pending: 'A faire',
		'in-progress': 'En cours',
		completed: 'Terminée',
		overdue: 'En retard',
	}

	const cloneTask = (task) => ({
		...task,
		tags: [...(task.tags || [])],
	})

	const normalizeTag = (value) => {
		if (typeof value !== 'string') return ''
		return value.trim()
	}

const normalizeTagList = (list) => {
	if (!Array.isArray(list)) return []
	const unique = new Set()
	list.forEach((tag) => {
		const normalized = normalizeTag(tag)
		if (normalized) unique.add(normalized)
	})
	return [...unique]
}

	function updateOverdueStatuses(options = {}) {
		const { persist = true } = options
		const today = startOfToday()
		let changed = false
		tasks.forEach((task) => {
			const due = toDateOrNull(task.dueDate)
			if (!due) {
				if (task.status === STATUS.OVERDUE) {
					task.status = STATUS.PENDING
					changed = true
				}
				return
			}
			if (task.status === STATUS.COMPLETED) return
			if (isBefore(due, today)) {
				if (task.status !== STATUS.OVERDUE) {
					task.status = STATUS.OVERDUE
					changed = true
				}
			} else if (task.status === STATUS.OVERDUE) {
				task.status = STATUS.PENDING
				changed = true
			}
		})
		if (changed && persist) persistTasks()
		return changed
	}

	function getIsoDate(value) {
		if (!value) return ''
		try {
			const date = value instanceof Date ? value : new Date(value)
			if (Number.isNaN(date.getTime())) return ''
			return date.toISOString()
		} catch {
			return ''
		}
	}

	function isDefaultCategory(name) {
		return DEFAULT_CATEGORIES.some(
			(defaultCat) => defaultCat.toLowerCase() === name.toLowerCase()
		)
	}

	function isDefaultTag(tag) {
		return DEFAULT_TAGS.some(
			(defaultTag) => defaultTag.toLowerCase() === tag.toLowerCase()
		)
	}

	function persistCategories() {
		const customOnly = categories.filter((cat) => !isDefaultCategory(cat))
		saveCategories(customOnly)
	}

	function persistTags() {
		const customOnly = [...customTags].filter((tag) => !isDefaultTag(tag))
		saveTags(customOnly)
	}

	function serializeTask(task) {
		return {
			id: task.id,
			title: task.title,
			description: task.description,
			category: task.category,
			dueDate: task.dueDate ? getIsoDate(task.dueDate) : null,
			status: task.status,
			createdAt: getIsoDate(task.createdAt) || new Date().toISOString(),
			tags: [...(task.tags || [])],
		}
	}

	function persistTasks() {
		saveTasks(tasks.map(serializeTask))
	}

	function ensureCategory(name, options = {}) {
		const { persist = false } = options
		const normalized = typeof name === 'string' ? name.trim() : ''
		if (!normalized) return categories[0]
		const existing = categories.find(
			(cat) => cat.toLowerCase() === normalized.toLowerCase()
		)
		if (existing) return existing
		categories.push(normalized)
		if (persist) persistCategories()
		return normalized
	}

	function addTagToSet(tag, options = {}) {
		const { persist = false } = options
		const normalized = normalizeTag(tag)
		if (!normalized) return null
		const sizeBefore = customTags.size
		customTags.add(normalized)
		if (persist && customTags.size !== sizeBefore) {
			persistTags()
		}
		return normalized
	}

	function hydrateTask(rawTask = {}) {
		const title = typeof rawTask.title === 'string' ? rawTask.title : ''
		const description =
			typeof rawTask.description === 'string' ? rawTask.description : ''
		const rawStatus =
			typeof rawTask.status === 'string' ? rawTask.status.trim() : ''
		let status = STATUS.PENDING
		if (rawStatus.toLowerCase() === 'blocked') {
			status = STATUS.OVERDUE
		} else if (Object.values(STATUS).includes(rawStatus)) {
			status = rawStatus
		}
		const category = ensureCategory(rawTask.category || categories[0])
		const dueDate = toDateOrNull(rawTask.dueDate)
		const createdAt = toDateOrNull(rawTask.createdAt) ?? new Date()
		const tags = normalizeTagList(rawTask.tags)
		tags.forEach((tag) => addTagToSet(tag))
		return {
			id: rawTask.id || uuidv4(),
			title,
			description,
			category,
			dueDate,
			status,
			createdAt,
			tags,
		}
	}

	// Hydratation depuis le stockage local
loadCategories().forEach((category) => ensureCategory(category))
loadTags().forEach((tag) => addTagToSet(tag))
loadTasks().forEach((task) => tasks.push(hydrateTask(task)))
updateOverdueStatuses({ persist: true })

	function registerTag(tag) {
		return addTagToSet(tag, { persist: true })
	}

	function addTask(
		title,
		description = '',
		category = categories[0],
		dueDate = null,
		status = STATUS.PENDING
	) {
		const due = toDateOrNull(dueDate)
		const resolvedCategory = ensureCategory(category, { persist: true })
		const newTask = {
			id: uuidv4(),
			title,
			description,
			category: resolvedCategory,
			dueDate: due,
			status,
			createdAt: new Date(),
			tags: [],
		}
		tasks.push(newTask)
		updateOverdueStatuses({ persist: false })
		persistTasks()
		return cloneTask(newTask)
	}

	function deleteTask(id) {
		const index = tasks.findIndex((task) => task.id === id)
		if (index !== -1) {
			tasks.splice(index, 1)
			persistTasks()
			return true
		}
		return false
	}

	function toggleComplete(id) {
	const task = tasks.find((t) => t.id === id)
	if (!task) return null
	task.status =
		task.status === STATUS.COMPLETED ? STATUS.PENDING : STATUS.COMPLETED
	updateOverdueStatuses({ persist: false })
	persistTasks()
	return cloneTask(task)
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
	updateOverdueStatuses({ persist: false })
	persistTasks()
	return cloneTask(task)
}

	function updateTask(id, patch = {}) {
		const task = tasks.find((t) => t.id === id)
		if (!task) return null
		if (patch.title !== undefined) task.title = patch.title
		if (patch.description !== undefined) task.description = patch.description
		if (patch.category !== undefined) {
			task.category = ensureCategory(patch.category, { persist: true })
		}
		if (patch.dueDate !== undefined) task.dueDate = toDateOrNull(patch.dueDate)
		if (patch.status !== undefined) task.status = patch.status // <-- pris en charge
		updateOverdueStatuses({ persist: false })
		persistTasks()
		return cloneTask(task)
	}

	function getTasks() {
		updateOverdueStatuses()
		return tasks.map(cloneTask)
	}

	function getCategories() {
		return [...categories]
	}

	function addCategory(name) {
		ensureCategory(name, { persist: true })
		return getCategories()
	}

	function renameCategory(oldName, newName) {
		const from = typeof oldName === 'string' ? oldName.trim() : ''
		const to = typeof newName === 'string' ? newName.trim() : ''
		if (!from || !to) return false
		const index = categories.findIndex(
			(cat) => cat.toLowerCase() === from.toLowerCase()
		)
		if (index === -1) return false
		const duplicate = categories.find(
			(cat, idx) => idx !== index && cat.toLowerCase() === to.toLowerCase()
		)
		if (duplicate) return false
		categories[index] = to
		tasks.forEach((task) => {
			if ((task.category || '').toLowerCase() === from.toLowerCase()) {
				task.category = to
			}
		})
		persistCategories()
		persistTasks()
		return true
	}

	function deleteCategory(name) {
		const target = typeof name === 'string' ? name.trim() : ''
		if (!target || isDefaultCategory(target)) return false
		const index = categories.findIndex(
			(cat) => cat.toLowerCase() === target.toLowerCase()
		)
		if (index === -1) return false
		categories.splice(index, 1)
		if (!categories.length) {
			categories.push(DEFAULT_CATEGORIES[0])
		}
		const fallback = categories[0]
		tasks.forEach((task) => {
			if ((task.category || '').toLowerCase() === target.toLowerCase()) {
				task.category = fallback
			}
		})
		persistCategories()
		persistTasks()
		return true
	}

	function getTasksByCategory(categoryName) {
		updateOverdueStatuses()
		return tasks
			.filter(
				(task) =>
					(task.category || '').toLowerCase() ===
					(categoryName || '').toLowerCase()
			)
			.map(cloneTask)
	}

	function getTasksByStatus(status) {
		updateOverdueStatuses()
		return tasks.filter((task) => task.status === status).map(cloneTask)
	}

	function filterTasksByPeriod(period) {
		updateOverdueStatuses()
		return tasks
			.filter((task) => {
				if (!task.dueDate) return false
				const due =
					task.dueDate instanceof Date ? task.dueDate : toDateOrNull(task.dueDate)
				if (!due) return false
				if (period === 'today') return isToday(due)
				if (period === 'tomorrow') return isTomorrow(due)
				if (period === 'week') return isThisWeek(due)
				if (period === 'month') return isThisMonth(due)
				if (period === 'upcoming') return isAfter(due, endOfToday())
				return true
			})
			.map(cloneTask)
	}

	function getStats() {
		const all = getTasks()
	const stats = {
		total: all.length,
		completed: 0,
		pending: 0,
		inProgress: 0,
		overdue: 0,
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
			case STATUS.OVERDUE:
				stats.overdue++
				break
			default:
				stats.pending++
				break
		}
			stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1
		})

		return stats
	}

	function getTags() {
		const tagsSet = new Set(customTags)
		tasks.forEach((task) => {
			;(task.tags || []).forEach((tag) => {
				const normalized = normalizeTag(tag)
				if (normalized) tagsSet.add(normalized)
			})
		})
		return [...tagsSet].sort((a, b) => a.localeCompare(b))
	}

	function hasTasks() {
		return tasks.length > 0
	}

	function replaceAllTasks(serializedTasks = []) {
		tasks.length = 0
		const normalizedDefaults = DEFAULT_CATEGORIES.map((cat) => cat.toLowerCase())
		const seen = new Set()
		categories.length = 0
		DEFAULT_CATEGORIES.forEach((cat) => {
			categories.push(cat)
			seen.add(cat.toLowerCase())
		})
		serializedTasks.forEach((task) => {
			const hydrated = hydrateTask(task)
			tasks.push(hydrated)
			const categoryName = hydrated.category
			if (categoryName && !seen.has(categoryName.toLowerCase())) {
				categories.push(categoryName)
				seen.add(categoryName.toLowerCase())
			}
		})
		persistCategories()
		persistTasks()
		updateOverdueStatuses({ persist: true })
	}

	function resetAll() {
		tasks.length = 0
		categories.length = 0
		DEFAULT_CATEGORIES.forEach((cat) => categories.push(cat))
		customTags.clear()
		DEFAULT_TAGS.forEach((tag) => customTags.add(tag))
		saveCategories([])
		saveTags([])
		saveTasks([])
	}

	return {
		addTask,
		deleteTask,
		toggleComplete,
		updateTask,
		updateStatus,
		getTasks,
		getCategories,
		addCategory,
		renameCategory,
		deleteCategory,
		getTasksByCategory,
		getTasksByStatus,
		filterTasksByPeriod,
		getStats,
		getTags,
		registerTag,
		hasTasks,
		replaceAllTasks,
		resetAll,
		isDefaultCategory,
		STATUS,
		STATUS_LABELS,
	}
})()

export default TaskManager
