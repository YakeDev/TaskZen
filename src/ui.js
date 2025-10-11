// ui.js
import TaskManager from './taskManager.js'

const form = document.getElementById('taskForm')
const titleInput = document.getElementById('title')
const descInput = document.getElementById('description')
const categorySelect = document.getElementById('category')
const statusSelect = document.getElementById('status')
const dateInput = document.getElementById('dueDate')
const submitBtn = document.getElementById('submit-btn')

const taskList = document.getElementById('taskList')
const statsContainer = document.getElementById('stats')

let editingTaskId = null

form.addEventListener('submit', (e) => {
	e.preventDefault()

	const title = titleInput.value.trim()
	const description = descInput.value.trim()
	const category = categorySelect.value
	const status = statusSelect.value
	const dueDate = dateInput.value || null

	if (!title) return

	if (editingTaskId) {
		TaskManager.updateTask(editingTaskId, {
			title,
			description,
			category,
			status,
			dueDate,
		})
		editingTaskId = null
		submitBtn.textContent = 'Ajouter'
	} else {
		TaskManager.addTask(title, description, category, dueDate, status)
	}

	form.reset()
	renderTasks()
})

function renderTasks() {
	taskList.innerHTML = ''
	const tasks = TaskManager.getTasks()

	tasks.forEach((task) => {
		const li = document.createElement('li')
		li.className = 'task'
		li.dataset.id = task.id // ✅ stocke l'id sur le <li>

		li.innerHTML = `
      <input type="checkbox" class="check-completed" data-id="${task.id}" ${
			task.status === 'completed' ? 'checked' : ''
		} />

      <h3 class="task-title ${
				task.status === 'completed' ? 'line-through text-gray-400' : ''
			}">
        ${task.title}
      </h3>

      <p>${task.description || '(Aucune description)'}</p>
      <p><strong>Catégorie :</strong> ${task.category}</p>
      <p><strong>Statut :</strong> ${TaskManager.STATUS_LABELS[task.status]}</p>
      <p><strong>Échéance :</strong> ${
				task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Aucune'
			}</p>

      <button data-id="${task.id}" class="edit-btn">Modifier</button>
      <button data-id="${task.id}" class="delete-btn">Supprimer</button>
    `
		taskList.appendChild(li)
	})

	renderStats()
}

// Délégation "click" : Edit/Supprimer OU clic sur le <li> pour éditer
taskList.addEventListener('click', (e) => {
	const li = e.target.closest('li.task')
	if (!li) return
	const id = li.dataset.id

	// Si on clique sur la checkbox -> ne pas ouvrir l'édition
	if (e.target.classList.contains('check-completed')) return

	// Si on clique sur les boutons, on gère normalement
	if (e.target.classList.contains('edit-btn')) {
		handleEditById(id)
		return
	}
	if (e.target.classList.contains('delete-btn')) {
		handleDeleteById(id)
		return
	}

	// Sinon: clic "vide" dans le <li> -> ouvrir l'édition
	handleEditById(id)
})

// Délégation "change" pour la checkbox (reste inchangé)
taskList.addEventListener('change', (e) => {
	if (e.target.classList.contains('check-completed')) {
		const id = e.target.dataset.id || e.target.closest('li.task')?.dataset.id
		if (id) handleCompletedById(id)
	}
})

function handleEditById(id) {
	const task = TaskManager.getTasks().find((t) => t.id === id)
	if (!task) return

	titleInput.value = task.title
	descInput.value = task.description
	categorySelect.value = task.category
	statusSelect.value = task.status
	dateInput.value = task.dueDate
		? new Date(task.dueDate).toISOString().split('T')[0]
		: ''

	editingTaskId = id
	submitBtn.textContent = 'Mettre à jour'
}

function handleCompletedById(id) {
	TaskManager.toggleComplete(id)
	renderTasks()
}

function handleDeleteById(id) {
	TaskManager.deleteTask(id)
	renderTasks()
}

function renderStats() {
	const stats = TaskManager.getStats()
	statsContainer.innerHTML = `
    <p><strong>Total :</strong> ${stats.total}</p>
    <p><strong>A faire :</strong> ${stats.pending}</p>
    <p><strong>En cours :</strong> ${stats.inProgress}</p>
    <p><strong>Bloquées :</strong> ${stats.blocked}</p>
    <p><strong>Terminées :</strong> ${stats.completed}</p>
    <h4>Par catégorie :</h4>
    <ul>
      ${Object.entries(stats.byCategory)
				.map(([cat, count]) => `<li>${cat} : ${count}</li>`)
				.join('')}
    </ul>
  `
}

export default renderTasks
