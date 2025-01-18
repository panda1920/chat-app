import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({
  port: 3000,
})

wss.on('connection', (ws) => {
  ws.on('error', console.error)

  console.log('You have made a connection!')

  ws.on('message', (data) => {
    console.log(`You have received a following data!: ${data}`)
    ws.send('Thank you for the data :)')
  })
})

wss.on('listening', () => {
  console.log('listening...')
})
