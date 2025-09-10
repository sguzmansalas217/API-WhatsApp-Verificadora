import express from 'express'
import { getQRImage } from '../config/baileys.js'  // función que devuelve QR dinámico

export default function(sock) {
  const router = express.Router()

  /**
   * @swagger
   * tags:
   *   name: WhatsApp
   *   description: Generación de QR para WhatsApp con Baileys
   */

  /**
   * @swagger
   * /GetQRWhatsapp/qr:
   *   get:
   *     summary: Obtiene el QR de WhatsApp si no hay sesión activa
   *     tags: [WhatsApp]
   *     responses:
   *       200:
   *         description: QR en base64
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 qr:
   *                   type: string
   *       401:
   *         description: WhatsApp ya está logeado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       500:
   *         description: Error al generar el QR
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   */
  router.get('/qr', async (req, res) => {
    try {
      if (sock && sock.user) {
        return res.status(401).json({ message: 'WhatsApp ya está logeado' })
      }

      const qr = await getQRImage()
      if (!qr) {
        return res.status(500).json({ error: 'QR no disponible todavía' })
      }

      res.json({ qr })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  return router
}
