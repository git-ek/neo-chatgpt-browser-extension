import { useCallback } from 'react'
import Browser from 'webextension-polyfill'
import logo from '../logo.png'

function App() {
  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center text-gray-800 dark:text-gray-200">
      <img src={logo} className="mb-3 h-12 w-12 rounded-lg" alt="Extension Logo" />
      <div className="mb-2 text-lg font-bold">{Browser.i18n.getMessage('ext_popup_title')}</div>
      <button
        className="mt-4 cursor-pointer rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        onClick={openOptionsPage}
      >
        {Browser.i18n.getMessage('ext_popup_open_settings')}
      </button>
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        {Browser.i18n.getMessage('ext_privacy_prefix')}{' '}
        <a
          href="https://github.com/git-ek/neo-chatgpt-browser-extension/blob/main/PRIVACY.md"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-blue-600 dark:hover:text-blue-400"
        >
          {Browser.i18n.getMessage('ext_privacy_link_text')}
        </a>
        .
      </div>
    </div>
  )
}

export default App
