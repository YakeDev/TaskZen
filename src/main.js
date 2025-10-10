import TaskManager from './taskManager.js'
import tasksData from './data/tasks.json'

tasksData.forEach((task) => {
	TaskManager.addTask(task.title, task.description, task.category, task.dueDate)
})

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

console.log(TaskManager.getTasks())
