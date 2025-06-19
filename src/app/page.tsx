import { Palette, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="border-b border-primary-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                   style={{background: 'var(--gradient-primary)'}}>
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DrawingBuddy</h1>
            </div>
            <Link href="/get-started">
              <button className="text-white font-medium py-2 px-6 rounded-xl hover:scale-105 transition-all duration-200"
                      style={{background: 'var(--gradient-primary)'}}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Properly Spaced */}
      <main className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-20">
            {/* Main Icon */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 float shadow-2xl"
                 style={{background: 'var(--gradient-primary)'}}>
              <Palette className="h-12 w-12 text-white" />
            </div>
            
            {/* Main Heading */}
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Daily Drawing
              </span>
              <br />
              <span className="bg-gradient-to-r from-secondary-500 to-accent-500 bg-clip-text text-transparent">
                Adventures
              </span>
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              A safe, creative space for young artists to explore, create, and share artwork through daily challenges
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/child">
                <button className="text-white font-bold text-lg px-10 py-4 rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg"
                        style={{background: 'var(--gradient-primary)'}}>
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Start Creating
                    <span>🎨</span>
                  </span>
                </button>
              </Link>
              <Link href="/auth/parent">
                <button className="bg-white border-2 border-blue-300 text-blue-700 font-bold text-lg px-10 py-4 rounded-2xl hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg">
                  <span className="flex items-center gap-2">
                    <span>👨‍👩‍👧‍👦</span>
                    Parent Dashboard
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* App Features - Properly Spaced */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-primary-100 hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{background: 'var(--gradient-primary)'}}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Challenges</h3>
              <p className="text-gray-600 leading-relaxed">Fresh, fun drawing prompts every day to spark creativity and imagination</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-secondary-100 hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{background: 'var(--gradient-secondary)'}}>
                <Palette className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safe Sharing</h3>
              <p className="text-gray-600 leading-relaxed">Share artwork in a secure, parent-monitored environment designed for kids</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-accent-100 hover:shadow-lg transition-all duration-300 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                   style={{background: 'var(--gradient-accent)'}}>
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Creative Growth</h3>
              <p className="text-gray-600 leading-relaxed">Track progress and celebrate artistic milestones with badges and achievements</p>
            </div>
          </div>
          
          {/* Security Message */}
          <div className="text-center">
            <div className="inline-block p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
              <p className="text-lg font-semibold text-gray-700 mb-2">🛡️ Safe & Secure</p>
              <p className="text-gray-600">Parents create accounts first, then set up supervised profiles for their children</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        <p>© 2025 DrawingBuddy</p>
      </footer>
    </div>
  );
}