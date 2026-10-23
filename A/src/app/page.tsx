import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { MissionSection } from "@/components/home/MissionSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ProjectsGallery } from "@/components/home/ProjectsGallery";
import { AssociationTracker } from "@/components/home/AssociationTracker";
import { TechnicalSpecs } from "@/components/home/TechnicalSpecs";
import { TechnicalPartnerSection } from "@/components/home/TechnicalPartnerSection";
import { InstitutionalPartners } from "@/components/home/InstitutionalPartners";
import { DonorsSection } from "@/components/home/DonorsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ModalProvider } from "@/context/ModalContext";

export default function HomePage() {
  return (
    <ModalProvider>
      <div className="min-h-screen flex flex-col bg-transparent text-slate-900 selection:bg-amber-500 selection:text-slate-950">
        {/* Fixed Navigation */}
        <Navbar />

        {/* Main Content Sections */}
        <main className="flex-1">
          <HeroSection />
          <PartnersStrip />
          <MissionSection />
          <HowItWorksSection />
          <ProjectsGallery />
          <AssociationTracker />
          <TechnicalSpecs />
          <TechnicalPartnerSection />
          <InstitutionalPartners />
          <DonorsSection />
          <FAQSection />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ModalProvider>
  );
}
