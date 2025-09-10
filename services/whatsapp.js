import { downloadMediaMessage } from '@whiskeysockets/baileys'
import axios from 'axios'

export function listenMessages(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) return

      const from = msg.key.remoteJid
      const type = Object.keys(msg.message)[0]
      const content = msg.message[type]
      const timestamp = new Date(Number(msg.messageTimestamp) * 1000).toLocaleString()

      let text = ''
      let fileBuffer = null
      let filename = null
      let mimetype = null

      // 🔹 Texto puro
      if (type === 'conversation') {
        text = content || '[Texto vacío]'
      } else if (type === 'extendedTextMessage') {
        text = content.text || '[Texto vacío]'
      }
      // 🔹 Archivos + Caption
      else if (['imageMessage', 'videoMessage', 'documentMessage'].includes(type)) {
        const stream = await downloadMediaMessage(msg, 'buffer', {}, { logger: sock.logger })
        fileBuffer = stream
        filename = content.fileName || `${type}-${Date.now()}`
        mimetype = content.mimetype
        text = content.caption || `[${type}] recibido`
      }
      // 🔹 Audios
      else if (type === 'audioMessage') {
        const stream = await downloadMediaMessage(msg, 'buffer', {}, { logger: sock.logger })
        fileBuffer = stream
        filename = `${type}-${Date.now()}.ogg`
        mimetype = content.mimetype
        text = `[${type}] recibido`
      }
      // 🔹 No soportados
      else {
        text = `[${type}] no soportado`
      }

      console.log(`📩 De: ${from} | Tipo: ${type} | Texto: ${text}`)

    }
  })
}

export async function sendMessage(sock, to, message) {
  await sock.sendMessage(to, { text: message })
}
