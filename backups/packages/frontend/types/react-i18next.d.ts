declare module 'react-i18next' {
  import { TFunction } from 'i18next'

  export function useTranslation(namespace?: string): {
    t: TFunction
    i18n: any
    ready: boolean
  }

  export const Trans: React.ComponentType<any>
  export const Translation: React.ComponentType<any>
  export const I18nextProvider: React.ComponentType<any>
}


