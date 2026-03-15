'use client';

import { useState } from 'react';
import { ChevronRight, ArrowUpRight, Zap, Lock, Gauge } from 'lucide-react';
import Header from '@/components/header';
import Hero from '@/components/hero';
import Stats from '@/components/stats';
import Features from '@/components/features';
import Pricing from '@/components/pricing';
import CTA from '@/components/cta';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
