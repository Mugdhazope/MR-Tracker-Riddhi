import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 50000, suffix: '+', label: 'Visits Tracked' },
  { value: 500, suffix: '+', label: 'MRs Managed' },
  { value: 99.5, suffix: '%', label: 'Uptime' },
  { value: 15, suffix: '+', label: 'Territories Covered' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() {
              setCount(Math.floor(this.targets()[0].val));
            },
          });
        },
        once: true,
      });
    }, counterRef);

    return () => ctx.revert();
  }, [value]);

  return (
    <span ref={counterRef}>
      {value % 1 === 0 ? count.toLocaleString() : count.toFixed(1)}{suffix}
    </span>
  );
}

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-primary to-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Trusted by Pharma Teams
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Join hundreds of pharmaceutical companies who trust Riddhi Life Sciences 
            for their field-force management needs.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-primary-foreground/70 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
