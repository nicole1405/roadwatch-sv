"use client";

import { useState } from "react";
import {
  LayoutGroup,
  motion,
} from "framer-motion";
import { IncidentCard } from "@/components/incidents/IncidentCard";
import type { IncidentData } from "@/components/incidents/IncidentCard";

/* ─── Initial mock data ──────────────────────────────────────────────── */

const INITIAL: IncidentData[] = [
  {
    id: "inc-001",
    type: "grave",
    status: "confirmed",
    location: "Bulevar Los Próceres Km 4",
    lat: 13.6978,
    lng: -89.2230,
    startedAt: new Date(Date.now() - 7 * 60 * 1000),
    affectedVehicles: 4,
    etaAuthorities: 6,
  },
  {
    id: "inc-002",
    type: "leve",
    status: "detected",
    location: "Autopista Norte · Tramo San Marcos",
    lat: 13.6942,
    lng: -89.2195,
    startedAt: new Date(Date.now() - 2 * 60 * 1000 - 18 * 1000),
    affectedVehicles: 2,
  },
  {
    id: "inc-003",
    type: "leve",
    status: "resolved",
    location: "Calle Arce esq. 17 Av. Norte",
    lat: 13.6901,
    lng: -89.2158,
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
    affectedVehicles: 1,
  },
];

/* ─── Demo page ──────────────────────────────────────────────────────── */

export default function IncidentsDemoPage() {
  const [incidents, setIncidents] = useState<IncidentData[]>(INITIAL);

  function handleConfirm(id: string) {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status: "confirmed" as const } : inc
      )
    );
  }

  function handleResolve(id: string) {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === id ? { ...inc, status: "resolved" as const } : inc
      )
    );
  }

  function handleViewOnMap(lat: number, lng: number) {
    console.log("[v0] View on map:", lat, lng);
  }

  function resetDemo() {
    setIncidents(
      INITIAL.map((inc) => ({
        ...inc,
        startedAt: new Date(
          Date.now() -
            (inc.status === "resolved" ? 15 * 60 * 1000 : 2 * 60 * 1000)
        ),
      }))
    );
  }

  return (
    <main
      className="min-h-screen p-6 md:p-10 font-sans"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* Page header */}
      <header className="mb-8 max-w-lg">
        <p
          className="text-xs font-mono uppercase tracking-widest mb-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          RoadWatch SV · Sistema de incidentes
        </p>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          Tarjetas de incidentes
        </h1>
        <p
          className="mt-1.5 text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Tres estados visuales distintos — el usuario entiende de un vistazo
          sin leer instrucciones.
        </p>
      </header>

      {/* State pills legend */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { label: "Detectado", color: "#EF9F27" },
          { label: "Confirmado", color: "#E24B4A" },
          { label: "Resuelto", color: "var(--color-traffic-green)" },
        ].map(({ label, color }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "var(--color-bg-surface)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-default)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: color }}
              aria-hidden="true"
            />
            {label}
          </span>
        ))}
      </div>

      {/* Cards list with LayoutGroup for smooth reordering */}
      <LayoutGroup>
        <motion.section
          layout
          className="max-w-sm space-y-3"
          aria-label="Lista de incidentes activos"
        >
          {incidents.map((incident) => (
            <motion.div key={incident.id} layout>
              <IncidentCard
                incident={incident}
                onConfirm={handleConfirm}
                onResolve={handleResolve}
                onViewOnMap={handleViewOnMap}
              />
            </motion.div>
          ))}
        </motion.section>
      </LayoutGroup>

      {/* Demo controls */}
      <section className="mt-10 max-w-sm space-y-3" aria-label="Controles de demostración">
        <p
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: "var(--color-text-muted)" }}
        >
          Controles de demo
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setIncidents((prev) =>
                prev.map((inc) =>
                  inc.id === "inc-002"
                    ? { ...inc, status: "confirmed" as const }
                    : inc
                )
              )
            }
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: "var(--color-traffic-red-tint)",
              color: "var(--color-traffic-red)",
              border: "0.5px solid rgba(226,75,74,0.35)",
            }}
          >
            Confirmar inc-002
          </button>

          <button
            onClick={() =>
              setIncidents((prev) =>
                prev.map((inc) =>
                  inc.id === "inc-001"
                    ? { ...inc, status: "resolved" as const }
                    : inc
                )
              )
            }
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: "var(--color-traffic-green-tint)",
              color: "var(--color-traffic-green)",
              border: "0.5px solid rgba(29,158,117,0.35)",
            }}
          >
            Resolver inc-001
          </button>

          <button
            onClick={resetDemo}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-[0.98]"
            style={{
              background: "var(--color-border-subtle)",
              color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-default)",
            }}
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  );
}
