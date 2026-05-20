"use client";

import { useEffect, useRef } from "react";

/**
 * Hero 背景の HUD（同心円）アニメーション
 *
 * - Canvas で 2 つの「ステーション」（同心円群）をゆっくり回転
 * - マウスホバーで近接ステーションが明るくなる軽いパララックス
 * - 画面外では requestAnimationFrame を停止して負荷を抑制
 */

type StationLayer =
  | { type: "ring"; r: number; a: number; w?: number }
  | { type: "dashed"; r: number; a: number }
  | {
      type: "ticks";
      r: number;
      count: number;
      len: number;
      a: number;
      longEvery?: number;
      longLen?: number;
    }
  | {
      type: "arc";
      r: number;
      sa: number;
      ea: number;
      a: number;
      w?: number;
      glow?: boolean;
    }
  | { type: "spokes"; r1: number; r2: number; count: number; a: number }
  | { type: "dot"; size: number; a: number; glow?: boolean };

type Station = {
  cx: number;
  cy: number;
  s: number;
  rot: number;
  rotSpeed: number;
  layers: StationLayer[];
};

function buildStations(W: number, H: number): Station[] {
  const minDim = Math.min(W, H);
  return [
    // BIG — 左下に大きく
    {
      cx: W * 0.18,
      cy: H * 0.78,
      s: minDim * 0.0021,
      rot: 0,
      rotSpeed: 0.016,
      layers: [
        { type: "ring", r: 500, a: 0.14, w: 1.0 },
        { type: "ticks", r: 478, count: 72, len: 8, a: 0.28 },
        { type: "dashed", r: 420, a: 0.26 },
        { type: "arc", r: 380, sa: 200, ea: 340, a: 0.85, w: 2.2 },
        {
          type: "ticks",
          r: 340,
          count: 36,
          len: 14,
          a: 0.4,
          longEvery: 6,
          longLen: 24,
        },
        { type: "ring", r: 280, a: 0.42, w: 1.4 },
        { type: "arc", r: 280, sa: 30, ea: 145, a: 1.0, w: 3.0, glow: true },
        { type: "ring", r: 210, a: 0.28 },
        { type: "ticks", r: 188, count: 24, len: 10, a: 0.52 },
        { type: "arc", r: 150, sa: 250, ea: 320, a: 0.9, w: 2.2, glow: true },
        { type: "ring", r: 110, a: 0.55, w: 1.2 },
        { type: "spokes", r1: 110, r2: 280, count: 6, a: 0.16 },
        { type: "dot", size: 4, a: 1.0, glow: true },
      ],
    },
    // MED — 右上の小さな station
    {
      cx: W * 0.86,
      cy: H * 0.18,
      s: minDim * 0.0014,
      rot: 0,
      rotSpeed: -0.022,
      layers: [
        { type: "ring", r: 360, a: 0.12, w: 1.0 },
        { type: "ticks", r: 340, count: 48, len: 5, a: 0.24 },
        { type: "dashed", r: 300, a: 0.2 },
        { type: "arc", r: 260, sa: 100, ea: 200, a: 0.8, w: 2.2 },
        {
          type: "ticks",
          r: 220,
          count: 24,
          len: 12,
          a: 0.38,
          longEvery: 4,
          longLen: 20,
        },
        { type: "ring", r: 170, a: 0.46, w: 1.4 },
        { type: "arc", r: 170, sa: 230, ea: 330, a: 1.0, w: 2.6, glow: true },
        { type: "ring", r: 110, a: 0.32 },
        { type: "ticks", r: 95, count: 18, len: 9, a: 0.5 },
        { type: "ring", r: 60, a: 0.5, w: 1.2 },
        { type: "dot", size: 3, a: 1.0, glow: true },
      ],
    },
  ];
}

function drawStation(
  ctx: CanvasRenderingContext2D,
  st: Station,
  mouseDist: number,
) {
  const boost = mouseDist < 320 ? 1 - mouseDist / 320 : 0;
  ctx.save();
  ctx.translate(st.cx, st.cy);
  ctx.rotate(st.rot);

  for (const L of st.layers) {
    if (L.type === "ring") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      ctx.beginPath();
      ctx.lineWidth = L.w ?? 1;
      ctx.strokeStyle = `rgba(170,210,255,${a})`;
      ctx.arc(0, 0, L.r * st.s, 0, Math.PI * 2);
      ctx.stroke();
    } else if (L.type === "dashed") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = `rgba(180,220,255,${a})`;
      ctx.arc(0, 0, L.r * st.s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (L.type === "ticks") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      const longEvery = L.longEvery ?? 0;
      const longLen = L.longLen ?? L.len;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(180,220,255,${a})`;
      ctx.beginPath();
      const r = L.r * st.s;
      for (let i = 0; i < L.count; i++) {
        const ang = (i / L.count) * Math.PI * 2;
        const isLong = longEvery && i % longEvery === 0;
        const useLen = (isLong ? longLen : L.len) * st.s;
        ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        ctx.lineTo(Math.cos(ang) * (r + useLen), Math.sin(ang) * (r + useLen));
      }
      ctx.stroke();
    } else if (L.type === "arc") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      ctx.lineWidth = L.w ?? 2;
      if (L.glow) {
        ctx.shadowColor = "rgba(180,220,255,0.9)";
        ctx.shadowBlur = 12;
      }
      ctx.strokeStyle = `rgba(220,238,255,${a})`;
      ctx.beginPath();
      ctx.arc(
        0,
        0,
        L.r * st.s,
        (L.sa * Math.PI) / 180,
        (L.ea * Math.PI) / 180,
      );
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (L.type === "spokes") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      const r1 = L.r1 * st.s;
      const r2 = L.r2 * st.s;
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(180,220,255,${a})`;
      ctx.beginPath();
      for (let i = 0; i < L.count; i++) {
        const ang = (i / L.count) * Math.PI * 2;
        ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
        ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
      }
      ctx.stroke();
    } else if (L.type === "dot") {
      const a = Math.min(L.a * (1 + boost * 0.6), 1);
      ctx.fillStyle = `rgba(220,240,255,${a})`;
      if (L.glow) {
        ctx.shadowColor = "rgba(180,220,255,0.9)";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(0, 0, L.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();
}

export function HeroHudBackground() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = {
      w: 0,
      h: 0,
      dpr: 1,
      mouse: { x: -9999, y: -9999, active: false },
      stations: [] as Station[],
    };

    function fit() {
      if (!wrap || !canvas || !ctx) return;
      const r = wrap.getBoundingClientRect();
      state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      state.w = r.width;
      state.h = r.height;
      canvas.width = Math.round(state.w * state.dpr);
      canvas.height = Math.round(state.h * state.dpr);
      canvas.style.width = `${state.w}px`;
      canvas.style.height = `${state.h}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      const prev = state.stations.map((s) => s.rot);
      state.stations = buildStations(state.w, state.h);
      state.stations.forEach((s, i) => {
        if (prev[i] != null) s.rot = prev[i];
      });
    }

    let raf = 0;
    let lastT = performance.now();
    let stopped = false;

    const loop = (now: number) => {
      if (stopped || !ctx) return;
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      ctx.clearRect(0, 0, state.w, state.h);

      // background bloom
      const bg = ctx.createRadialGradient(
        state.w * 0.22,
        state.h * 0.75,
        0,
        state.w * 0.22,
        state.h * 0.75,
        Math.max(state.w, state.h) * 0.9,
      );
      bg.addColorStop(0, "rgba(82,124,210,0.20)");
      bg.addColorStop(0.55, "rgba(33,30,85,0)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, state.w, state.h);

      for (const st of state.stations) {
        st.rot += st.rotSpeed * dt;
        const dx = state.mouse.x - st.cx;
        const dy = state.mouse.y - st.cy;
        const md = state.mouse.active ? Math.sqrt(dx * dx + dy * dy) : 9999;
        drawStation(ctx, st, md);
      }

      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      state.mouse.x = e.clientX - r.left;
      state.mouse.y = e.clientY - r.top;
      state.mouse.active = true;
    };
    const onLeave = () => {
      state.mouse.active = false;
    };

    fit();
    raf = requestAnimationFrame(loop);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    // Pause when offscreen
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            if (!raf) {
              lastT = performance.now();
              raf = requestAnimationFrame(loop);
            }
          } else {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    // Honor reduced motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => {
      if (mql.matches) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    mql.addEventListener?.("change", onReduced);
    onReduced();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
      mql.removeEventListener?.("change", onReduced);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="absolute inset-0 z-1 overflow-hidden pointer-events-auto"
      style={{
        background:
          "radial-gradient(120% 80% at 18% 78%, rgba(82,124,210,0.22) 0%, transparent 55%)," +
          "radial-gradient(80% 60% at 85% 12%, rgba(82,124,210,0.16) 0%, transparent 55%)," +
          "linear-gradient(180deg, #211E55 0%, #211E55 55%, #15133a 100%)",
      }}
    >
      <canvas ref={canvasRef} className="block absolute inset-0" />
    </div>
  );
}
