import { Palette, Sparkles, Shield, Star, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="py-6 px-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container pink">
                <Palette />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                DrawingBuddy
              </h1>
            </div>
            <Link href="/get-started" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="section py-20">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto animate-fade-in">
              <div className="icon-container purple mx-auto mb-8" style={{width: '4rem', height: '4rem'}}>
                <Palette style={{width: '2rem', height: '2rem'}} />
              </div>
              
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                Daily Drawing
                <br />
                Adventures
              </h2>
              
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                A safe, creative space for young artists to explore, create, and share artwork through daily challenges
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/child" className="btn btn-primary btn-large">
                  <Sparkles />
                  Start Creating
                </Link>
                <Link href="/auth/parent" className="btn btn-secondary btn-large">
                  Parent Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-white/50">
          <div className="container">
            <div className="grid grid-3">
              <div className="card text-center animate-fade-in">
                <div className="icon-container mint mx-auto">
                  <Sparkles />
                </div>
                <h3 className="mb-4">Daily Challenges</h3>
                <p>Fresh, fun drawing prompts every day to spark creativity and imagination</p>
              </div>
              
              <div className="card text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                <div className="icon-container blue mx-auto">
                  <Shield />
                </div>
                <h3 className="mb-4">Safe Sharing</h3>
                <p>Share artwork in a secure, parent-monitored environment designed for kids</p>
              </div>
              
              <div className="card text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                <div className="icon-container orange mx-auto">
                  <Star />
                </div>
                <h3 className="mb-4">Creative Growth</h3>
                <p>Track progress and celebrate artistic milestones with badges and achievements</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="section">
          <div className="container">
            <div className="card max-w-3xl mx-auto text-center bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-100">
              <div className="icon-container peach mx-auto">
                <Heart />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-700">Safe & Secure</h3>
              <p className="text-lg text-slate-600">
                Parents create accounts first, then set up supervised profiles for their children
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-800 text-center">
        <div className="container">
          <p className="text-slate-400">© 2025 DrawingBuddy</p>
        </div>
      </footer>
    </div>
  );
}