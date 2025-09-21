// services/api.ts
export async function generateServer(prompt: string, model = 'gemini-1.5-flash') {
  const r = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, model })
  })
  if (!r.ok) {
    const err = await r.json().catch(() => ({}))
    throw new Error(err?.error || `HTTP ${r.status}`)
  }
  const data = await r.json()
  return data.text as string
}
