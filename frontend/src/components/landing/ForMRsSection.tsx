import { useEffect, useRef } from 'react';
import { Smartphone, Wifi, WifiOff, Bell, Calendar, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mrFeatures = [
  { icon: Smartphone, text: 'Mobile-first PWA design' },
  { icon: Wifi, text: 'Real-time sync when online' },
  { icon: WifiOff, text: 'Offline mode support' },
  { icon: Bell, text: 'Push notifications' },
  { icon: Calendar, text: 'Daily visit schedule' },
  { icon: CheckCircle2, text: 'Easy visit punching' },
];

export function ForMRsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.mr-content',
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      gsap.fromTo(
        '.mr-mockup',
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
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
    <section ref={sectionRef} id="for-mrs" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="mr-content">
            <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              For Medical Representatives
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Your Field Companion
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A mobile-first experience designed for MRs on the go. Punch visits quickly, 
              track your daily schedule, and stay connected even without internet.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {mrFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mr-mockup flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-72 h-[580px] bg-foreground rounded-[3rem] p-3 shadow-pharma-xl">
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground rounded-b-2xl" />
                  
                  <div className="pt-10 px-5 pb-5 h-full overflow-hidden">
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground">Good Morning</p>
                      <h3 className="text-xl font-bold text-foreground">Rahul Kumar</h3>
                    </div>

                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-center shadow-pharma-lg">
                        <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <p className="text-primary-foreground font-semibold">Punch Visit Now</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Today's Visits</h4>
                      <div className="space-y-2">
                        {['Dr. Sharma - 9:30 AM', 'Dr. Patel - 11:00 AM', 'Dr. Singh - 2:30 PM'].map((visit, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="w-2 h-2 rounded-full bg-secondary" />
                            <span className="text-xs text-muted-foreground">{visit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
