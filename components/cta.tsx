'use client';

import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="py-20 md:py-32 px-6 border-t border-border">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-accent/10 via-secondary/5 to-transparent border border-accent/30 rounded-2xl p-12 md:p-16 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to move faster?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of teams already shipping with Velocity. Get started free—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="px-8 py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition font-semibold text-lg flex items-center justify-center gap-2">
              Start Your Free Trial <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 border border-accent text-foreground hover:bg-accent/10 transition rounded-lg font-semibold text-lg">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
