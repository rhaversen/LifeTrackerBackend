// Process environment variables
process.env.NODE_ENV = 'development'
process.env.SESSION_SECRET = 'TEST_SESSION_SECRET'

async function startServer (): Promise<void> {
    try {
        const connectToMongoDB = await import('../test/mongoMemoryReplSetConnector.js')
        // Connect to the MongoDB
        await connectToMongoDB.default()

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

export {}
