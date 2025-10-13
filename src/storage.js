// storage.js

const STORAGE_KEYS = {
	tasks: 'todo:list:tasks',
	categories: 'todo:list:categories',
	tags: 'todo:list:tags',
}

const memoryStore = {}

const getLocalStorage = () => {
	if (typeof window === 'undefined') return null
	try {
		return window.localStorage
	} catch {
		return null
	}
}

const read = (key) => {
	const storage = getLocalStorage()
	if (storage) {
		return storage.getItem(key)
	}
	return Object.prototype.hasOwnProperty.call(memoryStore, key)
		? memoryStore[key]
		: null
}

const write = (key, value) => {
	const storage = getLocalStorage()
	if (storage) {
		try {
			storage.setItem(key, value)
			return
		} catch {
			// ignore quota errors
		}
	}
	memoryStore[key] = value
}

const safeParseArray = (raw) => {
	if (!raw) return []
	try {
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export const loadTasks = () => safeParseArray(read(STORAGE_KEYS.tasks))
export const saveTasks = (tasks) =>
	write(STORAGE_KEYS.tasks, JSON.stringify(tasks || []))

export const loadCategories = () =>
	safeParseArray(read(STORAGE_KEYS.categories))
export const saveCategories = (categories) =>
	write(STORAGE_KEYS.categories, JSON.stringify(categories || []))

export const loadTags = () => safeParseArray(read(STORAGE_KEYS.tags))
export const saveTags = (tags) =>
	write(STORAGE_KEYS.tags, JSON.stringify(tags || []))
