// ui.js
import TaskManager from './taskManager.js'
import {
	Calendar,
	CheckCircle2,
	CircleDot,
	CalendarCheck,
	ClipboardList,
	FolderClosed,
	List,
	ListTodo,
	OctagonAlert,
	PanelLeft,
	Pencil,
	Timer,
	Trash2,
} from 'lucide'
import { getPastDaysDiff } from './utils/dateUtils.js'

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
const sidebarSearchInput = document.getElementById('sidebarSearchInput')
const menuToggleBtn = document.getElementById('menuToggleBtn')
const appRoot = document.getElementById('app')

const sidebar = document.getElementById('sidebar')
const sidebarContent = document.getElementById('sidebarContent')
const taskSection = document.getElementById('taskSection')
const formAside = document.getElementById('formAside')
const tasksViewTitle = document.getElementById('tasksViewTitle')
const todayTaskList = document.getElementById('todayTaskList')
const todaySection = document.getElementById('todaySection')
const openFormButtons = document.querySelectorAll('[data-open-form]')
const periodShortcutButtons = document.querySelectorAll('[data-period-shortcut]')
const closeFormBtn = document.getElementById('closeFormBtn')
const settingsModal = document.getElementById('settingsModal')
const settingsOverlay = document.getElementById('settingsOverlay')
const openSettingsBtn = document.getElementById('openSettingsBtn')
const closeSettingsBtn = document.getElementById('closeSettingsBtn')
const settingsLanguageSelect = document.getElementById('settingsLanguage')
const settingsThemeSelect = document.getElementById('settingsTheme')
const settingsDensitySelect = document.getElementById('settingsDensity')
const settingsFeedbackToggle = document.getElementById('settingsFeedback')
const settingsCategoriesList = document.getElementById('settingsCategoriesList')
const settingsAddCategoryForm = document.getElementById('settingsAddCategoryForm')
const settingsAddCategoryInput = document.getElementById('settingsAddCategoryInput')
const settingsExportBtn = document.getElementById('settingsExportBtn')
const settingsImportBtn = document.getElementById('settingsImportBtn')
const settingsImportFile = document.getElementById('settingsImportFile')
const settingsResetBtn = document.getElementById('settingsResetBtn')

const priorityInput = document.getElementById('priority')
const undoToast = document.getElementById('undoToast')
const undoToastMessage = document.getElementById('undoToastMessage')
const undoToastAction = document.getElementById('undoToastAction')

const onboardingModal = document.getElementById('onboardingModal')
const onboardingBody = document.getElementById('onboardingBody')
const onboardingDots = document.getElementById('onboardingDots')
const onboardingNext = document.getElementById('onboardingNext')
const onboardingPrev = document.getElementById('onboardingPrev')
const onboardingSkip = document.getElementById('onboardingSkip')
const onboardingTitle = document.getElementById('onboardingTitle')

const selectedTagsContainer = document.getElementById('selectedTags')
const feedbackRegion = document.getElementById('formFeedback')
if (feedbackRegion) feedbackRegion.dataset.visible = 'false'

const SETTINGS_STORAGE_KEY = 'todo:list:user-settings'
const DEFAULT_USER_SETTINGS = {
	language: 'fr',
	theme: 'light',
	density: 'comfortable',
	notifications: {
		feedback: true,
	},
}

const ONBOARDING_STORAGE_KEY = 'todo:list:onboarding'
const PRIORITY_TAG = (TaskManager.DEFAULT_PRIORITY_TAG || 'Prioritaire').trim()
const PRIORITY_TAG_NORMALIZED = PRIORITY_TAG.toLowerCase()
const UNDO_TIMEOUT = 4000
const CATEGORY_ICON_DEFAULTS = TaskManager.CATEGORY_ICON_DEFAULTS || { default: '🗂️' }

const ONBOARDING_STEPS = [
	{
		title: 'Créer une tâche en quelques secondes',
		description:
			"Cliquez sur « Nouvelle tâche » ou appuyez sur N pour ouvrir le formulaire, puis indiquez l'échéance avant de valider.",
		bullets: [
			"Cochez l’option Prioritaire pour afficher le badge orange.",
			"Les dates passées sont bloquées pour éviter les oublis.",
		],
	},
	{
		title: 'Organisez vos catégories',
		description:
			'Attribuez une icône à chaque catégorie et gardez vos listes lisibles au premier coup d’œil.',
		bullets: [
			"Depuis Paramètres → Catégories, renommez ou changez l’icône.",
			"Le panneau latéral affiche en direct les totaux par catégorie.",
		],
	},
	{
		title: 'Priorités et statuts clarifiés',
		description:
			"Survolez les badges pour connaître l’état, utilisez Ctrl/Cmd + Entrée pour valider rapidement.",
		bullets: [
			"Les tâches en retard sont mises en avant avec ⚠️.",
			"E pour modifier la tâche sélectionnée, Échap pour fermer.",
		],
	},
]

const loadUserSettings = () => {
	try {
		const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
		if (!raw) return { ...DEFAULT_USER_SETTINGS }
		const parsed = JSON.parse(raw)
		return {
			...DEFAULT_USER_SETTINGS,
			...parsed,
			notifications: {
				...DEFAULT_USER_SETTINGS.notifications,
				...(parsed?.notifications || {}),
			},
		}
	} catch {
		return { ...DEFAULT_USER_SETTINGS }
	}
}

if (todayTaskList) {
	todayTaskList.addEventListener('click', (event) => {
		const li = event.target.closest('li')
		if (!li) return
		const { id } = li.dataset
		if (!id) return
		if (event.target.closest('button')) return
		setSelectedTask(id)
		handleEditById(id)
	})

	todayTaskList.addEventListener('focusin', (event) => {
		const li = event.target.closest('li')
		if (!li) return
		const { id } = li.dataset
		if (id) setSelectedTask(id)
	})
}

let userSettings = loadUserSettings()

const saveUserSettings = () => {
	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(userSettings))
}

const applySettings = () => {
	if (userSettings.theme === 'dark') {
		document.documentElement.classList.add('dark')
		document.body.classList.add('bg-slate-900', 'text-slate-100')
	} else {
		document.documentElement.classList.remove('dark')
		document.body.classList.remove('bg-slate-900', 'text-slate-100')
	}
	if (appRoot) {
		appRoot.dataset.density = userSettings.density
	}
}

applySettings()

const openSettingsPanel = () => {
	if (!settingsModal) return
	settingsModal.classList.remove('hidden')
	if (settingsLanguageSelect)
		settingsLanguageSelect.value = userSettings.language || 'fr'
	if (settingsThemeSelect) settingsThemeSelect.value = userSettings.theme
	if (settingsDensitySelect)
		settingsDensitySelect.value = userSettings.density || 'comfortable'
	if (settingsFeedbackToggle)
		settingsFeedbackToggle.checked = !!userSettings.notifications.feedback
	renderSettingsCategories()
	settingsModal.focus()
}

const closeSettingsPanel = () => {
	if (!settingsModal) return
	settingsModal.classList.add('hidden')
	if (settingsImportFile) settingsImportFile.value = ''
}

const renderSettingsCategories = () => {
	if (!settingsCategoriesList) return
	settingsCategoriesList.innerHTML = ''
	const categories = TaskManager.getCategories()
	categories.forEach((category) => {
		const li = document.createElement('li')
		li.className =
			'flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700'

		const label = document.createElement('div')
		label.className = 'flex items-center gap-2'
		const iconSpan = document.createElement('span')
		iconSpan.className = 'text-lg'
		iconSpan.setAttribute('aria-hidden', 'true')
		iconSpan.textContent = getCategoryIcon(category)
		const name = document.createElement('span')
		name.textContent = category
		label.append(iconSpan, name)
		li.appendChild(label)

		const actions = document.createElement('div')
		actions.className = 'flex gap-2'

		const isDefault = TaskManager.isDefaultCategory(category)

		const renameBtn = document.createElement('button')
		renameBtn.type = 'button'
		renameBtn.textContent = 'Renommer'
		renameBtn.className =
			'text-emerald-600 hover:text-emerald-700 disabled:text-gray-400 text-xs'
		renameBtn.disabled = isDefault
		renameBtn.addEventListener('click', () => {
			const newName = window.prompt(
				'Nouveau nom pour la catégorie :',
				category
			)
			const trimmed = newName?.trim()
			if (!trimmed || trimmed === category) return
			const ok = TaskManager.renameCategory(category, trimmed)
			if (!ok) {
				showFeedback(
					'Impossible de renommer la catégorie (nom déjà utilisé ?)',
					'error'
				)
				return
			}
			renderSettingsCategories()
			renderCategoryOptions(trimmed)
			renderSidebar()
			showFeedback('Catégorie renommée avec succès.')
		})

		const iconBtn = document.createElement('button')
		iconBtn.type = 'button'
		iconBtn.textContent = 'Icône'
		iconBtn.className = 'text-sky-600 hover:text-sky-700 text-xs'
		iconBtn.addEventListener('click', () => {
			const current = getCategoryIcon(category)
			const input = window.prompt(
				`Nouvelle icône pour « ${category} » (emoji recommandé) :`,
				current
			)
			const trimmed = input?.trim()
			if (!trimmed) return
			const nextIcon = Array.from(trimmed)[0]
			const ok = TaskManager.setCategoryIcon(category, nextIcon)
			if (!ok) {
				showFeedback('Impossible de mettre à jour l’icône.', 'error')
				return
			}
			renderSettingsCategories()
			renderSidebar()
			renderTasks()
			showFeedback('Icône mise à jour avec succès.')
		})

		const deleteBtn = document.createElement('button')
		deleteBtn.type = 'button'
		deleteBtn.textContent = 'Supprimer'
		deleteBtn.className =
			'text-rose-600 hover:text-rose-700 disabled:text-gray-400 text-xs'
		deleteBtn.disabled = isDefault
		deleteBtn.addEventListener('click', () => {
			if (
				!window.confirm(
					`Supprimer la catégorie « ${category} » ? Les tâches associées seront déplacées dans la première catégorie disponible.`
				)
			)
				return
			const ok = TaskManager.deleteCategory(category)
			if (!ok) {
				showFeedback('Impossible de supprimer cette catégorie.', 'error')
				return
			}
			resetFormState(false)
			renderSettingsCategories()
			renderCategoryOptions(TaskManager.getCategories()[0])
			renderSidebar()
			showFeedback('Catégorie supprimée avec succès.')
		})

		actions.append(iconBtn, renameBtn, deleteBtn)
		li.appendChild(actions)
		settingsCategoriesList.appendChild(li)
	})
}

const STATUS_METADATA = {
	[TaskManager.STATUS.PENDING]: {
		className: 'status-chip status-chip--pending',
		icon: '🔄',
		label: TaskManager.STATUS_LABELS[TaskManager.STATUS.PENDING],
	},
	[TaskManager.STATUS.IN_PROGRESS]: {
		className: 'status-chip status-chip--in-progress',
		icon: '⚙️',
		label: TaskManager.STATUS_LABELS[TaskManager.STATUS.IN_PROGRESS],
	},
	[TaskManager.STATUS.OVERDUE]: {
		className: 'status-chip status-chip--overdue',
		icon: '⚠️',
		label: TaskManager.STATUS_LABELS[TaskManager.STATUS.OVERDUE],
	},
	[TaskManager.STATUS.COMPLETED]: {
		className: 'status-chip status-chip--completed',
		icon: '✅',
		label: TaskManager.STATUS_LABELS[TaskManager.STATUS.COMPLETED],
	},
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
	searchQuery: '',
	selectedTaskId: null,
	undo: { timer: null, task: null },
	onboardingStep: 0,
}

let editingTaskId = null
let currentTags = []
let isSidebarCollapsed = false
let isFormVisible = false

const renderIcon = (icon, options = {}) => {
	if (!icon) return ''
	const {
		size = 20,
		strokeWidth = 1.75,
		className = '',
		title: iconTitle,
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

	const titleMarkup = iconTitle ? `<title>${escapeHtml(iconTitle)}</title>` : ''

	return `<svg ${baseAttrs.join(' ')}>${titleMarkup}${children}</svg>`
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

const matchesSearchQuery = (task) => {
	const query = state.searchQuery
	if (!query) return true
	const needle = query.toLowerCase()
	const fields = [
		task.title,
		task.description,
		task.category,
		...(Array.isArray(task.tags) ? task.tags : []),
	]
	return fields.some((value) =>
		String(value ?? '').toLowerCase().includes(needle)
	)
}

const isPriorityTask = (task = {}) =>
	(task.tags || []).some((tag) => String(tag).toLowerCase() === PRIORITY_TAG_NORMALIZED)

const getCategoryIcon = (category) =>
	TaskManager.getCategoryIcon(category) || CATEGORY_ICON_DEFAULTS.default || '🗂️'

const refreshDatePickerMin = () => {
	if (!dateInput) return
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	dateInput.min = today.toISOString().split('T')[0]
}

const clearUndoState = () => {
	if (state.undo.timer) {
		clearTimeout(state.undo.timer)
		state.undo.timer = null
	}
	state.undo.task = null
}

const hideUndoToast = (options = {}) => {
	if (!undoToast) return
	const { immediate = false } = options
	undoToast.classList.remove('show')
	undoToast.classList.add('hide')
	const finalize = () => {
		undoToast.classList.add('hidden')
		undoToast.classList.remove('hide')
	}
	if (immediate) {
		finalize()
	} else {
		setTimeout(finalize, 160)
	}
}

const showUndoToast = (task) => {
	if (!undoToast || !undoToastMessage) return
	clearUndoState()
	state.undo.task = { ...task }
	undoToastMessage.textContent = `Tâche « ${task.title} » supprimée.`
	undoToast.classList.remove('hidden', 'hide')
	undoToast.classList.add('show')
	state.undo.timer = setTimeout(() => {
		clearUndoState()
		hideUndoToast()
	}, UNDO_TIMEOUT)
}

const setSearchQuery = (value) => {
	const normalized = (value || '').trim()
	if (state.searchQuery === normalized) return
	state.searchQuery = normalized
	renderTasks()
}

const updateSelectedIndicators = () => {
	if (!taskList) return
	const cards = taskList.querySelectorAll('li.task .task-card')
	cards.forEach((card) => {
		const li = card.closest('li.task')
		if (!li) return
		const { id } = li.dataset
		const isSelected = id && id === state.selectedTaskId
		card.dataset.selected = String(!!isSelected)
		li.dataset.selected = String(!!isSelected)
	})
}

const setSelectedTask = (id) => {
	state.selectedTaskId = id || null
	updateSelectedIndicators()
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

const setFormVisible = (visible) => {
	isFormVisible = visible
	if (appRoot) appRoot.dataset.formVisible = visible ? 'true' : 'false'
	if (formAside) {
		formAside.classList.toggle('hidden', !visible)
		if (visible) {
			formAside.classList.remove('hidden')
		} else {
			formAside.classList.add('hidden')
		}
	}
	if (!visible && feedbackRegion) {
		feedbackRegion.textContent = ''
		feedbackRegion.className = 'hidden'
		feedbackRegion.dataset.visible = 'false'
	}
	if (visible) {
		refreshDatePickerMin()
		setTimeout(() => titleInput?.focus(), 50)
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
	currentTags = []
	if (selectedTagsContainer) selectedTagsContainer.innerHTML = ''
}

const showFeedback = (message, type = 'success') => {
	if (!userSettings.notifications.feedback) return
	if (!feedbackRegion) return
	feedbackRegion.dataset.visible = 'true'
	feedbackRegion.classList.remove('hidden', 'opacity-0')
	const base =
		'rounded-md px-3 py-2 text-sm font-medium transition-opacity duration-300'
	const palette =
		type === 'error'
			? 'bg-rose-100 text-rose-700 border border-rose-200'
			: 'bg-emerald-100 text-emerald-700 border border-emerald-200'
	feedbackRegion.textContent = message
	feedbackRegion.className = `${base} ${palette}`
	setTimeout(() => {
		if (feedbackRegion.dataset.visible === 'true') {
			feedbackRegion.classList.add('opacity-0')
		}
	}, 2200)
	setTimeout(() => {
		if (feedbackRegion.dataset.visible === 'true') {
			feedbackRegion.textContent = ''
			feedbackRegion.className = 'hidden'
			feedbackRegion.dataset.visible = 'false'
		}
	}, 2600)
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

const FILTER_TOOLTIPS = {
	dashboard: 'Toutes les tâches actives',
	upcoming: 'Tâches à venir',
	today: 'Tâches du jour',
	overdue: 'Tâches en retard',
	completed: 'Tâches terminées',
}

const renderFilterIcon = (key) => {
	const iconMap = {
		dashboard: PanelLeft,
		upcoming: List,
		today: CalendarCheck,
		overdue: OctagonAlert,
		completed: CheckCircle2,
	}
	const icon = iconMap[key]
	if (!icon) return ''
	const tooltip = FILTER_TOOLTIPS[key] || 'Filtrer les tâches'
	const svgMarkup = renderIcon(icon, {
		size: 16,
		className: 'w-4 h-4 shrink-0 text-gray-500',
		title: tooltip,
	})
	return svgMarkup.replace('<svg ', `<svg data-icon="${key}" `)
}

const renderSidebar = () => {
	const stats = TaskManager.getStats()
	const filterListItems = sidebarTaskFilters?.querySelectorAll('li') || []
	filterListItems.forEach((item) => {
		const iconKey = item.dataset.view || item.dataset.period || item.dataset.status
		const svg = item.querySelector('svg[data-icon]')
		if (svg) {
			svg.outerHTML = renderFilterIcon(iconKey)
		}
		const tooltip = FILTER_TOOLTIPS[iconKey]
		if (tooltip) {
			item.setAttribute('data-tooltip', tooltip)
			item.setAttribute('title', tooltip)
		}
	})

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
				li.setAttribute('data-tooltip', `Catégorie ${category}`)
				li.setAttribute('title', `Catégorie ${category}`)

				const label = document.createElement('span')
				label.className = 'flex items-center gap-2'
				const iconSpan = document.createElement('span')
				iconSpan.className = 'text-base'
				iconSpan.setAttribute('aria-hidden', 'true')
				iconSpan.textContent = getCategoryIcon(category)
				const name = document.createElement('span')
				name.textContent = category
				label.append(iconSpan, name)

				const count = document.createElement('span')
				count.className =
					'rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-gray-700'
				count.textContent = stats.byCategory[category] ?? 0

				li.append(label, count)
				categoryListEl.appendChild(li)
			})
		}
	}

	renderCategoryOptions(categorySelect?.value)
	updateFilterIndicators()
}

const renderStats = () => {
	if (!statsContainer) return
	if (state.filter.type !== FILTER_TYPES.ALL || state.searchQuery) {
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
				.map(([category, count]) => {
					const icon = escapeHtml(getCategoryIcon(category))
					return `
				<div class="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
					<span class="text-sm font-medium text-gray-700 flex items-center gap-2">
						<span aria-hidden="true">${icon}</span>
						<span>${escapeHtml(category)}</span>
					</span>
					<span class="text-sm font-semibold text-gray-900">${count}</span>
				</div>
			`
				})
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
				class="progress-bar h-full rounded-full bg-emerald-400"
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

const renderTodaySection = () => {
	if (!todayTaskList || !todaySection) return
	if (state.searchQuery) {
		todaySection.classList.add('hidden')
		todayTaskList.innerHTML = ''
		return
	}
	const overdueTasks = TaskManager.getTasksByStatus(TaskManager.STATUS.OVERDUE).filter(
		(task) => !isCompleted(task)
	)
	const todayTasks = excludeCompletedTasks(TaskManager.filterTasksByPeriod('today'))
	const merged = new Map()
	overdueTasks.forEach((task) => merged.set(task.id, task))
	todayTasks.forEach((task) => merged.set(task.id, task))
	const entries = Array.from(merged.values()).sort((a, b) => {
		const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity
		const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity
		return aTime - bTime
	})
	todayTaskList.innerHTML = ''
	if (!entries.length) {
		todaySection.classList.add('hidden')
		return
	}
	todaySection.classList.remove('hidden')
	entries.forEach((task) => {
		const li = document.createElement('li')
		const isOverdue = task.status === TaskManager.STATUS.OVERDUE
		li.className = `flex items-center justify-between gap-3 ${isOverdue ? 'overdue' : ''}`
		li.dataset.id = task.id
		li.dataset.status = task.status
		li.dataset.priority = String(isPriorityTask(task))
		li.tabIndex = 0

		const left = document.createElement('div')
		left.className = 'flex flex-col gap-1'
		const title = document.createElement('p')
		title.className = 'text-sm font-semibold'
		title.textContent = task.title
		const meta = document.createElement('span')
		meta.className = 'today-meta'
		const statusIcon = isOverdue ? '⚠️' : '🗓️'
		meta.textContent = `${statusIcon} ${formatDate(task.dueDate)}`
		left.append(title, meta)

		const actions = document.createElement('div')
		actions.className = 'flex items-center gap-2'
		if (isPriorityTask(task)) {
			const badge = document.createElement('span')
			badge.className = 'priority-badge'
			badge.textContent = PRIORITY_TAG
			actions.appendChild(badge)
		}
		const quickEdit = document.createElement('button')
		quickEdit.type = 'button'
		quickEdit.className = 'rounded-md border border-transparent px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50'
		quickEdit.textContent = 'Ouvrir'
		quickEdit.addEventListener('click', (event) => {
			event.stopPropagation()
			handleEditById(task.id)
		})
		actions.appendChild(quickEdit)

		li.append(left, actions)
		todayTaskList.appendChild(li)
	})
}

const isOnboardingCompleted = () => {
	try {
		return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'done'
	} catch {
		return true
	}
}

const markOnboardingCompleted = () => {
	try {
		localStorage.setItem(ONBOARDING_STORAGE_KEY, 'done')
	} catch {
		// ignore storage errors
	}
}

const renderOnboardingStep = () => {
	if (!onboardingModal) return
	const step = ONBOARDING_STEPS[state.onboardingStep]
	if (!step) return
	if (onboardingTitle) onboardingTitle.textContent = step.title
	if (onboardingBody) {
		const bullets = step.bullets
			.map((item) => `<li class="flex items-start gap-2 text-sm"><span class="text-emerald-500">•</span><span>${escapeHtml(item)}</span></li>`)
			.join('')
		onboardingBody.innerHTML = `
			<p>${escapeHtml(step.description)}</p>
			<ul class="space-y-1">${bullets}</ul>
		`
	}
	if (onboardingDots) {
		onboardingDots.innerHTML = ONBOARDING_STEPS.map((_, index) => {
			const active = index === state.onboardingStep
			return `<span class="h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}"></span>`
		}).join('')
	}
	if (onboardingPrev) onboardingPrev.disabled = state.onboardingStep === 0
	if (onboardingNext)
		onboardingNext.textContent =
			state.onboardingStep === ONBOARDING_STEPS.length - 1 ? 'Terminer' : 'Suivant'
}

const openOnboarding = (step = 0) => {
	state.onboardingStep = step
	renderOnboardingStep()
	if (onboardingModal) {
		onboardingModal.classList.remove('hidden')
		onboardingModal.classList.add('flex')
		onboardingModal.focus()
	}
}

const closeOnboarding = (options = {}) => {
	const { completed = false, skip = false } = options
	if (onboardingModal) {
		onboardingModal.classList.add('hidden')
		onboardingModal.classList.remove('flex')
	}
	if (completed || skip) {
		markOnboardingCompleted()
	}
}

const maybeStartOnboarding = () => {
	if (!isOnboardingCompleted()) {
		openOnboarding(0)
	}
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

const createTaskMarkup = (task, options = {}) => {
	const { selected = false, isPriority = false } = options
	const statusMeta =
		STATUS_METADATA[task.status] || STATUS_METADATA[TaskManager.STATUS.PENDING]
	const statusLabel = statusMeta?.label ?? task.status
	const dueDate = formatDate(task.dueDate)
	const dueClass =
		task.status === TaskManager.STATUS.OVERDUE
			? 'text-rose-600 font-semibold'
			: 'text-gray-600'
	const descriptionSnippet = task.description
		? escapeHtml(task.description)
		: '(Aucune description)'
	const categoryIcon = escapeHtml(getCategoryIcon(task.category))
	const priorityBadge = isPriority
		? `<span class="priority-badge" aria-label="${escapeHtml(
				PRIORITY_TAG
			)}">${escapeHtml(PRIORITY_TAG)}</span>`
		: ''

	return `
		<article
			class="task-card group"
			data-status="${task.status}"
			data-selected="${selected}"
			data-priority="${isPriority}"
			aria-label="${escapeHtml(task.title)}"
		>
			<div class="grid items-start gap-3" style="grid-template-columns:auto 1fr auto;">
				<input
					type="checkbox"
					class="check-completed mt-1 h-4 w-4 cursor-pointer accent-emerald-500"
					data-id="${task.id}"
					${task.status === TaskManager.STATUS.COMPLETED ? 'checked' : ''}
					title="Marquer comme terminé"
					aria-label="Marquer la tâche comme terminée"
					data-tooltip="Terminer / Reprendre"
				/>
				<div class="space-y-1">
					<h3 class="text-base font-semibold ${
						task.status === TaskManager.STATUS.COMPLETED
							? 'text-gray-400 line-through'
							: 'text-gray-800'
					}">
						${escapeHtml(task.title)}
					</h3>
					<div class="flex flex-wrap items-center gap-3 text-xs text-gray-500">
						<span class="inline-flex items-center gap-1">
							${renderIcon(Calendar, { size: 14, title: "Échéance" })}
							<span class="${dueClass}">${dueDate}</span>
						</span>
						<span class="inline-flex items-center gap-2">
							<span class="${statusMeta.className} status-chip" data-tooltip="${escapeHtml(
								statusLabel
							)}">
								<span aria-hidden="true">${statusMeta.icon}</span>
								<span>${escapeHtml(statusLabel)}</span>
							</span>
						</span>
						<span class="inline-flex items-center gap-1" data-tooltip="Catégorie">
							<span aria-hidden="true" class="text-base">${categoryIcon}</span>
							<span>${escapeHtml(task.category)}</span>
						</span>
						<span class="inline-flex items-center gap-1 text-[11px] text-gray-500 max-w-xs">
							${renderIcon(CircleDot, { size: 12, title: 'Description' })}
							<span class="line-clamp-1">${descriptionSnippet}</span>
						</span>
					</div>
					${priorityBadge
						? `<div class="flex items-center gap-2 text-[11px] text-amber-600">${priorityBadge}</div>`
						: ''}
				</div>
				<div class="flex gap-1">
					<button
						type="button"
						data-id="${task.id}"
						class="edit-btn rounded-md p-2 text-xs text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
						aria-label="Modifier la tâche"
						data-tooltip="Modifier"
					>
						${renderIcon(Pencil, {
							size: 16,
							className: 'shrink-0',
							title: 'Modifier',
						})}
					</button>
					<button
						type="button"
						data-id="${task.id}"
						class="delete-btn rounded-md p-2 text-xs text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
						aria-label="Supprimer la tâche"
						data-tooltip="Supprimer"
					>
						${renderIcon(Trash2, {
							size: 16,
							className: 'shrink-0',
							title: 'Supprimer',
						})}
					</button>
				</div>
			</div>
	</article>
	`
}

const getVisibleTasks = () => {
	const { type, value } = state.filter
	let tasks
	if (type === FILTER_TYPES.STATUS && value) {
		tasks = TaskManager.getTasksByStatus(value)
	} else if (type === FILTER_TYPES.PERIOD && value) {
		tasks = excludeCompletedTasks(TaskManager.filterTasksByPeriod(value))
	} else {
		tasks = excludeCompletedTasks(TaskManager.getTasks())
	}
	const filtered = tasks.filter(matchesSearchQuery)
	if (state.selectedTaskId && !filtered.some((task) => task.id === state.selectedTaskId)) {
		state.selectedTaskId = null
	}
	return filtered
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
			'rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
		li.innerHTML =
			'Aucune tâche pour le moment. Ajoutez-en une pour commencer !'
		taskList.appendChild(li)
	} else {
		tasks.forEach((task) => {
			const li = document.createElement('li')
			li.className = 'task cursor-pointer'
			li.dataset.id = task.id
			li.dataset.status = task.status
			const priority = isPriorityTask(task)
			li.dataset.priority = String(priority)
			li.tabIndex = 0
			li.innerHTML = createTaskMarkup(task, {
				selected: state.selectedTaskId === task.id,
				isPriority: priority,
			})
			taskList.appendChild(li)
		})
	}
	renderTodaySection()
	renderStats()
	renderSidebar()
	updateViewTitle()
	updateSelectedIndicators()
}

function setFilter(type, value) {
	const same = state.filter.type === type && state.filter.value === value
	state.filter = same
		? { type: FILTER_TYPES.ALL, value: null }
		: { type, value }
	state.selectedTaskId = null
	renderTasks()
}

const resetFormState = (options = {}) => {
	if (!form) return
	const closeForm =
		typeof options === 'boolean'
			? options
			: options.close !== undefined
			? options.close
			: true
	form.reset()
	setCurrentTags([])
	editingTaskId = null
	if (submitBtn) submitBtn.textContent = 'Ajouter'
	if (taskTitle) taskTitle.textContent = 'Nouvelle tâche'
	if (priorityInput) priorityInput.checked = false
	renderCategoryOptions(TaskManager.getCategories()[0])
	if (closeForm) setFormVisible(false)
}

const handleEditById = (id) => {
	const task = TaskManager.getTasks().find((item) => item.id === id)
	if (!task) return
	setFormVisible(true)
	state.selectedTaskId = id

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
	if (priorityInput) priorityInput.checked = isPriorityTask(task)

	editingTaskId = id
	if (submitBtn) submitBtn.textContent = 'Mettre à jour'
	if (taskTitle) taskTitle.textContent = 'Modifier la tâche'
}

const handleCompletedById = (id) => {
	TaskManager.toggleComplete(id)
	renderTasks()
}

const handleDeleteById = (id) => {
	const task = TaskManager.getTasks().find((item) => item.id === id)
	if (!task) return
	TaskManager.deleteTask(id)
	if (editingTaskId === id) {
		resetFormState()
	}
	if (state.selectedTaskId === id) {
		state.selectedTaskId = null
	}
	renderTasks()
	showUndoToast(task)
}

if (form) {
	form.addEventListener('submit', (event) => {
		event.preventDefault()

		const title = titleInput?.value.trim()
		if (!title) {
			showFeedback('Veuillez saisir un titre pour la tâche.', 'error')
			titleInput?.focus()
			return
		}

		const payload = {
			title,
			description: descInput?.value.trim() ?? '',
			category: categorySelect?.value ?? '',
			status: statusSelect?.value ?? TaskManager.STATUS.PENDING,
			dueDate: dateInput?.value || null,
		}

		const pastDiff = getPastDaysDiff(payload.dueDate)
		if (pastDiff > 0) {
			const suffix = pastDiff > 1 ? 'jours' : 'jour'
			showFeedback(
				`La date est dépassée depuis ${pastDiff} ${suffix}.`,
				'error'
			)
			dateInput?.focus()
			return
		}

		const existingTags = editingTaskId
			? (TaskManager.getTasks().find((item) => item.id === editingTaskId)?.tags || [])
			: []
		const filteredTags = existingTags.filter(
			(tag) => String(tag).toLowerCase() !== PRIORITY_TAG_NORMALIZED
		)
		if (priorityInput?.checked) {
			filteredTags.push(PRIORITY_TAG)
		}
		payload.tags = filteredTags

		if (editingTaskId) {
			TaskManager.updateTask(editingTaskId, payload)
			showFeedback('La tâche a été mise à jour avec succès.')
		} else {
			TaskManager.addTask(
				payload.title,
				payload.description,
				payload.category,
				payload.dueDate,
				payload.status,
				payload.tags
			)
			showFeedback('La tâche a été ajoutée avec succès.')
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
			setSelectedTask(id)

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
			const li = checkbox.closest('li.task')
			if (id) {
				setSelectedTask(id)
				handleCompletedById(id)
				const card = li?.querySelector('.task-card')
				if (card) {
					card.classList.add('is-checking')
					setTimeout(() => card.classList.remove('is-checking'), 160)
				}
			}
		})

		taskList.addEventListener('focusin', (event) => {
			const li = event.target.closest('li.task')
			if (!li) return
			const { id } = li.dataset
			if (id) setSelectedTask(id)
		})
	}

if (openFormButtons?.length) {
	openFormButtons.forEach((button) => {
		button.addEventListener('click', () => {
			resetFormState({ close: false })
			setFormVisible(true)
		})
	})
}

if (closeFormBtn) {
	closeFormBtn.addEventListener('click', () => {
		resetFormState(true)
	})
}

if (openSettingsBtn) {
	openSettingsBtn.addEventListener('click', () => {
		openSettingsPanel()
	})
}

if (closeSettingsBtn) {
	closeSettingsBtn.addEventListener('click', () => {
		closeSettingsPanel()
	})
}

if (settingsOverlay) {
	settingsOverlay.addEventListener('click', () => closeSettingsPanel())
}

if (settingsThemeSelect) {
	settingsThemeSelect.addEventListener('change', (event) => {
		userSettings.theme = event.target.value
		saveUserSettings()
		applySettings()
	})
}

if (settingsDensitySelect) {
	settingsDensitySelect.addEventListener('change', (event) => {
		userSettings.density = event.target.value
		saveUserSettings()
		applySettings()
		renderTasks()
	})
}

if (settingsLanguageSelect) {
	settingsLanguageSelect.addEventListener('change', (event) => {
		userSettings.language = event.target.value
		saveUserSettings()
	})
}

if (settingsFeedbackToggle) {
	settingsFeedbackToggle.addEventListener('change', (event) => {
		userSettings.notifications.feedback = event.target.checked
		saveUserSettings()
		if (!event.target.checked && feedbackRegion) {
			feedbackRegion.textContent = ''
			feedbackRegion.className = 'hidden'
			feedbackRegion.dataset.visible = 'false'
		}
	})
}

if (settingsAddCategoryForm) {
	settingsAddCategoryForm.addEventListener('submit', (event) => {
		event.preventDefault()
		const value = settingsAddCategoryInput?.value.trim()
		if (!value) return
		TaskManager.addCategory(value)
		settingsAddCategoryInput.value = ''
		renderSettingsCategories()
		renderCategoryOptions(value)
		renderSidebar()
		showFeedback('Catégorie ajoutée avec succès.')
	})
}

if (settingsExportBtn) {
	settingsExportBtn.addEventListener('click', () => {
		const data = {
			tasks: TaskManager.getTasks(),
			settings: userSettings,
		}
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = `todo-export-${new Date().toISOString().slice(0, 10)}.json`
		document.body.appendChild(link)
		link.click()
		link.remove()
		URL.revokeObjectURL(url)
		showFeedback('Export JSON généré avec succès.')
	})
}

if (settingsImportBtn && settingsImportFile) {
	settingsImportBtn.addEventListener('click', () => settingsImportFile.click())
	settingsImportFile.addEventListener('change', (event) => {
		const file = event.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const parsed = JSON.parse(e.target?.result || '[]')
				const tasks = Array.isArray(parsed.tasks) ? parsed.tasks : Array.isArray(parsed) ? parsed : []
				const importedSettings = parsed.settings
				TaskManager.replaceAllTasks(tasks)
				if (importedSettings) {
					userSettings = {
						...DEFAULT_USER_SETTINGS,
						...importedSettings,
						notifications: {
							...DEFAULT_USER_SETTINGS.notifications,
							...(importedSettings.notifications || {}),
						},
					}
					applySettings()
				}
				saveUserSettings()
				resetFormState(false)
				renderTasks()
				renderSidebar()
				renderSettingsCategories()
				showFeedback('Import réalisé avec succès.')
				closeSettingsPanel()
			} catch (error) {
				console.error(error)
				showFeedback('Fichier d’import invalide.', 'error')
			}
		}
		reader.readAsText(file)
	})
}

if (settingsResetBtn) {
	settingsResetBtn.addEventListener('click', () => {
		if (
			window.confirm(
				'Réinitialiser l’application ? Toutes les tâches et catégories personnalisées seront supprimées.'
			)
		) {
			TaskManager.resetAll()
			userSettings = { ...DEFAULT_USER_SETTINGS }
			saveUserSettings()
			applySettings()
			const hadSearch = state.searchQuery !== ''
			if (sidebarSearchInput) sidebarSearchInput.value = ''
			if (hadSearch) {
				setSearchQuery('')
			} else {
				renderTasks()
			}
			resetFormState(false)
			renderSettingsCategories()
			showFeedback('Application réinitialisée.')
			closeSettingsPanel()
		}
	})
}

if (undoToastAction) {
	undoToastAction.addEventListener('click', () => {
		if (!state.undo.task) {
			hideUndoToast({ immediate: true })
			return
		}
		const taskToRestore = { ...state.undo.task }
		clearUndoState()
		hideUndoToast({ immediate: true })
		TaskManager.restoreTask(taskToRestore)
		setSelectedTask(taskToRestore.id)
		renderTasks()
		showFeedback('Suppression annulée avec succès.')
	})
}

if (onboardingNext) {
	onboardingNext.addEventListener('click', () => {
		if (state.onboardingStep < ONBOARDING_STEPS.length - 1) {
			state.onboardingStep += 1
			renderOnboardingStep()
		} else {
			closeOnboarding({ completed: true })
		}
	})
}

if (onboardingPrev) {
	onboardingPrev.addEventListener('click', () => {
		if (state.onboardingStep > 0) {
			state.onboardingStep -= 1
			renderOnboardingStep()
		}
	})
}

if (onboardingSkip) {
	onboardingSkip.addEventListener('click', () => {
		closeOnboarding({ skip: true })
	})
}

document.addEventListener('keydown', (event) => {
	const target = event.target
	const tagName = target?.tagName?.toLowerCase?.() ?? ''
	const isTyping =
		target?.isContentEditable ||
		tagName === 'input' ||
		tagName === 'textarea' ||
		tagName === 'select'
	const key = event.key || ''
	const keyLower = key.toLowerCase()
	const metaOrCtrl = event.metaKey || event.ctrlKey

	if (metaOrCtrl && key === 'Enter') {
		if (state.selectedTaskId) {
			event.preventDefault()
			handleCompletedById(state.selectedTaskId)
		}
		return
	}

	if (!metaOrCtrl && !event.altKey) {
		if (keyLower === 'n' && !isTyping) {
			event.preventDefault()
			resetFormState({ close: false })
			setFormVisible(true)
			return
		}
		if (keyLower === 'e' && !isTyping && state.selectedTaskId) {
			event.preventDefault()
			handleEditById(state.selectedTaskId)
			return
		}
	}

	if (key === 'Escape') {
		if (onboardingModal && !onboardingModal.classList.contains('hidden')) {
			closeOnboarding({ skip: true })
			return
		}
		if (settingsModal && !settingsModal.classList.contains('hidden')) {
			closeSettingsPanel()
			return
		}
		if (isFormVisible) {
			resetFormState(true)
		}
	}
})

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

if (sidebarSearchInput) {
	sidebarSearchInput.addEventListener('input', (event) => {
		setSearchQuery(event.target.value)
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
	renderSettingsCategories()
	showFeedback('Catégorie ajoutée avec succès.')
	})
}

if (menuToggleBtn) {
	menuToggleBtn.addEventListener('click', () => {
		setSidebarCollapsed(!isSidebarCollapsed)
	})
}

if (periodShortcutButtons?.length) {
	periodShortcutButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const period = button.dataset.periodShortcut
			if (period) setFilter(FILTER_TYPES.PERIOD, period)
		})
	})
}

setSidebarCollapsed(false)
setCurrentTags([])
refreshDatePickerMin()
renderCategoryOptions(TaskManager.getCategories()[0])
renderSidebar()
setFormVisible(false)
maybeStartOnboarding()

export default renderTasks
