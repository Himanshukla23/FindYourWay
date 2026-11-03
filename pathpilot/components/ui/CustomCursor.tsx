'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import { usePathname } from 'next/navigation'

function CustomCursorInner() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isDarkBg, setIsDarkBg] = useState(false)
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [isPageTransition, setIsPageTransition] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Mouse coordinates (immediate target & smooth spring position)
  const mousePos = useRef({ x: -100, y: -100 })
  const ringPos = useRef({ x: -100, y: -100 })
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const animFrameId = useRef<number | null>(null)

  // DOM node references for GPU-accelerated styling
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  // Verify non-touch desktop device
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isPointerFine = window.matchMedia('(pointer: fine)').matches
    if (isPointerFine) {
      setMounted(true)
    }
  }, [])

  // ── Trigger animated pulse when navigating between pages ──────────
  useEffect(() => {
    if (!mounted) return
    setIsPageTransition(true)
    const timer = setTimeout(() => {
      setIsPageTransition(false)
    }, 550)
    return () => clearTimeout(timer)
  }, [pathname, mounted])

  // ── Physics loop & mouse / scroll listeners ───────────────────────
  useEffect(() => {
    if (!mounted) return

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      if (!isVisible) setIsVisible(true)

      // Direct, zero-latency transform on the inner pinpoint dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }

      // Detect background luminosity / dark section under cursor
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el) {
        const darkParent = el.closest(
          '[class*="bg-[#0A0A0C]"], [class*="bg-[#0C0D0E]"], [class*="bg-[#121316]"], [class*="bg-black"], [class*="bg-neutral-900"], [class*="bg-neutral-950"], [data-theme="dark"]'
        )
        if (darkParent) {
          setIsDarkBg(true)
        } else {
          // Check evaluated background color
          try {
            const comp = window.getComputedStyle(el)
            const rgb = comp.backgroundColor.match(/\d+/g)
            if (rgb && rgb.length >= 3) {
              const r = parseInt(rgb[0], 10)
              const g = parseInt(rgb[1], 10)
              const b = parseInt(rgb[2], 10)
              // Relative luminance calculation
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
              setIsDarkBg(luminance < 0.35)
            } else {
              setIsDarkBg(false)
            }
          } catch {
            setIsDarkBg(false)
          }
        }

        // Check if cursor is over clickable / interactive element
        const interactive = el.closest(
          'a, button, input, select, textarea, [role="button"], .btn, .card-interactive, .cursor-pointer, [data-cursor]'
        )
        setIsHovered(!!interactive)
      }
    }

    const onMouseDown = () => setIsMouseDown(true)
    const onMouseUp = () => setIsMouseDown(false)
    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    // Detect scroll direction (moving down dynamic deformation)
    const onScroll = () => {
      const currentScroll = window.scrollY
      if (currentScroll > lastScrollY.current + 3) {
        setIsScrollingDown(true)
      } else {
        setIsScrollingDown(false)
      }
      lastScrollY.current = currentScroll

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        setIsScrollingDown(false)
      }, 150)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('mouseenter', onMouseEnter)
    window.addEventListener('scroll', onScroll, { passive: true })

    // ── 60/120fps Spring LERP Follower Animation Loop ─────────────────
    const animateRing = () => {
      // Linear interpolation factor for weighted trailing feel
      const ease = 0.2
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`
      }

      animFrameId.current = requestAnimationFrame(animateRing)
    }

    animFrameId.current = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('mouseenter', onMouseEnter)
      window.removeEventListener('scroll', onScroll)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }
  }, [mounted, isVisible])

  if (!mounted) return null

  // Calculate dynamic colors based on background
  const dotBg = isDarkBg ? '#00F090' : '#0C0D0E'
  const ringBorder = isDarkBg ? '#00F090' : '#0C0D0E'
  const ringGlow = isDarkBg
    ? '0 0 18px rgba(0, 240, 144, 0.5), inset 0 0 8px rgba(0, 240, 144, 0.2)'
    : '0 0 14px rgba(12, 13, 14, 0.2), inset 0 0 6px rgba(12, 13, 14, 0.08)'

  // Determine scale & deformation state
  let ringScale = 'scale(1)'
  let ringBg = 'transparent'

  if (isPageTransition) {
    ringScale = 'scale(2.4)'
    ringBg = isDarkBg ? 'rgba(0, 240, 144, 0.25)' : 'rgba(12, 13, 14, 0.15)'
  } else if (isMouseDown) {
    ringScale = 'scale(0.7)'
    ringBg = isDarkBg ? 'rgba(0, 240, 144, 0.35)' : 'rgba(12, 13, 14, 0.25)'
  } else if (isScrollingDown) {
    // Dynamic aerodynamic elongation when scrolling down
    ringScale = 'scale(0.8, 1.45)'
  } else if (isHovered) {
    ringScale = 'scale(1.55)'
    ringBg = isDarkBg ? 'rgba(0, 240, 144, 0.14)' : 'rgba(12, 13, 14, 0.08)'
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* ── Precision Target Center Dot ───────────────────────────── */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 -ml-1 -mt-1 rounded-full transition-colors duration-150 ease-out"
        style={{
          width: 8,
          height: 8,
          backgroundColor: dotBg,
          boxShadow: isDarkBg ? '0 0 10px #00F090' : '0 0 4px rgba(0,0,0,0.4)',
          transform: `translate3d(-100px, -100px, 0)`,
          willChange: 'transform',
        }}
      />

      {/* ── Outer Follower Positioner (LERP transform only) ───────── */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 -ml-4 -mt-4"
        style={{
          width: 32,
          height: 32,
          transform: `translate3d(-100px, -100px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* ── Inner Morphing Visual Ring (Scales, Colors & Transitions) ── */}
        <div
          className="w-full h-full rounded-full border transition-all duration-200 ease-out"
          style={{
            borderColor: ringBorder,
            backgroundColor: ringBg,
            boxShadow: ringGlow,
            transform: ringScale,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  )
}

export function CustomCursor() {
  return (
    <Suspense fallback={null}>
      <CustomCursorInner />
    </Suspense>
  )
}
