import { Palette } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-16 h-16 bg-pink-200 rounded-2xl transform rotate-12 opacity-40"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-blue-200 rounded-xl transform -rotate-6 opacity-50"></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-purple-200 rounded-3xl transform rotate-45 opacity-30"></div>
        <div className="absolute bottom-60 right-20 w-14 h-14 bg-orange-200 rounded-2xl transform -rotate-12 opacity-40"></div>
        <div className="absolute top-60 left-1/2 w-10 h-10 bg-teal-200 rounded-xl transform rotate-30 opacity-50"></div>
      </div>

      <header className="py-6 px-4 bg-white relative z-10">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container pink">
                <Palette />
              </div>
              <h1 className="text-2xl font-bold text-slate-700">
                Daily Scribble
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/child" className="btn btn-primary">
                Child Login
              </Link>
              <Link href="/auth/parent" className="btn btn-secondary">
                Parent Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container px-8">
          <div className="text-center max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-7xl font-bold mb-8 text-slate-800 leading-tight">
              Draw Every Day,
              <br />
              <span className="text-pink-400">Share Your Art</span>
            </h2>
            
            <p className="text-2xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed">
              Join a magical community of young artists in a safe, inspiring space to practice drawing with <span className="text-pink-400">daily creative challenges</span> and share your masterpieces.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <Link href="/auth/child" className="btn btn-primary btn-large">
                Start Creating
              </Link>
              <Link href="/auth/parent" className="btn btn-secondary btn-large">
                Parent Dashboard
              </Link>
            </div>

            <div className="flex justify-between items-center max-w-5xl mx-auto text-center">
              <div className="animate-fade-in flex-1">
                <div className="text-5xl font-bold text-slate-800 mb-3">Join</div>
                <div className="text-xl text-slate-600">Young Artists</div>
              </div>
              
              <div className="animate-fade-in flex-1" style={{animationDelay: '0.1s'}}>
                <div className="text-5xl font-bold text-slate-800 mb-3">Create</div>
                <div className="text-xl text-slate-600">& Share</div>
              </div>
              
              <div className="animate-fade-in flex-1" style={{animationDelay: '0.2s'}}>
                <div className="text-5xl font-bold text-slate-800 mb-3">Daily</div>
                <div className="text-xl text-slate-600">New Challenges</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-8 bg-white relative z-10">
        <div className="container">
          <p className="text-slate-500 text-center">© 2025 Daily Scribble</p>
        </div>
      </footer>
    </div>
  );
}