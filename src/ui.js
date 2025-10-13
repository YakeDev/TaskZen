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

if (form) {
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
}

function renderTasks() {
	taskList.innerHTML = ''
	const tasks = TaskManager.getTasks()

	tasks.forEach((task) => {
		const li = document.createElement('li')
		li.className = 'task hover:bg-gray-50 cursor-pointer'
		li.dataset.id = task.id // ✅ stocke l'id sur le <li>

		li.innerHTML = `
  <div class="flex justify-between items-center border-gray-200  pt-2 px-3">
    <!-- Titre et checkbox -->
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        class="check-completed size-3 accent-amber-400"
        data-id="${task.id}"
        ${task.status === 'completed' ? 'checked' : ''}
      />
      <h3 class="text-base font-semibold ${
				task.status === 'completed'
					? 'line-through text-gray-400'
					: 'text-gray-700'
			}">
        ${task.title}
      </h3>
    </div>

    <!-- Boutons -->
    <div class="flex gap-2">
      <button
        data-id="${task.id}"
        class="edit-btn rounded-lg text-base p-1 font-normal text-gray-700 cursor-pointer"
      >
			<svg class='h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
  <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
</svg>

      </button>
      <button
        data-id="${task.id}"
        class="delete-btn text-red-500 hover:text-red-600 p-1 cursor-pointer"
      >
        <svg class='h-4' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
</svg>

      </button>
    </div>
  </div>
  
  <!-- Infos Catégorie | Date | Statut | Description-->
  <div class="px-4 pb-2 flex items-center text-xs text-gray-500 divide-x divide-gray-300 ">
	<div class="flex items-center px-2 col-span-2">
      <svg class='h-4 pr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
  <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
</svg>
 ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Aucune'}
    </div>
	<div class="flex items-center px-2 col-span-2">
      <svg class='h-4 pr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
</svg>

			<span> ${TaskManager.STATUS_LABELS[task.status]}</span>
    </div>
    <div class="flex items-center px-2 col-span-2">
      <strong><svg class='h-4 pr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path d="M5.566 4.657A4.505 4.505 0 0 1 6.75 4.5h10.5c.41 0 .806.055 1.183.157A3 3 0 0 0 15.75 3h-7.5a3 3 0 0 0-2.684 1.657ZM2.25 12a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3v-6ZM5.25 7.5c-.41 0-.806.055-1.184.157A3 3 0 0 1 6.75 6h10.5a3 3 0 0 1 2.683 1.657A4.505 4.505 0 0 0 18.75 7.5H5.25Z" />
</svg>
</strong> ${task.category}
    </div>
    <div class="flex items-center px-2 col-span-6">
      
    <svg class='h-4 pr-1' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clip-rule="evenodd" />
  <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
</svg> <p class="mt-2 text-gray-600 line-clamp-1"> ${
			task.description || '<em>(Aucune description)</em>'
		}
  </p>
    </div>
    
    
  </div>
	<div class=' border-b border-gray-100'></div>
`

		taskList.appendChild(li)
	})

	renderStats()
}

// Délégation "click" : Edit/Supprimer OU clic sur le <li> pour éditer
if (taskList) {
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
}

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
