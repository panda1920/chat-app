import { createHash } from 'node:crypto'
import { type Params } from 'nestjs-pino'

// https://github.com/iamolegga/nestjs-pino
// https://github.com/pinojs/pino-http?tab=readme-ov-file#api
// https://github.com/pinojs/pino/blob/main/docs/api.md#options
export default {
  pinoHttp: {
    // level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    level: 'debug',
    // transport: {
    //   options: {
    //     target:
    //     destination: 1,
    //   }
    // },
    genReqId: (req, _) => {
      const now = new Date().getTime()
      const path = req.url || ''
      const random = Math.random()

      return createHash('sha1')
        .update(now + path + random)
        .digest('hex')
        .substring(0, 16)
    },
  },
} satisfies Params
