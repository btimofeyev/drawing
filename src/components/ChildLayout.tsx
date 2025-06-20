'use client'

import { useState, useEffect } from 'react'
import { 
  Home,
  Palette, 
  Star, 
  Trophy, 
  Calendar,
  Camera,
  Users,
  Target,
  TrendingUp,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Child {
  id: string
  username: string
  name: string
  ageGroup: 'kids' | 'tweens'
}

interface UserStats {
  points: number
  level: number
}

interface ChildLayoutProps {
  children: React.ReactNode
}

export default function ChildLayout({ children }: ChildLayoutProps) {
  const [child, setChild] = useState<Child | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/child/stats')
      if (response.ok) {
        const data = await response.json()
        setChild(data.child)
        setUserStats({ points: data.stats.points, level: data.stats.level })
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/child/signout', { method: 'POST' })
    } catch (error) {
      console.error('Sign out failed:', error)
    } finally {
      window.location.href = '/'
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/child-home', icon: Home },
    { name: 'Create Art', href: '/create', icon: Camera },
    { name: 'Art Gallery', href: '/gallery', icon: Users },
    { name: 'My Profile', href: '/profile', icon: Star },
    { name: 'Challenges', href: '/challenges', icon: Target },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Leaderboards', href: '/leaderboards', icon: TrendingUp },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{background: 'var(--gradient-primary)'}}>
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Daily Draw</h1>
                <p className="text-sm text-slate-600">{child?.name || 'Artist'}</p>
              </div>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                   style={{background: 'var(--gradient-purple)'}}>
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Level {userStats?.level || 1}</h3>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="h-4 w-4 text-accent-600" />
                <span className="font-bold text-accent-700">{userStats?.points || 0} points</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}>
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{background: 'var(--gradient-primary)'}}>
                <Palette className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-slate-800">Daily Draw</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-accent-600" />
              <span className="font-bold text-accent-700 text-sm">{userStats?.points || 0}</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}