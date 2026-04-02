import { useSyncExternalStore } from 'react'

let current = Date.now()
const subscribers = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

function tick() {
  current = Date.now()
  for (const cb of Array.from(subscribers)) cb()
}

function ensureTimer() {
  if (timer === null) timer = setInterval(tick, 1000)
}

function subscribe(cb: () => void) {
  subscribers.add(cb)
  ensureTimer()
  return () => {
    subscribers.delete(cb)
    if (subscribers.size === 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function getNowMs() {
  return current
}

export default function useNow() {
  // Provide a server snapshot callback as the third argument so
  // server-side rendering can obtain a deterministic snapshot.
  // React will call this when rendering on the server.
  const getSnapshot = () => current
  const getServerSnapshot = () => current
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
