import { useState, useEffect, useRef, useCallback } from 'react'
import bittersweetLogo from './imports/bittersweet-logo.png'
import bittersweetHeader from './imports/mostlydanny-bittersweet-portfolio-header.png'
const pfpImg = '/pfp.png'

// ─── Theme ───────────────────────────────────────────────────────────────────

type ThemeId = 'mostly.blue' | 'mostly.night' | 'windows.classic'

interface Theme {
  id: ThemeId
  label: string
  desktop: string
  desktopOverlay: string[]
  taskbar: string
  taskbarBorder: string
  windowTitle: string
  windowTitleText: string
  windowBorder: string
  windowBody: string
  accent: string
  accentText: string
  textPrimary: string
  textSecondary: string
  textDim: string
  surface: string
  surfaceDeep: string
  gridLine: string
  startBtn: string
}

const THEMES: Record<ThemeId, Theme> = {
  'mostly.blue': {
    id: 'mostly.blue',
    label: 'mostly.blue',
    desktop: 'linear-gradient(160deg, #0d2137 0%, #091828 50%, #060f1a 100%)',
    desktopOverlay: [
      'radial-gradient(ellipse 60% 40% at 15% 25%, rgba(26,58,100,0.18) 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 35% at 85% 75%, rgba(10,36,80,0.14) 0%, transparent 55%)',
    ],
    taskbar: '#040c18',
    taskbarBorder: '#0d2040',
    windowTitle: 'linear-gradient(to bottom, #1a4a8a, #0a246a)',
    windowTitleText: '#c8d8f0',
    windowBorder: '#1a3a6a',
    windowBody: '#060f1e',
    accent: '#4a7aba',
    accentText: '#ffffff',
    textPrimary: '#c8d8f0',
    textSecondary: '#7ab0e0',
    textDim: '#3a6a9a',
    surface: '#0a1628',
    surfaceDeep: '#040c18',
    gridLine: 'rgba(26,58,106,0.4)',
    startBtn: 'linear-gradient(to bottom, #0a246a, #1a4a8a)',
  },
  'mostly.night': {
    id: 'mostly.night',
    label: 'mostly.night',
    desktop: 'linear-gradient(160deg, #0a0a1a 0%, #050510 50%, #020208 100%)',
    desktopOverlay: [
      'radial-gradient(ellipse 60% 40% at 15% 25%, rgba(80,20,120,0.15) 0%, transparent 60%)',
      'radial-gradient(ellipse 50% 35% at 85% 75%, rgba(40,10,80,0.12) 0%, transparent 55%)',
    ],
    taskbar: '#08050f',
    taskbarBorder: '#1a0a2a',
    windowTitle: 'linear-gradient(to bottom, #2a0a4a, #180630)',
    windowTitleText: '#ddc8f0',
    windowBorder: '#3a1a5a',
    windowBody: '#0e0618',
    accent: '#8a4aba',
    accentText: '#ffffff',
    textPrimary: '#ddc8f0',
    textSecondary: '#aa80d0',
    textDim: '#5a3a7a',
    surface: '#120820',
    surfaceDeep: '#08050f',
    gridLine: 'rgba(80,30,120,0.35)',
    startBtn: 'linear-gradient(to bottom, #2a0a4a, #3a1a6a)',
  },
  'windows.classic': {
    id: 'windows.classic',
    label: 'Windows Classic',
    desktop: '#008080',
    desktopOverlay: [],
    taskbar: '#c0c0c0',
    taskbarBorder: '#808080',
    windowTitle: 'linear-gradient(to right, #000080, #1084d0)',
    windowTitleText: '#ffffff',
    windowBorder: '#808080',
    windowBody: '#c0c0c0',
    accent: '#000080',
    accentText: '#ffffff',
    textPrimary: '#000000',
    textSecondary: '#222222',
    textDim: '#555555',
    surface: '#d4d0c8',
    surfaceDeep: '#c0c0c0',
    gridLine: 'rgba(0,0,0,0.1)',
    startBtn: 'linear-gradient(to bottom, #d4d0c8, #a8a8a8)',
  },
}

let _themeListeners: Array<(t: ThemeId) => void> = []
let _currentThemeId: ThemeId = 'mostly.blue'

function applyThemeVars(t: Theme) {
  const r = document.documentElement
  r.style.setProperty('--t-bg', t.surfaceDeep)
  r.style.setProperty('--t-surface', t.surface)
  r.style.setProperty('--t-accent', t.accent)
  r.style.setProperty('--t-accent-text', t.accentText)
  r.style.setProperty('--t-text', t.textPrimary)
  r.style.setProperty('--t-text2', t.textSecondary)
  r.style.setProperty('--t-dim', t.textDim)
  r.style.setProperty('--t-border', t.taskbarBorder)
  r.style.setProperty('--t-border2', t.windowBorder)
}

function setGlobalTheme(id: ThemeId) {
  _currentThemeId = id
  applyThemeVars(THEMES[id])
  _themeListeners.forEach(fn => fn(id))
}

// Seed CSS vars for initial theme
if (typeof document !== 'undefined') applyThemeVars(THEMES[_currentThemeId])

// ─── Accessibility ────────────────────────────────────────────────────────────

let _a11yListeners: Array<(s: A11yState) => void> = []
interface A11yState { largeUI: boolean; highContrast: boolean }
let _a11y: A11yState = { largeUI: false, highContrast: false }

function applyA11yVars(s: A11yState) {
  const r = document.documentElement
  r.style.setProperty('--ui-scale', s.largeUI ? '1.25' : '1')
  r.style.setProperty('--ui-font-size', s.largeUI ? '14px' : '12px')
  if (s.highContrast) {
    r.style.setProperty('--t-text', '#ffffff')
    r.style.setProperty('--t-text2', '#ffffff')
    r.style.setProperty('--t-dim', '#cccccc')
    r.style.setProperty('--t-bg', '#000000')
    r.style.setProperty('--t-surface', '#111111')
    r.style.setProperty('--t-border', '#ffffff')
    r.style.setProperty('--t-border2', '#ffffff')
  } else {
    applyThemeVars(THEMES[_currentThemeId])
  }
}

function setA11y(patch: Partial<A11yState>) {
  _a11y = { ..._a11y, ...patch }
  applyA11yVars(_a11y)
  _a11yListeners.forEach(fn => fn(_a11y))
}

function useA11y(): A11yState {
  const [s, setS] = useState<A11yState>(_a11y)
  useEffect(() => {
    _a11yListeners.push(setS)
    return () => { _a11yListeners = _a11yListeners.filter(fn => fn !== setS) }
  }, [])
  return s
}

function useTheme(): Theme {
  const [id, setId] = useState<ThemeId>(_currentThemeId)
  useEffect(() => {
    _themeListeners.push(setId)
    return () => { _themeListeners = _themeListeners.filter(fn => fn !== setId) }
  }, [])
  return THEMES[id]
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Win {
  id: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  contentType: string
  contentData?: Record<string, string>
  minWidth?: number
  minHeight?: number
}

type AppPhase = 'boot' | 'desktop' | 'shutdown' | 'restart' | 'logoff'

// ─── Snake Game ──────────────────────────────────────────────────────────────

const GRID = 20
const CELL = 16

function SnakeGame() {
  const [snake, setSnake] = useState([[10, 10], [10, 11]])
  const [food, setFood] = useState([5, 5])
  const [dir, setDir] = useState<[number, number]>([0, -1])
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() =>
    parseInt(localStorage.getItem('mostly-snake-hs') || '0')
  )
  const [dead, setDead] = useState(false)
  const dirRef = useRef(dir)
  dirRef.current = dir

  const spawnFood = useCallback((s: number[][]) => {
    let f: number[]
    do {
      f = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]
    } while (s.some(([x, y]) => x === f[0] && y === f[1]))
    return f
  }, [])

  const reset = () => {
    const s = [[10, 10], [10, 11]]
    setSnake(s)
    setFood(spawnFood(s))
    setDir([0, -1])
    dirRef.current = [0, -1]
    setScore(0)
    setDead(false)
    setRunning(true)
  }

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => {
      setSnake(prev => {
        const [dx, dy] = dirRef.current
        const head = [prev[0][0] + dx, prev[0][1] + dy]
        if (
          head[0] < 0 || head[0] >= GRID ||
          head[1] < 0 || head[1] >= GRID ||
          prev.some(([x, y]) => x === head[0] && y === head[1])
        ) {
          setRunning(false)
          setDead(true)
          return prev
        }
        const ate = head[0] === food[0] && head[1] === food[1]
        const next = [head, ...prev.slice(0, ate ? undefined : -1)]
        if (ate) {
          setScore(s => {
            const ns = s + 10
            setHighScore(h => {
              const nh = Math.max(h, ns)
              localStorage.setItem('mostly-snake-hs', String(nh))
              return nh
            })
            return ns
          })
          setFood(spawnFood(next))
        }
        return next
      })
    }, 120)
    return () => clearInterval(interval)
  }, [running, food, spawnFood])

  useEffect(() => {
    if (!running) return
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
      }
      const next = map[e.key]
      if (!next) return
      e.preventDefault()
      const [cx, cy] = dirRef.current
      if (next[0] === -cx && next[1] === -cy) return
      dirRef.current = next
      setDir(next)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [running])

  return (
    <div className="flex flex-col items-center gap-3 p-4 select-none"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="flex gap-8 text-sm" style={{ color: 'var(--t-text2)' }}>
        <span>SCORE: {score}</span>
        <span>BEST: {highScore}</span>
      </div>
      <div style={{
        position: 'relative',
        width: GRID * CELL, height: GRID * CELL,
        background: '#060d1a', border: '2px solid #1a3a6a',
        imageRendering: 'pixelated',
      }}>
        {Array.from({ length: GRID }).map((_, i) => (
          <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: i * CELL, height: 1, background: 'rgba(26,58,106,0.4)' }} />
        ))}
        {Array.from({ length: GRID }).map((_, i) => (
          <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: i * CELL, width: 1, background: 'rgba(26,58,106,0.4)' }} />
        ))}
        <div style={{
          position: 'absolute',
          left: food[0] * CELL + 2, top: food[1] * CELL + 2,
          width: CELL - 4, height: CELL - 4,
          background: '#ff3333', borderRadius: '50%', boxShadow: '0 0 4px #ff3333',
        }} />
        {snake.map(([x, y], i) => (
          <div key={`${x}-${y}-${i}`} style={{
            position: 'absolute',
            left: x * CELL + 1, top: y * CELL + 1,
            width: CELL - 2, height: CELL - 2,
            background: i === 0 ? '#33ff88' : '#1a7a44',
            boxShadow: i === 0 ? '0 0 3px #33ff88' : undefined,
          }} />
        ))}
        {!running && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12, background: 'rgba(0,0,0,0.8)',
          }}>
            <span style={{ color: dead ? '#ff4444' : '#33ff88', fontSize: 13, fontFamily: "'VT323', monospace", letterSpacing: 2 }}>
              {dead ? `GAME OVER  ${score} pts` : 'SNAKE.EXE'}
            </span>
            <button onClick={reset} style={{
              padding: '4px 20px', background: 'var(--t-border)', color: 'var(--t-text2)',
              border: '1px solid #2a5a9a', cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            }}>
              {dead ? 'RETRY' : 'START'}
            </button>
          </div>
        )}
      </div>
      {running && (
        <p style={{ fontSize: 11, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>Arrow keys / WASD</p>
      )}
    </div>
  )
}

// ─── Window Content Components ────────────────────────────────────────────────

function MyComputerContent() {
  const rows = [
    ['System', 'mostly.os'],
    ['User', 'Danny'],
    ['Role', 'Web Developer'],
    ['Location', 'Texas'],
    ['', ''],
    ['Currently', 'Watching F1 probably'],
    ['', ''],
    ['Interests', 'Web Design'],
    ['', 'Linux / Servers'],
    ['', 'Formula 1'],
    ['', 'Minecraft'],
  ]
  return (
    <div className="p-4 flex gap-4" style={{ fontFamily: 'system-ui', fontSize: 13, color: 'var(--t-text)' }}>
      <img src={pfpImg} alt="Danny — pixel art avatar"
        style={{ width: 80, height: 80, imageRendering: 'pixelated', flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--t-accent)', marginBottom: 10, letterSpacing: 2 }}>
          SYSTEM PROPERTIES
        </div>
        <table style={{ borderSpacing: '6px 2px', marginLeft: -6 }}>
          <tbody>
            {rows.map(([k, v], i) => (
              <tr key={i}>
                <td style={{ color: '#2a6a9a', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, paddingRight: 16, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{k}</td>
                <td style={{ color: 'var(--t-text)', fontSize: 12 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ProjectsContent({ openWindow }: { openWindow: (id: string) => void }) {
  const projects: { id: string; name: string; icon: string | null; imgIcon?: string; desc: string }[] = [
    { id: 'proj-astralis', name: 'Astralis Hosting', icon: '🌐', desc: 'Web hosting brand & infrastructure' },
    { id: 'proj-bittersweet', name: 'Bittersweet', icon: null, imgIcon: bittersweetLogo, desc: 'Minecraft server website' },
  ]
  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
      <div style={{ padding: '2px 8px', background: 'var(--t-bg)', borderBottom: '1px solid #1a3a5a', fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
        C:\Users\Danny\Projects\
      </div>
      <div style={{ padding: 8 }}>
        {projects.map(p => (
          <div key={p.id} onDoubleClick={() => openWindow(p.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', cursor: 'default', color: 'var(--t-text)', borderRadius: 2 }}
            className="hover:bg-[var(--t-border)]">
            {p.imgIcon
              ? <img src={p.imgIcon} alt={p.name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
              : <span style={{ fontSize: 18, flexShrink: 0 }}>{p.icon}</span>}
            <div>
              <div style={{ fontSize: 12 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t-dim)' }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BittersweetContent() {
  const theme = useTheme()
  const isClassic = theme.id === 'windows.classic'

  // Bittersweet purple tones shift with theme
  const tagBg = isClassic ? 'rgba(100,50,150,0.1)' : `color-mix(in srgb, ${theme.accent} 15%, transparent)`
  const tagBorder = isClassic ? 'rgba(100,50,150,0.5)' : `color-mix(in srgb, ${theme.accent} 50%, transparent)`
  const tagColor = isClassic ? '#6a2fa0' : '#b080e0'
  const btnBg = isClassic ? '#d4d0c8' : theme.surfaceDeep
  const btnBorderLight = isClassic ? '#ffffff' : '#9b59d0'
  const btnBorderDark = isClassic ? '#808080' : '#3a1a5a'
  const btnOutline = isClassic ? '#000' : '#0a0015'
  const btnColor = isClassic ? '#000' : '#d4a8ff'
  const btnShadowLight = isClassic ? '#fff' : '#6a3a9a'
  const btnShadowDark = isClassic ? '#808080' : '#0a0018'

  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 13, color: 'var(--t-text)', background: 'var(--t-bg)' }}>
      {/* Header — clickable */}
      <a href="https://play-bittersweet.net" target="_blank" rel="noreferrer" style={{ display: 'block', textDecoration: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
        <img src={bittersweetHeader} alt="Bittersweet header" style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover', objectPosition: 'top' }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,5,20,0.3) 0%, rgba(10,5,20,0.7) 100%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <img src={bittersweetLogo} alt="Bittersweet logo" style={{ width: 36, height: 36, objectFit: 'contain', marginBottom: 4 }} />
          <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 0.5, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Bittersweet</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>Minecraft Server</div>
        </div>
      </a>

      {/* Tags */}
      <div style={{ padding: '12px 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {['React', 'TypeScript', 'UI/UX Design', 'Responsive Design', 'SEO'].map(tag => (
          <span key={tag} style={{
            background: tagBg, border: `1px solid ${tagBorder}`,
            color: tagColor, padding: '2px 8px', fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace", borderRadius: 3,
          }}>{tag}</span>
        ))}
      </div>

      {/* Description */}
      <p style={{ padding: '0 14px 10px', fontSize: 12, color: 'var(--t-text2)', lineHeight: 1.7, margin: 0 }}>
        A custom Minecraft server website designed and developed for Bittersweet, featuring interactive role guides, responsive layouts, and community integrations.
      </p>

      {/* View Project button — Win2K retro style */}
      <div style={{ padding: '0 14px 14px' }}>
        <a href="https://play-bittersweet.net" target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', padding: '5px 0',
            background: btnBg,
            border: '2px solid',
            borderColor: `${btnBorderLight} ${btnBorderDark} ${btnBorderDark} ${btnBorderLight}`,
            outline: `1px solid ${btnOutline}`,
            color: btnColor, fontSize: 11, fontWeight: 400,
            cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: 0.5,
            boxShadow: `inset 1px 1px 0 ${btnShadowLight}, inset -1px -1px 0 ${btnShadowDark}`,
          }}
            onMouseDown={e => {
              const el = e.currentTarget
              el.style.borderColor = `${btnBorderDark} ${btnBorderLight} ${btnBorderLight} ${btnBorderDark}`
              el.style.boxShadow = `inset 1px 1px 0 ${btnShadowDark}, inset -1px -1px 0 ${btnShadowLight}`
            }}
            onMouseUp={e => {
              const el = e.currentTarget
              el.style.borderColor = `${btnBorderLight} ${btnBorderDark} ${btnBorderDark} ${btnBorderLight}`
              el.style.boxShadow = `inset 1px 1px 0 ${btnShadowLight}, inset -1px -1px 0 ${btnShadowDark}`
            }}
          >
            View Project
          </button>
        </a>
      </div>
    </div>
  )
}

const PROJECT_DETAILS: Record<string, { role: string; stack: string[]; desc: string }> = {
  'proj-astralis': {
    role: 'Founder · Designer · Developer · Infrastructure',
    stack: ['Next.js', 'Tailwind CSS', 'Proxmox', 'Linux', 'WHMCS'],
    desc: 'A web hosting brand built from the ground up — branding, website design, and server infrastructure. Handles real customers on managed VPS and shared plans.',
  },
  'proj-f1pi': {
    role: 'Builder · Designer',
    stack: ['Python', 'FastF1', 'Raspberry Pi', 'React', 'Node.js'],
    desc: 'A Raspberry Pi display that shows live Formula 1 race data — timing, standings, and session info — on a small screen in real-time.',
  },
  'proj-webdesign': {
    role: 'Designer · Developer',
    stack: ['Affinity', 'React', 'CSS', 'Tailwind'],
    desc: 'A collection of UI/UX design work spanning branding, web projects, and interface design experiments.',
  },
  'proj-minecraft': {
    role: 'Creator · Developer',
    stack: ['Java', 'Bedrock', 'Resource Packs', 'Add-ons'],
    desc: 'Custom Minecraft Bedrock content — texture packs, add-ons, and server-side modifications.',
  },
  'proj-experiments': {
    role: 'Explorer',
    stack: ['Various'],
    desc: 'A running collection of side projects, prototypes, and ideas that may or may not go anywhere.',
  },
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const d = PROJECT_DETAILS[projectId]
  if (!d) return <div style={{ padding: 16, color: 'var(--t-accent)', fontFamily: 'system-ui', fontSize: 13 }}>Not found.</div>
  return (
    <div style={{ padding: 16, color: 'var(--t-text)', fontFamily: 'system-ui', fontSize: 13, lineHeight: 1.7 }}>
      <p style={{ color: 'var(--t-text2)', marginBottom: 12, fontSize: 12 }}>{d.desc}</p>
      <div style={{ marginBottom: 10 }}>
        <span style={{ color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1 }}>ROLE  </span>
        <span style={{ fontSize: 12 }}>{d.role}</span>
      </div>
      <div>
        <div style={{ color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>STACK</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {d.stack.map(t => (
            <span key={t} style={{
              background: 'var(--t-surface)', border: '1px solid #1a3a5a',
              color: 'var(--t-text2)', padding: '2px 8px', fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function GamesContent({ openWindow }: { openWindow: (id: string) => void }) {
  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
      <div style={{ padding: '2px 8px', background: 'var(--t-bg)', borderBottom: '1px solid #1a3a5a', fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
        C:\Programs\Games\
      </div>
      <div style={{ padding: 8 }}>
        {[
          { id: 'snake', name: 'Snake.exe', icon: '🐍', desc: 'Arrow keys to move, eat the dots', enabled: true },
          { id: 'minesweeper', name: 'Minesweeper.exe', icon: '💣', desc: 'Coming soon...', enabled: false },
        ].map(g => (
          <div key={g.id} onDoubleClick={() => g.enabled && openWindow(g.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
              cursor: g.enabled ? 'default' : 'not-allowed',
              color: g.enabled ? 'var(--t-text)' : '#2a4a6a', borderRadius: 2,
            }}
            className={g.enabled ? 'hover:bg-[var(--t-border)]' : ''}>
            <span style={{ fontSize: 20 }}>{g.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{g.name}</div>
              <div style={{ fontSize: 11, color: g.enabled ? 'var(--t-dim)' : 'var(--t-border2)' }}>{g.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiscordCopyRow() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText('mostlydanny').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onMouseDown={copy}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
        marginBottom: 4, background: 'var(--t-bg)', color: 'var(--t-text2)',
        border: '1px solid #1a3a5a', width: '100%', cursor: 'pointer',
        textAlign: 'left',
      }}
      className="hover:bg-[var(--t-border)]">
      <span>🎮</span>
      <span style={{ color: 'var(--t-dim)', fontSize: 11, width: 50, fontFamily: "'JetBrains Mono', monospace" }}>Discord</span>
      <span style={{ fontSize: 12, flex: 1 }}>mostlydanny</span>
      <span style={{ fontSize: 10, color: copied ? '#44cc88' : 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
        {copied ? 'copied!' : 'click to copy'}
      </span>
    </button>
  )
}

function ContactContent() {
  return (
    <div style={{ padding: 16, fontFamily: 'system-ui', fontSize: 13, color: 'var(--t-text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: '1px solid #0d2040', marginBottom: 16 }}>
        <img src={pfpImg} alt="Danny" style={{ width: 40, height: 40, imageRendering: 'pixelated' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Danny</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
            <div style={{ width: 6, height: 6, background: '#33cc77', borderRadius: '50%' }} />
            <span style={{ color: '#33cc77' }}>Online</span>
          </div>
        </div>
      </div>
      <p style={{ color: 'var(--t-text2)', marginBottom: 14, fontSize: 12 }}>Have a project? Let's talk.</p>
      {[
        { icon: '📧', label: 'Email', href: 'mailto:hey@mostlydanny.dev', text: 'hey@mostlydanny.dev' },
        { icon: '🐙', label: 'GitHub', href: 'https://github.com/mostlydanny', text: '/mostlydanny' },
      ].map(({ icon, label, href, text }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
            marginBottom: 4, background: 'var(--t-bg)', color: 'var(--t-text2)',
            textDecoration: 'none', border: '1px solid #1a3a5a',
          }}
          className="hover:bg-[var(--t-border)]">
          <span>{icon}</span>
          <span style={{ color: 'var(--t-dim)', fontSize: 11, width: 50, fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
          <span style={{ fontSize: 12 }}>{text}</span>
        </a>
      ))}
      <DiscordCopyRow />
    </div>
  )
}

function RecycleBinContent({ openWindow }: { openWindow: (id: string) => void }) {
  const files = [
    { id: 'rb-portfolio', name: 'old_portfolio.zip', icon: '🗜️' },
    { id: 'rb-logo', name: 'logo_final_FINAL.svg', icon: '🎨' },
    { id: 'rb-bad', name: 'bad_idea.txt', icon: '📄' },
    { id: 'rb-mc', name: 'definitely_not_minecraft.jar', icon: '⛏️' },
  ]
  return (
    <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
      <div style={{ padding: '2px 8px', background: 'var(--t-bg)', borderBottom: '1px solid #1a3a5a', fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
        4 object(s)
      </div>
      <div style={{ padding: 8 }}>
        {files.map(f => (
          <div key={f.id} onDoubleClick={() => openWindow(f.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', cursor: 'default', color: 'var(--t-text)', borderRadius: 2 }}
            className="hover:bg-[var(--t-border)]">
            <span style={{ fontSize: 16 }}>{f.icon}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TextFileContent({ text }: { text: string }) {
  return (
    <div style={{ padding: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--t-text)', whiteSpace: 'pre-wrap', lineHeight: 1.7, minHeight: 80 }}>
      {text}
    </div>
  )
}

// ─── Search ───────────────────────────────────────────────────────────────────

interface SearchEntry {
  name: string
  category: string
  desc: string
  keywords: string[]
  windowId: string
  icon: string
}

const SEARCH_INDEX: SearchEntry[] = [
  { name: 'My Computer', icon: '🖥️', category: 'System', desc: 'System properties and information about Danny.', keywords: ['computer','system','about','danny','info','properties'], windowId: 'computer' },
  { name: 'Projects', icon: '📁', category: 'Applications', desc: 'Portfolio of projects and work.', keywords: ['projects','portfolio','work','folder','files'], windowId: 'projects' },
  { name: 'Astralis Hosting', icon: '🌐', category: 'Projects', desc: 'Web hosting brand and infrastructure.', keywords: ['astralis','hosting','web','server','infrastructure','brand'], windowId: 'proj-astralis' },
  { name: 'Games', icon: '🎮', category: 'Applications', desc: 'Games folder.', keywords: ['games','play','fun','arcade'], windowId: 'games' },
  { name: 'Snake.exe', icon: '🐍', category: 'Games', desc: 'Classic Snake game. Arrow keys to move.', keywords: ['snake','game','arcade','classic','exe','play'], windowId: 'snake' },
  { name: 'Calculator', icon: '🧮', category: 'Applications', desc: 'Standard calculator.', keywords: ['calculator','calc','math','numbers','add','multiply'], windowId: 'calculator' },
  { name: 'Internet Explorer', icon: '🌐', category: 'Applications', desc: 'Retro browser with favorites.', keywords: ['internet','explorer','browser','web','ie','online','favourites'], windowId: 'internet' },
  { name: 'Contact', icon: '📧', category: 'System', desc: 'Get in touch with Danny — email, GitHub, Discord.', keywords: ['contact','email','github','discord','message','hire','social'], windowId: 'contact' },
  { name: 'Control Panel', icon: '⚙️', category: 'System', desc: 'Settings — display, sounds, accessibility, system info.', keywords: ['settings','control','panel','preferences','display','sounds','accessibility','mouse','system'], windowId: 'settings' },
  { name: 'Recycle Bin', icon: '🗑️', category: 'System', desc: 'Deleted files.', keywords: ['recycle','bin','trash','deleted','files'], windowId: 'recycle' },
  { name: 'GitHub', icon: '🐙', category: 'Internet', desc: 'Danny\'s GitHub profile.', keywords: ['github','code','repos','open source','git'], windowId: 'internet' },
  { name: 'Formula 1', icon: '🏎️', category: 'Interests', desc: 'Danny watches a lot of F1.', keywords: ['formula','f1','racing','cars','sport','ferrari','verstappen'], windowId: 'computer' },
  { name: 'Linux', icon: '🐧', category: 'Interests', desc: 'Servers, terminal, the good stuff.', keywords: ['linux','server','terminal','bash','unix','penguin'], windowId: 'computer' },
  { name: '???', icon: '🕹️', category: 'Secret', desc: 'You found something.', keywords: ['konami','cheat','secret','easter','egg','hidden'], windowId: 'konami' },
]

function score(entry: SearchEntry, q: string): number {
  const query = q.toLowerCase().trim()
  if (!query) return 0
  const name = entry.name.toLowerCase()
  const cat = entry.category.toLowerCase()
  if (name === query) return 100
  if (name.startsWith(query)) return 80
  if (name.includes(query)) return 60
  if (entry.keywords.some(k => k === query)) return 70
  if (entry.keywords.some(k => k.includes(query) || query.includes(k))) return 40
  if (cat.includes(query)) return 30
  if (entry.desc.toLowerCase().includes(query)) return 20
  return 0
}

function SearchContent({ openWindow }: { openWindow: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const mono = { fontFamily: "'JetBrains Mono', monospace" }

  const results = submitted
    ? SEARCH_INDEX
        .map(e => ({ entry: e, s: score(e, submitted) }))
        .filter(r => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .map(r => r.entry)
    : []

  const search = () => setSubmitted(query.trim())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', ...mono, fontSize: 12 }}>
      {/* Search bar */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #0d2040', background: 'var(--t-bg)', flexShrink: 0 }}>
        <div style={{ fontSize: 10, color: 'var(--t-dim)', letterSpacing: 1, marginBottom: 6 }}>SEARCH MOSTLY.OS</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search for anything..."
            style={{
              flex: 1, background: 'var(--t-bg)', border: '1px solid #1a3a5a',
              color: 'var(--t-text)', padding: '5px 8px', outline: 'none',
              ...mono, fontSize: 12,
            }}
          />
          <button
            onMouseDown={search}
            style={{
              padding: '5px 14px', background: 'var(--t-accent)', border: '1px solid #1a3a5a',
              color: 'var(--t-text2)', cursor: 'pointer', ...mono, fontSize: 11,
            }}
          >
            🔎
          </button>
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {submitted && (
          <div style={{ padding: '6px 12px 4px', fontSize: 10, color: 'var(--t-dim)', borderBottom: '1px solid #0a1525' }}>
            {results.length === 0
              ? 'No results found.'
              : `${results.length} result${results.length !== 1 ? 's' : ''} found`}
          </div>
        )}
        {!submitted && (
          <div style={{ padding: 16, color: 'var(--t-dim)', fontSize: 11, lineHeight: 1.8 }}>
            Try searching:<br />
            <span style={{ color: 'var(--t-dim)' }}>projects · snake · calculator · contact · settings</span>
          </div>
        )}
        {results.map((entry, i) => (
          <div
            key={i}
            onDoubleClick={() => openWindow(entry.windowId)}
            style={{
              padding: '9px 12px', borderBottom: '1px solid #0a1525',
              cursor: 'default', color: 'var(--t-text)',
            }}
            className="hover:bg-[var(--t-border)]"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{entry.icon}</span>
              <div>
                <div style={{ fontSize: 12, color: 'var(--t-text)' }}>{entry.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t-dim)', marginTop: 1 }}>
                  {entry.category} — {entry.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
        {results.length > 0 && (
          <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--t-border2)' }}>
            Double-click a result to open it.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Internet Explorer ────────────────────────────────────────────────────────

function InternetContent() {
  const [url, setUrl] = useState('https://mostlydanny.dev')
  const [inputUrl, setInputUrl] = useState('https://mostlydanny.dev')

  const favs = [
    { icon: '⭐', label: 'GitHub', href: 'https://github.com/mostlydanny', display: 'github.com/mostlydanny' },
    { icon: '⭐', label: 'Astralis Hosting', href: 'https://astralis.host', display: 'astralis.host' },
    { icon: '⭐', label: 'Cool Websites', href: 'https://theuselessweb.com', display: 'theuselessweb.com' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'system-ui', fontSize: 13 }}>
      {/* Browser toolbar */}
      <div style={{ background: 'var(--t-bg)', borderBottom: '1px solid #0d2040', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        {/* Nav buttons */}
        {['←', '→', '↻'].map(btn => (
          <button key={btn} style={{
            width: 22, height: 20, background: 'var(--t-surface)',
            border: '1px solid #1a3a5a', color: 'var(--t-text2)',
            cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{btn}</button>
        ))}
        <div style={{ width: 1, height: 16, background: 'var(--t-border2)', margin: '0 2px' }} />
        {/* Address bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>Address:</span>
          <input
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setUrl(inputUrl)}
            style={{
              flex: 1, background: 'var(--t-surface)', border: '1px solid #1a3a5a',
              color: 'var(--t-text2)', padding: '2px 6px',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, outline: 'none',
            }}
          />
          <button onClick={() => setUrl(inputUrl)} style={{
            padding: '2px 8px', background: 'var(--t-surface)', border: '1px solid #1a3a5a',
            color: 'var(--t-text2)', cursor: 'pointer', fontSize: 11,
          }}>Go</button>
        </div>
      </div>

      {/* Status bar strip */}
      <div style={{ background: 'var(--t-bg)', borderBottom: '1px solid #0d1f35', padding: '1px 8px' }}>
        <span style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
          mostly.os Internet Explorer v1.0 — {url}
        </span>
      </div>

      {/* Favorites content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8, letterSpacing: 1 }}>
          FAVORITES
        </div>
        {favs.map(({ icon, label, href, display }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              marginBottom: 3, background: 'var(--t-bg)', color: 'var(--t-text2)',
              textDecoration: 'none', border: '1px solid #1a3a5a', fontSize: 12,
            }}
            className="hover:bg-[var(--t-border)]"
            onClick={() => setInputUrl(href)}>
            <span style={{ color: '#aa8830' }}>{icon}</span>
            <div style={{ flex: 1 }}>{label}</div>
            <span style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>{display}</span>
          </a>
        ))}

        <div style={{ marginTop: 16, padding: '8px 10px', background: 'var(--t-bg)', border: '1px solid #0d1f35' }}>
          <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>DANNY'S WEB — coming soon</div>
          <div style={{ fontSize: 11, color: 'var(--t-border2)' }}>Friends · Projects · Webrings · Guestbook</div>
        </div>
      </div>
    </div>
  )
}

// ─── Control Panel (Settings) ─────────────────────────────────────────────────

type ControlPanelSection = null | 'display' | 'sounds' | 'accessibility' | 'mouse' | 'system'

function ControlPanelContent() {
  const [section, setSection] = useState<ControlPanelSection>(null)
  const [uptime, setUptime] = useState(0)
  const th = useTheme()
  const a11y = useA11y()

  useEffect(() => {
    const start = Date.now()
    const iv = setInterval(() => setUptime(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(iv)
  }, [])

  const fmt = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0')
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  const panels = [
    { id: 'display' as ControlPanelSection, icon: '🖥️', label: 'Display', desc: 'Wallpaper and appearance' },
    { id: 'sounds' as ControlPanelSection, icon: '🔊', label: 'Sounds', desc: 'Interface sounds and volume' },
    { id: 'accessibility' as ControlPanelSection, icon: '♿', label: 'Accessibility', desc: 'Motion, contrast, text size' },
    { id: 'mouse' as ControlPanelSection, icon: '🖱️', label: 'Mouse', desc: 'Cursor and interaction' },
    { id: 'system' as ControlPanelSection, icon: 'ℹ️', label: 'System', desc: 'mostly.os information' },
  ]

  if (section === null) {
    return (
      <div style={{ fontFamily: 'system-ui', fontSize: 13 }}>
        <div style={{ padding: '2px 8px', background: 'var(--t-bg)', borderBottom: '1px solid #1a3a5a', fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace" }}>
          Control Panel
        </div>
        <div style={{ padding: 8 }}>
          {panels.map(p => (
            <div key={p.id as string} onDoubleClick={() => setSection(p.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', cursor: 'default', color: 'var(--t-text)', borderRadius: 2 }}
              className="hover:bg-[var(--t-border)]">
              <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 12 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: 'var(--t-dim)' }}>{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const back = (
    <button onClick={() => setSection(null)} style={{
      background: 'transparent', border: 'none', color: 'var(--t-accent)',
      cursor: 'pointer', fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      padding: '4px 0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4,
    }}>← Back</button>
  )

  if (section === 'display') {
    const themeOptions: ThemeId[] = ['mostly.blue', 'mostly.night', 'windows.classic']
    return (
      <div style={{ padding: 14, color: th.textPrimary, fontFamily: 'system-ui', fontSize: 13 }}>
        {back}
        <div style={{ fontSize: 10, color: th.textDim, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>THEME</div>
        {themeOptions.map(id => {
          const t = THEMES[id]
          const isActive = th.id === id
          return (
            <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', marginBottom: 6, background: isActive ? th.surface : 'transparent', border: `1px solid ${isActive ? th.accent : th.taskbarBorder}`, borderRadius: 4 }}
              onClick={() => setGlobalTheme(id)}>
              <input type="radio" name="theme" checked={isActive} onChange={() => setGlobalTheme(id)} style={{ accentColor: t.accent }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: isActive ? t.accent : th.textSecondary, fontWeight: isActive ? 700 : 400 }}>{t.label}</div>
              </div>
              <div style={{ display: 'flex', gap: 3 }}>
                {[t.accent, t.textPrimary, t.surface, t.taskbar].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, background: c, borderRadius: 2, border: '1px solid rgba(0,0,0,0.3)' }} />
                ))}
              </div>
              {isActive && <span style={{ fontSize: 9, color: '#2a6a4a', fontFamily: "'JetBrains Mono', monospace" }}>active</span>}
            </label>
          )
        })}
      </div>
    )
  }

  if (section === 'sounds') return (
    <div style={{ padding: 14, color: 'var(--t-text)', fontFamily: 'system-ui', fontSize: 13 }}>
      {back}
      <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>SOUND</div>
      {[['System sounds', false], ['Ambient audio', false]].map(([label, checked]) => (
        <label key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked={checked as boolean} style={{ accentColor: 'var(--t-accent)' }} />
          {label as string}
        </label>
      ))}
      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--t-dim)' }}>
        Note: browser autoplay policy restricts audio on first load.
      </div>
    </div>
  )

  if (section === 'accessibility') {
    return (
      <div style={{ padding: 14, color: 'var(--t-text)', fontFamily: 'system-ui', fontSize: 13 }}>
        {back}
        <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>ACCESSIBILITY</div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', marginBottom: 6, background: a11y.largeUI ? 'var(--t-surface)' : 'transparent', border: `1px solid ${a11y.largeUI ? 'var(--t-accent)' : 'var(--t-border)'}`, borderRadius: 4 }}>
          <input type="checkbox" checked={a11y.largeUI} onChange={e => setA11y({ largeUI: e.target.checked })} style={{ accentColor: 'var(--t-accent)', width: 14, height: 14 }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--t-text)' }}>Increase UI size</div>
            <div style={{ fontSize: 10, color: 'var(--t-dim)', marginTop: 2 }}>Scales text and spacing up by 25%</div>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', marginBottom: 6, background: a11y.highContrast ? 'var(--t-surface)' : 'transparent', border: `1px solid ${a11y.highContrast ? 'var(--t-accent)' : 'var(--t-border)'}`, borderRadius: 4 }}>
          <input type="checkbox" checked={a11y.highContrast} onChange={e => setA11y({ highContrast: e.target.checked })} style={{ accentColor: 'var(--t-accent)', width: 14, height: 14 }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--t-text)' }}>High contrast</div>
            <div style={{ fontSize: 10, color: 'var(--t-dim)', marginTop: 2 }}>Forces white text on black for maximum legibility</div>
          </div>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'default', opacity: 0.4, border: '1px solid var(--t-border)', borderRadius: 4 }}>
          <input type="checkbox" disabled style={{ width: 14, height: 14 }} />
          <div>
            <div style={{ fontSize: 12, color: 'var(--t-text)' }}>Reduce animations</div>
            <div style={{ fontSize: 10, color: 'var(--t-dim)', marginTop: 2 }}>Coming soon</div>
          </div>
        </label>
      </div>
    )
  }

  if (section === 'mouse') return (
    <div style={{ padding: 14, color: 'var(--t-text)', fontFamily: 'system-ui', fontSize: 13 }}>
      {back}
      <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1, marginBottom: 10 }}>MOUSE</div>
      <div style={{ color: '#5a7a9a', fontSize: 12 }}>Double-click speed: <span style={{ color: 'var(--t-text2)' }}>Normal</span></div>
      <div style={{ marginTop: 8, color: '#5a7a9a', fontSize: 12 }}>Cursor: <span style={{ color: 'var(--t-text2)' }}>Default</span></div>
    </div>
  )

  if (section === 'system') return (
    <div style={{ padding: 14, color: 'var(--t-text)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
      {back}
      <div style={{ color: 'var(--t-dim)', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>SYSTEM INFORMATION</div>
      {[
        ['OS', 'mostly.os'],
        ['Version', '1.0.0'],
        ['Build', '20260904'],
        ['Kernel', 'mostly'],
        ['Shell', 'mostly.shell'],
        ['', ''],
        ['CPU', 'Your Computer'],
        ['Memory', 'Probably enough'],
        ['Storage', '∞'],
        ['', ''],
        ['Uptime', fmt(uptime)],
      ].map(([k, v], i) => (
        <div key={i}>
          <span style={{ color: 'var(--t-dim)', display: 'inline-block', width: 80 }}>{k}</span>
          <span style={{ color: k === '' ? 'transparent' : 'var(--t-text)' }}>{v || '-'}</span>
        </div>
      ))}
      <div style={{ marginTop: 12, color: 'var(--t-dim)', fontSize: 10 }}>Built by Danny.</div>
    </div>
  )

  return null
}


// ─── Help ─────────────────────────────────────────────────────────────────────

// Module-level hook so HelpContent can activate What's This mode in App
let _activateWhatIsThis: (() => void) | null = null

const HELP_SECTIONS: Record<string, { title: string; icon: string; content: React.ReactNode }> = {
  welcome: {
    title: 'Welcome to mostly.os', icon: '👋',
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Welcome to <strong>mostly.os</strong> — a portfolio that decided it wanted to be an operating system.</p>
        <p style={{ marginBottom: 12 }}>You can open windows, drag them around, minimise them, and generally waste time in a more aesthetically interesting way than a regular portfolio page.</p>
        <p style={{ marginBottom: 12, color: 'var(--t-text2)' }}>Use the <strong>Start Menu</strong> in the bottom-left to navigate, or double-click icons on the desktop.</p>
        <div style={{ background: 'var(--t-bg)', border: '1px solid #1a3a5a', padding: 10, marginTop: 16 }}>
          <div style={{ fontSize: 10, color: 'var(--t-dim)', marginBottom: 6, letterSpacing: 1 }}>QUICK START</div>
          {[
            ['🖥️', 'My Computer', 'Info about Danny'],
            ['📁', 'Projects', "Danny's work"],
            ['🎮', 'Games', 'Play Snake'],
            ['📧', 'Contact', 'Get in touch'],
            ['🔎', 'Search', 'Find anything'],
          ].map(([icon, name, desc]) => (
            <div key={name} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
              <span>{icon}</span>
              <div><span style={{ color: 'var(--t-text)' }}>{name}</span><span style={{ color: 'var(--t-dim)' }}> — {desc}</span></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  desktop: {
    title: 'Using the Desktop', icon: '🖥️',
    content: (
      <div>
        <p style={{ marginBottom: 10 }}>The desktop is the main workspace. Here's how it works:</p>
        {[
          ['Double-click an icon', 'Opens the application or folder.'],
          ['Drag a window', 'Click and hold the title bar, then move.'],
          ['Resize a window', 'Drag the bottom-right corner.'],
          ['Minimise', 'Click the — button in the title bar.'],
          ['Maximise', 'Click the □ button to go fullscreen.'],
          ['Close', 'Click × to close the window.'],
          ['Taskbar', 'Click running apps to bring them forward or minimise them.'],
          ['Start Menu', "Bottom-left. Danny's version of a launchpad."],
          ['Clock', "Shows the time. Yes it's real."],
        ].map(([action, desc]) => (
          <div key={action as string} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #0a1525' }}>
            <div style={{ color: 'var(--t-text)', marginBottom: 2 }}>{action}</div>
            <div style={{ color: 'var(--t-dim)', fontSize: 11 }}>{desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  projects: {
    title: "Finding Danny's Work", icon: '📁',
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Open <strong>Projects</strong> from the desktop or Start → Documents.</p>
        <p style={{ marginBottom: 12, color: 'var(--t-text2)' }}>Double-click any project to see more detail.</p>
        {[
          ['🌐', 'Astralis Hosting', 'Web hosting brand and infrastructure.'],
        ].map(([icon, name, desc]) => (
          <div key={name as string} style={{ display: 'flex', gap: 8, marginBottom: 10, padding: 8, background: 'var(--t-bg)', border: '1px solid #0d2040' }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <div style={{ color: 'var(--t-text)' }}>{name}</div>
              <div style={{ color: 'var(--t-dim)', fontSize: 11 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  games: {
    title: 'Games', icon: '🎮',
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Open <strong>Games</strong> from the desktop. Currently installed:</p>
        <div style={{ padding: 10, background: 'var(--t-bg)', border: '1px solid #1a3a5a', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>🐍</span>
            <div>
              <div style={{ color: 'var(--t-text)' }}>Snake.exe</div>
              <div style={{ color: 'var(--t-dim)', fontSize: 11 }}>Classic snake. Eat dots. Don't hit yourself.</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--t-dim)', marginTop: 8 }}>
            <div>↑ ↓ ← → — Move</div>
            <div style={{ marginTop: 2 }}>Enter / Space — Start / Pause</div>
          </div>
        </div>
        <p style={{ color: 'var(--t-dim)', fontSize: 11 }}>More games may or may not appear in future updates.</p>
      </div>
    ),
  },
  internet: {
    title: 'Internet Explorer', icon: '🌐',
    content: (
      <div>
        <p style={{ marginBottom: 12 }}>Open <strong>Internet Explorer</strong> from Programs in the Start Menu.</p>
        <p style={{ marginBottom: 12 }}>This is not a real browser. It knows where Danny lives on the internet though.</p>
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'var(--t-text)', marginBottom: 4 }}>Favourites</div>
          {[
            ['⭐', 'GitHub', 'github.com/mostlydanny'],
            ['⭐', 'Astralis Hosting', 'astralis.host'],
            ['⭐', 'Cool Websites', 'theuselessweb.com'],
          ].map(([icon, name, url]) => (
            <div key={name as string} style={{ display: 'flex', gap: 6, marginBottom: 6, fontSize: 11, color: 'var(--t-dim)' }}>
              <span>{icon}</span><span style={{ color: 'var(--t-text2)' }}>{name}</span><span>— {url}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--t-dim)', fontSize: 11 }}>Click a favourite to open it in a new tab. Yes, a real tab.</p>
      </div>
    ),
  },
  whatisthis: {
    title: 'So... what is this?', icon: '🤔',
    content: (
      <div>
        <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--t-text)', lineHeight: 1.8 }}>
          <strong>mostly.os</strong> is Danny's portfolio pretending to be an operating system.
        </p>
        <p style={{ marginBottom: 12, color: 'var(--t-text2)', lineHeight: 1.8 }}>
          Instead of clicking through a bunch of boring portfolio pages, you're currently operating one.
        </p>
        <p style={{ marginBottom: 12, color: 'var(--t-text2)', lineHeight: 1.8 }}>
          Yes, this is unnecessarily complicated.
        </p>
        <p style={{ marginBottom: 16, color: 'var(--t-text2)', lineHeight: 1.8 }}>
          No, I'm not sorry.
        </p>
        <div style={{ borderTop: '1px solid #0d2040', paddingTop: 12 }}>
          <div style={{ color: 'var(--t-dim)', fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>TECHNICAL DETAILS</div>
          <div style={{ fontSize: 11, color: 'var(--t-dim)', lineHeight: 1.8 }}>
            Built with React + Vite + Tailwind CSS.<br />
            Running entirely in your browser.<br />
            No backend required to view Danny's work.<br />
            Yes, the windows are actually draggable.
          </div>
        </div>
      </div>
    ),
  },
  faq: {
    title: 'Frequently Asked Questions', icon: '❓',
    content: (
      <div>
        {[
          ["Why can't I shut down mostly.os?", "Because it's a website."],
          ['Where is the portfolio?', "You're looking at it."],
          ['Why did you make this?', 'Excellent question.'],
          ['Is there a secret somewhere?', '👀'],
          ['Can I hire Danny?', 'Open Contact. Or search for it.'],
          ['What OS is this based on?', "Windows 2000, approximately. It's vibes-based."],
          ['Why does the Recycle Bin have stuff in it?', "Danny didn't want to throw it away but also didn't want to keep it."],
          ['Is the clock real?', "Yes. It's that time."],
        ].map(([q, a]) => (
          <div key={q as string} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #0a1525' }}>
            <div style={{ color: 'var(--t-text)', marginBottom: 4 }}>Q: {q}</div>
            <div style={{ color: 'var(--t-dim)', fontSize: 11 }}>A: {a}</div>
          </div>
        ))}
      </div>
    ),
  },
}

function HelpContent() {
  const [section, setSection] = useState('welcome')
  const mono = { fontFamily: "'JetBrains Mono', monospace" }
  const current = HELP_SECTIONS[section]

  const navItems = [
    { id: 'welcome', icon: '👋', label: 'Welcome' },
    { id: 'desktop', icon: '🖥️', label: 'Desktop' },
    { id: 'projects', icon: '📁', label: 'My Work' },
    { id: 'games', icon: '🎮', label: 'Games' },
    { id: 'internet', icon: '🌐', label: 'Internet' },
    { id: 'faq', icon: '❓', label: 'FAQ' },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', ...mono }}>
      {/* Sidebar */}
      <div style={{
        width: 140, borderRight: '1px solid #0d2040', flexShrink: 0,
        background: 'var(--t-bg)', overflow: 'auto',
      }}>
        <div style={{ padding: '8px 10px 4px', fontSize: 9, color: 'var(--t-dim)', letterSpacing: 1 }}>CONTENTS</div>
        {navItems.map(item => (
          <div
            key={item.id}
            onMouseDown={() => setSection(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 10px', cursor: 'default', fontSize: 11,
              background: section === item.id ? 'var(--t-accent)' : 'transparent',
              color: section === item.id ? 'var(--t-text)' : 'var(--t-text2)',
              borderLeft: section === item.id ? '2px solid #4a7aba' : '2px solid transparent',
            }}
            className={section !== item.id ? 'hover:bg-[var(--t-border)]' : ''}
          >
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}

      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 14, fontSize: 12, color: 'var(--t-text2)', lineHeight: 1.7 }}>
        <div style={{ fontSize: 13, color: 'var(--t-text)', fontWeight: 700, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #0d2040' }}>
          {current.icon} {current.title}
        </div>
        {current.content}
      </div>
    </div>
  )
}

// ─── Calculator ──────────────────────────────────────────────────────────────

type CalcOp = '+' | '−' | '×' | '÷' | null

function CalculatorContent() {
  const [display, setDisplay] = useState('0')
  const [stored, setStored] = useState<number | null>(null)
  const [op, setOp] = useState<CalcOp>(null)
  const [fresh, setFresh] = useState(true) // next digit replaces display

  const compute = (a: number, o: CalcOp, b: number) => {
    switch (o) {
      case '+': return a + b
      case '−': return a - b
      case '×': return a * b
      case '÷': return b === 0 ? NaN : a / b
      default: return b
    }
  }

  const fmt = (n: number) => {
    if (isNaN(n)) return 'Error'
    const s = parseFloat(n.toPrecision(10)).toString()
    return s.length > 12 ? parseFloat(n.toPrecision(8)).toString() : s
  }

  const pressDigit = (d: string) => {
    if (display === 'Error') { setDisplay(d); setFresh(false); return }
    if (fresh) { setDisplay(d); setFresh(false) }
    else { setDisplay(prev => prev === '0' ? d : prev.length >= 12 ? prev : prev + d) }
  }

  const pressDot = () => {
    if (fresh) { setDisplay('0.'); setFresh(false); return }
    if (!display.includes('.')) setDisplay(prev => prev + '.')
  }

  const pressOp = (o: CalcOp) => {
    const cur = parseFloat(display)
    if (stored !== null && !fresh && op) {
      const result = compute(stored, op, cur)
      setDisplay(fmt(result))
      setStored(result)
    } else {
      setStored(cur)
    }
    setOp(o)
    setFresh(true)
  }

  const pressEquals = () => {
    if (stored === null || op === null) return
    const result = compute(stored, op, parseFloat(display))
    setDisplay(fmt(result))
    setStored(null)
    setOp(null)
    setFresh(true)
  }

  const pressPct = () => {
    const cur = parseFloat(display)
    if (stored !== null && op && (op === '+' || op === '−')) {
      setDisplay(fmt(stored * cur / 100))
    } else {
      setDisplay(fmt(cur / 100))
    }
    setFresh(true)
  }

  const pressSign = () => {
    if (display === '0' || display === 'Error') return
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev)
  }

  const pressCE = () => { setDisplay('0'); setFresh(true) }
  const pressC  = () => { setDisplay('0'); setStored(null); setOp(null); setFresh(true) }
  const pressBack = () => {
    if (fresh || display === 'Error') { setDisplay('0'); return }
    const next = display.length > 1 ? display.slice(0, -1) : '0'
    setDisplay(next)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') pressDigit(e.key)
      else if (e.key === '.') pressDot()
      else if (e.key === '+') pressOp('+')
      else if (e.key === '-') pressOp('−')
      else if (e.key === '*') pressOp('×')
      else if (e.key === '/') { e.preventDefault(); pressOp('÷') }
      else if (e.key === 'Enter' || e.key === '=') pressEquals()
      else if (e.key === 'Backspace') pressBack()
      else if (e.key === 'Escape') pressC()
      else if (e.key === '%') pressPct()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const btn = (
    label: string,
    action: () => void,
    opts: { wide?: boolean; color?: string; textColor?: string } = {}
  ) => (
    <button
      key={label}
      onMouseDown={(e) => { e.stopPropagation(); action() }}
      style={{
        gridColumn: opts.wide ? 'span 2' : undefined,
        padding: '10px 0',
        background: opts.color ?? '#0d1f38',
        color: opts.textColor ?? 'var(--t-text)',
        border: '1px solid #1a3a5a',
        fontSize: 14,
        cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace",
        transition: 'background 0.08s',
      }}
      className="hover:brightness-125"
    >
      {label}
    </button>
  )

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, userSelect: 'none' }}>
      {/* Display */}
      <div style={{
        background: 'var(--t-bg)',
        border: '1px solid #1a3a5a',
        padding: '8px 12px',
        textAlign: 'right',
      }}>
        <div style={{ fontSize: 10, color: 'var(--t-dim)', fontFamily: "'JetBrains Mono', monospace", minHeight: 14 }}>
          {stored !== null ? `${fmt(stored)} ${op ?? ''}` : ' '}
        </div>
        <div style={{
          fontSize: display.length > 10 ? 18 : 24,
          color: display === 'Error' ? '#ff5555' : 'var(--t-text2)',
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 1,
        }}>
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        {btn('%',   pressPct,  { color: '#091525', textColor: 'var(--t-text2)' })}
        {btn('CE',  pressCE,   { color: '#091525', textColor: 'var(--t-text2)' })}
        {btn('C',   pressC,    { color: '#091525', textColor: '#cc5555' })}
        {btn('⌫',  pressBack, { color: '#091525', textColor: '#cc5555' })}

        {btn('7', () => pressDigit('7'))}
        {btn('8', () => pressDigit('8'))}
        {btn('9', () => pressDigit('9'))}
        {btn('÷', () => pressOp('÷'),  { color: 'var(--t-surface)', textColor: 'var(--t-text2)' })}

        {btn('4', () => pressDigit('4'))}
        {btn('5', () => pressDigit('5'))}
        {btn('6', () => pressDigit('6'))}
        {btn('×', () => pressOp('×'),  { color: 'var(--t-surface)', textColor: 'var(--t-text2)' })}

        {btn('1', () => pressDigit('1'))}
        {btn('2', () => pressDigit('2'))}
        {btn('3', () => pressDigit('3'))}
        {btn('−', () => pressOp('−'),  { color: 'var(--t-surface)', textColor: 'var(--t-text2)' })}

        {btn('+/−', pressSign, { color: '#091525', textColor: 'var(--t-text2)' })}
        {btn('0', () => pressDigit('0'))}
        {btn('.', pressDot)}
        {btn('+', () => pressOp('+'),  { color: 'var(--t-surface)', textColor: 'var(--t-text2)' })}

        {btn('=', pressEquals, { wide: true, color: 'var(--t-accent)', textColor: '#fff' })}
      </div>
    </div>
  )
}

// ─── Boot Screen ─────────────────────────────────────────────────────────────

const BOOT_LINES = [
  { text: 'mostly.os  BIOS v1.4.02', bold: true, delay: 0 },
  { text: '', delay: 150 },
  { text: 'Checking memory....................  OK', ok: true, delay: 350 },
  { text: 'Detecting display..................  OK', ok: true, delay: 620 },
  { text: 'Loading kernel.....................  OK', ok: true, delay: 900 },
  { text: 'Mounting filesystem................  OK', ok: true, delay: 1180 },
  { text: 'Loading user profile...............  OK', ok: true, delay: 1450 },
  { text: 'Starting desktop environment.......  OK', ok: true, delay: 1720 },
  { text: '', delay: 1900 },
  { text: 'Welcome to mostly.os', bold: true, delay: 2000 },
]

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [phase, setPhase] = useState<'lines' | 'progress'>('lines')
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    BOOT_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay))
    })
    const last = BOOT_LINES[BOOT_LINES.length - 1].delay + 300
    timers.push(setTimeout(() => setPhase('progress'), last))
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase !== 'progress') return
    let p = 0
    const iv = setInterval(() => {
      p += Math.random() * 7 + 2
      if (p >= 100) {
        p = 100
        setProgress(100)
        clearInterval(iv)
        setTimeout(() => onCompleteRef.current(), 500)
      } else {
        setProgress(p)
      }
    }, 55)
    return () => clearInterval(iv)
  }, [phase])

  const filled = Math.round((progress / 100) * 44)
  const empty = 44 - filled

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 560, fontFamily: "'VT323', monospace", fontSize: 18, lineHeight: 1.6 }}>
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.bold ? '#ffffff' : '#aaaaaa' }}>
            {line.ok ? (
              <><span>{line.text.replace('  OK', '')}</span><span style={{ color: '#33cc77' }}>  OK</span></>
            ) : (
              line.text || '\u00a0'
            )}
          </div>
        ))}
        {phase === 'progress' && (
          <div style={{ marginTop: 20 }}>
            <div style={{ color: '#666', marginBottom: 4, fontSize: 16 }}>Loading mostly.os</div>
            <div style={{ color: '#aaa', fontFamily: "'JetBrains Mono', monospace", fontSize: 14 }}>
              <div>┌{'─'.repeat(46)}┐</div>
              <div>│<span style={{ color: '#4a9adf' }}>{'█'.repeat(filled)}</span>{' '.repeat(empty)}│</div>
              <div>└{'─'.repeat(46)}┘</div>
            </div>
            <div style={{ color: '#555', marginTop: 4, fontSize: 15 }}>{Math.round(progress)}%</div>
          </div>
        )}
      </div>
      <button onClick={onComplete} style={{
        position: 'absolute', bottom: 20, right: 24,
        background: 'transparent', color: '#333', border: '1px solid #222',
        padding: '3px 14px', cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      }}>Skip →</button>
    </div>
  )
}

// ─── Shutdown Dialog ──────────────────────────────────────────────────────────

function ShutdownDialog({ onAction, onCancel }: {
  onAction: (action: 'shutdown' | 'restart' | 'logoff') => void
  onCancel: () => void
}) {
  const [choice, setChoice] = useState<'shutdown' | 'restart' | 'logoff'>('shutdown')

  return (
    <div onMouseDown={(e) => e.stopPropagation()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 20000,
    }}>
      <div style={{
        background: 'var(--t-surface)', border: '1px solid #2a5a9a',
        width: 320, boxShadow: '4px 4px 0 #000',
        fontFamily: 'system-ui',
      }}>
        {/* Title bar */}
        <div style={{
          background: 'linear-gradient(to right, #0a246a, #2058a8)',
          padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>⏻</span>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>Shut Down mostly.os</span>
        </div>

        <div style={{ padding: '20px 20px 16px' }}>
          <p style={{ color: 'var(--t-text2)', fontSize: 13, marginBottom: 16 }}>
            What do you want the computer to do?
          </p>

          {(['shutdown', 'restart', 'logoff'] as const).map(opt => (
            <label key={opt} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0', cursor: 'pointer',
              color: choice === opt ? 'var(--t-text)' : '#5a7a9a', fontSize: 13,
            }}>
              <input
                type="radio"
                name="shutdown-choice"
                value={opt}
                checked={choice === opt}
                onChange={() => setChoice(opt)}
                style={{ accentColor: 'var(--t-accent)' }}
              />
              {opt === 'shutdown' && 'Shut down'}
              {opt === 'restart' && 'Restart'}
              {opt === 'logoff' && 'Log off'}
            </label>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button onMouseDown={() => onAction(choice)} style={{
              padding: '4px 24px', background: 'var(--t-border)',
              border: '1px solid #2a5a9a', color: 'var(--t-text)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
            }}>OK</button>
            <button onMouseDown={onCancel} style={{
              padding: '4px 16px', background: 'var(--t-bg)',
              border: '1px solid #1a3a5a', color: '#5a7a9a',
              cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shutdown Screen ──────────────────────────────────────────────────────────

const SHUTDOWN_LINES = [
  { text: 'Saving session...', delay: 400 },
  { text: 'Closing applications...', delay: 900 },
  { text: 'Stopping system...', delay: 1500 },
  { text: '', delay: 2000 },
  { text: 'System halted.', delay: 2100 },
]

function ShutdownScreen({ mode, onBoot }: {
  mode: 'shutdown' | 'restart'
  onBoot: () => void
}) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [showFinal, setShowFinal] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const onBootRef = useRef(onBoot)
  onBootRef.current = onBoot

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    SHUTDOWN_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => setVisibleLines(i + 1), line.delay))
    })
    timers.push(setTimeout(() => setShowFinal(true), 2600))
    if (mode === 'restart') {
      timers.push(setTimeout(() => onBootRef.current(), 4000))
    } else {
      timers.push(setTimeout(() => setShowButton(true), 4000))
    }
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'VT323', monospace", color: '#aaa',
    }}>
      <div style={{ width: 480, fontSize: 18, lineHeight: 1.8 }}>
        <div style={{ color: '#fff', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2 }}>
          mostly.os
        </div>

        {SHUTDOWN_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.text ? '#888' : 'transparent' }}>{line.text || '\u00a0'}</div>
        ))}

        {showFinal && mode === 'restart' && (
          <div style={{ marginTop: 24, color: 'var(--t-text2)', fontSize: 18 }}>
            Restarting...
          </div>
        )}

        {showFinal && mode === 'shutdown' && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 20, color: '#aaa', marginBottom: 24 }}>
              you can come back
            </div>
            <button
              onMouseDown={onBoot}
              style={{
                padding: '6px 28px',
                background: 'var(--t-surface)', border: '1px solid #2a5a9a',
                color: 'var(--t-text2)', cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                opacity: showButton ? 1 : 0,
                transition: 'opacity 0.4s',
              }}
            >
              [ Start mostly.os ]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Log Off Screen ───────────────────────────────────────────────────────────

function LogoffScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(160deg, #060f1e, #040810)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui',
    }}>
      <div style={{
        background: 'var(--t-surface)', border: '1px solid #1a3a5a',
        padding: '32px 48px', textAlign: 'center',
        boxShadow: '4px 4px 24px rgba(0,0,0,0.8)',
        minWidth: 280,
      }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: '#fff', marginBottom: 24, letterSpacing: 2 }}>
          mostly.os
        </div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <div style={{ color: 'var(--t-text2)', fontSize: 14, marginBottom: 24 }}>Guest</div>
        <button onClick={onLogin} style={{
          padding: '6px 32px', background: 'var(--t-border)',
          border: '1px solid #2a5a9a', color: 'var(--t-text)',
          cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui',
        }}>
          Log In
        </button>
      </div>
    </div>
  )
}

// ─── OS Window ───────────────────────────────────────────────────────────────

interface OSWindowProps {
  win: Win
  isActive: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onDragStart: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent) => void
  children: React.ReactNode
}

function OSWindow({ win, isActive, onFocus, onClose, onMinimize, onMaximize, onDragStart, onResizeStart, children }: OSWindowProps) {
  const theme = useTheme()
  if (win.minimized) return null

  const style: React.CSSProperties = win.maximized
    ? { position: 'absolute', inset: 0, width: undefined, height: undefined }
    : { position: 'absolute', left: win.x, top: win.y, width: win.width, height: win.height }

  const isClassic = theme.id === 'windows.classic'

  return (
    <div
      style={{
        ...style, zIndex: win.zIndex,
        display: 'flex', flexDirection: 'column',
        background: theme.windowBody,
        border: isActive ? `2px solid ${theme.accent}` : `1px solid ${theme.windowBorder}`,
        boxShadow: isActive ? '3px 3px 0 #000, 5px 5px 12px rgba(0,0,0,0.6)' : '1px 1px 4px rgba(0,0,0,0.4)',
        minWidth: win.minWidth || 200, minHeight: win.minHeight || 120,
      }}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        data-help={`${win.title} — Window title bar. Drag to move the window. Double-click to maximise. Use the — □ × buttons to minimise, maximise, or close.`}
        style={{
          background: isActive ? theme.windowTitle : (isClassic ? '#808080' : 'linear-gradient(to right, #1e1e2e, #2a2a3e)'),
          padding: '3px 6px', display: 'flex', alignItems: 'center',
          cursor: 'default', userSelect: 'none', flexShrink: 0, minHeight: 22,
        }}
        onMouseDown={(e) => { if ((e.target as HTMLElement).closest('button')) return; onDragStart(e) }}
        onDoubleClick={onMaximize}
      >
        <span style={{ fontSize: 12, marginRight: 5 }}>{win.icon}</span>
        <span style={{ color: isActive ? theme.windowTitleText : (isClassic ? '#ddd' : '#666'), fontSize: 11, flex: 1, fontFamily: 'system-ui', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {win.title}
        </span>
        <div style={{ display: 'flex', gap: 2, marginLeft: 4 }}>
          {[
            { sym: '─', action: onMinimize, bg: isClassic ? '#c0c0c0' : '#1a4a7a' },
            { sym: '□', action: onMaximize, bg: isClassic ? '#c0c0c0' : '#1a5a3a' },
            { sym: '✕', action: onClose, bg: isClassic ? '#c0c0c0' : '#7a1a1a' },
          ].map(({ sym, action, bg }) => (
            <button key={sym} onClick={(e) => { e.stopPropagation(); action() }} style={{
              width: 16, height: 14, background: bg,
              border: isClassic ? '2px outset #fff' : '1px solid rgba(255,255,255,0.15)',
              color: isClassic ? '#000' : '#ddd',
              fontSize: 9, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, fontFamily: 'system-ui', flexShrink: 0,
            }}>{sym}</button>
          ))}
        </div>
      </div>

      {/* Menu bar */}
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.windowBorder}`, display: 'flex', flexShrink: 0 }}>
        {['File', 'Edit', 'View', 'Help'].map(m => (
          <span key={m} style={{ padding: '2px 10px', fontSize: 11, color: theme.textDim, fontFamily: 'system-ui', cursor: 'default' }}>
            {m}
          </span>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>{children}</div>

      {/* Resize handle */}
      {!win.maximized && (
        <div
          style={{
            position: 'absolute', bottom: 0, right: 0, width: 14, height: 14,
            cursor: 'se-resize', background: `linear-gradient(135deg, transparent 50%, ${theme.accent} 50%)`,
          }}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e) }}
        />
      )}
    </div>
  )
}

// ─── Start Menu ──────────────────────────────────────────────────────────────

function StartMenu({ onClose, onOpen, onShutdown }: {
  onClose: () => void
  onOpen: (id: string) => void
  onShutdown: () => void
}) {
  const [programsOpen, setProgramsOpen] = useState(false)

  const programItems = [
    { icon: '🌐', label: 'Internet Explorer', id: 'internet' },
    { icon: '🎮', label: 'Games', id: 'games', arrow: true },
    { icon: '🧮', label: 'Calculator', id: 'calculator' },
  ]

  const mainItems = [
    { icon: '📁', label: 'Documents', id: 'projects', arrow: false },
    { icon: '⚙️', label: 'Settings', id: 'settings', arrow: false },
  ]

  return (
    <div data-startmenu onMouseDown={(e) => e.stopPropagation()} style={{
      position: 'absolute', bottom: 36, left: 0, width: 210,
      background: 'var(--t-surface)', border: '1px solid #1a3a5a', borderBottom: 'none',
      boxShadow: '4px 0 16px rgba(0,0,0,0.7)', zIndex: 10000, fontFamily: 'system-ui',
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--t-accent)',
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid var(--t-border2)',
      }}>
        <img src={pfpImg} alt="Danny" style={{ width: 30, height: 30, imageRendering: 'pixelated' }} />
        <div style={{ color: '#fff', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 1 }}>
          mostly.os
        </div>
      </div>

      {/* Programs item with flyout */}
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setProgramsOpen(true)}
        onMouseLeave={() => setProgramsOpen(false)}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
          cursor: 'default', color: programsOpen ? 'var(--t-text)' : '#9ab8d8', fontSize: 13,
          background: programsOpen ? 'var(--t-border)' : 'transparent',
          borderBottom: '1px solid var(--t-border)',
        }}>
          <span>📁</span>
          <span style={{ flex: 1 }}>Programs</span>
          <span style={{ fontSize: 10, color: 'var(--t-dim)' }}>▶</span>
        </div>

        {programsOpen && (
          <div style={{
            position: 'absolute', left: '100%', top: 0,
            width: 200, background: 'var(--t-surface)',
            border: '1px solid #1a3a5a',
            boxShadow: '4px 4px 12px rgba(0,0,0,0.6)',
            zIndex: 10001,
          }}>
            {programItems.map(item => (
              <div key={item.id}
                onMouseDown={(e) => { e.stopPropagation(); onOpen(item.id); onClose() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
                  cursor: 'default', color: 'var(--t-text)', fontSize: 13,
                  borderBottom: '1px solid var(--t-border)',
                }}
                className="hover:bg-[var(--t-border)]">
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.arrow && <span style={{ fontSize: 10, color: 'var(--t-dim)' }}>▶</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {mainItems.map(item => (
        <div key={item.id}
          onMouseDown={() => { onOpen(item.id); onClose() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
            cursor: 'default', color: 'var(--t-text2)', fontSize: 13, borderBottom: '1px solid var(--t-border)',
          }}
          className="hover:bg-[var(--t-border)] hover:text-[var(--t-text)]">
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}

      <div style={{ height: 1, background: 'var(--t-border2)', margin: '2px 0' }} />

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        cursor: 'default', color: 'var(--t-text2)', fontSize: 13, borderBottom: '1px solid var(--t-border)',
      }}
        className="hover:bg-[var(--t-border)] hover:text-[var(--t-text)]"
        onMouseDown={() => { onOpen('search'); onClose() }}>
        <span>🔍</span><span>Search</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        cursor: 'default', color: 'var(--t-text2)', fontSize: 13, borderBottom: '1px solid var(--t-border)',
      }}
        className="hover:bg-[var(--t-border)] hover:text-[var(--t-text)]"
        onMouseDown={() => { onOpen('help'); onClose() }}>
        <span>❓</span><span>Help</span>
      </div>

      <div style={{ height: 1, background: 'var(--t-border2)', margin: '2px 0' }} />

      <div onMouseDown={() => { onShutdown(); onClose() }} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
        cursor: 'default', color: '#cc4444', fontSize: 13,
      }}
        className="hover:bg-[#2a0a0a]">
        <span>⏻</span><span>Shut Down...</span>
      </div>
    </div>
  )
}

// ─── Desktop Icon ─────────────────────────────────────────────────────────────

function DesktopIcon({ icon, label, x, y, onDoubleClick, help }: {
  icon: string; label: string; x: number; y: number; onDoubleClick: () => void; help?: string
}) {
  const [sel, setSel] = useState(false)

  useEffect(() => {
    if (!sel) return
    const h = () => setSel(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [sel])

  return (
    <div
      data-help={help}
      style={{
        position: 'absolute', left: x, top: y, width: 72,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        cursor: 'default', userSelect: 'none', padding: 4,
        background: sel ? 'rgba(74,122,186,0.35)' : 'transparent',
      }}
      onMouseDown={(e) => { e.stopPropagation(); setSel(true) }}
      onDoubleClick={onDoubleClick}
    >
      <span style={{ fontSize: 28 }}>{icon}</span>
      <span style={{
        fontSize: 11, color: 'var(--t-text)', textAlign: 'center', fontFamily: 'system-ui',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        background: sel ? 'rgba(74,122,186,0.6)' : 'transparent',
        padding: '1px 3px', lineHeight: 1.3,
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

let zCounter = 100

const ICONS: Array<{ icon: string; label: string; x: number; y: number; id: string; help: string }> = [
  { icon: '🖥️', label: 'My Computer', x: 16, y: 16, id: 'mycomputer', help: "My Computer — Not actually your computer. Contains info about Danny: location, what he's working on, interests, and general system vibes." },
  { icon: '📁', label: 'Projects', x: 16, y: 106, id: 'projects', help: "Projects — Danny's portfolio folder. Double-click a project to open its detail window. Think of it as a file explorer for his work history." },
  { icon: '🎮', label: 'Games', x: 16, y: 196, id: 'games', help: "Games — It's a portfolio, but there are games in it. Because why not. Currently: Snake.exe." },
  { icon: '📧', label: 'Contact', x: 104, y: 50, id: 'contact', help: "Contact — How to reach Danny. Email, GitHub, Discord. He's real and he does respond." },
  { icon: '🌐', label: 'Internet', x: 104, y: 140, id: 'internet', help: "Internet — A retro browser window with Danny's favourite links. It won't load arbitrary websites but it will take you to the ones that matter." },
  { icon: '🗑️', label: 'Recycle Bin', x: 16, y: 430, id: 'recycle', help: "Recycle Bin — Contains files Danny deleted but couldn't quite let go of. Probably contains something stupid. You should look inside." },
]

const WINDOW_DEFS: Record<string, Partial<Win>> = {
  mycomputer:  { title: 'My Computer', icon: '🖥️', width: 400, height: 260, contentType: 'mycomputer' },
  projects:    { title: 'Projects', icon: '📁', width: 360, height: 310, contentType: 'projects' },
  games:       { title: 'Games', icon: '🎮', width: 300, height: 190, contentType: 'games' },
  snake:       { title: 'Snake.exe', icon: '🐍', width: 370, height: 430, minWidth: 370, minHeight: 380, contentType: 'snake' },
  contact:     { title: 'Contact', icon: '📧', width: 340, height: 270, contentType: 'contact' },
  recycle:     { title: 'Recycle Bin', icon: '🗑️', width: 320, height: 240, contentType: 'recycle' },
  internet:    { title: 'Internet Explorer', icon: '🌐', width: 380, height: 340, contentType: 'internet' },
  settings:    { title: 'Control Panel', icon: '⚙️', width: 320, height: 310, contentType: 'settings' },
  calculator:  { title: 'Calculator', icon: '🧮', width: 240, height: 340, minWidth: 240, minHeight: 340, contentType: 'calculator' },
  search:      { title: 'Search Results', icon: '🔎', width: 380, height: 380, minWidth: 300, minHeight: 280, contentType: 'search' },
  help:        { title: 'mostly.os Help', icon: '❓', width: 500, height: 400, minWidth: 380, minHeight: 300, contentType: 'help' },
  konami:      { title: '???', icon: '🎉', width: 300, height: 180, contentType: 'konami' },
  'rb-portfolio': { title: 'old_portfolio.zip', icon: '🗜️', width: 300, height: 150, contentType: 'textfile', contentData: { text: 'Error: Cannot open corrupted archive.\n\nNote to self: never look at this again.' } },
  'rb-logo':   { title: 'logo_final_FINAL.svg', icon: '🎨', width: 300, height: 170, contentType: 'textfile', contentData: { text: 'v1: bad\nv2: worse\nv3: terrible\nv4: why\nv5: logo_final_FINAL.svg' } },
  'rb-bad':    { title: 'bad_idea.txt', icon: '📄', width: 320, height: 170, contentType: 'textfile', contentData: { text: 'This was definitely going to be\nthe next big thing.\n\n// TODO: tell nobody about this' } },
  'rb-mc':     { title: 'definitely_not_minecraft.jar', icon: '⛏️', width: 340, height: 150, contentType: 'textfile', contentData: { text: "It's literally Minecraft.\nI don't know why I named it this." } },
  'proj-astralis':    { title: 'Astralis Hosting', icon: '🌐', width: 360, height: 260, contentType: 'projdetail', contentData: { projectId: 'proj-astralis' } },
  'proj-bittersweet': { title: 'Bittersweet', icon: '🍇', width: 380, height: 320, minHeight: 280, contentType: 'bittersweet' },
  'proj-f1pi':        { title: 'F1PI', icon: '🏎️', width: 360, height: 260, contentType: 'projdetail', contentData: { projectId: 'proj-f1pi' } },
  'proj-webdesign':   { title: 'Web Design', icon: '🎨', width: 360, height: 260, contentType: 'projdetail', contentData: { projectId: 'proj-webdesign' } },
  'proj-minecraft':   { title: 'Minecraft', icon: '⛏️', width: 360, height: 260, contentType: 'projdetail', contentData: { projectId: 'proj-minecraft' } },
  'proj-experiments': { title: 'Experiments', icon: '🧪', width: 360, height: 260, contentType: 'projdetail', contentData: { projectId: 'proj-experiments' } },
}

// ─── Mobile ───────────────────────────────────────────────────────────────────

function useMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

function MobileApp() {
  const theme = useTheme()
  const [activeSection, setActiveSection] = useState<'home' | 'projects' | 'contact'>('home')
  const [expandedProject, setExpandedProject] = useState<string | null>('proj-bittersweet')

  const projects = [
    {
      id: 'proj-bittersweet',
      name: 'Bittersweet',
      imgIcon: bittersweetLogo,
      desc: 'Minecraft server website',
      href: 'https://play-bittersweet.net',
      tags: ['React', 'TypeScript', 'UI/UX Design', 'Responsive Design', 'SEO'],
      detail: 'A custom Minecraft server website designed and developed for Bittersweet, featuring interactive role guides, responsive layouts, and community integrations.',
      headerImg: bittersweetHeader,
      accentColor: '#8a4aba',
    },
    {
      id: 'proj-astralis',
      name: 'Astralis Hosting',
      icon: '🌐',
      desc: 'Web hosting brand & infrastructure',
      href: 'https://astralis.host',
      tags: ['Next.js', 'Tailwind CSS', 'Proxmox', 'Linux', 'WHMCS'],
      detail: 'A web hosting brand built from the ground up — branding, website design, and server infrastructure. Handles real customers on managed VPS and shared plans.',
      accentColor: theme.accent,
    },
  ]

  const mono = { fontFamily: "'JetBrains Mono', monospace" }
  const isClassic = theme.id === 'windows.classic'

  return (
    <div style={{
      position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden',
      background: theme.desktop, color: 'var(--t-text)',
      fontFamily: 'system-ui', display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: theme.taskbar, borderBottom: `1px solid ${theme.taskbarBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={pfpImg} alt="Danny" style={{ width: 28, height: 28, imageRendering: 'pixelated' }} />
          <span style={{ ...mono, fontSize: 14, fontWeight: 700, color: 'var(--t-text)' }}>mostly.os</span>
        </div>
        <span style={{ ...mono, fontSize: 10, color: 'var(--t-dim)' }}>Danny's Portfolio</span>
      </div>

      {/* Nav tabs */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${theme.taskbarBorder}`,
        background: theme.surfaceDeep,
      }}>
        {(['home', 'projects', 'contact'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveSection(tab)} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
            background: activeSection === tab ? theme.surface : 'transparent',
            borderBottom: activeSection === tab ? `2px solid ${theme.accent}` : '2px solid transparent',
            color: activeSection === tab ? 'var(--t-text)' : 'var(--t-dim)',
            fontSize: 12, fontWeight: activeSection === tab ? 600 : 400,
            fontFamily: 'system-ui', textTransform: 'capitalize',
          }}>
            {tab === 'home' ? '🖥️ Home' : tab === 'projects' ? '📁 Projects' : '📧 Contact'}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1 }}>
      {/* ── HOME ── */}
      {activeSection === 'home' && (
        <div style={{ padding: 20 }}>
          <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', letterSpacing: 1, marginBottom: 14 }}>C:\Users\Danny\Home\</div>
          {/* Hero */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
            padding: 16, background: theme.surface, border: `1px solid ${theme.taskbarBorder}`,
            borderRadius: isClassic ? 0 : 8,
          }}>
            <img src={pfpImg} alt="Danny" style={{ width: 64, height: 64, imageRendering: 'pixelated', flexShrink: 0 }} />
            <div>
              <div style={{ ...mono, fontSize: 10, color: 'var(--t-accent)', letterSpacing: 2, marginBottom: 4 }}>SYSTEM PROPERTIES</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Danny</div>
              <div style={{ fontSize: 12, color: 'var(--t-text2)' }}>Web Developer · Texas</div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ marginBottom: 24, padding: 16, background: theme.surface, border: `1px solid ${theme.taskbarBorder}`, borderRadius: isClassic ? 0 : 8 }}>
            {[
              ['OS', 'mostly.os'],
              ['Currently', 'Watching F1 probably'],
              ['Interests', 'Web Design, Linux, F1, Minecraft'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 13 }}>
                <span style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', width: 80, flexShrink: 0, paddingTop: 2 }}>{k}</span>
                <span style={{ color: 'var(--t-text2)' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Featured project */}
          <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', letterSpacing: 1, marginBottom: 10 }}>FEATURED PROJECT</div>
          <div style={{ borderRadius: isClassic ? 0 : 8, overflow: 'hidden', border: `1px solid ${theme.taskbarBorder}`, marginBottom: 24 }}>
            <a href="https://play-bittersweet.net" target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative', textDecoration: 'none' }}>
              <img src={bittersweetHeader} alt="Bittersweet" style={{ width: '100%', height: 160, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,5,20,0.2), rgba(10,5,20,0.75))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <img src={bittersweetLogo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                <div style={{ color: '#fff', fontSize: 16, fontWeight: 700, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>Bittersweet</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>Minecraft Server · tap to visit →</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {activeSection === 'projects' && (
        <div style={{ padding: 20 }}>
          <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', letterSpacing: 1, marginBottom: 14 }}>C:\Users\Danny\Projects\</div>
          {projects.map(p => (
            <div key={p.id} style={{ marginBottom: 12, border: `1px solid ${expandedProject === p.id ? theme.accent : theme.taskbarBorder}`, borderRadius: isClassic ? 0 : 8, overflow: 'hidden', background: theme.surface }}>
              {/* Project row */}
              <div onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', cursor: 'pointer' }}>
                {p.imgIcon
                  ? <img src={p.imgIcon} alt={p.name} style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                  : <span style={{ fontSize: 24, flexShrink: 0 }}>{p.icon}</span>}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t-text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--t-dim)' }}>{p.desc}</div>
                </div>
                <span style={{ color: 'var(--t-dim)', fontSize: 12, transition: 'transform 0.15s', display: 'inline-block', transform: expandedProject === p.id ? 'rotate(90deg)' : 'none' }}>▶</span>
              </div>

              {/* Expanded detail */}
              {expandedProject === p.id && (
                <div style={{ borderTop: `1px solid ${theme.taskbarBorder}` }}>
                  {p.headerImg && (
                    <img src={p.headerImg} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                  )}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                      {p.tags.map(t => (
                        <span key={t} style={{
                          background: `color-mix(in srgb, ${p.accentColor} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${p.accentColor} 40%, transparent)`,
                          color: p.accentColor, padding: '2px 7px', fontSize: 10, borderRadius: 3,
                          ...mono,
                        }}>{t}</span>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--t-text2)', lineHeight: 1.7, margin: '0 0 12px' }}>{p.detail}</p>
                    {p.href && (
                      <a href={p.href} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <button style={{
                          width: '100%', padding: '8px 0',
                          background: p.accentColor, border: 'none',
                          color: '#fff', fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'system-ui', borderRadius: isClassic ? 0 : 4,
                        }}>View Project →</button>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── CONTACT ── */}
      {activeSection === 'contact' && (
        <div style={{ padding: 20 }}>
          <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', letterSpacing: 1, marginBottom: 14 }}>C:\Users\Danny\Contact\</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, marginBottom: 16, background: theme.surface, border: `1px solid ${theme.taskbarBorder}`, borderRadius: isClassic ? 0 : 8 }}>
            <img src={pfpImg} alt="Danny" style={{ width: 48, height: 48, imageRendering: 'pixelated' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Danny</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 7, height: 7, background: '#33cc77', borderRadius: '50%' }} />
                <span style={{ color: '#33cc77' }}>Online</span>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--t-text2)', fontSize: 13, marginBottom: 16 }}>Have a project? Let's talk.</p>
          {[
            { icon: '📧', label: 'Email', href: 'mailto:hey@mostlydanny.dev', text: 'hey@mostlydanny.dev' },
            { icon: '🐙', label: 'GitHub', href: 'https://github.com/mostlydanny', text: '/mostlydanny' },
            { icon: '🌐', label: 'Site', href: 'https://mostlydanny.dev', text: 'mostlydanny.dev' },
          ].map(({ icon, label, href, text }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                marginBottom: 8, background: theme.surface, border: `1px solid ${theme.taskbarBorder}`,
                textDecoration: 'none', borderRadius: isClassic ? 0 : 6,
              }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <div>
                <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--t-text2)' }}>{text}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--t-dim)', fontSize: 12 }}>→</span>
            </a>
          ))}
        </div>
      )}

      </div>{/* end scrollable content */}

      {/* Footer */}
      <div style={{
        background: theme.surfaceDeep, borderTop: `1px solid ${theme.taskbarBorder}`,
        padding: '28px 20px 36px', textAlign: 'center',
      }}>
        <div style={{ ...mono, fontSize: 13, fontWeight: 700, color: 'var(--t-text)', marginBottom: 4 }}>mostly.os</div>
        <div style={{ ...mono, fontSize: 10, color: 'var(--t-dim)', marginBottom: 16 }}>Danny's Portfolio</div>
        <div style={{
          display: 'inline-block',
          border: `1px solid ${theme.taskbarBorder}`,
          borderRadius: 4, padding: '6px 14px',
          ...mono, fontSize: 10, color: 'var(--t-text2)', lineHeight: 1.6,
        }}>
          🖥️ boot up on desktop for the full experience
        </div>
        <div style={{ ...mono, fontSize: 9, color: 'var(--t-dim)', marginTop: 20 }}>
          © {new Date().getFullYear()} Danny · mostlydanny.dev
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useTheme()
  const a11y = useA11y()
  const isMobile = useMobile()
  const [phase, setPhase] = useState<AppPhase>('boot')
  const [shutdownMode, setShutdownMode] = useState<'shutdown' | 'restart'>('shutdown')
  const [shutdownDialogOpen, setShutdownDialogOpen] = useState(false)
  const [windows, setWindows] = useState<Win[]>([])
  const [startOpen, setStartOpen] = useState(false)
  const [clock, setClock] = useState(new Date())
  const [calOpen, setCalOpen] = useState(false)
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [whatIsThis, setWhatIsThis] = useState(false)
  const [helpTip, setHelpTip] = useState<{ text: string; x: number; y: number } | null>(null)

  // Wire module-level setter so HelpContent can activate this mode
  _activateWhatIsThis = () => { setWhatIsThis(true); setHelpTip(null) }

  const [dragState, setDragState] = useState<{ id: string; ox: number; oy: number } | null>(null)
  const [resizeState, setResizeState] = useState<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null)

  const windowsRef = useRef(windows)
  windowsRef.current = windows

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!whatIsThis) return
    const handler = (e: MouseEvent) => {
      e.preventDefault(); e.stopPropagation()
      const el = (e.target as HTMLElement).closest('[data-help]') as HTMLElement | null
      const text = el?.dataset.help ?? null
      if (text) {
        const vw = window.innerWidth, vh = window.innerHeight
        let x = e.clientX + 14, y = e.clientY + 14
        if (x + 240 > vw) x = e.clientX - 254
        if (y + 80 > vh) y = e.clientY - 94
        setHelpTip({ text, x, y })
      } else {
        setHelpTip(null)
      }
      setWhatIsThis(false)
    }
    document.addEventListener('click', handler, { capture: true })
    return () => document.removeEventListener('click', handler, { capture: true })
  }, [whatIsThis])

  useEffect(() => {
    if (!calOpen) return
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      if (!el.closest('[data-calendar]')) setCalOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [calOpen])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragState) {
        setWindows(prev => prev.map(w =>
          w.id === dragState.id && !w.maximized
            ? { ...w, x: e.clientX - dragState.ox, y: e.clientY - dragState.oy }
            : w
        ))
      }
      if (resizeState) {
        const dw = e.clientX - resizeState.sx
        const dh = e.clientY - resizeState.sy
        setWindows(prev => prev.map(w =>
          w.id === resizeState.id
            ? { ...w, width: Math.max(w.minWidth || 200, resizeState.sw + dw), height: Math.max(w.minHeight || 120, resizeState.sh + dh) }
            : w
        ))
      }
    }
    const onUp = () => { setDragState(null); setResizeState(null) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [dragState, resizeState])

  // Konami code
  useEffect(() => {
    const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    let pos = 0
    const h = (e: KeyboardEvent) => {
      if (e.key === seq[pos]) { pos++; if (pos === seq.length) { pos = 0; openWindow('konami') } }
      else pos = 0
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const openWindow = useCallback((id: string) => {
    const existing = windowsRef.current.find(w => w.id === id)
    if (existing) {
      setWindows(prev => prev.map(w =>
        w.id === id ? { ...w, minimized: false, zIndex: ++zCounter } : w
      ))
      return
    }
    const def = WINDOW_DEFS[id]
    if (!def) return
    const cascade = windowsRef.current.length
    const newWin: Win = {
      id,
      title: def.title ?? id,
      icon: def.icon ?? '📄',
      x: Math.min(60 + cascade * 22, window.innerWidth - (def.width ?? 300) - 40),
      y: Math.min(30 + cascade * 18, window.innerHeight - (def.height ?? 240) - 60),
      width: def.width ?? 300,
      height: def.height ?? 240,
      minimized: false, maximized: false,
      zIndex: ++zCounter,
      contentType: def.contentType ?? '',
      contentData: def.contentData,
      minWidth: def.minWidth, minHeight: def.minHeight,
    }
    setWindows(prev => [...prev, newWin])
  }, [])

  // Auto-open Bittersweet window in top-right on desktop load
  useEffect(() => {
    if (phase !== 'desktop') return
    const def = WINDOW_DEFS['proj-bittersweet']
    const w = def.width ?? 380
    const h = def.height ?? 320
    setWindows([{
      id: 'proj-bittersweet',
      title: def.title ?? 'Bittersweet',
      icon: def.icon ?? '🍇',
      x: window.innerWidth - w - 20,
      y: 20,
      width: w, height: h,
      minimized: false, maximized: false,
      zIndex: ++zCounter,
      contentType: def.contentType ?? 'bittersweet',
      minWidth: def.minWidth, minHeight: def.minHeight,
    }])
  }, [phase])

  const focusWin = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: ++zCounter } : w))
  const closeWin = (id: string) => setWindows(prev => prev.filter(w => w.id !== id))
  const minimizeWin = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w))
  const maximizeWin = (id: string) => setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))

  const handleShutdownAction = (action: 'shutdown' | 'restart' | 'logoff') => {
    setShutdownDialogOpen(false)
    setWindows([])
    if (action === 'logoff') { setPhase('logoff'); return }
    setShutdownMode(action)
    setPhase(action === 'restart' ? 'restart' : 'shutdown')
  }

  const renderContent = (win: Win) => {
    switch (win.contentType) {
      case 'mycomputer':  return <MyComputerContent />
      case 'projects':    return <ProjectsContent openWindow={openWindow} />
      case 'games':       return <GamesContent openWindow={openWindow} />
      case 'snake':       return <SnakeGame />
      case 'contact':     return <ContactContent />
      case 'recycle':     return <RecycleBinContent openWindow={openWindow} />
      case 'internet':    return <InternetContent />
      case 'settings':    return <ControlPanelContent />
      case 'calculator':  return <CalculatorContent />
      case 'search':      return <SearchContent openWindow={openWindow} />
      case 'help':        return <HelpContent />
      case 'konami':      return <div style={{ padding: 20, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#33ff88', lineHeight: 2 }}><div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div><div>mostly.os has detected</div><div>that you know things.</div><div style={{ marginTop: 12, color: '#1a5a3a', fontSize: 11 }}>↑↑↓↓←→←→BA</div></div>
      case 'textfile':    return <TextFileContent text={win.contentData?.text ?? ''} />
      case 'projdetail':  return <ProjectDetailContent projectId={win.contentData?.projectId ?? ''} />
      case 'bittersweet': return <BittersweetContent />
      default:            return null
    }
  }

  const maxZ = windows.length > 0 ? Math.max(...windows.map(w => w.zIndex)) : 0
  const clockStr = clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isMobile) return <MobileApp />
  if (phase === 'boot') return <BootScreen onComplete={() => setPhase('desktop')} />
  if (phase === 'shutdown') return <ShutdownScreen mode="shutdown" onBoot={() => setPhase('boot')} />
  if (phase === 'restart') return <ShutdownScreen mode="restart" onBoot={() => setPhase('boot')} />
  if (phase === 'logoff') return <LogoffScreen onLogin={() => setPhase('boot')} />

  return (
    <div
      data-help="Desktop — The main workspace of mostly.os. Double-click icons to open applications. Right-click does nothing (this is a portfolio, not Windows)."
      className={[a11y.largeUI ? 'ui-scaled' : '', a11y.highContrast ? 'high-contrast' : ''].filter(Boolean).join(' ')}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: theme.desktop,
        fontSize: a11y.largeUI ? 14 : undefined,
        userSelect: dragState || resizeState ? 'none' : undefined,
        cursor: whatIsThis ? 'help' : dragState ? 'grabbing' : undefined,
      }}
      onMouseDown={() => { setStartOpen(false); if (helpTip) setHelpTip(null) }}
    >
      {/* Wallpaper texture */}
      {theme.desktopOverlay.length > 0 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: theme.desktopOverlay.join(','),
        }} />
      )}

      {/* Desktop icons */}
      {ICONS.map((ic, i) => (
        <DesktopIcon key={i} icon={ic.icon} label={ic.label} x={ic.x} y={ic.y}
          help={ic.help} onDoubleClick={() => openWindow(ic.id)} />
      ))}

      {/* Windows */}
      {windows.map(win => (
        <OSWindow
          key={win.id} win={win}
          isActive={win.zIndex === maxZ && !win.minimized}
          onFocus={() => focusWin(win.id)}
          onClose={() => closeWin(win.id)}
          onMinimize={() => minimizeWin(win.id)}
          onMaximize={() => maximizeWin(win.id)}
          onDragStart={(e) => {
            if (windowsRef.current.find(w => w.id === win.id)?.maximized) return
            e.preventDefault()
            focusWin(win.id)
            const w = windowsRef.current.find(w => w.id === win.id)!
            setDragState({ id: win.id, ox: e.clientX - w.x, oy: e.clientY - w.y })
          }}
          onResizeStart={(e) => {
            e.preventDefault()
            const w = windowsRef.current.find(w => w.id === win.id)!
            setResizeState({ id: win.id, sx: e.clientX, sy: e.clientY, sw: w.width, sh: w.height })
          }}
        >
          {renderContent(win)}
        </OSWindow>
      ))}

      {/* What's This mode indicator */}
      {whatIsThis && (
        <div style={{
          position: 'fixed', top: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--t-accent)', border: '1px solid #4a7aba', color: 'var(--t-text)',
          padding: '6px 16px', fontSize: 12, zIndex: 99999,
          fontFamily: "'JetBrains Mono', monospace", pointerEvents: 'none',
        }}>
          🔍 Click any element to learn about it
        </div>
      )}

      {/* What's This tooltip */}
      {helpTip && (
        <div
          onMouseDown={() => setHelpTip(null)}
          style={{
            position: 'fixed', left: helpTip.x, top: helpTip.y,
            background: '#0a1f3a', border: '1px solid #4a7aba',
            color: 'var(--t-text)', padding: '8px 12px', fontSize: 12,
            maxWidth: 240, zIndex: 99999, cursor: 'default',
            fontFamily: 'system-ui', lineHeight: 1.6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}
        >
          {helpTip.text}
          <div style={{ fontSize: 10, color: 'var(--t-dim)', marginTop: 4 }}>Click to dismiss</div>
        </div>
      )}

      {/* Shutdown dialog */}
      {shutdownDialogOpen && (
        <ShutdownDialog
          onAction={handleShutdownAction}
          onCancel={() => setShutdownDialogOpen(false)}
        />
      )}

      {/* Start menu */}
      {startOpen && (
        <StartMenu
          onClose={() => setStartOpen(false)}
          onOpen={openWindow}
          onShutdown={() => setShutdownDialogOpen(true)}
        />
      )}

      {/* Taskbar */}
      <div
        data-help="Taskbar — Shows currently running applications. Click an app button to bring it forward or minimise it. The Start button is on the left; the clock is on the right."
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 34,
          background: theme.taskbar,
          borderTop: `1px solid ${theme.taskbarBorder}`,
          display: 'flex', alignItems: 'center', zIndex: 9998,
        }}>
        <button
          data-startbtn
          data-help="Start Button — Opens the Start Menu. From here you can launch applications, open Settings, Search, or shut down mostly.os."
          onMouseDown={(e) => { e.stopPropagation(); setStartOpen(s => !s) }}
          style={{
            height: '100%', padding: '0 14px',
            background: theme.startBtn,
            border: 'none', borderRight: `1px solid ${theme.taskbarBorder}`,
            color: theme.accentText, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: 'system-ui', flexShrink: 0,
          }}>
          <span style={{ fontSize: 14 }}>🪟</span>
          <span style={{ color: theme.id === 'windows.classic' ? '#000' : '#fff' }}>Start</span>
        </button>

        <div style={{ width: 1, height: 22, background: theme.taskbarBorder, margin: '0 3px', flexShrink: 0 }} />

        <div style={{ flex: 1, display: 'flex', gap: 2, overflow: 'hidden', padding: '0 3px' }}>
          {windows.map(win => {
            const isTop = win.zIndex === maxZ && !win.minimized
            return (
              <button key={win.id}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  if (win.minimized) { minimizeWin(win.id); focusWin(win.id) }
                  else if (isTop) minimizeWin(win.id)
                  else focusWin(win.id)
                }}
                style={{
                  height: 26, padding: '0 8px',
                  background: isTop ? theme.surface : theme.surfaceDeep,
                  border: `1px solid ${isTop ? theme.accent : theme.taskbarBorder}`,
                  color: isTop ? theme.textPrimary : theme.textDim, fontSize: 11,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'system-ui', maxWidth: 140, overflow: 'hidden', flexShrink: 0,
                  opacity: win.minimized ? 0.5 : 1,
                }}>
                <span style={{ fontSize: 12 }}>{win.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{win.title}</span>
              </button>
            )
          })}
        </div>

        <div
          data-help="System Tray — Shows the current time and system status. The clock is real. Yes, it's really that time."
          data-calendar
          style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {calOpen && (() => {
            const f1Events: { year: number; month: number; startDay: number; endDay: number; endMonth: number; name: string }[] = [
              { year: 2026, month: 8, startDay: 4, endDay: 6, endMonth: 8, name: 'Italian GP' },
              { year: 2026, month: 8, startDay: 11, endDay: 13, endMonth: 8, name: 'Spanish GP' },
              { year: 2026, month: 8, startDay: 24, endDay: 26, endMonth: 8, name: 'Azerbaijan GP' },
              { year: 2026, month: 9, startDay: 1, endDay: 4, endMonth: 9, name: 'Bahrain GP in Malaysia' },
              { year: 2026, month: 9, startDay: 9, endDay: 11, endMonth: 9, name: 'Singapore GP' },
              { year: 2026, month: 9, startDay: 23, endDay: 25, endMonth: 9, name: 'United States GP' },
              { year: 2026, month: 9, startDay: 30, endDay: 1, endMonth: 10, name: 'Mexico City GP' },
              { year: 2026, month: 10, startDay: 6, endDay: 8, endMonth: 10, name: 'São Paulo GP' },
              { year: 2026, month: 10, startDay: 19, endDay: 21, endMonth: 10, name: 'Las Vegas GP' },
              { year: 2026, month: 10, startDay: 27, endDay: 29, endMonth: 10, name: 'Qatar GP' },
              { year: 2026, month: 11, startDay: 4, endDay: 6, endMonth: 11, name: 'Abu Dhabi GP' },
            ]
            const today = new Date()
            const firstDay = new Date(calYear, calMonth, 1).getDay()
            const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
            const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
            const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
            while (cells.length % 7 !== 0) cells.push(null)

            const getEventForDay = (day: number) => f1Events.find(e => {
              if (e.year !== calYear) return false
              if (e.month === calMonth && day >= e.startDay) {
                if (e.endMonth === calMonth && day <= e.endDay) return true
                if (e.endMonth > calMonth) return true
              }
              if (e.endMonth === calMonth && e.month < calMonth && day <= e.endDay) return true
              return false
            })

            return (
              <div
                style={{
                  position: 'absolute', bottom: 34, right: 0,
                  width: 260, background: theme.surfaceDeep, border: `1px solid ${theme.accent}`,
                  boxShadow: '0 -4px 24px rgba(0,0,0,0.8)', zIndex: 9999,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                onMouseDown={e => e.stopPropagation()}
                data-calendar="inner"
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${theme.taskbarBorder}` }}>
                  <button
                    onMouseDown={() => { let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y-- } setCalMonth(m); setCalYear(y) }}
                    style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                  >‹</button>
                  <span style={{ fontSize: 11, color: theme.textPrimary, letterSpacing: 1 }}>{monthNames[calMonth]} {calYear}</span>
                  <button
                    onMouseDown={() => { let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++ } setCalMonth(m); setCalYear(y) }}
                    style={{ background: 'none', border: 'none', color: theme.accent, cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                  >›</button>
                </div>

                {/* Day labels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '6px 8px 2px' }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: 9, color: theme.textDim, paddingBottom: 4 }}>{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px 8px', gap: 2 }}>
                  {cells.map((day, i) => {
                    const isToday = day !== null && calYear === today.getFullYear() && calMonth === today.getMonth() && day === today.getDate()
                    const event = day !== null ? getEventForDay(day) : undefined
                    return (
                      <div
                        key={i}
                        title={event ? event.name : undefined}
                        style={{
                          textAlign: 'center', fontSize: 10, padding: '3px 0',
                          color: isToday ? theme.surfaceDeep : event ? '#ffffff' : day ? theme.textSecondary : 'transparent',
                          background: isToday ? theme.accent : event ? '#FF1E00' : 'transparent',
                          borderRadius: 3,
                          outline: event && !isToday ? '1px solid #cc1800' : 'none',
                        }}
                      >{day ?? ''}</div>
                    )
                  })}
                </div>

                {/* F1 events this month */}
                {(() => {
                  const monthEvents = f1Events.filter(e =>
                    e.year === calYear && (e.month === calMonth || e.endMonth === calMonth)
                  )
                  if (!monthEvents.length) return null
                  return (
                    <div style={{ borderTop: `1px solid ${theme.taskbarBorder}`, padding: '6px 10px 8px' }}>
                      <div style={{ fontSize: 9, color: '#FF1E00', letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>🏎 F1 EVENTS</div>
                      {monthEvents.map((e, i) => {
                        const startLabel = `${e.month === calMonth ? e.startDay : 1}`
                        const endLabel = `${e.endMonth === calMonth ? e.endDay : daysInMonth}`
                        return (
                          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                            <span style={{ fontSize: 9, color: '#FF1E00', minWidth: 36 }}>{startLabel}–{endLabel}</span>
                            <span style={{ fontSize: 10, color: '#FF1E00' }}>{e.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )
          })()}

          <div
            onMouseDown={() => setCalOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 10px', borderLeft: `1px solid ${theme.taskbarBorder}`,
              height: '100%', flexShrink: 0, cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 13 }}>🔊</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: theme.textSecondary, letterSpacing: 0.5 }}>
              {clockStr}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
