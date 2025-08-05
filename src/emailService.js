// src/emailService.js
import emailjs from '@emailjs/browser'

export const sendNotification = async (templateId, templateData) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      templateId,
      templateData,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }
}
