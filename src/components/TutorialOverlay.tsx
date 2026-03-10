"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, X, Lightbulb, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTutorial } from "@/lib/tutorial-context"
import { useFinance } from "@/lib/finance-context"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function TutorialOverlay() {
  const { isActive, currentStep, steps, nextStep, prevStep, skipTutorial } = useTutorial()
  const { setSidebarOpen } = useFinance()
  const router = useRouter()
  
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const lastFoundRect = useRef<DOMRect | null>(null)
  const prevStepRef = useRef<number>(-1)

  const step = steps[currentStep]

  const findAndSet = useCallback(() => {
    if (!step?.targetId) {
      setTargetRect(null)
      lastFoundRect.current = null
      return
    }
    
    const el = document.getElementById(step.targetId)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (!lastFoundRect.current || 
          rect.top !== lastFoundRect.current.top || 
          rect.left !== lastFoundRect.current.left || 
          rect.width !== lastFoundRect.current.width) {
        setTargetRect(rect)
        lastFoundRect.current = rect
      }
    }
  }, [step?.targetId])

  useEffect(() => {
    if (!isActive || !step) return
    if (prevStepRef.current === currentStep) return
    
    const handleStepChange = async () => {
      const isSidebarTarget = step.targetId?.startsWith("sidebar-nav")
      const isMobile = window.innerWidth < 1024

      if (isSidebarTarget && isMobile) {
        setSidebarOpen(true)
        await new Promise(resolve => setTimeout(resolve, 400))
      } else if (!isSidebarTarget && isMobile) {
        setSidebarOpen(false)
      }

      if (step.route) {
        setIsNavigating(true)
        router.push(step.route)
        await new Promise(resolve => setTimeout(resolve, 400))
        setIsNavigating(false)
      }
      
      let retryCount = 0
      const tryScroll = () => {
        const el = document.getElementById(step.targetId || "")
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          setTimeout(findAndSet, 100)
        } else if (retryCount < 10) {
          retryCount++
          setTimeout(tryScroll, 100)
        }
      }
      
      tryScroll()
      prevStepRef.current = currentStep
    }

    handleStepChange()
  }, [isActive, currentStep, step, router, findAndSet, setSidebarOpen])

  useEffect(() => {
    if (!isActive || isNavigating) return

    findAndSet()
    const interval = setInterval(findAndSet, 100)
    
    window.addEventListener('resize', findAndSet)
    window.addEventListener('scroll', findAndSet, true)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', findAndSet)
      window.removeEventListener('scroll', findAndSet, true)
    }
  }, [isActive, currentStep, step?.targetId, isNavigating, findAndSet])

  if (!isActive || !step) return null

  const isCenter = step.position === "center" || !step.targetId || !targetRect
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0
  const progress = ((currentStep + 1) / steps.length) * 100

  const spotlightX = targetRect ? targetRect.left - 8 : (isCenter ? window.innerWidth / 2 : 0)
  const spotlightY = targetRect ? targetRect.top - 8 : (isCenter ? window.innerHeight / 2 : 0)
  const spotlightW = targetRect ? targetRect.width + 16 : 0
  const spotlightH = targetRect ? targetRect.height + 16 : 0

  const getPopoverAnimation = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const P_WIDTH = isMobile ? window.innerWidth * 0.9 : 360
    const P_HEIGHT = 280
    const GAP = 24
    const MARGIN = 16

    if (isCenter || !targetRect) {
      return { top: "50%", left: "50%", x: "-50%", y: "-50%" }
    }

    // Special behavior for mobile: if targeting sidebar or if screen too narrow, place at bottom/top
    if (isMobile) {
      const isTargetInTopHalf = targetRect.top < window.innerHeight / 2
      return {
        top: isTargetInTopHalf ? "auto" : MARGIN,
        bottom: isTargetInTopHalf ? MARGIN : "auto",
        left: "50%",
        x: "-50%",
        y: 0
      }
    }

    let top: number | string = "auto"
    let left: number | string = "auto"
    let bottom: number | string = "auto"
    let right: number | string = "auto"

    if (step.position === "right") {
      left = targetRect.right + GAP
      top = targetRect.top + targetRect.height / 2 - 100
    } else if (step.position === "left") {
      right = window.innerWidth - targetRect.left + GAP
      top = targetRect.top + targetRect.height / 2 - 100
    } else if (step.position === "bottom") {
      top = targetRect.bottom + GAP
      left = targetRect.left
    } else if (step.position === "top") {
      bottom = window.innerHeight - targetRect.top + GAP
      left = targetRect.left
    }

    // Viewport clamping
    if (typeof left === "number") left = Math.max(MARGIN, Math.min(window.innerWidth - P_WIDTH - MARGIN, left))
    if (typeof right === "number") right = Math.max(MARGIN, Math.min(window.innerWidth - P_WIDTH - MARGIN, right))
    if (typeof top === "number") top = Math.max(MARGIN, Math.min(window.innerHeight - P_HEIGHT - MARGIN, top))
    if (typeof bottom === "number") bottom = Math.max(MARGIN, Math.min(window.innerHeight - P_HEIGHT - MARGIN, bottom))

    return { top, left, bottom, right, x: 0, y: 0 }
  }

  return (
    <div className="fixed inset-0 z-[1000] overflow-hidden pointer-events-none">
      <AnimatePresence>
        <motion.div
          key="tutorial-mask"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-auto"
        >
          <svg className="h-full w-full">
            <defs>
              <mask id="tutorial-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <motion.rect
                  animate={{
                    x: spotlightX,
                    y: spotlightY,
                    width: spotlightW,
                    height: spotlightH,
                    opacity: isCenter ? 0 : 1
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  rx="12"
                  ry="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.7)"
              mask="url(#tutorial-spotlight-mask)"
              onClick={nextStep}
              className="cursor-pointer"
            />
          </svg>

          <AnimatePresence>
            {!isCenter && targetRect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: spotlightX,
                  y: spotlightY,
                  width: spotlightW,
                  height: spotlightH,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className="absolute border-2 border-primary rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={getPopoverAnimation()}
            transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            style={{
              position: "absolute",
              width: isCenter ? "min(440px, 90vw)" : "min(360px, 90vw)",
              zIndex: 1000,
              pointerEvents: "auto",
            }}
            className={cn(
              "rounded-2xl border border-border/60 bg-background shadow-2xl overflow-hidden"
            )}
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500" />

            <div className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    {isLastStep ? <Sparkles className="h-5 w-5 text-primary" /> : <Lightbulb className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 leading-none mb-1">Passo</span>
                    <span className="block text-sm font-bold text-foreground leading-none">{currentStep + 1} / {steps.length}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={skipTutorial}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentStep}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-2.5 leading-tight">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-6">{step.description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mb-6 h-1 w-full rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" onClick={skipTutorial} className="text-muted-foreground">Pular tour</Button>
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button variant="outline" size="sm" onClick={prevStep} className="gap-1.5"><ChevronLeft className="h-4 w-4" />Anterior</Button>
                  )}
                  <Button size="sm" onClick={nextStep} className="gap-1.5 px-4 font-semibold">
                    {isLastStep ? "Finalizar" : "Próximo"}
                    {!isLastStep && <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
