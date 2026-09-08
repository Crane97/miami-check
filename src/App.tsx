import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'
import bgDay from './assets/bg-image-1.png'
import bgNight from './assets/bg-image-2.png'

const BG_BASE = bgNight
const BG_REVEAL = bgDay
const SPOTLIGHT_R = 260
const EMAIL_TO = 'jorge@macdiego.com'

const PLANS = [
  { id: 'shooting', label: 'Disparar armas en un shooting range' },
  { id: 'bachata', label: 'Bailar bachata en Calle 8' },
  { id: 'bahamas', label: 'Escapada a Bahamas' },
  { id: 'keys', label: 'Playa en los Cayos' },
  { id: 'southbeach', label: 'Sunset en South Beach' },
  { id: 'wynwood', label: 'Street art y brunch en Wynwood' },
  { id: 'everglades', label: 'Airboat por los Everglades' },
  { id: 'cuban', label: 'Café cubano y croquetas en Little Havana' },
  { id: 'boat', label: 'Salida en barco al atardecer' },
  { id: 'spa', label: 'Día de spa + piscina rooftop' },
] as const

const SCENARIOS = [
  {
    id: 1,
    title: 'Plan A',
    text: 'Quedarnos en Londres, manta, series y “ya viajamos otro año”.',
  },
  {
    id: 2,
    title: 'Plan B',
    text: 'Un finde “relajado” en Benidorm… y fingir que es Miami.',
  },
  {
    id: 3,
    title: 'Plan C',
    text: 'Miami 2026. Sol, playa, Calle 8 y cero excusas.',
  },
] as const

type Step = 'hero' | 'plans' | 'scenarios' | 'dates'
type PlanId = (typeof PLANS)[number]['id']

type RevealLayerProps = {
  image: string
  cursorX: number
  cursorY: number
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [maskUrl, setMaskUrl] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R,
    )
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    gradient.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fill()

    setMaskUrl(canvas.toDataURL())
  }, [cursorX, cursorY])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          maskImage: maskUrl ? `url(${maskUrl})` : 'none',
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : 'none',
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    </>
  )
}

function HeroShell({
  cursorPos,
  children,
  animateZoom = false,
}: {
  cursorPos: { x: number; y: number }
  children: ReactNode
  animateZoom?: boolean
}) {
  return (
    <section
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: '100dvh' }}
    >
      <div
        className={`absolute inset-0 bg-center bg-cover bg-no-repeat z-10 ${animateZoom ? 'hero-zoom' : ''}`}
        style={{ backgroundImage: `url(${BG_BASE})` }}
      />
      <RevealLayer
        image={BG_REVEAL}
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
      />
      <div className="absolute inset-0 z-40 bg-black/35 pointer-events-none" />
      <div className="relative z-50 h-full">{children}</div>
    </section>
  )
}

function primaryButtonClass(extra = '') {
  return `bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100 ${extra}`
}

function formatSkyDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y.slice(2)}${m}${d}`
}

function buildSkyscannerUrl(outbound: string, inbound: string) {
  const out = formatSkyDate(outbound)
  const inn = formatSkyDate(inbound)
  return `https://www.skyscanner.es/transporte/vuelos/lond/mia/${out}/${inn}/?adultsv2=2&cabinclass=economy&ref=home&rtn=1&preferdirects=true&outboundaltsenabled=false&inboundaltsenabled=false`
}

function buildMailto(params: {
  plans: string[]
  scenario: string
  outbound: string
  inbound: string
}) {
  const subject = encodeURIComponent('Respuestas Viaje a Miami 2026')
  const body = encodeURIComponent(
    [
      '¡Hay respuesta al Viaje a Miami 2026!',
      '',
      `Planes elegidos:`,
      ...params.plans.map((p) => `• ${p}`),
      '',
      `Escenario: ${params.scenario}`,
      `Ida: ${params.outbound}`,
      `Vuelta: ${params.inbound}`,
    ].join('\n'),
  )
  return `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`
}

async function sendFormEmail(payload: {
  plans: string[]
  scenario: string
  outbound: string
  inbound: string
}) {
  const mailto = buildMailto(payload)
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${EMAIL_TO}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: 'Respuestas Viaje a Miami 2026',
        message: 'Nueva respuesta del formulario Viaje a Miami 2026',
        planes: payload.plans.join(', '),
        escenario: payload.scenario,
        ida: payload.outbound,
        vuelta: payload.inbound,
        _template: 'table',
        _captcha: 'false',
      }),
    })
    if (!res.ok) {
      window.location.href = mailto
    }
  } catch {
    window.location.href = mailto
  }
}

function RunawayButton({
  label,
  subtitle,
  initialOffsetY = 0,
}: {
  label: string
  subtitle: string
  initialOffsetY?: number
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0, ready: false })
  const [jumps, setJumps] = useState(0)

  useEffect(() => {
    const w = Math.min(320, window.innerWidth - 40)
    setPos({
      x: Math.max(16, window.innerWidth / 2 - w / 2 + (Math.random() * 100 - 50)),
      y: Math.max(140, window.innerHeight * 0.28 + initialOffsetY),
      ready: true,
    })
  }, [initialOffsetY])

  const flee = (clientX: number, clientY: number) => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const bw = rect.width
    const bh = rect.height
    const pad = 16
    let nextX = pad + Math.random() * Math.max(1, window.innerWidth - bw - pad * 2)
    let nextY = 100 + Math.random() * Math.max(1, window.innerHeight - bh - 140)

    // Empujar lejos del cursor
    const cx = nextX + bw / 2
    const cy = nextY + bh / 2
    const dx = cx - clientX
    const dy = cy - clientY
    if (Math.hypot(dx, dy) < 180) {
      const angle = Math.atan2(dy || 1, dx || 1)
      nextX = Math.min(
        window.innerWidth - bw - pad,
        Math.max(pad, clientX + Math.cos(angle) * 220 - bw / 2),
      )
      nextY = Math.min(
        window.innerHeight - bh - pad,
        Math.max(100, clientY + Math.sin(angle) * 220 - bh / 2),
      )
    }

    setPos({ x: nextX, y: nextY, ready: true })
    setJumps((n) => n + 1)
  }

  const onMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
    flee(e.clientX, e.clientY)
  }

  if (!pos.ready) return null

  return (
    <button
      ref={btnRef}
      type="button"
      onMouseEnter={onMove}
      onMouseMove={onMove}
      onFocus={(e) => {
        e.target.blur()
        flee(window.innerWidth / 2, window.innerHeight / 2)
      }}
      onClick={(e) => {
        e.preventDefault()
        flee(e.clientX, e.clientY)
      }}
      className="fixed z-[60] max-w-[min(320px,calc(100vw-32px))] text-left px-5 py-4 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md text-white transition-all duration-200 ease-out shadow-lg"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `rotate(${(jumps % 2 === 0 ? -1 : 1) * Math.min(8, jumps)}deg)`,
      }}
    >
      <span className="block text-xs uppercase tracking-wider text-white/60 mb-1">
        {label}
      </span>
      <span className="block text-sm leading-snug">{subtitle}</span>
    </button>
  )
}

const DATE_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const day = 16 + i
  const iso = `2026-10-${String(day).padStart(2, '0')}`
  return { iso, label: `${day} oct` }
})

export default function App() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number>(0)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  const [step, setStep] = useState<Step>('hero')
  const [selectedPlans, setSelectedPlans] = useState<PlanId[]>([])
  const [scenario, setScenario] = useState<string>('')
  const [outbound, setOutbound] = useState('2026-10-16')
  const [inbound, setInbound] = useState('2026-10-25')
  const [submitting, setSubmitting] = useState(false)
  const [submitNote, setSubmitNote] = useState('')

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1
      setCursorPos({ x: smooth.current.x, y: smooth.current.y })
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const togglePlan = (id: PlanId) => {
    setSelectedPlans((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    )
  }

  const onFinish = async () => {
    if (outbound >= inbound) {
      setSubmitNote('La vuelta tiene que ser después de la ida.')
      return
    }
    setSubmitting(true)
    setSubmitNote('')

    const planLabels = PLANS.filter((p) => selectedPlans.includes(p.id)).map(
      (p) => p.label,
    )
    const payload = {
      plans: planLabels,
      scenario,
      outbound,
      inbound,
    }

    const sky = buildSkyscannerUrl(outbound, inbound)
    window.open(sky, '_blank', 'noopener,noreferrer')
    await sendFormEmail(payload)

    setSubmitting(false)
    setSubmitNote('Listo: Skyscanner abierto y respuestas enviadas (o listas en tu correo). Si FormSubmit te pide confirmar el email la primera vez, hazlo desde la bandeja de jorge@macdiego.com.')
  }

  return (
    <div
      className="min-h-screen bg-black tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {step === 'hero' && (
        <HeroShell cursorPos={cursorPos} animateZoom>
          <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none">
            <h1 className="text-white leading-[0.95]">
              <span
                className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
                style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
              >
                Viaje a Miami
              </span>
              <span
                className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
                style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
              >
                2026
              </span>
            </h1>
          </div>

          <div
            className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade"
            style={{ animationDelay: '0.7s' }}
          >
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Una propuesta con sol, playa y planes absurdamente buenos. Desliza
              el cursor para ver Miami de día… y pulsa cuando estés lista.
            </p>
            <button
              type="button"
              className={primaryButtonClass()}
              onClick={() => setStep('plans')}
            >
              Vuelos a Miami
            </button>
          </div>
        </HeroShell>
      )}

      {step === 'plans' && (
        <HeroShell cursorPos={cursorPos}>
          <div className="h-full overflow-y-auto px-5 py-10 sm:py-14 flex flex-col items-center">
            <div className="w-full max-w-2xl hero-anim hero-reveal" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Paso 1 · Selección múltiple
              </p>
              <h2 className="text-white font-playfair italic text-4xl sm:text-5xl leading-tight mb-3">
                ¿Qué hacemos en Miami?
              </h2>
              <p className="text-white/75 text-sm sm:text-base mb-8 max-w-lg">
                Elige todos los planes que te apetezcan. Cuantos más marques, más
                difícil será decir que no.
              </p>

              <div className="flex flex-col gap-2.5 mb-10">
                {PLANS.map((plan) => {
                  const on = selectedPlans.includes(plan.id)
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => togglePlan(plan.id)}
                      className={`w-full text-left px-5 py-3.5 rounded-full border transition-all ${
                        on
                          ? 'bg-white text-gray-900 border-white'
                          : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-sm font-medium">{plan.label}</span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                className={primaryButtonClass()}
                disabled={selectedPlans.length === 0}
                onClick={() => setStep('scenarios')}
              >
                Continuar
              </button>
            </div>
          </div>
        </HeroShell>
      )}

      {step === 'scenarios' && (
        <HeroShell cursorPos={cursorPos}>
          <div className="h-full overflow-hidden px-5 py-10 sm:py-14 flex flex-col items-center relative">
            <div className="w-full max-w-xl text-center hero-anim hero-reveal mb-10" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Paso 2 · Elige con cuidado
              </p>
              <h2 className="text-white font-playfair italic text-4xl sm:text-5xl leading-tight mb-3">
                Tres escenarios
              </h2>
              <p className="text-white/75 text-sm sm:text-base">
                Solo uno es el correcto. Los otros… tienen vida propia.
              </p>
            </div>

            <RunawayButton
              label={SCENARIOS[0].title}
              subtitle={SCENARIOS[0].text}
              initialOffsetY={0}
            />
            <RunawayButton
              label={SCENARIOS[1].title}
              subtitle={SCENARIOS[1].text}
              initialOffsetY={120}
            />

            <div className="mt-auto mb-8 w-full max-w-md hero-anim hero-fade" style={{ animationDelay: '0.35s' }}>
              <button
                type="button"
                onClick={() => {
                  setScenario(SCENARIOS[2].text)
                  setStep('dates')
                }}
                className="w-full text-left px-6 py-5 rounded-2xl border border-[#e8702a]/70 bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/25 hover:bg-[#d2611f] transition-all hover:scale-[1.02] active:scale-95"
              >
                <span className="block text-xs uppercase tracking-wider text-white/80 mb-1">
                  {SCENARIOS[2].title} · el bueno
                </span>
                <span className="block text-base sm:text-lg font-medium leading-snug">
                  {SCENARIOS[2].text}
                </span>
              </button>
            </div>
          </div>
        </HeroShell>
      )}

      {step === 'dates' && (
        <HeroShell cursorPos={cursorPos}>
          <div className="h-full overflow-y-auto px-5 py-10 sm:py-14 flex flex-col items-center">
            <div className="w-full max-w-xl hero-anim hero-reveal" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Paso 3 · Fechas
              </p>
              <h2 className="text-white font-playfair italic text-4xl sm:text-5xl leading-tight mb-3">
                ¿Cuándo volamos?
              </h2>
              <p className="text-white/75 text-sm sm:text-base mb-8">
                Elige ida y vuelta entre el 16 y el 25 de octubre de 2026.
                Al continuar te llevo a Skyscanner (Londres ↔ Miami, directos) y
                mando las respuestas a {EMAIL_TO}.
              </p>

              <div className="mb-6">
                <p className="text-white text-sm font-medium mb-3">Ida</p>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={`out-${d.iso}`}
                      type="button"
                      onClick={() => setOutbound(d.iso)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        outbound === d.iso
                          ? 'bg-white text-gray-900'
                          : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <p className="text-white text-sm font-medium mb-3">Vuelta</p>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={`in-${d.iso}`}
                      type="button"
                      onClick={() => setInbound(d.iso)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        inbound === d.iso
                          ? 'bg-white text-gray-900'
                          : 'bg-white/10 text-white border border-white/25 hover:bg-white/20'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {submitNote && (
                <p className="text-sm text-white/80 mb-4">{submitNote}</p>
              )}

              <button
                type="button"
                className={primaryButtonClass()}
                disabled={submitting}
                onClick={onFinish}
              >
                {submitting ? 'Preparando magia…' : 'Continuar a Skyscanner'}
              </button>
            </div>
          </div>
        </HeroShell>
      )}
    </div>
  )
}
