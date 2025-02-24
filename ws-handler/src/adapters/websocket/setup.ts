import { AsyncResource } from 'node:async_hooks'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { createRequestContext } from './context'
import { ChatClientDto } from './dto'
import { wrapWithDefaults } from './handler-wrapper'
import { logger } from '../../app/logger'
import { contextStorage } from '../../app/storage'
import {
  type ConnectHandler,
  type RequestHandler,
  type MessageHandler,
  type DisconnectHandler,
  type MessageReturner,
} from '../../app/types'
import { type Message } from '../../domain/models/message'

export function setupServer(config: {
  port: number
  onRequest: RequestHandler
  onMessage: MessageHandler
  onConnect: ConnectHandler
  onDisconnect: DisconnectHandler
}) {
  const wss = setupWebsocket(
    config.onMessage,
    config.onConnect,
    config.onDisconnect,
  )
  const server = setupHttp(wss, config.onRequest)
  server.listen(config.port, '0.0.0.0', () =>
    logger.info(`Listening on port: ${config.port}`),
  )
}

function setupWebsocket(
  onMessage: MessageHandler,
  onConnect: ConnectHandler,
  onDisconnect: DisconnectHandler,
) {
  const wss = new WebSocketServer({
    noServer: true,
  })

  wss.on('connection', async (ws) => {
    logger.info('New websocket connection established')

    // a callback to send meessage back to connected websocket
    const returnMessage: MessageReturner = wrapWithDefaults(
      ws,
      async (message: Message) => {
        logger.info('Returning messsage to client')
        ws.send(JSON.stringify({ type: 'message', payload: message }))
      },
    )

    // do some subscription
    onConnect(returnMessage)

    // handle websocket errors
    ws.on(
      'error',
      wrapWithDefaults(ws, async (error) => {
        logger.error(error, 'Error encountered during websocket communication')
        ws.close()
      }),
    )

    // incoming messages
    ws.on(
      'message',
      wrapWithDefaults(ws, async (data) => {
        const dto = ChatClientDto.parse(JSON.parse(data.toString()))
        switch (dto.type) {
          case 'messageText':
            logger.info('New message has arrived')
            await onMessage(dto.payload.message)
            break
          case 'ping':
            logger.debug('ping')
            ws.send(JSON.stringify({ type: 'pong' }))
            break
        }
      }),
    )

    // on disconect
    ws.on(
      'close',
      wrapWithDefaults(ws, async () => {
        try {
          logger.info('Closing websocket connection')
          await onDisconnect(returnMessage)
        } catch (e) {
          // make sure no further error propagates
          // because that will trigger yet another close event
          logger.error(e, 'Error occured during disconnection')
        }
      }),
    )
  })

  return wss
}

function onSocketError(error: Error) {
  logger.error(error)
}

function setupHttp(wss: WebSocketServer, onRequest: RequestHandler) {
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
        await onRequest()
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
