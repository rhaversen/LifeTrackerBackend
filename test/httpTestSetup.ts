// Node.js built-in modules

// Third-party libraries
import * as chai from 'chai'
import chaiHttp from 'chai-http'

// Own modules
import server from './testSetup.js'

// Using chaiHttp with chai
const chaiHttpObject = chai.use(chaiHttp)

let agent: ChaiHttp.Agent

beforeEach(async function () {
    agent = chaiHttpObject.request.agent(server.app) // Create an agent instance
})

afterEach(async function () {
    agent.close()
})

export default server
export { agent, chaiHttpObject }
