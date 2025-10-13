// ui.js
import TaskManager from './taskManager.js'
import {
	Calendar,
	CheckCircle2,
	CircleDot,
	ClipboardList,
	FolderClosed,
	ListTodo,
	OctagonAlert,
	Pencil,
	Timer,
	Trash2,
} from 'lucide'

const form = document.getElementById('taskForm')
const titleInput = document.getElementById('title')
const descInput = document.getElementById('description')
const categorySelect = document.getElementById('category')
const statusSelect = document.getElementById('status')
const dateInput = document.getElementById('dueDate')
const submitBtn = document.getElementById('submit-btn')
const taskTitle = document.getElementById('task-title')

const taskList = document.getElementById('taskList')
const statsContainer = document.getElementById('stats')

const sidebarTaskFilters = document.getElementById('sidebarTaskFilters')
const categoryListEl = document.getElementById('categoryList')
const addCategoryBtn = document.getElementById('addCategoryBtn')
const tagListEl = document.getElementById('tagList')
const sidebarTagForm = document.getElementById('sidebarTagForm')
const sidebarTagInput = document.getElementById('sidebarTagInput')
const menuToggleBtn = document.getElementById('menuToggleBtn')
const appRoot = document.getElementById('app')

const sidebar = document.getElementById('sidebar')
const sidebarContent = document.getElementById('sidebarContent')
const taskSection = document.getElementById('taskSection')
const formAside = document.getElementById('formAside')
const tasksViewTitle = document.getElementById('tasksViewTitle')

const selectedTagsContainer = document.getElementById('selectedTags')
const tagInput = document.getElementById('tagInput')
const addTagBtn = document.getElementById('addTagBtn')
const tagOptionsEl = document.getElementById('tagOptions')

const STATUS_BADGES = {
	pending: 'bg-gray-100 text-gray-700',
	'in-progress': 'bg-blue-100 text-blue-700',
	overdue: 'bg-red-100 text-red-700',
	completed: 'bg-emerald-100 text-emerald-700',
}

const CATEGORY_STYLES = [
	'bg-red-100 text-red-700',
	'bg-blue-100 text-blue-700',
	'bg-yellow-100 text-yellow-700',
	'bg-green-100 text-green-700',
	'bg-purple-100 text-purple-700',
	'bg-sky-100 text-sky-700',
]

const ENTITY_MAP = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
}

const FILTER_TYPES = {
	ALL: 'all',
	PERIOD: 'period',
	STATUS: 'status',
}

const state = {
	filter: { type: FILTER_TYPES.ALL, value: null },
}

let editingTaskId = null
let currentTags = []
let isSidebarCollapsed = false

const renderIcon = (icon, options = {}) => {
	if (!icon) return ''
	const {
		size = 20,
		strokeWidth = 1.75,
		className = '',
	} = options
	const baseAttrs = [
		`xmlns="http://www.w3.org/2000/svg"`,
		`width="${size}"`,
		`height="${size}"`,
		`viewBox="0 0 24 24"`,
		`fill="none"`,
		`stroke="currentColor"`,
		`stroke-width="${strokeWidth}"`,
		`stroke-linecap="round"`,
		`stroke-linejoin="round"`,
		`aria-hidden="true"`,
		`focusable="false"`,
	]
	if (className) {
		baseAttrs.push(`class="${className}"`)
	}

	const children = icon
		.map(([tag, attrs]) => {
			const attribs = Object.entries(attrs)
				.map(([key, value]) => `${key}="${value}"`)
				.join(' ')
			return `<${tag} ${attribs} />`
		})
		.join('')

	return `<svg ${baseAttrs.join(' ')}>${children}</svg>`
}

const getCategoryStyle = (category) => {
	const categories = TaskManager.getCategories()
	const index = categories.findIndex(
		(item) => item.toLowerCase() === category.toLowerCase()
	)
	const baseIndex = index !== -1 ? index : categories.length
	return CATEGORY_STYLES[baseIndex % CATEGORY_STYLES.length]
}

const escapeHtml = (value) =>
	String(value ?? '')
		.split('')
		.map((char) => ENTITY_MAP[char] ?? char)
		.join('')

const normalizeTag = (value) => {
	if (typeof value !== 'string') return ''
	return value.trim()
}

const dedupeTags = (tags = []) => {
	const unique = new Set()
	tags.forEach((tag) => {
		const normalized = normalizeTag(tag)
		if (normalized) unique.add(normalized)
	})
	return [...unique]
}

const setSidebarCollapsed = (collapsed) => {
	isSidebarCollapsed = collapsed
	if (sidebar) {
		sidebar.dataset.collapsed = collapsed ? 'true' : 'false'
	}
	if (sidebarContent) {
		sidebarContent.classList.toggle('hidden', collapsed)
	}
	if (appRoot) {
		appRoot.dataset.sidebarCollapsed = collapsed ? 'true' : 'false'
	}
	if (menuToggleBtn) {
		menuToggleBtn.setAttribute('aria-expanded', String(!collapsed))
		menuToggleBtn.setAttribute(
			'aria-label',
			collapsed ? 'Afficher le menu' : 'Masquer le menu'
		)
	}
}

const isCompleted = (task) => task.status === TaskManager.STATUS.COMPLETED
const excludeCompletedTasks = (tasks = []) =>
	tasks.filter((task) => !isCompleted(task))

const formatDate = (value) => {
	if (!value) return 'Aucune'
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime())
		? 'Aucune'
		: date.toLocaleDateString('fr-FR', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
		  })
}

const setCurrentTags = (tags) => {
	currentTags = dedupeTags(tags)
	renderSelectedTags()
}

const renderSelectedTags = () => {
	if (!selectedTagsContainer) return
	selectedTagsContainer.innerHTML = ''

	if (!currentTags.length) {
		const placeholder = document.createElement('span')
		placeholder.className = 'text-xs text-gray-400'
		placeholder.textContent = 'Aucun tag sélectionné'
		selectedTagsContainer.appendChild(placeholder)
		return
	}

	currentTags.forEach((tag) => {
		const capsule = document.createElement('span')
		capsule.className =
			'inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700'

		const text = document.createElement('span')
		text.textContent = tag

		const removeBtn = document.createElement('button')
		removeBtn.type = 'button'
		removeBtn.dataset.removeTag = tag
		removeBtn.className =
			'rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 hover:bg-white hover:text-amber-700'
		removeBtn.textContent = '×'

		capsule.append(text, removeBtn)
		selectedTagsContainer.appendChild(capsule)
	})
}

const renderTagOptions = () => {
	if (!tagOptionsEl) return
	tagOptionsEl.innerHTML = ''
	const tags = TaskManager.getTags()
	const fragment = document.createDocumentFragment()
	tags.forEach((tag) => {
		const option = document.createElement('option')
		option.value = tag
		fragment.appendChild(option)
	})
	tagOptionsEl.appendChild(fragment)
}

const renderCategoryOptions = (preferredValue) => {
	if (!categorySelect) return
	const categories = TaskManager.getCategories()
	const currentValue =
		preferredValue && categories.includes(preferredValue)
			? preferredValue
			: categorySelect.value
	const fragment = document.createDocumentFragment()

	categories.forEach((category) => {
		const option = document.createElement('option')
		option.value = category
		option.textContent = category
		fragment.appendChild(option)
	})

	categorySelect.innerHTML = ''
	categorySelect.appendChild(fragment)
	categorySelect.value = categories.includes(currentValue)
		? currentValue
		: categories[0]
}

function updateFilterIndicators() {
	if (!sidebarTaskFilters) return
	sidebarTaskFilters
		.querySelectorAll('[data-view], [data-period], [data-status]')
		.forEach((item) => {
			const view = item.dataset.view
			const period = item.dataset.period
			const status = item.dataset.status
			let isActive = false
			if (view === 'dashboard') {
				isActive = state.filter.type === FILTER_TYPES.ALL
			} else if (period) {
				isActive =
					state.filter.type === FILTER_TYPES.PERIOD &&
					state.filter.value === period
			} else if (status) {
				isActive =
					state.filter.type === FILTER_TYPES.STATUS &&
					state.filter.value === status
			}
			item.classList.toggle('bg-amber-100', isActive)
			item.classList.toggle('text-amber-700', isActive)
			item.classList.toggle('font-semibold', isActive)
			if (isActive) {
				item.setAttribute('aria-current', 'page')
			} else {
				item.removeAttribute('aria-current')
			}
		})
}

const renderSidebar = () => {
	const stats = TaskManager.getStats()

	const todayActiveTasks = excludeCompletedTasks(
		TaskManager.filterTasksByPeriod('today')
	)
	const upcomingActiveTasks = excludeCompletedTasks(
		TaskManager.filterTasksByPeriod('upcoming')
	)
	const completedTasksCount = TaskManager.getTasksByStatus(
		TaskManager.STATUS.COMPLETED
	).length
	const overdueTasksCount = TaskManager.getTasksByStatus(
		TaskManager.STATUS.OVERDUE
	).length
	const dashboardTasksCount = excludeCompletedTasks(TaskManager.getTasks()).length

	if (sidebarTaskFilters) {
		const counts = {
			dashboard: dashboardTasksCount,
			upcoming: upcomingActiveTasks.length,
			today: todayActiveTasks.length,
			overdue: overdueTasksCount,
			completed: completedTasksCount,
		}
		sidebarTaskFilters
			.querySelectorAll('[data-count]')
			.forEach((badge) => {
				const key = badge.dataset.count
				if (counts[key] !== undefined) {
					badge.textContent = counts[key]
				}
			})
	}

	if (categoryListEl) {
		categoryListEl.innerHTML = ''
		const categories = TaskManager.getCategories()
		if (!categories.length) {
			const empty = document.createElement('li')
			empty.className = 'text-xs text-gray-400'
			empty.textContent = 'Aucune catégorie'
			categoryListEl.appendChild(empty)
		} else {
			categories.forEach((category) => {
				const li = document.createElement('li')
				li.className = `flex items-center justify-between rounded px-3 py-2 text-xs font-medium ${getCategoryStyle(
					category
				)}`

				const name = document.createElement('span')
				name.textContent = category

				const count = document.createElement('span')
				count.className =
					'rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-gray-700'
				count.textContent = stats.byCategory[category] ?? 0

				li.append(name, count)
				categoryListEl.appendChild(li)
			})
		}
	}

	if (tagListEl) {
		tagListEl.innerHTML = ''
		const tags = TaskManager.getTags()
		if (!tags.length) {
			const empty = document.createElement('p')
			empty.className = 'text-xs text-gray-400'
			empty.textContent = 'Aucun tag pour le moment'
			tagListEl.appendChild(empty)
		} else {
			tags.forEach((tag) => {
				const button = document.createElement('button')
				button.type = 'button'
				button.dataset.tag = tag
				button.className =
					'rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 transition hover:bg-amber-100 hover:text-amber-700'
				button.textContent = tag
				tagListEl.appendChild(button)
			})
		}
	}

	renderTagOptions()
	renderCategoryOptions(categorySelect?.value)
	updateFilterIndicators()
}

const renderStats = () => {
	if (!statsContainer) return
	if (state.filter.type !== FILTER_TYPES.ALL) {
		statsContainer.innerHTML = ''
		statsContainer.classList.add('hidden')
		return
	}
	statsContainer.classList.remove('hidden')
	const stats = TaskManager.getStats()
	const completionRate = stats.total
		? Math.round((stats.completed / stats.total) * 100)
		: 0

	const summaryCards = [
		{
			key: 'total',
			label: 'Total',
			icon: ClipboardList,
			classes: 'bg-amber-50 text-amber-600',
		},
		{
			key: 'pending',
			label: 'À faire',
			icon: ListTodo,
			classes: 'bg-sky-50 text-sky-600',
		},
		{
			key: 'inProgress',
			label: 'En cours',
			icon: Timer,
			classes: 'bg-indigo-50 text-indigo-600',
		},
	{
		key: 'overdue',
		label: 'En retard',
		icon: OctagonAlert,
		classes: 'bg-rose-50 text-rose-600',
	},
		{
			key: 'completed',
			label: 'Terminées',
			icon: CheckCircle2,
			classes: 'bg-emerald-50 text-emerald-600',
		},
	]

	const renderSummaryCard = ({ key, label, icon, classes }) => `
			<div class="rounded-xl bg-white p-4 shadow-sm">
				<div class="flex items-center gap-3">
					<span class="flex h-10 w-10 items-center justify-center rounded-full ${classes}">
						${renderIcon(icon, { size: 20 })}
					</span>
					<div>
						<p class="text-xs font-medium uppercase tracking-wide text-gray-400">
							${label}
						</p>
						<p class="text-2xl font-semibold text-gray-800">
							${stats[key] ?? 0}
						</p>
					</div>
				</div>
			</div>
		`

	const topRowMarkup = summaryCards
		.slice(0, 3)
		.map((card) => renderSummaryCard(card))
		.join('')
	const bottomRowMarkup = summaryCards
		.slice(3)
		.map((card) => renderSummaryCard(card))
		.join('')

	const cardsMarkup = `
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			${topRowMarkup}
		</div>
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
			${bottomRowMarkup}
		</div>
	`

	const categoryMarkup = Object.entries(stats.byCategory).length
		? Object.entries(stats.byCategory)
				.map(
					([category, count]) => `
				<div class="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
					<span class="text-sm font-medium text-gray-700">${escapeHtml(category)}</span>
					<span class="text-sm font-semibold text-gray-900">${count}</span>
				</div>
			`
				)
				.join('')
		: '<p class="text-sm text-gray-400">Aucune tâche enregistrée.</p>'

	statsContainer.innerHTML = `
			<section class="space-y-6">
			<div class="space-y-4">
				${cardsMarkup}
			</div>
			<div class="rounded-xl border border-dashed border-gray-200 bg-white p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-semibold text-gray-700">
							Taux d'accomplissement
						</p>
						<p class="text-xs text-gray-500">
							${completionRate}% des tâches sont terminées
						</p>
					</div>
					<span class="text-lg font-bold text-emerald-500">${completionRate}%</span>
				</div>
				<div class="mt-3 h-2 rounded-full bg-gray-100">
					<div
						class="h-full rounded-full bg-emerald-400 transition-all"
						style="width: ${completionRate}%"
					></div>
				</div>
			</div>
			<div>
				<h4 class="mb-3 text-sm font-semibold text-gray-600">
					Répartition par catégorie
				</h4>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					${categoryMarkup}
				</div>
			</div>
		</section>
	`
}

const updateViewTitle = () => {
	if (!tasksViewTitle) return
	let title = 'Mes tâches'
	const { type, value } = state.filter
	if (type === FILTER_TYPES.PERIOD) {
		if (value === 'today') title = 'Tâches du jour'
		else if (value === 'upcoming') title = 'Tâches à venir'
	} else if (type === FILTER_TYPES.STATUS) {
		if (value === TaskManager.STATUS.COMPLETED) title = 'Tâches terminées'
		else if (value === TaskManager.STATUS.OVERDUE) title = 'Tâches en retard'
	}
	tasksViewTitle.textContent = title
}

const createTaskMarkup = (task) => {
	const statusLabel = TaskManager.STATUS_LABELS[task.status] ?? task.status
	const statusClass = STATUS_BADGES[task.status] ?? STATUS_BADGES.pending
	const dueDate = formatDate(task.dueDate)
	const description = task.description
		? `<p class="mt-2 line-clamp-2 text-sm text-gray-600">${escapeHtml(
				task.description
		  )}</p>`
		: '<p class="mt-2 text-sm italic text-gray-400">(Aucune description)</p>'

	const tags =
		task.tags && task.tags.length
			? `<div class="mt-4 flex flex-wrap gap-2">
					${task.tags
						.map(
							(tag) => `
							<span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
								${escapeHtml(tag)}
							</span>`
						)
						.join('')}
				</div>`
			: ''

	return `
		<article class="group rounded-xl border border-gray-200 bg-white p-4 mb-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div class="flex items-start justify-between gap-4">
				<div class="flex items-start gap-3">
					<input
						type="checkbox"
						class="check-completed mt-1 size-4 cursor-pointer accent-amber-400"
						data-id="${task.id}"
						${task.status === TaskManager.STATUS.COMPLETED ? 'checked' : ''}
					/>
					<div>
						<h3 class="text-lg font-semibold ${
							task.status === TaskManager.STATUS.COMPLETED
								? 'text-gray-400 line-through'
								: 'text-gray-800'
						}">
							${escapeHtml(task.title)}
						</h3>
						${description}
					</div>
				</div>
					<div class="flex gap-1">
						<button
							type="button"
							data-id="${task.id}"
							class="edit-btn rounded-md p-2 text-sm text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
							aria-label="Éditer la tâche"
						>
							${renderIcon(Pencil, { size: 18, className: 'shrink-0' })}
						</button>
						<button
							type="button"
							data-id="${task.id}"
							class="delete-btn rounded-md p-2 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
							aria-label="Supprimer la tâche"
						>
							${renderIcon(Trash2, { size: 18, className: 'shrink-0' })}
						</button>
					</div>
				</div>
				<div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
					<span class="inline-flex items-center gap-1">
						${renderIcon(Calendar, { size: 16 })}
						<span>${dueDate}</span>
					</span>
					<span class="inline-flex items-center gap-2">
						<span class="inline-flex items-center gap-1 rounded-full px-2 py-1 ${statusClass}">
							${renderIcon(CircleDot, { size: 12 })}
							<span class="font-medium">${statusLabel}</span>
						</span>
					</span>
					<span class="inline-flex items-center gap-1">
						${renderIcon(FolderClosed, { size: 16 })}
						<span>${escapeHtml(task.category)}</span>
					</span>
				</div>
			${tags}
		</article>
	`
}

const getVisibleTasks = () => {
	const { type, value } = state.filter
	if (type === FILTER_TYPES.STATUS && value) {
		return TaskManager.getTasksByStatus(value)
	}

	if (type === FILTER_TYPES.PERIOD && value) {
		const tasks = TaskManager.filterTasksByPeriod(value)
		return excludeCompletedTasks(tasks)
	}

	return excludeCompletedTasks(TaskManager.getTasks())
}

const renderTasks = () => {
	if (!taskList) return
	const tasks = getVisibleTasks().sort((a, b) => {
		const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
		const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
		if (aDate !== bDate) return aDate - bDate
		const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
		const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
		return aCreated - bCreated
	})

	taskList.innerHTML = ''

	if (!tasks.length) {
		const li = document.createElement('li')
		li.className =
			'rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500'
		li.innerHTML =
			'Aucune tâche pour le moment. Ajoutez-en une pour commencer !'
		taskList.appendChild(li)
	} else {
		tasks.forEach((task) => {
			const li = document.createElement('li')
			li.className = 'task cursor-pointer'
			li.dataset.id = task.id
			li.innerHTML = createTaskMarkup(task)
			taskList.appendChild(li)
		})
	}

	renderStats()
	renderSidebar()
	updateViewTitle()
}

function setFilter(type, value) {
	const same = state.filter.type === type && state.filter.value === value
	state.filter = same
		? { type: FILTER_TYPES.ALL, value: null }
		: { type, value }
	renderTasks()
}

const resetFormState = () => {
	if (!form) return
	form.reset()
	setCurrentTags([])
	editingTaskId = null
	if (submitBtn) submitBtn.textContent = 'Ajouter'
	if (taskTitle) taskTitle.textContent = 'Nouvelle tâche'
	renderCategoryOptions(TaskManager.getCategories()[0])
}

const handleEditById = (id) => {
	const task = TaskManager.getTasks().find((item) => item.id === id)
	if (!task) return

	if (titleInput) titleInput.value = task.title
	if (descInput) descInput.value = task.description
	renderCategoryOptions(task.category)
	if (categorySelect) categorySelect.value = task.category
	if (statusSelect) statusSelect.value = task.status
	if (dateInput) {
		dateInput.value = task.dueDate
			? new Date(task.dueDate).toISOString().split('T')[0]
			: ''
	}

	setCurrentTags(task.tags || [])

	editingTaskId = id
	if (submitBtn) submitBtn.textContent = 'Mettre à jour'
	if (taskTitle) taskTitle.textContent = 'Modifier la tâche'
}

const handleCompletedById = (id) => {
	TaskManager.toggleComplete(id)
	renderTasks()
}

const handleDeleteById = (id) => {
	TaskManager.deleteTask(id)
	if (editingTaskId === id) {
		resetFormState()
	}
	renderTasks()
}

const addTagToCurrent = (tag) => {
	const normalized = normalizeTag(tag)
	if (!normalized) return null
	if (!currentTags.includes(normalized)) {
		setCurrentTags([...currentTags, normalized])
	}
	return normalized
}

const addTagFromInput = () => {
	if (!tagInput) return
	const normalized = addTagToCurrent(tagInput.value)
	if (normalized) {
		TaskManager.registerTag(normalized)
	}
	tagInput.value = ''
	renderSidebar()
}

if (form) {
	form.addEventListener('submit', (event) => {
		event.preventDefault()

		const title = titleInput?.value.trim()
		if (!title) return

		const payload = {
			title,
			description: descInput?.value.trim() ?? '',
			category: categorySelect?.value ?? '',
			status: statusSelect?.value ?? TaskManager.STATUS.PENDING,
			dueDate: dateInput?.value || null,
			tags: [...currentTags],
		}

		if (editingTaskId) {
			TaskManager.updateTask(editingTaskId, payload)
		} else {
			TaskManager.addTask(
				payload.title,
				payload.description,
				payload.category,
				payload.dueDate,
				payload.status,
				payload.tags
			)
		}

		resetFormState()
		renderTasks()
	})
}

if (taskList) {
	taskList.addEventListener('click', (event) => {
		const editBtn = event.target.closest('.edit-btn')
		const deleteBtn = event.target.closest('.delete-btn')
		const checkbox = event.target.closest('.check-completed')
		const li = event.target.closest('li.task')
		if (!li) return

		const { id } = li.dataset
		if (!id) return

		if (checkbox) return
		if (editBtn) {
			handleEditById(id)
			return
		}
		if (deleteBtn) {
			handleDeleteById(id)
			return
		}
		handleEditById(id)
	})

	taskList.addEventListener('change', (event) => {
		const checkbox = event.target.closest('.check-completed')
		if (!checkbox) return
		const id = checkbox.dataset.id || checkbox.closest('li.task')?.dataset.id
		if (id) handleCompletedById(id)
	})
}

if (sidebarTaskFilters) {
	sidebarTaskFilters.addEventListener('click', (event) => {
	const item = event.target.closest('[data-view], [data-period], [data-status]')
	if (!item) return
	const { view } = item.dataset
	const { period } = item.dataset
	const { status } = item.dataset
	if (view === 'dashboard') {
		setFilter(FILTER_TYPES.ALL, null)
		return
	}
	if (period) {
			setFilter(FILTER_TYPES.PERIOD, period)
			return
		}
		if (status) {
			setFilter(FILTER_TYPES.STATUS, status)
		}
	})
}

if (selectedTagsContainer) {
	selectedTagsContainer.addEventListener('click', (event) => {
		const button = event.target.closest('button[data-remove-tag]')
		if (!button) return
		const { removeTag } = button.dataset
		if (!removeTag) return
		currentTags = currentTags.filter((tag) => tag !== removeTag)
		renderSelectedTags()
	})
}

if (tagListEl) {
	tagListEl.addEventListener('click', (event) => {
		const button = event.target.closest('button[data-tag]')
		if (!button) return
		const { tag } = button.dataset
		if (!tag) return
		addTagToCurrent(tag)
	})
}

if (addTagBtn) {
	addTagBtn.addEventListener('click', (event) => {
		event.preventDefault()
		addTagFromInput()
	})
}

if (tagInput) {
	tagInput.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			addTagFromInput()
		}
	})
}

if (sidebarTagForm) {
	sidebarTagForm.addEventListener('submit', (event) => {
		event.preventDefault()
		const value = normalizeTag(sidebarTagInput?.value ?? '')
		if (!value) return
		const registered = TaskManager.registerTag(value)
		sidebarTagInput.value = ''
		renderSidebar()
		if (registered) {
			addTagToCurrent(registered)
		}
	})
}

if (addCategoryBtn) {
	addCategoryBtn.addEventListener('click', () => {
		const name = normalizeTag(
			window.prompt('Nom de la nouvelle catégorie ?') ?? ''
		)
		if (!name) return
		TaskManager.addCategory(name)
		renderCategoryOptions(name)
		if (categorySelect) categorySelect.value = name
		renderSidebar()
	})
}

if (menuToggleBtn) {
	menuToggleBtn.addEventListener('click', () => {
		setSidebarCollapsed(!isSidebarCollapsed)
	})
}

setSidebarCollapsed(false)
setCurrentTags([])
renderCategoryOptions(TaskManager.getCategories()[0])
renderSidebar()

export default renderTasks
