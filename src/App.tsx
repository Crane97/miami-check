import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import bgImage1 from './assets/bg-image-1.png'
import bgImage2 from './assets/bg-image-2.png'

const BG_IMAGE_1 = bgImage1
const BG_IMAGE_2 = bgImage2
const SPOTLIGHT_R = 260

const NAV_LINKS = ['Course', 'Field Guides', 'Geology', 'Plans', 'Live Tour'] as const

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

export default function App() {
  const mouse = useRef({ x: -999, y: -999 })
  const smooth = useRef({ x: -999, y: -999 })
  const rafRef = useRef<number>(0)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })
  const [activeNav, setActiveNav] = useState<(typeof NAV_LINKS)[number]>('Course')

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

  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <svg
            width="26"
            height="26"
            viewBox="0 0 256 256"
            fill="#ffffff"
            aria-hidden="true"
          >
            <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
          </svg>
          <span className="text-white text-2xl font-playfair italic">Lithos</span>
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link}
              type="button"
              onClick={() => setActiveNav(link)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeNav === link
                  ? 'text-white'
                  : 'text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {link}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
        >
          Sign Up
        </button>

        <button
          type="button"
          className="md:hidden text-white p-1"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Layers hold
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              tales of time
            </span>
          </h1>
        </div>

        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            Every layer of sediment records a chapter of our planet, from ancient
            seabeds to drifting ash, layered across millions of years beneath us.
          </p>
        </div>

        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Our interactive maps let you peel back the crust to trace how stones,
            fossils, and deep time combine to shape the ground beneath your feet.
          </p>
          <button
            type="button"
            className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            Start Digging
          </button>
        </div>
      </section>
    </div>
  )
}
