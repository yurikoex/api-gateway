import { createSubject as Subject } from 'create-subject-with-filter'
import { forEach } from 'lodash'

import { createHttpServer } from './http-server'
import { createRegistrationApi } from './registration'
import { getDataInstance } from './data'
import { createEndpoints } from './endpoints'

import { name, version } from '../package.json'
process.title = `${name}@${version}`

const port = process.env.PORT || 8080

const logger = new Subject()

const setupLogger = logger => server => {
	logger.subscribe(arg => {
		const { message, data } = typeof arg == 'string' ? { message: arg } : Array.isArray(arg) ? { message: arg[0], data: arg[1] } : arg
		server.log(message, data)
	})
	return server
}

const setup = (logger, data, server, create) =>
	create({ logger, data })
		.then(routes => {
			forEach(routes, r => {
				logger.next([`registering route`, r])
				server.route(r)
			})
		})
		.then(() => ({
			data,
			server
		}))

const setupRegistrationApi = logger => ({ data, server }) => setup(logger, data, server, createRegistrationApi)

const setupEndpoints = logger => ({ data, server }) => setup(logger, data, server, createEndpoints)

const setupData = logger => server =>
	getDataInstance({ logger }).then(data => ({
		data,
		server
	}))

const startServer = logger => ({ server }) =>
	server.start(err => {
		if (err) {
			throw err
		}
		logger.next(`${process.title} started`)
		logger.next(`server up on ${port}`)
	})

// Startup sequence
createHttpServer({ logger, port })
	.then(setupLogger(logger))
	.then(setupData(logger))
	.then(setupEndpoints(logger))
	.then(setupRegistrationApi(logger))
	.then(startServer(logger))
	.catch(console.error)
