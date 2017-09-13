export const createRegistrationApi = ({ logger, data }) => Promise.resolve([
    ({
        method: 'GET',
        path: `/api/services`,
        handler: (req, reply) => reply(data.getServices())
    }),
    ({
        method: 'POST',
        path: `/api/services/register`,
        config: {
            payload: {
                parse: true,
                allow: 'application/json'
            }
        },
        handler: ({ payload: { route, config } }, reply) => reply(data.registerService({ route, config }))
    })
])
