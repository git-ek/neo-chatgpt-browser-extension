import { useCallback } from 'react'
import Browser from 'webextension-polyfill'
import logo from '../logo.png'

function App() {
  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  return (
    <div className="w-80 p-8 mx-auto my-8 bg-white rounded-2xl shadow-lg text-center text-gray-800">
      <img src={logo} className="w-8 h-8 rounded-lg mb-3 mx-auto" alt="Extension Logo" />
      <div className="font-bold text-lg mb-2">{Browser.i18n.getMessage('ext_popup_title')}</div>
      <button
        className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg mt-4 cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={openOptionsPage}
      >
        {Browser.i18n.getMessage('ext_popup_open_settings')}
      </button>
      <div className="mt-6 text-sm text-gray-500">
        {Browser.i18n.getMessage('ext_privacy_prefix')}{' '}
        <a
          href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-blue-600"
        >
          {Browser.i18n.getMessage('ext_privacy_link_text')}
        </a>
        .
      </div>
    </div>
  )
}

export default App
