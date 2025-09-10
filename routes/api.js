import express from 'express'
import { sendMessage } from '../services/whatsapp.js'

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: Endpoints para enviar mensajes
 */

/**
 * @swagger
 * /api/send:
 *   post:
 *     summary: Envía un mensaje de WhatsApp a un número
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Número completo con código de país (ej. 5215555555555)
 *               message:
 *                 type: string
 *                 description: Texto a enviar
 *             required:
 *               - to
 *               - message
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 to:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Parámetros faltantes
 *       401:
 *         description: WhatsApp no está logueado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 qr_url:
 *                   type: string
 *       500:
 *         description: Error al enviar el mensaje
 */

export default function createRoutes(sock) {
  const router = express.Router()

  router.post('/send', async (req, res) => {
    const { to, message } = req.body

    if (!to || !message) {
      return res.status(400).json({ error: 'Faltan parámetros: to, message' })
    }

    // 🔹 Verificar que el socket de WhatsApp esté conectado y autenticado
    if (!sock || !sock.user) {
      return res.status(401).json({
        error: 'WhatsApp no está logueado',
        qr_url: 'http://0.0.0.0:3000/GetQRWhatsapp/qr' // endpoint para obtener QR
      })
    }

    try {
      await sendMessage(sock, `${to}@s.whatsapp.net`, message)
      res.json({ success: true, to, message })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}
