// src/App.jsx
import React from 'react'
import { sendNotification } from './emailService'
import {
  buildLotadaTemplateData,
  buildResumoDiarioTemplateData,
} from './templateData'

function App() {
  const enviarEmailLotada = () => {
    const data = buildLotadaTemplateData({
      destino: 'Gramado/RS',
      data_ida: '15/09/2025',
      data_volta: '18/09/2025',
      total_reservas: 25,
      limite_passageiros: 25,
    })

    sendNotification('template_lotada', data)
  }

  const enviarResumoDiario = () => {
    const data = buildResumoDiarioTemplateData({
      data_atual: '05/08/2025',
      resumo_viagens: `
• Viagem para Fortaleza/CE está com 10 passageiros.
• Viagem para Gramado/RS está com 22 passageiros.
      `,
    })

    sendNotification('template_resumo_diario', data)
  }

  return (
    <div>
      <h1>🚀 App Gestão de Viagens</h1>
      <p>Deploy com Supabase + Vercel funcionando!</p>

      <button onClick={enviarEmailLotada}>Enviar Email Lotada</button>
      <button onClick={enviarResumoDiario}>Enviar Resumo Diário</button>
    </div>
  )
}

export default App
