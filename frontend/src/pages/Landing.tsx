import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { ForMRsSection } from '@/components/landing/ForMRsSection';
import { ForAdminsSection } from '@/components/landing/ForAdminsSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { Footer } from '@/components/landing/Footer';
import { Helmet } from 'react-helmet-async';

export default function Landing() {
  return (
    <>
      <Helmet>
        <title>Riddhi Life Sciences - MR Visit Tracker | Field-Force Management</title>
        <meta 
          name="description" 
          content="Empower your pharmaceutical field-force with real-time visit tracking, GPS-based monitoring, and comprehensive analytics. Streamline MR operations with Riddhi Life Sciences." 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <ForMRsSection />
          <ForAdminsSection />
          <StatsSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
