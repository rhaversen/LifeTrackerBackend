// Node.js built-in modules

// Third-party libraries
import nodeVault from 'node-vault'

// Own modules
import { shutDown } from '../index.js'
import logger from './logger.js'

const vaultAddr = process.env.VAULT_ADDR // Vault address
const token = process.env.VAULT_TOKEN // Vault token

const vault = nodeVault({
    apiVersion: 'v1',
    endpoint: vaultAddr,
    token
})

export default async function loadVaultSecrets (): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
        logger.info('Env is not production, not loading secrets from vault')
        return
    }

    try {
        // Reading the keys in backend directory
        const vaultMetadata = await vault.list('secret/metadata/life_tracker/backend')

        // KEEP UPDATED:
        // Expected production env keys:
        // 'BETTERSTACK_LOG_TOKEN', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'
        const keys = vaultMetadata.data.keys

        logger.debug('Reading vault keys: ' + keys.toString())

        // Load all keys
        for (const key of keys) {
            const secretPath = `secret/data/life_tracker/backend/${key}`
            logger.debug('Fetching secret key at path: ' + secretPath)

            const response = await vault.read(secretPath)
            const secretValue = response.data.data[key]

            // Save the key-value pair to runtime env
            process.env[key] = secretValue

            // Check if it is saved successfully
            if (process.env[key] === secretValue) {
                logger.debug('Saved to env: ' + key)
            } else {
                logger.error('Failed to save to env: ' + key)
            }
        }

        // Check if all required keys are loaded
        const missingKeys = []
        for (const key of keys) {
            if (process.env[key] === null || process.env[key] === undefined || process.env[key] === '') {
                missingKeys.push(key)
            }
        }
        if (missingKeys.length !== 0) {
            throw new Error('Keys failed to load to env: ' + missingKeys.toString())
        } else {
            logger.info('All secrets successfully loaded from vault!')
        }
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Failed to load secrets: ${err.message}`)
        } else {
            logger.error('Failed to load secrets: An unknown error occurred')
        }
        logger.error('Shutting down')
        shutDown()
    }
}
