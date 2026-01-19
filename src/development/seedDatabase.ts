import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import TrackModel from '../app/models/Track.js'
import UserModel from '../app/models/User.js'
import logger from '../app/utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolve to src directory when running from dist
const srcDir = __dirname.replace(/dist[/\\]development$/, 'src/development')

logger.info('Seeding database')

const user = await UserModel.create({
	userName: 'Rhaversen',
	email: 'Rhaversen@gmail.com',
	password: 'password'
})
await user.save()

const seedsDir = path.join(srcDir, 'seeds')
const files = fs.readdirSync(seedsDir).filter(f => f.endsWith('.json'))

for (const file of files) {
	const trackName = path.basename(file, '.json')
	const filePath = path.join(seedsDir, file)
	const dates = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as string[]

	logger.info(`Seeding ${trackName} with ${dates.length} tracks`)

	const tracks = dates.map(date => ({
		trackName,
		date,
		userId: user._id
	}))

	await TrackModel.insertMany(tracks)
}

logger.info('Database seeded')
