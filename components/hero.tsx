'use client';

import { ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-0 px-6 overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-secondary text-accent rounded-full text-sm font-medium border border-border">
              ✨ Introducing Velocity Pro
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-balance leading-tight">
                Move faster than<span className="text-accent"> ever</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                The fastest infrastructure platform for teams that refuse to compromise on performance, security, or developer experience.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition font-semibold flex items-center justify-center gap-2">
                Start Building <ArrowRight size={18} />
              </button>
              <button className="px-6 py-3 border border-border text-foreground hover:bg-secondary transition rounded-lg font-semibold flex items-center justify-center gap-2">
                <Play size={18} /> Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary border-2 border-background" />
                ))}
              </div>
              <p>Join 10,000+ companies shipping faster</p>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Animated gradient bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-secondary/10 rounded-3xl blur-3xl" />
              
              {/* Code-like visual */}
              <div className="relative bg-card border border-border rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-4 font-mono text-sm">
                  <div className="text-muted-foreground">{'// Deploy in seconds'}</div>
                  <div className="flex gap-2">
                    <span className="text-accent">$</span>
                    <span className="text-foreground">velocity deploy --production</span>
                  </div>
                  <div className="mt-6 text-muted-foreground text-xs space-y-2">
                    <div>{'✓ Build optimized'}</div>
                    <div>{'✓ Tests passed'}</div>
                    <div>{'✓ Deployed to edge'}</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      <span className="text-accent">Live at v3.velocity.app</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
