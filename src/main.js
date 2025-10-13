import TaskManager from './taskManager.js'
import tasksData from './data/tasks.json'
import renderTasks from './ui.js'

if (!TaskManager.hasTasks()) {
	tasksData.forEach((task) => {
		TaskManager.addTask(
			task.title,
			task.description,
			task.category,
			task.dueDate
		)
	})
}

// Initialisation
renderTasks()

console.log("Tâches d'aujourd’hui :", TaskManager.filterTasksByPeriod('today'))
console.log('Tâches de demain :', TaskManager.filterTasksByPeriod('tomorrow'))
console.log(
	'Tâches de cette semaine :',
	TaskManager.filterTasksByPeriod('week')
)
console.log('Tâches de ce mois :', TaskManager.filterTasksByPeriod('month'))

console.log(
	'Tâches de catégorie Santé :',
	TaskManager.getTasksByCategory('Santé')
)
console.log(
	'Tâches de catégorie Étude :',
	TaskManager.getTasksByCategory('Étude')
)

console.log(TaskManager.getStats(TaskManager.getTasks()))
