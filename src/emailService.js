// src/emailService.js
import emailjs from '@emailjs/browser'

export const sendNotification = async (templateData) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }
}
