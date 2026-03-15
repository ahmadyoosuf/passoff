'use client';

export default function Stats() {
  const stats = [
    {
      number: '99.99%',
      label: 'Uptime Guaranteed',
      description: 'Enterprise-grade reliability',
    },
    {
      number: '<50ms',
      label: 'Global Latency',
      description: 'Lightning-fast edge delivery',
    },
    {
      number: '250+',
      label: 'Edge Locations',
      description: 'Worldwide infrastructure',
    },
    {
      number: '10B+',
      label: 'Requests/Day',
      description: 'Handling massive scale',
    },
  ];

  return (
    <section className="py-20 md:py-32 px-6 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-accent">
                {stat.number}
              </div>
              <div className="text-foreground font-semibold">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
