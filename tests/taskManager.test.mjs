import assert from 'node:assert'

import TaskManager from '../src/taskManager.js'

TaskManager.resetAll()

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

const created = TaskManager.addTask(
	'Tâche test',
	'Vérification des statuts',
	'Travail',
	tomorrow,
	TaskManager.STATUS.IN_PROGRESS,
	[TaskManager.DEFAULT_PRIORITY_TAG]
)

assert.strictEqual(created.status, TaskManager.STATUS.IN_PROGRESS)
assert.ok(
	created.tags.includes(TaskManager.DEFAULT_PRIORITY_TAG),
	'Le tag Prioritaire doit être appliqué à la création.'
)

TaskManager.updateTask(created.id, { status: 'statut-invalide' })
const afterInvalidUpdate = TaskManager.getTasks().find((task) => task.id === created.id)
assert.strictEqual(
	afterInvalidUpdate.status,
	TaskManager.STATUS.IN_PROGRESS,
	'Un statut invalide ne doit pas être appliqué.'
)

const completed = TaskManager.toggleComplete(created.id)
assert.strictEqual(completed.status, TaskManager.STATUS.COMPLETED)
assert.strictEqual(completed.previousStatus, TaskManager.STATUS.IN_PROGRESS)

const reverted = TaskManager.toggleComplete(created.id)
assert.strictEqual(reverted.status, TaskManager.STATUS.IN_PROGRESS)
assert.strictEqual(reverted.previousStatus, null)

const snapshot = TaskManager.getTasks().find((task) => task.id === created.id)
assert.ok(snapshot, 'La tâche doit exister avant suppression.')

TaskManager.deleteTask(created.id)
assert.ok(
	!TaskManager.getTasks().some((task) => task.id === created.id),
	'La tâche supprimée ne doit plus être retournée.'
)

TaskManager.restoreTask(snapshot)
assert.ok(
	TaskManager.getTasks().some((task) => task.id === created.id),
	'La tâche restaurée doit réapparaître.'
)

const icon = TaskManager.getCategoryIcon('Travail')
assert.strictEqual(
	icon,
	TaskManager.CATEGORY_ICON_DEFAULTS.travail,
	'L’icône par défaut de Travail doit être appliquée.'
)

console.log('✓ TaskManager tests passed')

