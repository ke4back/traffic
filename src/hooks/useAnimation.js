import { useEffect, useRef } from 'react'

function useAnimation(callback, active = true) {
  const callbackRef = useRef(callback)
  const frameRef = useRef(0)
  const previousTimeRef = useRef(0)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      previousTimeRef.current = 0
      return undefined
    }

    const animate = (timestamp) => {
      if (!previousTimeRef.current) {
        previousTimeRef.current = timestamp
      }

      const rawDelta = (timestamp - previousTimeRef.current) / 1000
      const deltaTime = Math.min(rawDelta, 0.05)

      previousTimeRef.current = timestamp
      callbackRef.current(deltaTime)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      previousTimeRef.current = 0
    }
  }, [active])
}

export default useAnimation
