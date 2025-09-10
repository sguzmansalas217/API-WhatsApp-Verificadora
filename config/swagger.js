import swaggerJsDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

export function setupSwagger(app, port) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API WhatsApp',
        version: '1.0.0',
        description: 'API para enviar mensajes y recibir mensajes de WhatsApp usando Baileys',
      },
      servers: [{ url: `http://34.44.122.144:${port}` }],
    },
    apis: ['./routes/*.js'], // Swagger lee todos los endpoints en routes
  }

  const swaggerDocs = swaggerJsDoc(swaggerOptions)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}