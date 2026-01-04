"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const VIDEO_SOURCES = [
    { src: "/media/hero-demo.webm", type: "video/webm" },
    { src: "/media/hero-demo.mp4", type: "video/mp4" },
];

const POSTER_SRC = "/hero-demo-poster.svg";
const VIDEO_ENABLED = process.env.NEXT_PUBLIC_HERO_DEMO_VIDEO === "true";

export function HeroDemoMedia() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [userPausedOverride, setUserPausedOverride] = useState<boolean | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [videoErrored, setVideoErrored] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

        handleChange();

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                setIsInView(entries.some((entry) => entry.isIntersecting));
            },
            { threshold: 0.4 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const videoEnabled = VIDEO_ENABLED && !videoErrored;
    const hasUserToggled = userPausedOverride !== null;
    const isUserPaused = userPausedOverride ?? prefersReducedMotion;
    const shouldRenderVideo = videoEnabled && (!prefersReducedMotion || hasUserToggled);

    const shouldPlay =
        videoEnabled &&
        isInView &&
        !isUserPaused &&
        (!prefersReducedMotion || hasUserToggled);

    useEffect(() => {
        const node = videoRef.current;
        if (!node) return;

        if (shouldPlay) {
            const playPromise = node.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    setUserPausedOverride(true);
                });
            }
        } else {
            node.pause();
        }
    }, [shouldPlay]);

    const handleToggle = () => {
        if (!videoEnabled) return;
        setUserPausedOverride((prev) => !(prev ?? prefersReducedMotion));
    };

    const toggleLabel = useMemo(() => {
        if (!videoEnabled) return "Animation unavailable";
        return isPlaying ? "Pause animation" : "Play animation";
    }, [isPlaying, videoEnabled]);

    return (
        <div
            ref={containerRef}
            className="group relative overflow-hidden rounded-[calc(var(--radius)+6px)] border border-border bg-card surface-card transition-all duration-200 hover:border-foreground/20 hover:shadow-md focus-within:ring-2 focus-within:ring-ring/40"
        >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/30">
                {shouldRenderVideo ? (
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        loop
                        preload="metadata"
                        poster={POSTER_SRC}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)}
                        onError={() => {
                            setVideoErrored(true);
                            setIsPlaying(false);
                            setUserPausedOverride(true);
                        }}
                    >
                        {VIDEO_SOURCES.map((source) => (
                            <source key={source.src} src={source.src} type={source.type} />
                        ))}
                    </video>
                ) : (
                    <Image
                        src={POSTER_SRC}
                        alt="Preview of the MindBridge intake workspace"
                        fill
                        priority
                        sizes="(min-width: 1024px) 42vw, 100vw"
                        className="object-cover"
                    />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/55 via-transparent to-background/5" />
            </div>

            <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-[11px] uppercase tracking-wide text-muted-foreground shadow-sm">
                Demo preview
            </div>

            <button
                type="button"
                onClick={handleToggle}
                disabled={!videoEnabled}
                aria-pressed={isPlaying}
                aria-label={toggleLabel}
                className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {toggleLabel}
            </button>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-border/70 bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                <span>Live intake walkthrough</span>
                <span>{videoEnabled ? "Muted preview" : "Static preview"}</span>
            </div>
        </div>
    );
}
