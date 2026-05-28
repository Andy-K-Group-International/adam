"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  src: string;
  credit: string;
  creditUrl: string;
}

type MusicState = "idle" | "playing" | "muted";

const TARGET_VOLUME = 0.12;
const FADE_IN_MS = 3000;
const FADE_OUT_MS = 800;

export default function AmbientMusic({ src, credit, creditUrl }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [musicState, setMusicState] = useState<MusicState>("idle");

  function clearFade() {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  }

  function fadeIn(audio: HTMLAudioElement) {
    clearFade();
    const steps = 60;
    const stepVol = TARGET_VOLUME / steps;
    const stepMs = FADE_IN_MS / steps;
    let n = 0;
    fadeRef.current = setInterval(() => {
      n++;
      audio.volume = Math.min(stepVol * n, TARGET_VOLUME);
      if (n >= steps) clearFade();
    }, stepMs);
  }

  function fadeOut(audio: HTMLAudioElement, onDone: () => void) {
    clearFade();
    const steps = 30;
    const stepVol = audio.volume / steps;
    const stepMs = FADE_OUT_MS / steps;
    let n = 0;
    fadeRef.current = setInterval(() => {
      n++;
      audio.volume = Math.max(0, audio.volume - stepVol);
      if (n >= steps) {
        clearFade();
        onDone();
      }
    }, stepMs);
  }

  const startPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio.play().then(() => {
      setMusicState("playing");
      fadeIn(audio);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const savedMuted = localStorage.getItem("adam_music_muted") === "true";

    // Try immediate autoplay
    audio.play().then(() => {
      if (savedMuted) {
        audio.pause();
        setMusicState("muted");
      } else {
        setMusicState("playing");
        fadeIn(audio);
      }
    }).catch(() => {
      // Browser blocked autoplay — wait for any user gesture
      setMusicState(savedMuted ? "muted" : "idle");
    });

    return () => {
      clearFade();
      audio.pause();
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Listen for first page interaction when in idle state
  useEffect(() => {
    if (musicState !== "idle") return;

    const handle = (e: Event) => {
      // Don't intercept button clicks — button's own handler runs instead
      const target = e.target as HTMLElement;
      if (target.closest("[data-music-btn]")) return;
      startPlayback();
    };

    document.addEventListener("click", handle);
    document.addEventListener("keydown", handle, { once: true });
    document.addEventListener("scroll", handle, { once: true });

    return () => {
      document.removeEventListener("click", handle);
      document.removeEventListener("keydown", handle);
      document.removeEventListener("scroll", handle);
    };
  }, [musicState, startPlayback]);

  function handleToggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicState === "idle" || musicState === "muted") {
      startPlayback();
      localStorage.setItem("adam_music_muted", "false");
    } else {
      fadeOut(audio, () => {
        audio.pause();
        setMusicState("muted");
      });
      setMusicState("muted");
      localStorage.setItem("adam_music_muted", "true");
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-1.5 select-none">
      <button
        data-music-btn
        onClick={handleToggle}
        aria-label={musicState === "playing" ? "Mute ambient music" : "Play ambient music"}
        className="flex items-center justify-center w-10 h-10 rounded-full text-base transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#faf6f3",
          color: "#01011b",
          border: "1px solid rgba(1,1,27,0.1)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        }}
      >
        {musicState === "idle"  && <span className="animate-pulse">♪</span>}
        {musicState === "playing" && <span>🔊</span>}
        {musicState === "muted"   && <span>🔇</span>}
      </button>
      <a
        href={creditUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] hover:underline transition-colors"
        style={{ color: "#8b93a8" }}
      >
        Music by {credit}
      </a>
    </div>
  );
}
