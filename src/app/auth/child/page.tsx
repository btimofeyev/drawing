'use client'

import { useState } from 'react'
import { ArrowLeft, User, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ChildAuthPage() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'username' | 'pin'>('username')
  const router = useRouter()

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length >= 3) {
      setStep('pin')
      setError('')
    }
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      
      if (newPin.length === 4) {
        handleSignIn(newPin)
      }
    }
  }

  const handlePinDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleSignIn = async (finalPin: string = pin) => {
    if (finalPin.length !== 4) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/child/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          pin: finalPin 
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push('/child-home')
      } else {
        setError('Wrong username or PIN. Please try again.')
        setPin('')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
      setPin('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'pin') {
      setStep('username')
      setPin('')
      setError('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg fade-in">
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 float"
                 style={{background: 'var(--gradient-primary)'}}>
              {step === 'username' ? (
                <User className="h-10 w-10 text-white" />
              ) : (
                <Lock className="h-10 w-10 text-white" />
              )}
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            {step === 'username' ? (
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Welcome Back!
              </span>
            ) : (
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent">
                Hi, {username}! 🎨
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-lg">
            {step === 'username' 
              ? 'Enter your artist username to continue creating!' 
              : 'Enter your secret 4-digit PIN to start drawing'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-primary-100 rounded-3xl p-10 shadow-xl">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center mb-6 font-medium">
              {error}
            </div>
          )}

          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-8">
              <div>
                <label htmlFor="username" className="block text-lg font-semibold text-gray-700 mb-3">
                  🎨 Your Artist Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="coolartist123"
                  maxLength={20}
                  required
                  className="w-full px-6 py-4 border-2 border-primary-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-200 focus:border-primary-500 text-lg font-medium transition-all duration-200 hover:border-primary-300"
                />
                <p className="text-sm text-gray-500 mt-2">✨ This is how other artists will know you!</p>
              </div>

              <button
                type="submit"
                disabled={username.length < 3}
                className="w-full text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 disabled:scale-100 disabled:opacity-60 transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{background: username.length >= 3 ? 'var(--gradient-primary)' : 'var(--color-gray-300)'}}
              >
                <span className="flex items-center justify-center gap-2">
                  Continue Creating
                  {username.length >= 3 && <span>🎨</span>}
                </span>
              </button>
            </form>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 wiggle"
                     style={{background: 'var(--gradient-secondary)'}}>
                  <span className="text-2xl font-bold text-white">
                    {username[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-700">@{username}</p>
                <p className="text-sm text-gray-500">🎨 Ready to create amazing art!</p>
              </div>

              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-700 mb-4">🔐 Enter your secret PIN</p>
                  <div className="flex justify-center gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full border-3 transition-all duration-200 ${
                          i < pin.length
                            ? 'border-primary-500 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{
                          background: i < pin.length ? 'var(--gradient-primary)' : 'transparent'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handlePinInput(digit.toString())}
                      disabled={isLoading}
                      className="aspect-square bg-white border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 rounded-2xl text-2xl font-bold text-gray-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      {digit}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleBack}
                    className="aspect-square bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-2xl text-sm font-bold text-gray-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => handlePinInput('0')}
                    disabled={isLoading}
                    className="aspect-square bg-white border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 rounded-2xl text-2xl font-bold text-gray-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    0
                  </button>
                  
                  <button
                    onClick={handlePinDelete}
                    className="aspect-square bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-2xl text-xl font-bold text-gray-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    ←
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="text-center p-6 bg-primary-50 rounded-2xl">
                  <div className="inline-flex items-center gap-3 text-primary-700">
                    <div className="w-6 h-6 border-3 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
                    <span className="font-medium">Getting your art studio ready... 🎨</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/auth/parent" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            <span>👨‍👩‍👧‍👦 Are you a parent? Sign in here</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}