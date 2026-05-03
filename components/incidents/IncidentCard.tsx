"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
} from "framer-motion";

/* ─── Types ─────────────────────────────────────────────────────────── */

export interface IncidentData {
  id: string;
  type: "leve" | "grave";
  status: "detected" | "confirmed" | "resolved";
  location: string;
  lat: number;
  lng: number;
  startedAt: Date;
  affectedVehicles: number;
  etaAuthorities?: number; // minutes
}

export interface IncidentCardProps {
  incident: IncidentData;
  onConfirm: (id: string) => void;
  onResolve: (id: string) => void;
  onViewOnMap: (lat: number, lng: number) => void;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

function formatElapsed(startedAt: Date): string {
  const seconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function useElapsedTimer(startedAt: Date, active: boolean): string {
  const [elapsed, setElapsed] = useState(() => formatElapsed(startedAt));
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setElapsed(formatElapsed(startedAt)), 1000);
    return () => clearInterval(id);
  }, [startedAt, active]);
  return elapsed;
}

function timeAgo(startedAt: Date): string {
  const minutes = Math.floor((Date.now() - startedAt.getTime()) / 60000);
  if (minutes < 1) return "hace un momento";
  if (minutes === 1) return "hace 1 min";
  return `hace ${minutes} min`;
}

/* ─── Animated check mark (SVG stroke-dashoffset) ───────────────────── */

function AnimatedCheck() {
  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--color-traffic-green)"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M7 12.5l3.5 3.5 6.5-7"
        stroke="var(--color-traffic-green)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

/* ─── Alert icon (rotates between ⚠ triangle and !) ─────────────────── */

function AlertIcon() {
  const [showBang, setShowBang] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setShowBang((v) => !v), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="relative w-5 h-5 flex-shrink-0" aria-hidden="true">
      <AnimatePresence mode="wait">
        {showBang ? (
          <motion.span
            key="bang"
            initial={{ opacity: 0, rotate: -15, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 15, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center text-[var(--color-traffic-red)] text-base font-black leading-none"
          >
            !
          </motion.span>
        ) : (
          <motion.span
            key="triangle"
            initial={{ opacity: 0, rotate: 15, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -15, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2L16.5 15H1.5L9 2Z"
                stroke="var(--color-traffic-red)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 7.5V10.5"
                stroke="var(--color-traffic-red)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="9" cy="13" r="0.75" fill="var(--color-traffic-red)" />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

/* ─── Leve stepper ───────────────────────────────────────────────────── */

const LEVE_STEPS = ["Documentar", "Despejar vía", "Asistencia"];

function LeveStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1.5 mt-3" role="list" aria-label="Pasos del protocolo">
      {LEVE_STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={label} className="flex items-center gap-1.5 flex-1" role="listitem">
            <div className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                className={[
                  "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold border",
                  done
                    ? "bg-[var(--color-traffic-green)] border-[var(--color-traffic-green)] text-[var(--color-text-inverse)]"
                    : active
                    ? "bg-[var(--color-traffic-amber-tint)] border-[var(--color-traffic-amber)] text-[var(--color-traffic-amber)]"
                    : "bg-transparent border-[var(--color-border-default)] text-[var(--color-text-muted)]",
                ].join(" ")}
                animate={done ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                aria-label={`${label}: ${done ? "completado" : active ? "en progreso" : "pendiente"}`}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </motion.div>
              <span
                className={[
                  "text-[10px] text-center leading-tight whitespace-nowrap",
                  done
                    ? "text-[var(--color-traffic-green)]"
                    : active
                    ? "text-[var(--color-traffic-amber)]"
                    : "text-[var(--color-text-muted)]",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
            {i < LEVE_STEPS.length - 1 && (
              <div
                className="h-px flex-1 mb-4"
                style={{
                  background: i < currentStep
                    ? "var(--color-traffic-green)"
                    : "var(--color-border-subtle)",
                }}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Grave authority status bar ─────────────────────────────────────── */

const GRAVE_STAGES = ["PNC notificado", "En camino", `ETA`];

function GraveStatusBar({ eta }: { eta?: number }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (stage >= GRAVE_STAGES.length - 1) return;
    const id = setTimeout(() => setStage((s) => s + 1), 3000);
    return () => clearTimeout(id);
  }, [stage]);

  const pct = Math.round((stage / (GRAVE_STAGES.length - 1)) * 100);

  return (
    <div className="mt-3 space-y-2">
      <div
        className="relative h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-border-subtle)" }}
        role="progressbar"
        aria-valuenow={stage + 1}
        aria-valuemin={1}
        aria-valuemax={GRAVE_STAGES.length}
        aria-label="Estado de respuesta de autoridades"
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: "var(--color-traffic-red)" }}
          initial={{ width: "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <div className="flex items-center justify-between">
        {GRAVE_STAGES.map((s, i) => {
          const label = s === "ETA" && eta != null ? `ETA ${eta} min` : s;
          return (
            <span
              key={s}
              className={[
                "text-[10px] font-medium",
                i <= stage
                  ? "text-[var(--color-traffic-red)]"
                  : "text-[var(--color-text-muted)]",
              ].join(" ")}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Eye icon ───────────────────────────────────────────────────────── */

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M1.5 8C1.5 8 4 3 8 3s6.5 5 6.5 5-2.5 5-6.5 5S1.5 8 1.5 8Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5a4 4 0 0 1 4 4c0 2.5-4 7-4 7s-4-4.5-4-7a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="7" cy="5.5" r="1.25" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M7 4v3.25l2 1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="5" width="11" height="5" rx="1" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3.5 5l1.5-2.5h4L10.5 5" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <circle cx="3.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1" />
      <circle cx="10.5" cy="10.5" r="1" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ─── State 1: Detected ──────────────────────────────────────────────── */

function DetectedContent({ incident, onResolve }: Pick<IncidentCardProps, "incident" | "onResolve">) {
  const elapsed = useElapsedTimer(incident.startedAt, true);

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
      {/* Diagonal stripe background */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[var(--radius-lg)]"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            rgba(239,159,39,0.04) 8px,
            rgba(239,159,39,0.04) 16px
          )`,
        }}
      />

      <div className="relative p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Pulsing badge */}
            <span
              className="relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
              style={{
                background: "var(--color-traffic-amber-tint)",
                color: "var(--color-traffic-amber)",
                border: "0.5px solid rgba(239,159,39,0.3)",
              }}
              role="status"
              aria-label="Estado: Detectando incidente"
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "var(--color-traffic-amber)" }}
                aria-hidden="true"
              />
              Detectando...
            </span>
          </div>

          {/* Live timer */}
          <div
            className="flex items-center gap-1 font-mono text-xs font-semibold tabular-nums"
            style={{ color: "var(--color-traffic-amber)" }}
            aria-label={`Tiempo detenido: ${elapsed}`}
          >
            <ClockIcon />
            {elapsed}
          </div>
        </div>

        {/* Location */}
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <MapPinIcon />
          <span className="truncate">{incident.location}</span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={() => {}}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--color-traffic-amber-tint)",
              color: "var(--color-traffic-amber)",
              border: "0.5px solid rgba(239,159,39,0.35)",
            }}
            aria-label="Ver que pasa: enviar notificacion a conductor cercano"
          >
            <EyeIcon />
            <span>Ver qué pasa</span>
          </button>

          <button
            onClick={() => onResolve(incident.id)}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "var(--color-border-subtle)",
              color: "var(--color-text-primary)",
              border: "0.5px solid var(--color-border-default)",
            }}
            aria-label="Marcar incidente como resuelto"
          >
            <CheckIcon />
            <span>Marcar resuelto</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── State 2: Confirmed ─────────────────────────────────────────────── */

function ConfirmedContent({ incident, onViewOnMap }: Pick<IncidentCardProps, "incident" | "onViewOnMap">) {
  const leveStep = 1; // example mid-progress

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertIcon />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--color-traffic-red)" }}
          >
            Accidente {incident.type}
          </span>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--color-text-muted)" }}
        >
          {timeAgo(incident.startedAt)}
        </span>
      </div>

      {/* Meta row */}
      <div
        className="flex items-center gap-3 text-xs"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <span className="flex items-center gap-1 truncate">
          <MapPinIcon />
          <span className="truncate">{incident.location}</span>
        </span>
        <span className="flex items-center gap-1 flex-shrink-0">
          <CarIcon />
          {incident.affectedVehicles} vehículos
        </span>
      </div>

      {/* Type-specific UI */}
      {incident.type === "leve" ? (
        <LeveStepper currentStep={leveStep} />
      ) : (
        <GraveStatusBar eta={incident.etaAuthorities} />
      )}

      {/* View on map */}
      <button
        onClick={() => onViewOnMap(incident.lat, incident.lng)}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 mt-1"
        style={{
          background: "var(--color-traffic-red-tint)",
          color: "var(--color-traffic-red)",
          border: "0.5px solid rgba(226,75,74,0.35)",
        }}
        aria-label={`Ver incidente en ${incident.location} en el mapa`}
      >
        <MapPinIcon />
        Ver en mapa
      </button>
    </div>
  );
}

/* ─── State 3: Resolved ──────────────────────────────────────────────── */

function ResolvedContent({ incident }: { incident: IncidentData }) {
  return (
    <div className="p-4 flex items-center gap-3">
      <AnimatedCheck />
      <div>
        <p
          className="text-xs font-medium"
          style={{ color: "var(--color-text-muted)" }}
        >
          Resuelto {timeAgo(incident.startedAt)} · Flujo normal restaurado
        </p>
      </div>
    </div>
  );
}

/* ─── IncidentCard (main export) ─────────────────────────────────────── */

export function IncidentCard({
  incident,
  onConfirm,
  onResolve,
  onViewOnMap,
}: IncidentCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse after 5s when resolved
  useEffect(() => {
    if (incident.status !== "resolved") return;
    const id = setTimeout(() => setCollapsed(true), 5000);
    return () => clearTimeout(id);
  }, [incident.status]);

  /* Border color by status */
  const borderColor =
    incident.status === "detected"
      ? "#EF9F27"
      : incident.status === "confirmed"
      ? "#E24B4A"
      : "var(--color-traffic-green)";

  /* Background tint for confirmed */
  const headerBg =
    incident.status === "confirmed"
      ? incident.type === "grave"
        ? "var(--color-traffic-red-tint)"
        : "rgba(239,159,39,0.07)"
      : "transparent";

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.article
          layout
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-[var(--radius-lg)]"
          style={{
            background: "var(--color-bg-surface)",
            borderLeft: `3px solid ${borderColor}`,
            border: `0.5px solid var(--color-border-default)`,
            borderLeftWidth: "3px",
            borderLeftColor: borderColor,
          }}
          aria-live={incident.status === "detected" ? "polite" : undefined}
          aria-label={`Incidente en ${incident.location}, estado: ${
            incident.status === "detected"
              ? "detectado"
              : incident.status === "confirmed"
              ? "confirmado"
              : "resuelto"
          }`}
        >
          {/* Optional colored top-header stripe for confirmed */}
          {incident.status === "confirmed" && (
            <div
              className="h-0.5 w-full"
              style={{ background: headerBg }}
              aria-hidden="true"
            />
          )}

          <AnimatePresence mode="wait">
            {incident.status === "detected" && (
              <motion.div
                key="detected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DetectedContent incident={incident} onResolve={onResolve} />
              </motion.div>
            )}

            {incident.status === "confirmed" && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
              >
                <ConfirmedContent incident={incident} onViewOnMap={onViewOnMap} />
              </motion.div>
            )}

            {incident.status === "resolved" && (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <ResolvedContent incident={incident} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.article>
      )}
    </AnimatePresence>
  );
}

export default IncidentCard;
