// Node.js built-in modules

// Third-party libraries

// Own modules
import logger from '../utils/logger.js'

// Define a variable to hold the type of the database connection
let dbConnectionType: 'replicaSet' | 'production' | undefined

async function initializeDatabaseConnection (): Promise<void> {
    logger.info('Handling database connection...')
    if (process.env.NODE_ENV !== 'production') {
        logger.info('Connecting to non-production database...')
        await import('./replicaSetDatabaseConnector.js')
        dbConnectionType = 'replicaSet'
    } else {
        logger.info('Connecting to production database...')
        await import('./productionDatabaseConnector.js')
        dbConnectionType = 'production'
    }

    logger.info('Database connection initialized')
}

function isMemoryDatabase (): boolean {
    return dbConnectionType === 'replicaSet'
}

export { initializeDatabaseConnection, isMemoryDatabase }
