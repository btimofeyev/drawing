'use client'

import { Palette, Shield, ArrowLeft, Sparkles, Heart, Star } from 'lucide-react'
import Link from 'next/link'

export default function GetStartedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12 fade-in">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 float"
                 style={{background: 'var(--gradient-rainbow)'}}>
              <Sparkles className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Welcome to
            </span>
            <br />
            <span className="bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent">
              Daily Scribble!
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Choose your adventure and let's start creating amazing art together! ✨
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Child Option */}
          <Link href="/auth/child">
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 cursor-pointer group border border-primary-100 bounce-in">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                   style={{background: 'var(--gradient-primary)'}}>
                <Palette className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">I'm an Artist!</h2>
              <p className="text-gray-600 text-center mb-8 text-lg leading-relaxed">
                Sign in to start creating, view daily challenges, and share your amazing artwork with friends! 🎨
              </p>
              
              <div className="flex items-center justify-center gap-3 font-bold text-lg group-hover:scale-110 transition-transform duration-300"
                   style={{color: 'var(--color-primary-600)'}}>
                <Heart className="h-6 w-6" />
                Let's Create!
                <Sparkles className="h-6 w-6" />
              </div>
              
              <div className="mt-6 text-center">
                <span className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold">
                  🌟 For Young Artists
                </span>
              </div>
            </div>
          </Link>

          {/* Parent Option */}
          <Link href="/auth/parent">
            <div className="bg-white rounded-3xl shadow-xl p-10 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 cursor-pointer group border border-blue-100 bounce-in"
                 style={{animationDelay: '0.2s'}}>
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                   style={{background: 'var(--gradient-secondary)'}}>
                <Shield className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">I'm a Parent</h2>
              <p className="text-gray-600 text-center mb-8 text-lg leading-relaxed">
                Create an account or sign in to safely manage your children's profiles and art-sharing settings 🛡️
              </p>
              
              <div className="flex items-center justify-center gap-3 text-blue-600 font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6" />
                Manage Accounts
                <Shield className="h-6 w-6" />
              </div>
              
              <div className="mt-6 text-center">
                <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                  👨‍👩‍👧‍👦 Parental Controls
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12 p-6 bg-white/50 rounded-2xl border border-gray-100 fade-in">
          <p className="text-gray-600 font-medium mb-2">🛡️ Safety First</p>
          <p className="text-sm text-gray-500">
            Parents create accounts first, then set up safe profiles for their children to start creating!
          </p>
        </div>
      </div>
    </div>
  )
}