import { AsyncResource } from 'node:async_hooks'
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'
import { createRequestContext } from './context'
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
  wss.on('connection', async (ws, _req) => {
    ws.on('error', console.error)

    // a callback to send meessage to websocket
    const returnMessage = AsyncResource.bind((message: Message) => {
      ws.send(serializeMessage(message))
    })
    onConnect(returnMessage)

    // incoming messages
    ws.on(
      'message',
      AsyncResource.bind(async (data) => {
        await onMessage(data.toString())
      }),
    )

    ws.on(
      'close',
      AsyncResource.bind(async () => {
        console.log('closing connection!!!')
        await onDisconnect(returnMessage)
      }),
    )
  })

  return wss
}

function onSocketError(error: Error) {
  console.error(error)
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
          wss.emit('connection', ws, req)
        }),
      )
    })
  })
  server.on('error', (err) => {
    console.error(err)
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
    console.log(`Listening on port: ${config.port}`),
  )
}
