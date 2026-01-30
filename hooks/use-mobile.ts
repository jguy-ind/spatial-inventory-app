import * as React from 'react'

// Tailwind default breakpoints (px)
const SM = 640
const MD = 768
const LG = 1024

export const MOBILE_BREAKPOINT = MD

export type Breakpoint = 'mobile' | 'tablet-portrait' | 'tablet-landscape' | 'desktop'

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = React.useState<Breakpoint>('desktop')

  React.useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < SM) setBp('mobile')
      else if (w < MD) setBp('tablet-portrait')
      else if (w < LG) setBp('tablet-landscape')
      else setBp('desktop')
    }
    const mqlSm = window.matchMedia(`(max-width: ${SM - 1}px)`)
    const mqlMd = window.matchMedia(`(max-width: ${MD - 1}px)`)
    const mqlLg = window.matchMedia(`(max-width: ${LG - 1}px)`)
    const onChange = () => update()
    mqlSm.addEventListener('change', onChange)
    mqlMd.addEventListener('change', onChange)
    mqlLg.addEventListener('change', onChange)
    update()
    return () => {
      mqlSm.removeEventListener('change', onChange)
      mqlMd.removeEventListener('change', onChange)
      mqlLg.removeEventListener('change', onChange)
    }
  }, [])

  return bp
}
