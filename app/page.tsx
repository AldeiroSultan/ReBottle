// app/page.tsx
'use client'

import { useAuth } from './context/AuthContext'
import SignUp from './components/SignUp'
import Dashboard from './components/Dashboard'

export default function Home() {
  const { user } = useAuth()
  
  return (
    <main className="min-h-screen bg-gray-100">
      {!user ? <SignUp /> : <Dashboard />}
    </main>
  )
}