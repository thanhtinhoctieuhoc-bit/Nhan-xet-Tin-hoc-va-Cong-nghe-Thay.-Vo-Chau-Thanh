// App.tsx (ví dụ tối giản để bạn lắp vào chỗ xử lý submit)
import { useState } from 'react'
import { generateServer } from './services/api'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setAnswer('')
    try {
      const text = await generateServer(prompt) // gọi backend thay vì gọi thẳng Gemini
      setAnswer(text)
    } catch (err:any) {
      setError(err.message || 'Lỗi gọi API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui, Arial' }}>
      <h1>Nhận xét Tin học & Công nghệ</h1>
      <form onSubmit={onSubmit}>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} style={{width:'100%'}} />
        <br />
        <button type="submit" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo nhận xét'}</button>
      </form>
      {error && <p style={{color:'crimson'}}>Lỗi: {error}</p>}
      {answer && (
        <>
          <h3>Kết quả</h3>
          <div style={{whiteSpace:'pre-wrap', background:'#f5f5f5', padding:12, borderRadius:8}}>
            {answer}
          </div>
        </>
      )}
    </div>
  )
}
