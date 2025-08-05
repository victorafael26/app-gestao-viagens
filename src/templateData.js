// src/templateData.js

// 🔹 Template para: VIAGEM LOTADA
export const buildLotadaTemplateData = ({
  destino,
  data_ida,
  data_volta,
  total_reservas,
  limite_passageiros,
}) => ({
  destino,
  data_ida,
  data_volta,
  total_reservas,
  limite_passageiros,
})

// 🔹 Template para: RESUMO DIÁRIO
export const buildResumoDiarioTemplateData = ({ resumo_viagens, data_atual }) => ({
  resumo_viagens,
  data_atual,
})
