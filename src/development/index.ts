// Import necessary modules
import connectToMongoDB from '../test/mongoMemoryReplSetConnector.js'

// Process environment variables
process.env.NODE_ENV = 'development'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'

async function startServer (): Promise<void> {
    try {
        // Connect to the MongoDB
        await connectToMongoDB()

        // Seed the database (if necessary)
        await import('./seedDatabase.js')

        // Start the application server
        await import('../app/index.js')

        console.log('Server started successfully')
    } catch (error) {
        console.error('Failed to start the server:', error)
    }
}

// Execute the server startup sequence
await startServer()
