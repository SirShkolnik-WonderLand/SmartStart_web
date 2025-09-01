// API utility for proxy calls
const API_BASE = '/api/proxy'

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function apiCallWithAuth(endpoint: string, token: string, options: RequestInit = {}) {
  // Token is handled by the proxy route via cookies
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
    },
  })
}
