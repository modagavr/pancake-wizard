import { invoke } from '@tauri-apps/api'

interface ScoreResponse {
  data: [
    {
      d: [number]
    }
  ]
}

export const calculateIsBullish = async () => {
  const scoreResponse: ScoreResponse = JSON.parse(
    await invoke('get_technical_analysis_score')
  )

  return scoreResponse.data[0].d[0] > 0
}
