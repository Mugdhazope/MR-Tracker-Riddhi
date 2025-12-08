import { useEffect, useRef } from 'react';
import { LayoutDashboard, Map, FileBarChart, Download, Users2, Shield } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const adminFeatures = [
  { icon: LayoutDashboard, text: 'Comprehensive dashboard' },
  { icon: Map, text: 'Live map tracking' },
  { icon: FileBarChart, text: 'Detailed reports' },
  { icon: Download, text: 'Export to Excel/PDF' },
  { icon: Users2, text: 'Team management' },
  { icon: Shield, text: 'Role-based access' },
];

export function ForAdminsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.admin-mockup',
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
        '.admin-content',
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
    <section ref={sectionRef} id="for-admins" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="admin-mockup order-2 lg:order-1">
            <div className="relative">
              <div className="bg-foreground rounded-2xl p-2 shadow-pharma-xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-muted-foreground/20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="bg-muted-foreground/20 rounded-full h-6 max-w-md" />
                  </div>
                </div>

                <div className="bg-background rounded-b-xl p-6 min-h-[350px]">
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Visits Today', value: '156' },
                      { label: 'Active MRs', value: '24' },
                      { label: 'Coverage', value: '87%' },
                      { label: 'Top Doctor', value: 'Dr. A' },
                    ].map((stat, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                        <div className="text-lg font-bold text-foreground">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 h-40 bg-muted/50 rounded-lg p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Daily Visits</div>
                      <div className="flex items-end gap-2 h-24">
                        {[40, 65, 55, 80, 70, 90, 75].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="h-40 bg-muted/50 rounded-lg p-4">
                      <div className="text-xs font-medium text-muted-foreground mb-2">By Territory</div>
                      <div className="space-y-2 mt-4">
                        {['North', 'South', 'East'].map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-muted-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-secondary/10 rounded-full blur-xl" />
            </div>
          </div>

          <div className="admin-content order-1 lg:order-2">
            <span className="inline-block px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              For Administrators
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Complete Control Center
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A powerful admin dashboard that gives you full visibility into your field operations. 
              Track attendance, monitor routes, analyze productivity, and export reports effortlessly.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {adminFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors border border-border"
                >
                  <feature.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
