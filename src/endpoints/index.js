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
							logger.next([
								`h2o2 headers`,
								req.headers
							])
							cb(
								null,
								service.config
									.uri,
								req.headers
							)
						},
						onResponse: (
							err,
							res,
							req,
							reply,
							settings,
							ttl
						) => {
							if (err) {
								logger.next([
									`h2o2 error`,
									err
								])
								return reply(
									err
								)
							} else {
								logger.next(
									`h2o2 successful`
								)
								Wreck.read(
									res,
									{
										json: true
									},
									function(
										err,
										payload
									) {
										reply(
											payload
										).headers =
											res.headers
									}
								)
							}
						}
					}
				}
			}
		})
	})
}
