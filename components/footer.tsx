'use client';

import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/20 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-sm">V</span>
              </div>
              <span className="font-bold">Velocity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Build faster, deploy smarter, scale infinitely.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Features</a></li>
              <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
              <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              <li><a href="#" className="hover:text-foreground transition">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">About</a></li>
              <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Docs</a></li>
              <li><a href="#" className="hover:text-foreground transition">API Ref</a></li>
              <li><a href="#" className="hover:text-foreground transition">Community</a></li>
              <li><a href="#" className="hover:text-foreground transition">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
              <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
              <li><a href="#" className="hover:text-foreground transition">Cookies</a></li>
              <li><a href="#" className="hover:text-foreground transition">GDPR</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Velocity. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
