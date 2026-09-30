"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnersStrip } from "@/components/home/PartnersStrip";
import { MissionSection } from "@/components/home/MissionSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ProjectsGallery } from "@/components/home/ProjectsGallery";
import { LossEstimator } from "@/components/home/LossEstimator";
import { AssociationTracker } from "@/components/home/AssociationTracker";
import { TechnicalSpecs } from "@/components/home/TechnicalSpecs";
import { TechnicalPartnerSection } from "@/components/home/TechnicalPartnerSection";
import { InstitutionalPartners } from "@/components/home/InstitutionalPartners";
import { DonorsSection } from "@/components/home/DonorsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";

export default function HomePage() {
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#060911] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Fixed Navigation */}
      <Navbar
        onOpenAuditModal={() => setAuditModalOpen(true)}
        onOpenDonationModal={() => setDonationModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        <HeroSection
          onOpenAuditModal={() => setAuditModalOpen(true)}
          onOpenDonationModal={() => setDonationModalOpen(true)}
        />
        <PartnersStrip />
        <MissionSection />
        <HowItWorksSection onOpenAuditModal={() => setAuditModalOpen(true)} />
        <ProjectsGallery />
        <LossEstimator onOpenAuditModal={() => setAuditModalOpen(true)} />
        <AssociationTracker onOpenAuditModal={() => setAuditModalOpen(true)} />
        <TechnicalSpecs onOpenAuditModal={() => setAuditModalOpen(true)} />
        <TechnicalPartnerSection />
        <InstitutionalPartners />
        <DonorsSection onOpenDonationModal={() => setDonationModalOpen(true)} />
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <AuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
    </div>
  );
}
