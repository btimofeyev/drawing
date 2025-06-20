'use client'

import { useState } from 'react'
import { Shield, Mail, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ParentAuthPage() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/parent/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setStep('code')
        setMessage('Check your email for your access code')
      } else {
        setMessage('Failed to send access code. Please try again.')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/parent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })

      const data = await response.json()
      console.log('Verify response:', { status: response.status, data })

      if (response.ok && data.success) {
        console.log('Success! Redirecting to /parent')
        // Try multiple redirect methods
        try {
          router.push('/parent')
          // Fallback to window.location if router.push fails
          setTimeout(() => {
            window.location.href = '/parent'
          }, 100)
        } catch (error) {
          console.error('Router push failed:', error)
          window.location.href = '/parent'
        }
      } else {
        console.log('Verification failed:', data)
        setMessage(data.error || 'Invalid code. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg fade-in">
        <div className="text-center mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 float">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Parent Access</h1>
          <p className="text-gray-600 text-lg">
            Secure access to safely manage your children's creative accounts
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-3xl p-10 shadow-xl">
          {message && (
            <div className={`p-4 rounded-2xl mb-6 font-medium ${
              message.includes('Check your email') 
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-8">
              <div>
                <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-3">
                  🔒 Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  required
                  className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-blue-300"
                />
                <p className="text-sm text-gray-500 mt-2">📧 We'll send you a secure access code</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-700 hover:scale-105 disabled:scale-100 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Get Access Code
                      <span>🛡️</span>
                    </>
                  )}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  📧 Check your email!
                </p>
                <p className="text-gray-600">
                  We sent a 6-digit code to <br />
                  <strong className="text-blue-600">{email}</strong>
                </p>
              </div>

              <div>
                <label htmlFor="code" className="block text-lg font-semibold text-gray-700 mb-3">
                  🔐 Access Code
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-center text-3xl font-mono tracking-widest transition-all duration-200 hover:border-blue-300"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">Enter the 6-digit code from your email</p>
              </div>

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-blue-700 hover:scale-105 disabled:scale-100 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      Continue to Dashboard
                      <span>→</span>
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setMessage('')
                }}
                className="w-full text-blue-600 hover:text-blue-800 font-semibold py-3 transition-colors"
              >
                ← Use different email
              </button>
            </form>
          )}

          <div className="mt-8 text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-700 font-medium">
              {step === 'email' 
                ? "🔒 We'll send you a secure access code - no password needed!"
                : "📧 Didn't receive the code? Check your spam folder or try again"}
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            href="/auth/child" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
          >
            <span>🎨 Are you a young artist? Sign in here</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}