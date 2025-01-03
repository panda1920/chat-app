import { createHash } from 'node:crypto'
import { Params } from 'nestjs-pino'

// https://github.com/iamolegga/nestjs-pino
// https://github.com/pinojs/pino-http?tab=readme-ov-file#api
// https://github.com/pinojs/pino/blob/main/docs/api.md#options
export default {
  pinoHttp: {
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
