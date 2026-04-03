import axios from 'axios'

import { getBackendBaseUrl } from './backend'

const API_URL = getBackendBaseUrl()

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

export function generateIdempotencyKey() {
  // lazy uuid generation to avoid bringing entire library to top
  // import when needed
  const { v4: uuidv4 } = require('uuid')
  return uuidv4()
}

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  else delete api.defaults.headers.common['Authorization']
}
