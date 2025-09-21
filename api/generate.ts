// api/generate.ts  — chạy trên Vercel (Node serverless)
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    // Parse body an toàn cả khi là string
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const prompt: string = body?.prompt ?? ''

    const key = process.env.GOOGLE_API_KEY
    if (!key) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY on server' })

    // Chọn model bạn muốn (có thể đổi sang gemini-1.5-pro nếu cần)
    const model = body?.model || 'gemini-1.5-flash'

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt || 'Hello from Vercel!' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      }
    )

    if (!r.ok) {
      const txt = await r.text()
      return res.status(r.status).json({ error: `Upstream error ${r.status}`, details: txt })
    }

    const data = await r.json()
    // Trả về gọn: text đã kết hợp sẵn; vẫn giữ raw để bạn muốn dùng thêm
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ??
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      ''
    return res.status(200).json({ text, raw: data })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Server error' })
  }
}
