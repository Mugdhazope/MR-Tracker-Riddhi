import { useEffect, useRef } from 'react';
import { MapPin, Clock, Route, BarChart3, Users, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Visit Tracking',
    description: 'Monitor MR visits as they happen with live GPS location updates and instant notifications.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Clock,
    title: 'GPS-Based Visit Punching',
    description: 'Accurate timestamp and location verification for every doctor visit with anti-spoofing measures.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Route,
    title: 'MR Route Replay',
    description: 'Visualize complete daily routes on interactive maps with chronological visit sequences.',
    color: 'bg-pharma-blue/10 text-pharma-blue',
  },
  {
    icon: BarChart3,
    title: 'Admin Analytics Dashboard',
    description: 'Comprehensive insights with charts, heatmaps, and productivity metrics for informed decisions.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Workforce Management',
    description: 'Track attendance, manage territories, and monitor team performance from a single dashboard.',
    color: 'bg-secondary/10 text-secondary',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security with offline sync capabilities and data encryption.',
    color: 'bg-pharma-blue/10 text-pharma-blue',
  },
];

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current?.querySelectorAll('.feature-card') || [],
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="product" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Product Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Field Operations
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete suite of tools designed specifically for pharmaceutical field-force management 
            and real-time visibility.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-card pharma-card p-6 lg:p-8 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
