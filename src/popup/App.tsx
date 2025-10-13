import { GearIcon, GlobeIcon } from '@primer/octicons-react'
import { useCallback } from 'react'
import useSWR from 'swr'
import Browser from 'webextension-polyfill'
import '../base.css'
import logo from '../logo.png'

const isChrome = /chrome/i.test(navigator.userAgent)

function App() {
  // 단일 기능(설정 진입)만 제공하는 심플 카드형 UI
  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])
  return (
    <div style={{
      maxWidth: 340,
      margin: '32px auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: '24px',
      fontFamily: 'Inter, sans-serif',
      color: '#222',
      textAlign: 'center',
    }}>
      <img src={logo} style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 12 }} />
      <div style={{ fontWeight: 700, fontSize: '1.1em', marginBottom: 8 }}>Neo ChatGPT Extension</div>
      <button
        style={{
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: '1em',
          cursor: 'pointer',
          marginTop: 16,
        }}
        onClick={openOptionsPage}
      >
        Open Settings
      </button>
      <div style={{ marginTop: 24, fontSize: '0.95em', color: '#888' }}>
        For privacy & security details, see <a href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">Privacy Policy</a>.
      </div>
    </div>
  )
}

export default App
