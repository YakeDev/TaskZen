import assert from 'node:assert'

import { getPastDaysDiff, MS_IN_DAY } from '../src/utils/dateUtils.js'

const reference = new Date('2025-01-15T00:00:00.000Z')
const yesterday = new Date(reference.getTime() - MS_IN_DAY).toISOString()
const tomorrow = new Date(reference.getTime() + MS_IN_DAY).toISOString()

assert.strictEqual(
	getPastDaysDiff(yesterday, reference),
	1,
	'Une date dépassée d’un jour doit retourner 1.'
)
assert.strictEqual(
	getPastDaysDiff(tomorrow, reference),
	0,
	'Une date future ne doit pas être considérée comme dépassée.'
)
assert.strictEqual(getPastDaysDiff('', reference), 0, 'Une valeur vide retourne 0.')

console.log('✓ Date utils tests passed')

