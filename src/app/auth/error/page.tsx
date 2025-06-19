'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'Authentication failed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        
        <div className="space-y-3">
          <Link href="/auth/parent">
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200">
              Try Again
            </button>
          </Link>
          
          <Link href="/">
            <button className="w-full text-gray-600 hover:text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}