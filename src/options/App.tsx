import logo from '../logo.png'
import ProviderSelect from './ProviderSelect'

function OptionsPage() {
  // Provider/모델/API Key만 노출, 나머지 옵션/링크 제거
  return (
    <div
      style={{
        maxWidth: 420,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '32px',
        fontFamily: 'Inter, sans-serif',
        color: '#222',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <img src={logo} style={{ width: 40, height: 40, borderRadius: 10, marginRight: 16 }} />
        <span style={{ fontWeight: 700, fontSize: '1.2em' }}>Extension Settings</span>
      </div>
      <ProviderSelect />
      <div style={{ marginTop: 32, fontSize: '0.95em', color: '#888', textAlign: 'center' }}>
        For privacy & security details, see{' '}
        <a
          href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}

function App() {
  return <OptionsPage />
}

export default App
