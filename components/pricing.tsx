'use client';

import { Check, ArrowRight } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '29',
      description: 'Perfect for small projects',
      features: [
        'Up to 100k requests/month',
        '1 deployment per day',
        'Basic analytics',
        'Community support',
        '99% uptime SLA',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '99',
      description: 'For scaling teams',
      features: [
        'Unlimited requests',
        'Unlimited deployments',
        'Advanced analytics',
        'Priority support',
        '99.9% uptime SLA',
        'Custom domains',
        'Auto-scaling',
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
        'On-premise option',
        'Advanced security',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Always flexible to scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border transition-all ${
                plan.highlighted
                  ? 'border-accent bg-secondary/40 ring-2 ring-accent shadow-xl shadow-accent/10 scale-105'
                  : 'border-border bg-card hover:border-accent'
              }`}
            >
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    {plan.price !== 'Custom' && (
                      <span className="text-sm text-muted-foreground font-normal">/mo</span>
                    )}
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                    plan.highlighted
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'border border-border text-foreground hover:border-accent'
                  }`}
                >
                  {plan.cta} <ArrowRight size={18} />
                </button>

                <div className="space-y-3 pt-6 border-t border-border">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
