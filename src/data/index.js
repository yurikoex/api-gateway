import redis, { createClient } from 'redis'
import _ from 'lodash'

export const getDataInstance = ({ logger }) => new Promise((resolve, reject) => {

        logger.next(`connecting to redis`)
        const client = createClient(
                process.env.REDIS_PORT || '6379',
                process.env.REDIS_HOST || '127.0.0.1'
        )


        const getServices = () => new Promise((resolve, reject) => {
                logger.next(`getServices called`)
                client.hgetall("services", (err, replies) => {
                        if (err) {
                                logger.next([`getServices error`, err])
                                reject(err)
                        }
                        else {
                                replies !== null ?
                                        resolve(_.map(replies, (config, route) => ({ route, config: JSON.parse(config) }))) :
                                        resolve([])
                        }

                })
        })

        const registerService = ({ route, config }) => new Promise((resolve, reject) => {
                logger.next(`registerService called`)
                client.hset('services', route, JSON.stringify(config), (err) => {
                        if (err) {
                                logger.next([`registerService error`, err])
                                reject(err)
                        }
                        else {
                                resolve()
                        }

                })
        })


        client.once("ready", function(err) {
                logger.next(`redis ready`)
                resolve({
                        getServices,
                        registerService,
                        deleteService: () => {}
                })
        })

        client.on("error", function(err) {
                logger.next([`redis error`, err])
                process.exit(1)
        })
})
