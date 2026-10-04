"use client";

import React, { useState } from "react";
import { FAQS } from "@/lib/data";
import { HelpCircle, ChevronDown } from "lucide-react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 lg:py-24 bg-[#080d19]/80 backdrop-blur-sm border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Clarificări & Răspunsuri
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Întrebări Frecvente (FAQ)
          </h2>
          <p className="mt-4 text-slate-400 text-base leading-relaxed">
            Tot ce trebuie să știe comitetul executiv și locatarii înainte de depunerea cererii.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden transition-all shadow-lg"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-6 text-left text-white hover:text-emerald-400 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold pr-4">{faq.q}</span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-emerald-500 text-slate-950 rotate-180"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-800/80 leading-relaxed animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
