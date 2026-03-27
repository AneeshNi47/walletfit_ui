import iconDark from '../assets/fynbee-icon-dark.svg'
import iconLight from '../assets/fynbee-icon-light.svg'
import lockupDark from '../assets/fynbee-lockup-dark.svg'
import lockupLight from '../assets/fynbee-lockup-light.svg'

const assets = {
  icon: { dark: iconDark, light: iconLight },
  lockup: { dark: lockupDark, light: lockupLight },
}

export default function Logo({ variant = 'lockup', theme = 'light', className = '', alt = 'FynBee' }) {
  const src = assets[variant]?.[theme] ?? assets.lockup.light
  return <img src={src} alt={alt} className={className} />
}
