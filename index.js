import express from 'express'
import bodyParser from 'body-parser'

import { connectToWhatsApp, getQRImage } from './config/baileys.js'
import { setupSwagger } from './config/swagger.js'
import postWP from './routes/api.js'
import getQRWhatsappRoutes from './routes/GetQRWhatsapp.js'

const app = express()
const PORT = 3000

app.use(bodyParser.json())

// 🔹 Configuración de Swagger
setupSwagger(app, PORT)

// 🔹 QR en navegador (opcional)
app.get('/qr', async (req, res) => {
  const qr = await getQRImage()
  if (!qr) return res.send('<h2>⚠️ QR aún no disponible</h2>')
  res.send(`
    <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;">
        <h2>Escanea este QR con WhatsApp 📱</h2>
        <img src="${qr}" />
      </body>
    </html>
  `)
})

// 🔹 Función para iniciar servidor después de conectar WhatsApp
async function startServer() {
  console.log('🔄 Conectando a WhatsApp...')
  const sock = await connectToWhatsApp() // Esperamos que el socket esté listo

  // Montamos rutas
  app.use('/api', postWP(sock))                  // endpoints de envío de mensajes
  app.use('/GetQRWhatsapp', getQRWhatsappRoutes(sock)) // endpoint QR dinámico

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor API corriendo en http://34.44.122.144:${PORT}`)
    console.log(`📄 Documentación Swagger: http://34.44.122.144:${PORT}/api-docs`)
  })
}

// 🔹 Ejecutar la función
startServer()
