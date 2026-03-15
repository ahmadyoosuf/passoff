'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-sm">V</span>
            </div>
            <span className="text-xl font-bold hidden sm:inline">Velocity</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Product
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition">
              Company
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-sm text-foreground hover:text-muted-foreground transition">
              Sign In
            </button>
            <button className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition font-medium">
              Get Started
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="md:hidden mt-4 py-4 border-t border-border space-y-3">
            <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Product
            </a>
            <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Pricing
            </a>
            <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </a>
            <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition">
              Company
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
