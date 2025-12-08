import { useEffect, useRef } from 'react';
import { UserCheck, MapPinned, CheckCircle, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    icon: UserCheck,
    title: 'MR Login',
    description: 'Medical representatives log in through the mobile web app with secure credentials.',
  },
  {
    number: '02',
    icon: MapPinned,
    title: 'GPS Location',
    description: 'The app automatically acquires GPS location with accuracy verification.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Punch Visit',
    description: 'MR selects the doctor and punches the visit with timestamp and location.',
  },
  {
    number: '04',
    icon: TrendingUp,
    title: 'Admin Analytics',
    description: 'Admins view real-time dashboards with visits, routes, and productivity metrics.',
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.step-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, Seamless Workflow
          </h2>
          <p className="text-muted-foreground text-lg">
            From login to analytics, experience a streamlined process designed for efficiency.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="hidden lg:block absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-secondary to-pharma-blue" />

            <div className="space-y-8 lg:space-y-12">
              {steps.map((step, index) => (
                <div key={step.number} className="step-item flex items-start gap-6 lg:gap-8">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-pharma-lg">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary">{step.number}</span>
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
