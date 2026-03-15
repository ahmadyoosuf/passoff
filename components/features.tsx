'use client';

import { Zap, Lock, Gauge, Code, BarChart3, Shield } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Blazing Fast',
      description: 'Optimized for speed with advanced caching and compression',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance certifications',
    },
    {
      icon: Gauge,
      title: 'Auto-Scaling',
      description: 'Handle traffic spikes without configuration',
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Intuitive API and comprehensive documentation',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Real-time insights into performance and usage',
    },
    {
      icon: Shield,
      title: 'DDoS Protection',
      description: 'Advanced threat detection and mitigation',
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 bg-secondary/20 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything you need
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Powerful features designed for modern development teams
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-8 rounded-xl bg-card border border-border hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/10 group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition">
                  <Icon size={24} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
