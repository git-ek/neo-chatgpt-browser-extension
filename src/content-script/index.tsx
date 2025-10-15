import { render } from 'preact'
import '../base.css'
import { getUserConfig, Language, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTCard from './ChatGPTCard'
import { config, SearchEngine } from './search-engine-configs'
import { getPossibleElementByQuerySelector } from './utils'

function applyTheme(theme: Theme, container: HTMLElement) {
  if (theme === Theme.Dark) {
    container.classList.remove('gpt-light')
    container.classList.add('gpt-dark')
  } else {
    container.classList.remove('gpt-dark')
    container.classList.add('gpt-light')
  }
}

async function mount(question: string, siteConfig: SearchEngine) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()

  // Set initial theme
  let currentTheme: Theme
  if (userConfig.theme === Theme.Auto) {
    currentTheme = detectSystemColorScheme()
  } else {
    currentTheme = userConfig.theme
  }
  applyTheme(currentTheme, container)

  // Listen for theme changes
  if (userConfig.theme === Theme.Auto) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      applyTheme(e.matches ? Theme.Dark : Theme.Light, container)
    })
  }

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  render(
    <ChatGPTCard question={question} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

const siteRegex = new RegExp(Object.keys(config).join('|'))
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = config[siteName]

async function run() {
  const searchInput = getPossibleElementByQuerySelector<HTMLInputElement>(siteConfig.inputQuery)
  if (searchInput && searchInput.value) {
    console.debug('Mount ChatGPT on', siteName)
    const userConfig = await getUserConfig()
    const searchValueWithLanguageOption =
      userConfig.language === Language.Auto
        ? searchInput.value
        : `${searchInput.value}(in ${userConfig.language})`
    mount(searchValueWithLanguageOption, siteConfig)
  }
}

run()

if (siteConfig.watchRouteChange) {
  siteConfig.watchRouteChange(run)
}
