"use client";

import { useEffect, useRef, useState } from "react";

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
    const startVol = audio.volume;
    const steps = 30;
    const stepVol = startVol / steps;
    const stepMs = FADE_OUT_MS / steps;
    let n = 0;
    fadeRef.current = setInterval(() => {
      n++;
      audio.volume = Math.max(0, startVol - stepVol * n);
      if (n >= steps) {
        clearFade();
        onDone();
      }
    }, stepMs);
  }

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const savedMuted = localStorage.getItem("adam_music_muted") === "true";
    if (savedMuted) setMusicState("muted");

    return () => {
      clearFade();
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  function handleToggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicState === "idle" || musicState === "muted") {
      audio.volume = 0;
      audio.play().then(() => {
        setMusicState("playing");
        fadeIn(audio);
        localStorage.setItem("adam_music_muted", "false");
      }).catch(() => {});
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
        onClick={handleToggle}
        aria-label={musicState === "playing" ? "Mute ambient music" : "Play ambient music"}
        className="flex items-center justify-center w-10 h-10 rounded-full text-base transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "#f0f4f4",
          border: "1px solid rgba(47,158,154,0.2)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          color: "#2F9E9A",
        }}
      >
        {musicState === "idle"    && <span className="animate-pulse text-lg">♪</span>}
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
