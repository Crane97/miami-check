import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import bgDay from './assets/bg-image-1.png'
import bgNight from './assets/bg-image-2.png'

const BG_BASE = bgNight
const BG_REVEAL = bgDay
const SPOTLIGHT_R = 420
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
  { id: 'spa', label: 'Día de spa + piscina rooftop' },
] as const

const SCENARIOS = [
  {
    id: 1,
    title: 'Escenario 1',
    text: 'Somos super amigos',
  },
  {
    id: 2,
    title: 'Escenario 2',
    text: 'Somos super amigos, pero ya nos veremos',
  },
  {
    id: 3,
    title: 'Escenario 3',
    text: 'No necesita mas explicacion.',
  },
] as const

type Step = 'hero' | 'plans' | 'scenarios' | 'dates'
type PlanId = (typeof PLANS)[number]['id']

function RevealLayer({ image }: { image: string }) {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    const target = {
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.42,
    }
    const current = { ...target }
    let raf = 0

    const apply = () => {
      const mask = `radial-gradient(circle ${SPOTLIGHT_R}px at ${current.x}px ${current.y}px, #000 0%, #000 45%, rgba(0,0,0,0.35) 75%, transparent 100%)`
      img.style.maskImage = mask
      img.style.webkitMaskImage = mask
    }

    apply()

    const follow = (x: number, y: number) => {
      target.x = x
      target.y = y
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      const dx = target.x - current.x
      const dy = target.y - current.y
      if (Math.abs(dx) < 0.2 && Math.abs(dy) < 0.2) {
        current.x = target.x
        current.y = target.y
        apply()
        raf = 0
        return
      }
      current.x += dx * 0.16
      current.y += dy * 0.16
      apply()
      raf = requestAnimationFrame(tick)
    }

    const onPointer = (e: PointerEvent) => {
      follow(e.clientX, e.clientY)
    }

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      follow(t.clientX, t.clientY)
    }

    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <img
      ref={imgRef}
      src={image}
      alt=""
      draggable={false}
      className="hero-bg absolute inset-0 z-30 h-full w-full object-cover pointer-events-none"
      style={{
        maskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at 50% 42%, #000 0%, #000 45%, rgba(0,0,0,0.35) 75%, transparent 100%)`,
        WebkitMaskImage: `radial-gradient(circle ${SPOTLIGHT_R}px at 50% 42%, #000 0%, #000 45%, rgba(0,0,0,0.35) 75%, transparent 100%)`,
      }}
    />
  )
}

function HeroShell({
  children,
  animateZoom = false,
}: {
  children: ReactNode
  animateZoom?: boolean
}) {
  return (
    <section className="relative w-full overflow-hidden bg-black h-svh">
      <img
        src={BG_BASE}
        alt=""
        draggable={false}
        decoding="async"
        className={`hero-bg absolute inset-0 z-10 h-full w-full object-cover ${animateZoom ? 'hero-zoom' : ''}`}
      />
      <RevealLayer image={BG_REVEAL} />
      <div className="absolute inset-0 z-40 bg-black/35 pointer-events-none" />
      <div className="relative z-50 h-full">{children}</div>
    </section>
  )
}

function primaryButtonClass(extra = '') {
  return `w-full sm:w-auto bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-6 py-3.5 sm:px-7 sm:py-3 min-h-12 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 disabled:opacity-40 disabled:pointer-events-none disabled:hover:scale-100 ${extra}`
}

const screenPad =
  'h-full overflow-y-auto px-4 sm:px-5 pt-8 sm:pt-14 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.5rem))] flex flex-col items-center'

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
    const w = Math.min(280, window.innerWidth - 32)
    const maxY = window.innerHeight * 0.48
    setPos({
      x: Math.max(16, window.innerWidth / 2 - w / 2 + (Math.random() * 60 - 30)),
      y: Math.min(maxY, Math.max(120, window.innerHeight * 0.24 + initialOffsetY)),
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
    const minY = 100
    const maxY = window.innerHeight * 0.52 - bh
    let nextX = pad + Math.random() * Math.max(1, window.innerWidth - bw - pad * 2)
    let nextY = minY + Math.random() * Math.max(1, maxY - minY)

    // Empujar lejos del cursor
    const cx = nextX + bw / 2
    const cy = nextY + bh / 2
    const dx = cx - clientX
    const dy = cy - clientY
    if (Math.hypot(dx, dy) < 180) {
      const angle = Math.atan2(dy || 1, dx || 1)
      nextX = Math.min(
        window.innerWidth - bw - pad,
        Math.max(pad, clientX + Math.cos(angle) * 180 - bw / 2),
      )
      nextY = Math.min(
        maxY,
        Math.max(minY, clientY + Math.sin(angle) * 180 - bh / 2),
      )
    }

    setPos({ x: nextX, y: nextY, ready: true })
    setJumps((n) => n + 1)
  }

  const onMove = (e: { clientX: number; clientY: number }) => {
    flee(e.clientX, e.clientY)
  }

  if (!pos.ready) return null

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerEnter={onMove}
      onPointerMove={onMove}
      onFocus={(e) => {
        e.target.blur()
        flee(window.innerWidth / 2, window.innerHeight / 2)
      }}
      onClick={(e) => {
        e.preventDefault()
        flee(e.clientX, e.clientY)
      }}
      className="fixed z-[60] max-w-[min(280px,calc(100vw-32px))] text-left px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-white/25 bg-white/10 backdrop-blur-md text-white transition-all duration-200 ease-out shadow-lg"
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
  const [step, setStep] = useState<Step>('hero')
  const [selectedPlans, setSelectedPlans] = useState<PlanId[]>([])
  const [scenario, setScenario] = useState<string>('')
  const [outbound, setOutbound] = useState('2026-10-16')
  const [inbound, setInbound] = useState('2026-10-25')
  const [submitting, setSubmitting] = useState(false)
  const [submitNote, setSubmitNote] = useState('')

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
      className="h-full bg-black tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <HeroShell animateZoom={step === 'hero'}>
      {step === 'hero' && (
          <div className="h-full flex flex-col items-center justify-between px-5 pt-[max(4.5rem,12vh)] pb-[max(1.5rem,calc(env(safe-area-inset-bottom)+1.25rem))] sm:block sm:p-0">
            <div className="flex flex-col items-center text-center pointer-events-none sm:absolute sm:top-[14%] sm:left-0 sm:right-0 sm:px-5">
              <h1 className="text-white leading-[0.95]">
                <span
                  className="block font-playfair italic font-normal text-[clamp(2.35rem,10vw,6rem)] hero-anim hero-reveal"
                  style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
                >
                  Viaje a Miami
                </span>
                <span
                  className="block font-normal text-[clamp(2.35rem,10vw,6rem)] -mt-1 hero-anim hero-reveal"
                  style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
                >
                  2026
                </span>
              </h1>
            </div>

            <div
              className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-3 sm:absolute sm:bottom-24 sm:right-10 md:right-14 sm:mx-0 sm:max-w-[280px] sm:items-start sm:text-left sm:gap-5 hero-anim hero-fade"
              style={{ animationDelay: '0.7s' }}
            >
              <p className="text-sm text-white/80 leading-relaxed">
                Mas facil... imposible
              </p>
              <button
                type="button"
                className={primaryButtonClass()}
                onClick={() => setStep('plans')}
              >
                Empezar a planear el viaje a Miami
              </button>
            </div>
          </div>
      )}

      {step === 'plans' && (
          <div className={screenPad}>
            <div className="w-full max-w-2xl hero-anim hero-reveal" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Selección múltiple
              </p>
              <h2 className="text-white font-playfair italic text-3xl sm:text-5xl leading-tight mb-3">
                ¿Qué planeamos para Miami?
              </h2>
              <p className="text-white/75 text-sm sm:text-base mb-6 sm:mb-8 max-w-lg">
                Elige todos los planes que te apetezcan. Cuantos más marques, más
                difícil será decir que no.
              </p>

              <div className="flex flex-col gap-2 sm:gap-2.5 mb-8 sm:mb-10">
                {PLANS.map((plan) => {
                  const on = selectedPlans.includes(plan.id)
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => togglePlan(plan.id)}
                      className={`w-full min-h-12 text-left px-4 sm:px-5 py-3 sm:py-3.5 rounded-full border transition-all ${
                        on
                          ? 'bg-white text-gray-900 border-white'
                          : 'bg-white/10 text-white border-white/25 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-sm font-medium leading-snug">{plan.label}</span>
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
      )}

      {step === 'scenarios' && (
          <div className="h-full overflow-hidden px-4 sm:px-5 pt-8 sm:pt-14 pb-2 flex flex-col items-center relative">
            <div className="w-full max-w-xl text-center hero-anim hero-reveal mb-6 sm:mb-10" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Elige con cuidado
              </p>
              <h2 className="text-white font-playfair italic text-3xl sm:text-5xl leading-tight mb-3">
                Tres escenarios
              </h2>
              <p className="text-white/75 text-sm sm:text-base">
                Elige el que mas te guste, o el que puedas...
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
              initialOffsetY={72}
            />

            <div className="mt-auto mb-[max(1.25rem,env(safe-area-inset-bottom))] w-full max-w-md hero-anim hero-fade" style={{ animationDelay: '0.35s' }}>
              <button
                type="button"
                onClick={() => {
                  setScenario(SCENARIOS[2].text)
                  setStep('dates')
                }}
                className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 rounded-2xl border border-[#e8702a]/70 bg-[#e8702a] text-white shadow-lg shadow-[#e8702a]/25 hover:bg-[#d2611f] transition-all hover:scale-[1.02] active:scale-95"
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
      )}

      {step === 'dates' && (
          <div className={screenPad}>
            <div className="w-full max-w-xl hero-anim hero-reveal" style={{ animationDelay: '0.1s' }}>
              <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-3">
                Fechas
              </p>
              <h2 className="text-white font-playfair italic text-3xl sm:text-5xl leading-tight mb-3">
                Elige bien las fechas?
              </h2>
              <p className="text-white/75 text-sm sm:text-base mb-6 sm:mb-8">
                Cuantos mas dias, mejor :)
              </p>

              <div className="mb-6">
                <p className="text-white text-sm font-medium mb-3">Ida</p>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={`out-${d.iso}`}
                      type="button"
                      onClick={() => setOutbound(d.iso)}
                      className={`min-h-11 min-w-[4.5rem] px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
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

              <div className="mb-8 sm:mb-10">
                <p className="text-white text-sm font-medium mb-3">Vuelta</p>
                <div className="flex flex-wrap gap-2">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={`in-${d.iso}`}
                      type="button"
                      onClick={() => setInbound(d.iso)}
                      className={`min-h-11 min-w-[4.5rem] px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
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
                {submitting ? 'Preparando magia…' : 'Continuar...'}
              </button>
            </div>
          </div>
      )}
      </HeroShell>
    </div>
  )
}
