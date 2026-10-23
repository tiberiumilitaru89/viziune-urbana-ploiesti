"use client";

import React, { createContext, useContext, useState } from "react";
import { AuditModal } from "@/components/modals/AuditModal";
import { DonationModal } from "@/components/modals/DonationModal";

type ModalContextType = {
  openAuditModal: () => void;
  openDonationModal: () => void;
  closeAuditModal: () => void;
  closeDonationModal: () => void;
};

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        openAuditModal: () => setAuditModalOpen(true),
        openDonationModal: () => setDonationModalOpen(true),
        closeAuditModal: () => setAuditModalOpen(false),
        closeDonationModal: () => setDonationModalOpen(false),
      }}
    >
      {children}
      <AuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
      />
      <DonationModal
        isOpen={donationModalOpen}
        onClose={() => setDonationModalOpen(false)}
      />
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return {
      openAuditModal: () => {},
      openDonationModal: () => {},
      closeAuditModal: () => {},
      closeDonationModal: () => {},
    };
  }
  return ctx;
}
