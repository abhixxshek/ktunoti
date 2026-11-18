"use client"

import React, { createContext, useContext, useState } from "react"

interface MobileNavContextType {
  mobileOpen: boolean
  setMobileOpen: (open: boolean) => void
  toggleMobile: () => void
}

const MobileNavContext = createContext<MobileNavContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  toggleMobile: () => {},
})

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleMobile = () => setMobileOpen((prev) => !prev)

  return (
    <MobileNavContext.Provider value={{ mobileOpen, setMobileOpen, toggleMobile }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  return useContext(MobileNavContext)
}

