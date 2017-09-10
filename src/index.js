import { createSubject as Subject } from 'create-subject-with-filter'

import { createHttpServer } from './http-server'

import { name, version } from '../package.json'
process.title = `${name}@${version}`

const port = process.env.PORT || 8080

const logger = new Subject()

createHttpServer({ logger, port })
	.then(server => {
		logger.subscribe(arg => {
			const { message, data } =
				typeof arg == 'string' ? { message: arg } :
				Array.isArray(arg) ? { message: arg[0], data: arg[1] } :
				arg
			server.log(message, data)
		})
		return server
	})
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		logger.next(`${process.title} started`)
		logger.next(`server up on ${port}`)
	}))
	.catch(console.error)