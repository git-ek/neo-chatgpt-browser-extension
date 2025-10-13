declare module '*.png' {
  const value: string
  export = value
}

declare interface Window {
  dataLayer: unknown[]
}

declare interface Navigator {
  brave?: {
    isBrave: () => Promise<boolean>
  }
}
