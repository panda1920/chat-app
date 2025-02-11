import { AsyncResource } from 'node:async_hooks'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { createRequestContext } from './context'
import { logger } from '../../app/logger'
import { contextStorage } from '../../app/storage'
import {
  type ConnectHandler,
  type Authorizer,
  type MessageHandler,
  type DisconnectHandler,
} from '../../app/types'
import { serializeMessage, type Message } from '../../domain/models/message'

function setupWebsocket(
  onMessage: MessageHandler,
  onConnect: ConnectHandler,
  onDisconnect: DisconnectHandler,
) {
  const wss = new WebSocketServer({
    noServer: true,
  })

  // websocket setting
  wss.on('connection', async (ws) => {
    ws.on('error', logger.error)

    logger.info('New websocket connection established')

    // a callback to send meessage back to connected websocket
    const returnMessage = AsyncResource.bind((message: Message) => {
      logger.info('Returning messsage to client')
      ws.send(serializeMessage(message))
    })
    onConnect(returnMessage)

    // incoming messages
    ws.on(
      'message',
      AsyncResource.bind(async (data) => {
        logger.info('New message arrived')
        await onMessage(data.toString())
      }),
    )

    ws.on(
      'close',
      AsyncResource.bind(async () => {
        logger.info('Closing websocket connection')
        await onDisconnect(returnMessage)
      }),
    )
  })

  return wss
}

function onSocketError(error: Error) {
  logger.error(error)
}

function setupHttp(wss: WebSocketServer, authorize: Authorizer) {
  const server = createServer((_, res) => {
    // basic http listener that returns error
    res.writeHead(400)
    res.end('This is a websocket server. Upgrade required.')
  })

  // http server setting
  server.on('upgrade', async (req, socket, head) => {
    // run all further code under the request context
    contextStorage.run(createRequestContext(req), async () => {
      socket.on('error', onSocketError)

      try {
        await authorize()
      } catch {
        logger.warn('Authorization failed')
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      socket.removeListener('error', onSocketError)

      wss.handleUpgrade(
        req,
        socket,
        head,
        // tell als to execute callback under the same context
        AsyncResource.bind((ws) => {
          wss.emit('connection', ws)
        }),
      )
    })
  })
  server.on('error', (err) => {
    logger.error(err)
  })

  return server
}

export function setupServer(config: {
  port: number
  authorize: Authorizer
  onMessage: MessageHandler
  onConnect: ConnectHandler
  onDisconnect: DisconnectHandler
}) {
  const wss = setupWebsocket(
    config.onMessage,
    config.onConnect,
    config.onDisconnect,
  )
  const server = setupHttp(wss, config.authorize)
  server.listen(config.port, '0.0.0.0', () =>
    logger.info(`Listening on port: ${config.port}`),
  )
}
