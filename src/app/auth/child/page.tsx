'use client'

import { useState } from 'react'
import { ArrowLeft, User, Lock, Palette, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 bg-white relative z-10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container pink">
                <Palette />
              </div>
              <h1 className="text-2xl font-bold text-slate-700">
                Daily Draw
              </h1>
            </div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg animate-fade-in">
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="icon-container pink mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
                {step === 'username' ? (
                  <Palette style={{width: '2rem', height: '2rem'}} />
                ) : (
                  <Sparkles style={{width: '2rem', height: '2rem'}} />
                )}
              </div>
            </div>
            
            <h2 className="text-5xl font-bold mb-6 text-slate-800 leading-tight">
              {step === 'username' ? (
                <>
                  Welcome Back!
                </>
              ) : (
                <>
                  Hi, <span className="text-pink-400">{username}</span>! 🎨
                </>
              )}
            </h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              {step === 'username' 
                ? 'Enter your artist username to continue creating!' 
                : 'Enter your secret 4-digit PIN to start drawing'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-lg">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center mb-6 font-medium">
              {error}
            </div>
          )}

          {step === 'username' ? (
            <form onSubmit={handleUsernameSubmit} className="space-y-8">
              <div>
                <label htmlFor="username" className="block text-lg font-semibold text-slate-700 mb-3">
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
                  className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-lg font-medium transition-all duration-200 hover:border-pink-300"
                />
                <p className="text-sm text-slate-500 mt-2">✨ This is how other artists will know you!</p>
              </div>

              <button
                type="submit"
                disabled={username.length < 3}
                className={`w-full font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                  username.length >= 3 
                    ? 'btn btn-primary' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  Continue Creating
                  {username.length >= 3 && <Sparkles className="h-4 w-4" />}
                </span>
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="icon-container mint mx-auto mb-3">
                  <span className="text-xl font-bold text-white">
                    {username[0]?.toUpperCase()}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-700">@{username}</p>
                <p className="text-sm text-slate-500">🎨 Ready to create amazing art!</p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-base font-semibold text-slate-700 mb-3">🔐 Enter your secret PIN</p>
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                          i < pin.length
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 border-pink-500 scale-110'
                            : 'border-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handlePinInput(digit.toString())}
                      disabled={isLoading}
                      className="w-16 h-16 bg-white border-2 border-slate-200 hover:border-pink-400 hover:bg-pink-50 rounded-xl text-xl font-bold text-slate-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-sm hover:shadow-md"
                    >
                      {digit}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleBack}
                    className="w-16 h-16 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => handlePinInput('0')}
                    disabled={isLoading}
                    className="w-16 h-16 bg-white border-2 border-slate-200 hover:border-pink-400 hover:bg-pink-50 rounded-xl text-xl font-bold text-slate-800 transition-all duration-200 hover:scale-105 disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    0
                  </button>
                  
                  <button
                    onClick={handlePinDelete}
                    className="w-16 h-16 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 rounded-xl text-lg font-bold text-slate-600 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    ←
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="text-center p-4 bg-pink-50 rounded-2xl">
                  <div className="inline-flex items-center gap-3 text-pink-700">
                    <div className="w-5 h-5 border-2 border-pink-300 border-t-pink-600 rounded-full animate-spin"></div>
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
              className="inline-flex items-center gap-2 text-slate-600 hover:text-pink-600 font-medium transition-colors"
            >
              <span>👨‍👩‍👧‍👦 Are you a parent? Sign in here</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}