"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowLeft, CheckCircle2, Clock, XCircle, Search, RefreshCw, Lock } from "lucide-react";
import { AuditRequest, DonationEntry, AuditStatus } from "@/lib/types";
import { INITIAL_ASSOCIATIONS } from "@/lib/data";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [requests, setRequests] = useState<AuditRequest[]>([...INITIAL_ASSOCIATIONS]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123" || password === "viziune2026") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Parolă incorectă. Încercați din nou.");
    }
  };

  const handleStatusChange = (id: string, newStatus: AuditStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter;
    const matchesSearch =
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase()) ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060911] text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white">Autentificare Administrare</h1>
            <p className="text-xs text-slate-400 mt-1">
              Panoul Asociației Viziune Urbană Ploiești
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Parolă Administrator
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduceți parola (ex: viziune2026)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all"
            >
              Autentificare
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Înapoi pe site-ul public
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">
                Panou Administrare — Viziune Urbană Ploiești
              </h1>
              <p className="text-xs text-slate-400">
                Gestionare cereri de audit tehnic și urmărire asociații
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" /> Vezi Site Public
            </Link>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20"
            >
              Deconectare
            </button>
          </div>
        </div>

        {/* Filters and search bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută bloc, stradă, telefon..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "nou", "in_evaluare", "acceptat", "finalizat"].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {st === "all" ? "Toate" : st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Requests Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Bloc / Asociație</th>
                  <th className="p-4">Contact Solicitant</th>
                  <th className="p-4">Descriere Problemă</th>
                  <th className="p-4">Progres Formulare & Fonduri</th>
                  <th className="p-4">Status & Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Nu au fost găsite cereri corespunzătoare filtrului.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{r.building}</div>
                        <div className="text-slate-400 mt-0.5">{r.address}</div>
                        <div className="text-[10px] text-slate-500 mt-1">ID: {r.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{r.name}</div>
                        <div className="font-mono text-emerald-400 mt-0.5">{r.phone}</div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="line-clamp-3 text-slate-300 leading-relaxed">
                          {r.problem}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-[11px]">
                          <div>
                            <span className="text-slate-400">ANAF 230: </span>
                            <strong className="text-emerald-400 font-mono">
                              {r.formsCollected}/{r.formsTarget}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Fond: </span>
                            <strong className="text-blue-400 font-mono">
                              {r.fundsCollected} / {r.fundsTarget} Lei
                            </strong>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value as AuditStatus)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="nou">Nou</option>
                          <option value="in_evaluare">În Evaluare</option>
                          <option value="acceptat">Acceptat</option>
                          <option value="respins">Respins</option>
                          <option value="finalizat">Finalizat</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
