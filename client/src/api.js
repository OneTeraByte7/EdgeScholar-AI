import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3 minutes for AI responses (first load can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Upload document
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/upload/document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })

  return response.data
}

// Send chat message
export const sendChatMessage = async (message, options = {}) => {
  const {
    temperature = 0.7,
    maxTokens = 1024,
    stream = false,
  } = options

  const response = await api.post('/api/chat/query', {
    message,
    temperature,
    max_tokens: maxTokens,
    stream,
  }, {
    timeout: 300000, // 5 minutes for chat - first AI inference can be very slow
  })

  return response.data
}

// Search documents
export const searchDocuments = async (query, nResults = 5) => {
  const response = await api.post('/api/search/query', {
    query,
    n_results: nResults,
  })

  return response.data
}

// Health check
export const checkHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

// Chat health check
export const checkChatHealth = async () => {
  const response = await api.get('/api/chat/health')
  return response.data
}

export default api
