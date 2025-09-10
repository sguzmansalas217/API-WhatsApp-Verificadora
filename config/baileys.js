import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys'
import P from 'pino'
import QRCode from 'qrcode'

let lastQR = null

// Guardar el socket global
let sockGlobal = null

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
  })

  sockGlobal = sock // Guardamos el socket global

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    // 👉 Guardar QR recibido
    if (qr) {
      lastQR = qr
      console.log('📲 Escanea el QR en http://localhost:3000/qr')
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        console.log('🔄 Reconectando WhatsApp...')
        connectToWhatsApp().then(sockNew => {
          sockGlobal = sockNew
        })
      } else {
        console.log('❌ WhatsApp desconectado: logged out')
      }
    } else if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp!')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  return sock
}

// Función para devolver el QR como imagen
export async function getQRImage() {
  if (!lastQR) return null
  return await QRCode.toDataURL(lastQR)
}

// Función para obtener siempre el socket actual
export function getSocket() {
  return sockGlobal
}
