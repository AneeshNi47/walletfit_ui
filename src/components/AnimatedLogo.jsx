export default function AnimatedLogo({ size = 160, className = '', showWordmark = true, theme = 'dark' }) {
  const isDark = theme === 'dark'

  // Wings are white/transparent on dark backgrounds, sage/green on light backgrounds
  const wingFill = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(74,140,106,0.12)'
  const wingStroke = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(74,140,106,0.45)'
  const hindWingFill = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(74,140,106,0.08)'
  const hindWingStroke = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(74,140,106,0.3)'

  // Wordmark colors
  const fynStroke = isDark ? '#fdf6e8' : '#1a3a2a'
  const beeStroke = isDark ? '#e8a830' : '#c8852a'

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Animated Bee Mark */}
      <div style={{ animation: 'float 4s ease-in-out infinite' }}>
        <svg width={size} height={size} viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="aTopCoin" cx="38%" cy="32%" r="66%">
              <stop offset="0%" stopColor="#fce05a"/>
              <stop offset="45%" stopColor="#e8a830"/>
              <stop offset="100%" stopColor="#a85e12"/>
            </radialGradient>
            <radialGradient id="aBotCoin" cx="38%" cy="32%" r="66%">
              <stop offset="0%" stopColor="#f5c842"/>
              <stop offset="50%" stopColor="#d08828"/>
              <stop offset="100%" stopColor="#9a5610"/>
            </radialGradient>
            <linearGradient id="aEdgeShimmer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,220,100,0.5)"/>
              <stop offset="50%" stopColor="rgba(255,200,60,0.15)"/>
              <stop offset="100%" stopColor="rgba(160,80,16,0.3)"/>
            </linearGradient>
            <filter id="aGlow">
              <feGaussianBlur stdDeviation="1.2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Hexagon Frame */}
          <polygon
            points="48,4 88,26 88,70 48,92 8,70 8,26"
            fill="none"
            stroke="rgba(74,140,106,0.55)"
            strokeWidth="1.2"
            style={{ animation: 'hexPulse 4s ease-in-out infinite' }}
          />
          <polygon
            points="48,10 82,29 82,67 48,86 14,67 14,29"
            fill="rgba(30,107,74,0.06)"
            stroke="rgba(74,140,106,0.18)"
            strokeWidth="0.7"
          />

          {/* Antennae */}
          <line x1="42" y1="22" x2="34" y2="13" stroke="#4a8c6a" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="54" y1="22" x2="62" y2="13" stroke="#4a8c6a" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="33.5" cy="12.5" r="2.2" fill="#f5c842" filter="url(#aGlow)"/>
          <circle cx="62.5" cy="12.5" r="2.2" fill="#f5c842" filter="url(#aGlow)"/>

          {/* Wings */}
          <ellipse cx="26" cy="42" rx="14" ry="7"
            fill={wingFill} stroke={wingStroke} strokeWidth="1.1"
            transform="rotate(-22 26 42)"
            style={{ transformOrigin: '36px 42px', animation: 'wingL 2.2s ease-in-out infinite' }}
          />
          <ellipse cx="24" cy="54" rx="10" ry="5"
            fill={hindWingFill} stroke={hindWingStroke} strokeWidth="0.9"
            transform="rotate(-14 24 54)"
          />
          <ellipse cx="70" cy="42" rx="14" ry="7"
            fill={wingFill} stroke={wingStroke} strokeWidth="1.1"
            transform="rotate(22 70 42)"
            style={{ transformOrigin: '60px 42px', animation: 'wingR 2.2s ease-in-out infinite' }}
          />
          <ellipse cx="72" cy="54" rx="10" ry="5"
            fill={hindWingFill} stroke={hindWingStroke} strokeWidth="0.9"
            transform="rotate(14 72 54)"
          />

          {/* Top Coin (head) */}
          <circle cx="48" cy="35" r="14" fill="url(#aTopCoin)"/>
          <circle cx="48" cy="35" r="13.3" fill="none" stroke="url(#aEdgeShimmer)" strokeWidth="1.4" strokeDasharray="3 2"/>
          <circle cx="48" cy="35" r="9.5" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="0.7"/>
          <circle cx="48" cy="35" r="4.5" fill="rgba(160,80,16,0.22)"/>
          <ellipse cx="43" cy="29" rx="4.5" ry="2.5" fill="rgba(255,255,255,0.28)" transform="rotate(-35 43 29)"/>
          <ellipse cx="44" cy="30" rx="1.8" ry="1" fill="rgba(255,255,255,0.35)" transform="rotate(-35 44 30)"/>

          {/* Bottom Coin (abdomen) */}
          <circle cx="48" cy="63" r="19" fill="url(#aBotCoin)"/>
          <circle cx="48" cy="63" r="18.3" fill="none" stroke="url(#aEdgeShimmer)" strokeWidth="1.4" strokeDasharray="3 2"/>
          <circle cx="48" cy="63" r="13.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7"/>
          <path d="M30 57 Q48 52 66 57" stroke="rgba(15,35,15,0.30)" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M29 64 Q48 59 67 64" stroke="rgba(15,35,15,0.24)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M30 70 Q48 66 66 70" stroke="rgba(15,35,15,0.16)" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <ellipse cx="37" cy="54" rx="6" ry="3.5" fill="rgba(255,255,255,0.2)" transform="rotate(-35 37 54)"/>
          <ellipse cx="39" cy="56" rx="2.5" ry="1.4" fill="rgba(255,255,255,0.28)" transform="rotate(-35 39 56)"/>

          {/* Stinger */}
          <path d="M45.5 81 Q48 89 50.5 81 Q48 84.5 45.5 81Z" fill="url(#aBotCoin)" opacity="0.88"/>
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="animate-fade-in" style={{ marginTop: size * 0.15 }}>
          <svg width={size * 1.375} height={size * 0.3} viewBox="0 0 360 80" fill="none">
            <path d="M10 15 L10 65 M10 15 L46 15 M10 42 L38 42" stroke={fynStroke} strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M66 24 L84 58 M102 24 L84 58 L80 72" stroke={fynStroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M122 65 L122 24 Q140 24 162 46 L162 65" stroke={fynStroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M186 12 L186 65 M186 44 Q206 24 230 50 Q230 65 206 65 Q186 65 186 65" stroke={beeStroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M250 50 Q270 24 294 50 L250 50 Q254 65 270 65 Q284 65 292 56" stroke={beeStroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M314 50 Q334 24 358 50 L314 50 Q318 65 334 65 Q348 65 356 56" stroke={beeStroke} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  )
}
