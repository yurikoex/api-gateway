import Wreck from 'wreck'

export const createEndpoints = ({ logger, data }) => {
        logger.next(`creating dynamic routes`)
        return data.getServices().then(services => {
                logger.next([`get services`, services])
                return services.map(service => {
                        logger.next([`creating service`, service])
                        return {
                                method: service.config.method,
                                path: service.route,
                                handler: {
                                        proxy: {
                                                mapUri: (req, cb) => {
                                                        logger.next([`h2o2 headers`, req.headers])
                                                        cb(null, service.config.uri)
                                                },
                                                onResponse: (err, res, req, reply, settings, ttl) => {
                                                        //console.log(JSON.stringify(res.body, null, '\t'))
                                                        //logger.next([`h2o2 response`, res])
                                                        if (err) {
                                                                logger.next([`h2o2 error`, err])
                                                                return reply(err)
                                                        }
                                                        else {
                                                                logger.next(`h2o2 successful`)
                                                                Wreck.read(res, { json: true }, function(err, payload) {
                                                                        console.log(`payload`, payload.toString())
                                                                        reply(payload.toString()) //.headers = res.headers;
                                                                });
                                                        }

                                                }
                                        }
                                }
                        }
                })
        })
}
