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
    // TODO: maybe I should keep some connection state here, extracted from req
    ws.on('error', console.error)
    console.log('You have made a connection!')

    // a callback to send meessage to websocket
    const sendMessage = (message: Message) => {
      ws.send(serializeMessage(message))
    }
    // TODO: parse chatId from url
    onConnect('test_chat', sendMessage)

    // incoming messages
    ws.on('message', async (data) => {
      const dummyMessage = {
        from: 'test_user',
        chatId: 'test_chat',
        message: data.toString(),
        createdAt: 1767052800,
      } satisfies Message
      await onMessage(dummyMessage)
    })

    ws.on('close', async () => {
      console.log('closing connection!!!')
      await onDisconnect('test_chat', sendMessage)
    })
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

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req)
      })
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
