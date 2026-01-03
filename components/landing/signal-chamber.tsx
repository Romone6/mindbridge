"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

type Stage =
  | "arrival"
  | "calibration"
  | "capture"
  | "compression"
  | "clarity"
  | "readiness";

const stageOrder: Stage[] = [
  "arrival",
  "calibration",
  "capture",
  "compression",
  "clarity",
  "readiness",
];

const stageMeta: Record<
  Stage,
  {
    label: string;
    directive: string;
    measure: string;
  }
> = {
  arrival: {
    label: "Arrival",
    directive: "Hold still. Let the system find you.",
    measure: "Presence",
  },
  calibration: {
    label: "Calibration",
    directive: "Adjust gain. Reduce ambient noise.",
    measure: "Alignment",
  },
  capture: {
    label: "Signal Capture",
    directive: "Sweep and gather uncertainty.",
    measure: "Capture",
  },
  compression: {
    label: "Compression",
    directive: "Noise compresses into a single trace.",
    measure: "Compression",
  },
  clarity: {
    label: "Clarity Lock",
    directive: "Hold clarity. Confirm the lock.",
    measure: "Stability",
  },
  readiness: {
    label: "Readiness",
    directive: "Proceed with signal confirmed.",
    measure: "Readiness",
  },
};

const initialMetrics = {
  noise: 78,
  clarity: 16,
  compression: 12,
  stability: 10,
  presence: 0,
};

export function SignalChamberLanding() {
  const [stage, setStage] = useState<Stage>("arrival");
  const [gain, setGain] = useState(28);
  const [armed, setArmed] = useState(false);
  const [metrics, setMetrics] = useState(initialMetrics);

  const stageIndex = stageOrder.indexOf(stage);
  const stageInfo = stageMeta[stage];

  useEffect(() => {
    if (stage !== "arrival" || !armed) return undefined;
    const timer = setTimeout(() => setStage("calibration"), 1600);
    return () => clearTimeout(timer);
  }, [stage, armed]);

  useEffect(() => {
    if (stage !== "capture" && stage !== "compression") return undefined;
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const intensity = stage === "compression" ? 2.6 : 1.7;
        const gainImpact = gain * 0.03;
        const noise = Math.max(6, prev.noise - intensity - gainImpact);
        const clarity = Math.min(98, prev.clarity + intensity + gainImpact);
        const compression = Math.min(100, prev.compression + intensity * 1.2);
        const stability = Math.min(100, prev.stability + intensity * 0.9);
        return { ...prev, noise, clarity, compression, stability };
      });
    }, 240);
    return () => clearInterval(interval);
  }, [stage, gain]);

  useEffect(() => {
    if (stage === "capture" && metrics.compression > 58) {
      setStage("compression");
    }
    if (stage === "compression" && metrics.noise <= 20) {
      setStage("clarity");
    }
  }, [stage, metrics.compression, metrics.noise]);

  const handleGainChange = (value: number) => {
    setGain(value);
    setMetrics((prev) => ({
      ...prev,
      noise: Math.max(10, prev.noise - value * 0.02),
      clarity: Math.min(98, prev.clarity + value * 0.015),
    }));
    if (stage === "arrival") {
      setStage("calibration");
    }
    if (stage === "calibration") {
      setStage("capture");
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - rect.left - rect.width / 2;
    const dy = event.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const max = Math.min(rect.width, rect.height) / 2;
    const presence = Math.max(0, 100 - (distance / max) * 100);
    setMetrics((prev) => ({ ...prev, presence: Math.round(presence) }));
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (stage === "arrival" || stage === "calibration") return;
    const delta = Math.abs(event.deltaY) > 30 ? 2.4 : 1.2;
    setMetrics((prev) => ({
      ...prev,
      noise: Math.max(4, prev.noise - delta),
      clarity: Math.min(98, prev.clarity + delta),
      compression: Math.min(100, prev.compression + delta * 1.1),
    }));
    if (stage === "capture") {
      setStage("compression");
    }
  };

  const resetInstrument = () => {
    setStage("arrival");
    setGain(28);
    setMetrics(initialMetrics);
  };

  const trace = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const base = 18 + index * 3;
      const noiseVariance = (metrics.noise / 100) * (index % 2 ? 14 : 8);
      const clarityLift = (metrics.clarity / 100) * 22;
      return Math.max(6, base + clarityLift - noiseVariance);
    });
  }, [metrics.noise, metrics.clarity]);

  const noiseOpacity = Math.max(0.1, metrics.noise / 100 * 0.45);
  const noiseScale = 1 + metrics.noise / 100 * 0.08;
  const signalOpacity = Math.min(0.35, metrics.clarity / 100 * 0.28);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 signal-field motion-reduce:animate-none" />
      <div className="absolute inset-0 signal-grid opacity-40" />
      <div
        className="absolute inset-0 signal-noise mix-blend-multiply motion-reduce:animate-none"
        style={{ opacity: noiseOpacity, transform: `scale(${noiseScale})` }}
      />
      <div
        className="absolute inset-0"
        style={{ background: `rgba(34, 54, 240, ${signalOpacity})` }}
      />

      <div className="relative">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10 pt-24 pb-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(340px,440px)_1fr] items-start">
            <div
              className="lg:sticky lg:top-24 space-y-8"
              onPointerMove={handlePointerMove}
              onPointerEnter={() => setArmed(true)}
              onPointerLeave={() => setArmed(false)}
              onWheel={handleWheel}
            >
              <div className="signal-glow rounded-[20px] border border-border/70 bg-background/80 backdrop-blur-xl p-8">
                <div className="flex items-center justify-between">
                  <span className="signal-chip">MindBridge Instrument</span>
                  <span className="font-mono text-[11px] uppercase text-muted-foreground">
                    Stage {String(stageIndex + 1).padStart(2, "0")}/06
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  <h1 className="font-display text-4xl sm:text-5xl tracking-tight">
                    {stageInfo.label}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {stageInfo.directive}
                  </p>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{stageInfo.measure}</span>
                      <span className="text-foreground">{metrics.presence}%</span>
                    </div>
                    <div className="h-[2px] w-full bg-border/70">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${metrics.presence}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Noise</span>
                      <span className="text-foreground">{metrics.noise.toFixed(1)}</span>
                    </div>
                    <div className="h-[2px] w-full bg-border/70">
                      <div
                        className="h-full bg-foreground/60"
                        style={{ width: `${metrics.noise}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      <span>Clarity</span>
                      <span className="text-foreground">{metrics.clarity.toFixed(1)}</span>
                    </div>
                    <div className="h-[2px] w-full bg-border/70">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${metrics.clarity}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Gain</span>
                    <span className="text-foreground">{gain}</span>
                  </div>
                  <input
                    aria-label="Signal gain"
                    type="range"
                    min={12}
                    max={80}
                    value={gain}
                    onChange={(event) => handleGainChange(Number(event.target.value))}
                    className="w-full accent-foreground"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Compression</span>
                    <span>{metrics.compression.toFixed(1)}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  {stage === "clarity" && (
                    <Button
                      className="h-12 rounded-full text-xs uppercase tracking-[0.3em]"
                      onClick={() => setStage("readiness")}
                    >
                      Confirm lock
                    </Button>
                  )}
                  {stage === "readiness" && (
                    <Link href="/demo">
                      <Button className="h-12 w-full rounded-full text-sm font-semibold">
                        Observe live
                      </Button>
                    </Link>
                  )}
                  <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                      <Button
                        variant="outline"
                        className="h-11 w-full rounded-full text-[11px] uppercase tracking-[0.3em]"
                      >
                        Clinician access
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="h-11 w-full rounded-full text-[11px] uppercase tracking-[0.3em]"
                      >
                        Enter dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                  <button
                    onClick={resetInstrument}
                    className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    Reset instrument
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="signal-glow rounded-[22px] border border-border/60 bg-background/70 backdrop-blur-lg px-8 py-10">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                  <span>Signal Trace</span>
                  <span>Stability {metrics.stability.toFixed(1)}</span>
                </div>
                <div className="mt-8 flex items-end gap-2">
                  {trace.map((height, index) => (
                    <div
                      key={`${height}-${index}`}
                      className="w-3 bg-foreground/70"
                      style={{ height: `${height}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <div className="rounded-[14px] border border-border/60 bg-background/70 px-4 py-5">
                  <div className="text-foreground">Integrity</div>
                  <div className="mt-2 text-foreground">{metrics.stability.toFixed(1)}</div>
                </div>
                <div className="rounded-[14px] border border-border/60 bg-background/70 px-4 py-5">
                  <div className="text-foreground">Drift</div>
                  <div className="mt-2 text-foreground">{(100 - metrics.stability).toFixed(1)}</div>
                </div>
                <div className="rounded-[14px] border border-border/60 bg-background/70 px-4 py-5">
                  <div className="text-foreground">Clarity</div>
                  <div className="mt-2 text-foreground">{metrics.clarity.toFixed(1)}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {stageOrder.map((item, index) => (
                  <span
                    key={item}
                    className={`rounded-full border border-border/60 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.25em] ${
                      index <= stageIndex
                        ? "bg-foreground text-background"
                        : "bg-background/60 text-muted-foreground"
                    }`}
                  >
                    {stageMeta[item].label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
