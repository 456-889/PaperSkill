import React from 'react';

// Shared drawing kit for the vinyl-record tutorial universe.
// Every widget and analogy card draws its scene with these primitives so the
// palette, line weights, and object proportions stay consistent.

export const PAL = {
  bg: '#f7f4ec',
  floor: '#d9d2c3',
  wood: '#8a7f6a',
  plinth: '#b9a98c',
  vinyl: '#2f3437',
  groove: '#5b6367',
  label: '#7c3aed',
  ink: '#21324a',
  muted: '#68778f',
  blue: '#27446e',
  green: '#228d5c',
  red: '#c43f52',
  orange: '#f07e47',
  purple: '#7c3aed',
  line: '#d7deea',
  white: '#ffffff',
};

export const VinylKit: React.FC = () => null;

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function drawRoom(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = PAL.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = PAL.floor;
  ctx.fillRect(0, h * 0.88, w, h * 0.12);
  ctx.strokeStyle = 'rgba(138,127,106,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.88);
  ctx.lineTo(w, h * 0.88);
  ctx.stroke();
}

export function drawTurntable(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(60,52,38,0.14)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 1.08, r * 1.42, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.plinth;
  roundRect(ctx, cx - r * 1.36, cy - r * 1.18, r * 2.72, r * 2.36, r * 0.14);
  ctx.fill();
  ctx.strokeStyle = PAL.wood;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#cfc6b6';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.wood;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function bandRadius(r: number, band: number): number {
  return r * (0.42 + 0.173 * (band - 1));
}

export function drawRecord(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  angle: number,
  opts: { activeBand?: number; markerAngle?: number; labelColor?: string; dim?: boolean } = {}
): void {
  ctx.save();
  ctx.fillStyle = PAL.vinyl;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 7; i += 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * (0.3 + i * 0.094), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, angle - 0.5, angle - 0.18);
  ctx.stroke();
  ctx.fillStyle = opts.labelColor || PAL.label;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
  if (opts.activeBand) {
    const br = bandRadius(r, opts.activeBand);
    ctx.strokeStyle = PAL.blue;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, br, 0, Math.PI * 2);
    ctx.stroke();
    const ma = ((opts.markerAngle ?? 200) * Math.PI) / 180;
    ctx.fillStyle = PAL.blue;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(ma) * br, cy + Math.sin(ma) * br, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (opts.dim) {
    ctx.fillStyle = 'rgba(247,244,236,0.45)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTonearm(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  tx: number,
  ty: number,
  color: string,
  lifted = 0
): void {
  const s = Math.max(0, Math.min(1, lifted));
  const tipX = tx;
  const tipY = ty - s * 12;
  ctx.save();
  ctx.strokeStyle = 'rgba(33,50,74,0.18)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, py + 4);
  ctx.lineTo(tipX, ty + 4);
  ctx.stroke();
  const mx = (px + tipX) / 2;
  const my = (py + tipY) / 2;
  const dx = tipX - px;
  const dy = tipY - py;
  const len = Math.max(1, Math.hypot(dx, dy));
  const nx = -dy / len;
  const ny = dx / len;
  const elbowX = mx + nx * 7;
  const elbowY = my + ny * 7;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  const dirX = (tipX - elbowX) / Math.max(1, Math.hypot(tipX - elbowX, tipY - elbowY));
  const dirY = (tipY - elbowY) / Math.max(1, Math.hypot(tipX - elbowX, tipY - elbowY));
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(tipX - dirX * 5, tipY - dirY * 5);
  ctx.rotate(Math.atan2(dirY, dirX));
  ctx.fillRect(-6, -4, 12, 8);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(tipX, tipY, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.wood;
  ctx.beginPath();
  ctx.arc(px, py, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.bg;
  ctx.beginPath();
  ctx.arc(px, py, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawArmOnRecord(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
  color: string,
  lifted = 0
): void {
  const px = cx + r * 1.3;
  const py = cy - r * 0.86;
  const a = (angleDeg * Math.PI) / 180;
  const tipX = cx + Math.cos(a) * r * 0.76;
  const tipY = cy + Math.sin(a) * r * 0.76;
  drawTonearm(ctx, px, py, tipX, tipY, color, lifted);
}

export function drawGrooveWave(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  phase: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= 48; i += 1) {
    const t = i / 48;
    const yy = y + h / 2 + Math.sin(t * Math.PI * 8 + phase) * (h / 2) * 0.8;
    if (i === 0) ctx.moveTo(x + t * w, yy);
    else ctx.lineTo(x + t * w, yy);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawSpeaker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  level: number,
  color: string
): void {
  const w = 62 * scale;
  const h = 84 * scale;
  ctx.save();
  ctx.fillStyle = '#e8e0d0';
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = PAL.wood;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.46, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h * 0.46, (10 + level * 5) * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(33,50,74,0.25)';
  ctx.fillRect(x + w * 0.16, y + h * 0.82, w * 0.68, 3 * scale);
  ctx.restore();
}

export function drawFader(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  alpha: number,
  color: string
): void {
  const a = Math.max(0, Math.min(1, alpha));
  ctx.save();
  ctx.fillStyle = 'rgba(33,50,74,0.12)';
  roundRect(ctx, x - 14, y - 18, w + 28, 36, 8);
  ctx.fill();
  ctx.strokeStyle = PAL.wood;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w * a, y);
  ctx.stroke();
  ctx.fillStyle = PAL.muted;
  for (let i = 0; i <= 4; i += 1) {
    ctx.fillRect(x + (w * i) / 4 - 1, y - 30, 2, 9);
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + w * a, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.white;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + w * a, y, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawMeter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frac: number,
  color: string
): void {
  const f = Math.max(0, Math.min(1, frac));
  ctx.save();
  ctx.fillStyle = '#e7ebf1';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  if (f > 0.005) {
    ctx.fillStyle = color;
    roundRect(ctx, x, y, Math.max(h, w * f), h, h / 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = 'left'
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '600 15px "Segoe UI", sans-serif';
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  items: { label: string; color: string }[]
): void {
  ctx.save();
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  let cx = x;
  for (const item of items) {
    ctx.fillStyle = item.color;
    ctx.fillRect(cx, y - 5, 10, 10);
    ctx.fillStyle = PAL.muted;
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 15, y);
    cx += 24 + ctx.measureText(item.label).width;
  }
  ctx.restore();
}

export function hitCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  return Math.hypot(px - cx, py - cy) <= r;
}

export function hitRect(px: number, py: number, x: number, y: number, w: number, h: number): boolean {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function ease(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

export function drawDeck(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  angle: number,
  activeBand?: number
): void {
  drawTurntable(ctx, cx, cy, r);
  drawRecord(ctx, cx, cy, r, angle, { activeBand });
}
