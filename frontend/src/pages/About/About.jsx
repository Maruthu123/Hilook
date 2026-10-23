import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   ALL STYLES — injected once into <head>
───────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --blue:       #1a6fd4;
  --blue-mid:   #2563eb;
  --blue-dark:  #1044a3;
  --blue-deep:  #0d2d6b;
  --blue-soft:  #dbeafe;
  --blue-pale:  #eff6ff;
  --gold:       #c9a84c;
  --gold-light: #e8c97a;
  --cream:      #f8faff;
  --ink:        #0a1628;
  --ink-mid:    #1e3a5f;
  --mist:       #5a7a9a;
  --white:      #ffffff;
  --border:     rgba(26,111,212,0.18);
  --r:          14px;
  --r-lg:       22px;
  --ease:       cubic-bezier(0.22,1,0.36,1);
}

*{ box-sizing:border-box; margin:0; padding:0; }
.ab-root{ font-family:'DM Sans',sans-serif; background:var(--cream); color:var(--ink); overflow-x:hidden; }

/* ═══════════════════════════ HERO ═══════════════════════════ */
.ab-hero{ position:relative; min-height:92vh; display:flex; align-items:center; justify-content:center; text-align:center; background:var(--blue-deep); overflow:hidden; padding:120px 24px 80px; }
.ab-hero-bg{ position:absolute; inset:0; background: radial-gradient(ellipse 80% 60% at 50% 30%,rgba(37,99,235,.45) 0%,transparent 70%), radial-gradient(ellipse 50% 40% at 20% 80%,rgba(201,168,76,.10) 0%,transparent 60%), radial-gradient(ellipse 40% 50% at 80% 10%,rgba(16,68,163,.55) 0%,transparent 60%); }
.ab-orb{ position:absolute; border-radius:50%; filter:blur(60px); opacity:.18; animation:orb-drift 8s ease-in-out infinite alternate; }
.ab-orb-1{ width:320px;height:320px;background:var(--gold);top:-80px;left:-60px;animation-delay:0s; }
.ab-orb-2{ width:400px;height:400px;background:var(--blue-mid);bottom:-100px;right:-80px;animation-delay:-3s; }
.ab-orb-3{ width:200px;height:200px;background:#60a5fa;top:50%;left:60%;animation-delay:-5s; }
@keyframes orb-drift{ from{transform:translate(0,0) scale(1);} to{transform:translate(30px,-30px) scale(1.08);} }
.ab-hero-lines{ position:absolute;inset:0;overflow:hidden;pointer-events:none; }
.ab-hero-lines::before,.ab-hero-lines::after{ content:'';position:absolute;border:1px solid rgba(96,165,250,.12);border-radius:50%; }
.ab-hero-lines::before{ width:600px;height:600px;top:50%;left:50%;transform:translate(-50%,-50%); }
.ab-hero-lines::after{ width:900px;height:900px;top:50%;left:50%;transform:translate(-50%,-50%); }
.ab-hero-inner{ position:relative;z-index:2;max-width:780px; }
.ab-hero-eyebrow{ display:inline-flex;align-items:center;gap:12px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:28px;opacity:0;animation:fade-up .8s var(--ease) .2s forwards; }
.ab-hero-eyebrow::before,.ab-hero-eyebrow::after{ content:'';height:1px;background:var(--gold);opacity:.5;width:40px; }
.ab-hero-title{ font-family:'Cormorant Garamond',serif;font-size:clamp(52px,8vw,96px);font-weight:700;color:#fff;line-height:1.05;margin-bottom:8px;opacity:0;animation:fade-up .9s var(--ease) .4s forwards; }
.ab-hero-title em{ font-style:italic;background:linear-gradient(135deg,var(--gold-light),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.ab-hero-subtitle{ font-family:'Cormorant Garamond',serif;font-size:clamp(18px,2.5vw,26px);font-style:italic;color:rgba(255,255,255,.55);margin-bottom:40px;opacity:0;animation:fade-up .9s var(--ease) .55s forwards; }
.ab-hero-divider{ width:80px;height:2px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:0 auto 40px;opacity:0;animation:scale-x .8s var(--ease) .7s forwards; }
.ab-hero-desc{ font-size:16px;line-height:1.85;color:rgba(255,255,255,.6);max-width:560px;margin:0 auto 40px;opacity:0;animation:fade-up .9s var(--ease) .8s forwards; }
.ab-hero-btns{ display:flex;gap:16px;justify-content:center;flex-wrap:wrap;opacity:0;animation:fade-up .9s var(--ease) 1s forwards; }

/* ═══════════════════════════ BUTTONS ════════════════════════ */
.ab-btn{ display:inline-flex;align-items:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;letter-spacing:.5px;padding:14px 32px;border-radius:100px;cursor:pointer;border:none;outline:none;transition:transform .25s var(--ease),box-shadow .25s,background .25s;text-decoration:none; }
.ab-btn-primary{ background:linear-gradient(135deg,#3b82f6,#1a6fd4);color:#fff;box-shadow:0 8px 24px rgba(37,99,235,.35); }
.ab-btn-primary:hover{ transform:translateY(-3px) scale(1.03);box-shadow:0 14px 36px rgba(37,99,235,.5);background:linear-gradient(135deg,#60a5fa,#2563eb); }
.ab-btn-outline{ background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35);backdrop-filter:blur(8px); }
.ab-btn-outline:hover{ transform:translateY(-3px);border-color:rgba(255,255,255,.7);background:rgba(255,255,255,.08); }
.ab-btn-blue{ background:linear-gradient(135deg,var(--blue-mid),var(--blue-dark));color:#fff;box-shadow:0 6px 20px rgba(26,111,212,.3); }
.ab-btn-blue:hover{ transform:translateY(-3px);box-shadow:0 12px 30px rgba(26,111,212,.45); }
.ab-btn-ghost{ background:var(--blue-pale);color:var(--blue-mid);border:1.5px solid var(--border); }
.ab-btn-ghost:hover{ background:var(--blue-soft);transform:translateY(-2px);border-color:var(--blue-mid); }

/* ═══════════════════════════ OWNER ══════════════════════════ */
.ab-owner{ padding:100px 24px;background:var(--white);position:relative;overflow:hidden; }
.ab-owner::before{ content:'"';position:absolute;top:-40px;left:24px;font-family:'Cormorant Garamond',serif;font-size:320px;line-height:1;color:#eff6ff;z-index:0;pointer-events:none; }
.ab-owner-inner{ max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1; }
.ab-owner-left{ display:flex;flex-direction:column;align-items:flex-start; }
.ab-owner-photo-wrap{ position:relative;width:240px;height:240px;margin-bottom:28px; }
.ab-owner-photo-ring{ position:absolute;inset:-6px;border-radius:50%;background:conic-gradient(from 0deg,var(--blue-mid),var(--gold),#60a5fa,var(--blue-mid));animation:spin-ring 6s linear infinite;z-index:0; }
@keyframes spin-ring{ to{transform:rotate(360deg);} }
.ab-owner-photo-inner{ position:absolute;inset:4px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--blue-mid));display:flex;align-items:center;justify-content:center;font-size:80px;z-index:1;overflow:hidden;box-shadow:0 16px 48px rgba(26,111,212,.3); }
.ab-owner-photo-inner img{ width:100%;height:100%;object-fit:cover;border-radius:50%; }
.ab-owner-upload-btn{ position:absolute;bottom:8px;right:8px;z-index:2;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--blue-mid),var(--blue-dark));border:3px solid #fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px;box-shadow:0 4px 16px rgba(26,111,212,.45);transition:transform .2s var(--ease),box-shadow .2s; }
.ab-owner-upload-btn:hover{ transform:scale(1.18);box-shadow:0 8px 24px rgba(26,111,212,.55); }
.ab-owner-tag{ font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--blue-mid);margin-bottom:16px; }
.ab-owner-name{ font-family:'Cormorant Garamond',serif;font-size:clamp(38px,4vw,56px);font-weight:700;color:var(--ink);line-height:1.1;margin-bottom:8px; }
.ab-owner-role{ font-size:14px;font-weight:500;color:var(--blue);margin-bottom:24px;letter-spacing:.5px; }
.ab-owner-exp{ display:flex;align-items:center;gap:16px;margin-bottom:28px; }
.ab-exp-num{ font-family:'Cormorant Garamond',serif;font-size:64px;font-weight:700;line-height:1;background:linear-gradient(135deg,var(--blue-mid),#60a5fa);-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
.ab-exp-label{ font-size:13px;color:var(--mist);line-height:1.5;font-weight:500; }
.ab-owner-quote{ font-family:'Cormorant Garamond',serif;font-size:20px;font-style:italic;color:var(--ink-mid);line-height:1.7;border-left:3px solid var(--blue-mid);padding-left:20px;margin-top:8px; }
.ab-owner-right p{ font-size:15px;color:var(--mist);line-height:1.9;margin-bottom:18px; }
.ab-owner-stats{ display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:32px; }
.ab-stat{ background:var(--cream);border:1px solid var(--border);border-radius:var(--r);padding:20px;text-align:center;transition:transform .3s var(--ease),box-shadow .3s; }
.ab-stat:hover{ transform:translateY(-4px);box-shadow:0 12px 32px rgba(26,111,212,.1); }
.ab-stat-num{ font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:700;color:var(--blue-mid); }
.ab-stat-label{ font-size:12px;color:var(--mist);margin-top:4px;font-weight:500; }

/* ═══════════════════════════ SHOP — IMAGE SHOWCASE ══════════ */
.ab-shop{
  position: relative;
  padding: 0;
  overflow: hidden;
  background: var(--ink);
}

/* big title overlay */
.ab-shop-hero{
  position: relative;
  height: 520px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.ab-shop-hero-img{
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
  filter: brightness(0.45);
  transition: transform 8s ease;
}
.ab-shop-hero:hover .ab-shop-hero-img{ transform: scale(1.05); }
.ab-shop-hero-overlay{
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,22,40,.95) 0%, rgba(10,22,40,.3) 60%, transparent 100%);
}
.ab-shop-hero-content{
  position: relative; z-index: 2;
  padding: 48px 60px;
  max-width: 700px;
}
.ab-shop-hero-tag{
  font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;
  color: var(--gold); margin-bottom: 14px; display: block;
}
.ab-shop-hero-title{
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(38px,5vw,68px); font-weight: 700;
  color: #fff; line-height: 1.05; margin-bottom: 14px;
}
.ab-shop-hero-title em{
  font-style: italic;
  background: linear-gradient(135deg,var(--gold-light),var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.ab-shop-hero-sub{
  font-size: 15px; color: rgba(255,255,255,.6); line-height: 1.7; max-width: 480px;
}

/* upload button on hero */
.ab-shop-hero-upload{
  position: absolute; top: 24px; right: 24px; z-index: 10;
}
.ab-shop-hero-upload label{
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 600; letter-spacing: .5px;
  padding: 10px 20px; border-radius: 100px; cursor: pointer;
  background: rgba(255,255,255,.12); color: #fff;
  border: 1px solid rgba(255,255,255,.25);
  backdrop-filter: blur(12px);
  transition: background .2s, border-color .2s, transform .2s;
}
.ab-shop-hero-upload label:hover{
  background: rgba(255,255,255,.22); border-color: rgba(255,255,255,.5); transform: translateY(-2px);
}

/* info strip below hero */
.ab-shop-strip{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: var(--blue-deep);
}
.ab-shop-strip-item{
  display: flex; align-items: center; gap: 16px;
  padding: 28px 32px;
  border-right: 1px solid rgba(255,255,255,.06);
  transition: background .3s;
}
.ab-shop-strip-item:last-child{ border-right: none; }
.ab-shop-strip-item:hover{ background: rgba(255,255,255,.05); }
.ab-shop-strip-icon{
  width: 48px; height: 48px; border-radius: 12px;
  background: linear-gradient(135deg,rgba(37,99,235,.4),rgba(16,68,163,.4));
  border: 1px solid rgba(96,165,250,.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.ab-shop-strip-text{}
.ab-shop-strip-label{ font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #60a5fa; margin-bottom: 4px; }
.ab-shop-strip-val{ font-size: 14px; font-weight: 500; color: #fff; }

/* gallery grid below strip */
.ab-shop-gallery{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 280px 280px;
  gap: 3px;
  background: var(--ink);
}
.ab-gallery-cell{
  position: relative; overflow: hidden; cursor: pointer;
  background: #1a2840;
}
.ab-gallery-cell:first-child{
  grid-column: 1 / 2; grid-row: 1 / 3; /* tall left */
}
.ab-gallery-cell img{
  width: 100%; height: 100%; object-fit: cover;
  transition: transform .6s var(--ease), filter .4s;
  filter: brightness(.75) saturate(.9);
}
.ab-gallery-cell:hover img{ transform: scale(1.07); filter: brightness(.9) saturate(1.1); }
.ab-gallery-overlay{
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(10,22,40,.8) 0%, transparent 55%);
  opacity: 0; transition: opacity .35s;
}
.ab-gallery-cell:hover .ab-gallery-overlay{ opacity: 1; }
.ab-gallery-info{
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 20px 20px 16px;
  transform: translateY(8px); opacity: 0;
  transition: transform .35s var(--ease), opacity .35s;
}
.ab-gallery-cell:hover .ab-gallery-info{ transform: translateY(0); opacity: 1; }
.ab-gallery-info h4{ font-family:'Cormorant Garamond',serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 2px; }
.ab-gallery-info span{ font-size: 11px; color: #93c5fd; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }

/* upload icon on each gallery cell */
.ab-gallery-upload{
  position: absolute; top: 12px; right: 12px; z-index: 5;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,.45); backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; cursor: pointer;
  opacity: 0; transition: opacity .25s, transform .25s;
}
.ab-gallery-cell:hover .ab-gallery-upload{ opacity: 1; transform: scale(1); }
.ab-gallery-upload:hover{ background: rgba(37,99,235,.6); border-color: #60a5fa; transform: scale(1.12) !important; }

/* detail cards row */
.ab-shop-details-row{
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 3px; background: var(--ink);
  padding: 3px;
}
.ab-shop-detail-card{
  background: var(--white); padding: 32px 28px;
  display: flex; flex-direction: column; gap: 10px;
  transition: background .25s;
}
.ab-shop-detail-card:hover{ background: var(--blue-pale); }
.ab-sdc-icon{ font-size: 28px; }
.ab-sdc-label{ font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--blue-mid); }
.ab-sdc-val{ font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: var(--ink); }
.ab-sdc-sub{ font-size: 12px; color: var(--mist); line-height: 1.5; }

/* ═══════════════════════════ VALUES ══════════════════════════ */
.ab-values{ padding:100px 24px;background:var(--cream); }
.ab-section-header{ text-align:center;margin-bottom:60px; }
.ab-eyebrow{ font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:var(--blue-mid);margin-bottom:14px;display:block; }
.ab-section-header h2{ font-family:'Cormorant Garamond',serif;font-size:clamp(28px,4vw,48px);font-weight:700;color:var(--ink); }
.ab-values-grid{ max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px; }
.ab-val-card{ background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-lg);padding:36px 20px;text-align:center;transition:transform .35s var(--ease),border-color .3s,box-shadow .3s;position:relative;overflow:hidden; }
.ab-val-card::before{ content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue-mid),#60a5fa);transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease); }
.ab-val-card:hover{ transform:translateY(-6px);border-color:var(--blue);box-shadow:0 16px 40px rgba(26,111,212,.12); }
.ab-val-card:hover::before{ transform:scaleX(1); }
.ab-val-icon{ font-size:40px;margin-bottom:16px; }
.ab-val-card h3{ font-size:15px;font-weight:600;color:var(--blue-mid);margin-bottom:10px; }
.ab-val-card p{ font-size:13px;color:var(--mist);line-height:1.7; }

/* ═══════════════════════════ TEAMS ══════════════════════════ */
.ab-teams{ padding:100px 24px;background:var(--white); }
.ab-team-section{ max-width:1100px;margin:0 auto 80px; }
.ab-team-section:last-child{ margin-bottom:0; }
.ab-team-label{ display:inline-flex;align-items:center;gap:12px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px; }
.ab-team-label::after{ content:'';height:1px;width:60px;opacity:.35; }
.ab-team-label-boys{ color:#1d4ed8; } .ab-team-label-boys::after{ background:#1d4ed8; }
.ab-team-label-girls{ color:#db2777; } .ab-team-label-girls::after{ background:#db2777; }
.ab-team-label-aari{ color:var(--gold); } .ab-team-label-aari::after{ background:var(--gold); }
.ab-team-title{ font-family:'Cormorant Garamond',serif;font-size:clamp(26px,3vw,40px);font-weight:700;color:var(--ink);margin-bottom:12px; }
.ab-team-desc{ font-size:14px;color:var(--mist);margin-bottom:40px;max-width:560px;line-height:1.8; }
.ab-team-grid{ display:grid;gap:24px; }
.ab-team-grid-3{ grid-template-columns:repeat(3,1fr); }
.ab-team-grid-2{ grid-template-columns:repeat(2,1fr); }

/* MEMBER CARD */
.ab-member{ border-radius:var(--r-lg);padding:28px 24px;border:1.5px solid;position:relative;overflow:hidden;transition:transform .35s var(--ease),box-shadow .35s; }
.ab-member:hover{ transform:translateY(-5px);box-shadow:0 20px 48px -8px rgba(0,0,0,.12); }
.ab-member-photo{ position:relative;width:90px;height:90px;margin-bottom:16px; }
.ab-member-photo-ring{ position:absolute;inset:-3px;border-radius:50%; }
.ab-member-photo-inner{ position:absolute;inset:3px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;z-index:1;overflow:hidden; }
.ab-member-photo-inner img{ width:100%;height:100%;object-fit:cover;border-radius:50%; }
.ab-member-cam{ position:absolute;bottom:0;right:0;z-index:2;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);transition:transform .2s var(--ease); }
.ab-member-cam:hover{ transform:scale(1.25); }
.ab-member-boy{ background:linear-gradient(135deg,#f0f7ff,#dbeafe);border-color:rgba(29,78,216,.18); }
.ab-member-boy::before{ content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#2563eb,#60a5fa); }
.ab-member-boy .ab-member-photo-ring{ background:linear-gradient(135deg,#2563eb,#60a5fa); }
.ab-member-boy .ab-member-photo-inner{ background:rgba(37,99,235,.12); }
.ab-member-boy .ab-member-role{ color:#1d4ed8; }
.ab-member-boy .ab-member-cam{ background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff; }
.ab-member-girl{ background:linear-gradient(135deg,#fff0f7,#fce7f3);border-color:rgba(219,39,119,.18); }
.ab-member-girl::before{ content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#db2777,#f472b6); }
.ab-member-girl .ab-member-photo-ring{ background:linear-gradient(135deg,#db2777,#f472b6); }
.ab-member-girl .ab-member-photo-inner{ background:rgba(219,39,119,.1); }
.ab-member-girl .ab-member-role{ color:#be185d; }
.ab-member-girl .ab-member-cam{ background:linear-gradient(135deg,#db2777,#be185d);color:#fff; }
.ab-member-aari{ background:linear-gradient(135deg,#fffbf0,#fdf4da);border-color:rgba(201,168,76,.25); }
.ab-member-aari::before{ content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-light)); }
.ab-member-aari .ab-member-photo-ring{ background:linear-gradient(135deg,var(--gold),var(--gold-light)); }
.ab-member-aari .ab-member-photo-inner{ background:rgba(201,168,76,.12); }
.ab-member-aari .ab-member-role{ color:#92620a; }
.ab-member-aari .ab-member-cam{ background:linear-gradient(135deg,var(--gold),#b8860b);color:#fff; }
.ab-member-name{ font-size:16px;font-weight:600;color:var(--ink);margin-bottom:4px; }
.ab-member-role{ font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px; }
.ab-member-desc{ font-size:13px;color:var(--mist);line-height:1.7; }

/* ═══════════════════════════ ANIMATIONS ════════════════════ */
@keyframes fade-up{ from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);} }
@keyframes scale-x{ from{opacity:0;transform:scaleX(0);}to{opacity:1;transform:scaleX(1);} }
.reveal{ opacity:0;transform:translateY(36px);transition:opacity .7s var(--ease),transform .7s var(--ease); }
.reveal.visible{ opacity:1;transform:translateY(0); }
.reveal-delay-1{ transition-delay:.1s; } .reveal-delay-2{ transition-delay:.2s; }
.reveal-delay-3{ transition-delay:.3s; } .reveal-delay-4{ transition-delay:.4s; }

/* ═══════════════════════════ RESPONSIVE ════════════════════ */
@media(max-width:1000px){
  .ab-shop-gallery{ grid-template-columns:1fr 1fr; grid-template-rows:240px 240px 240px; }
  .ab-gallery-cell:first-child{ grid-column:1/2; grid-row:1/3; }
  .ab-shop-details-row{ grid-template-columns:1fr 1fr; }
  .ab-shop-strip{ grid-template-columns:1fr; }
  .ab-shop-strip-item{ border-right:none;border-bottom:1px solid rgba(255,255,255,.06); }
}
@media(max-width:900px){
  .ab-owner-inner{ grid-template-columns:1fr;gap:40px; }
  .ab-values-grid{ grid-template-columns:1fr 1fr; }
  .ab-team-grid-3{ grid-template-columns:1fr 1fr; }
  .ab-shop-hero-content{ padding:32px 28px; }
}
@media(max-width:640px){
  .ab-shop-gallery{ grid-template-columns:1fr; grid-template-rows:auto; }
  .ab-gallery-cell{ height:220px; }
  .ab-gallery-cell:first-child{ grid-column:1/2; grid-row:auto; }
  .ab-shop-details-row{ grid-template-columns:1fr; }
  .ab-values-grid{ grid-template-columns:1fr; }
  .ab-team-grid-3,.ab-team-grid-2{ grid-template-columns:1fr; }
  .ab-owner-stats{ grid-template-columns:1fr 1fr; }
  .ab-hero-btns{ flex-direction:column;align-items:center; }
}
`;

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const VALUES = [
  { icon:'✂️', title:'Handcrafted',    desc:'Every stitch laid by skilled artisans devoted to the craft.' },
  { icon:'💎', title:'Premium Fabrics',desc:'Finest fabrics from trusted suppliers across Tamil Nadu and India.' },
  { icon:'📏', title:'Perfect Fit',    desc:'Custom measurements for a flawless tailor-made fit every time.' },
  { icon:'🤝', title:'Customer First', desc:'Your satisfaction is our foundation and promise — always.' },
];
const BOYS_TEAM = [
  { id:'b1', icon:'👨‍🎨', name:'Rajan K',  role:'Master Tailor – Gents', desc:'Specialises in formal & casual gents wear with 8+ years in suit and trouser stitching.' },
  { id:'b2', icon:'👨‍💼', name:'Suresh M', role:'Cutting Expert',         desc:'Expert fabric cutter ensuring perfect pattern placement for gents garments.' },
  { id:'b3', icon:'🧵',  name:'Arjun P',  role:'Finishing & Embroidery', desc:'Handles all finishing touches, button-holes, and embroidery on gents collections.' },
];
const GIRLS_TEAM = [
  { id:'g1', icon:'👩‍🎨', name:'Priya S',   role:'Lead Tailor – Ladies', desc:'Expert in Chudidar, lehenga, and blouse stitching with 7+ years of precision tailoring.' },
  { id:'g2', icon:'👩‍💼', name:'Deepa V',   role:'Blouse Specialist',    desc:'Mastery in all blouse neck designs, sleeve styles, and piping for sarees.' },
  { id:'g3', icon:'👩‍🔬', name:'Kavitha R', role:'Quality Manager',      desc:'Ensures every ladies garment meets our premium finish standard before delivery.' },
  { id:'g4', icon:'👩‍🎓', name:'Anitha L',  role:'Fitting & Alterations',desc:'Handles trial fittings ensuring the perfect silhouette for every client.' },
];
const AARI_TEAM = [
  { id:'a1', icon:'🪡', name:'Meena T',     role:'Head – Aari Work',  desc:'Over 12 years of Aari embroidery mastery — bridal and heavy blouse thread work.' },
  { id:'a2', icon:'✨', name:'Sangeetha D', role:'Stone & Zari Work',  desc:'Expert in kundan setting, mirror work, and zari border embellishment for festival attire.' },
];

/* gallery slot metadata */
const GALLERY_META = [
  { id:'img0', label:'Our Boutique',       sub:'Exterior View',         placeholder:'🏬' },
  { id:'img1', label:'Tailoring Studio',   sub:'Where Magic Happens',   placeholder:'✂️' },
  { id:'img2', label:'Fabric Collection',  sub:'Premium Materials',      placeholder:'🧵' },
  { id:'img3', label:'Bridal Section',     sub:'Wedding Specialists',    placeholder:'👰' },
  { id:'img4', label:'Aari Work Display',  sub:'Hand Embroidery',        placeholder:'🪡' },
];

/* detail card data */
const DETAIL_CARDS = [
  { icon:'📍', label:'Location',      val:'Rajapalayam, Tamil Nadu',  sub:'Easily accessible from main road' },
  { icon:'⏰', label:'Working Hours', val:'9 AM – 8 PM',              sub:'Monday to Saturday' },
  { icon:'📞', label:'Contact',       val:'+91 98765 43210',          sub:'Call or WhatsApp anytime' },
  { icon:'🗓️', label:'Since',        val:'2015',                     sub:'10+ years of trusted service' },
  { icon:'🌟', label:'Specialty',     val:'Aari & Custom Stitching',  sub:'Bridal, ethnic & fusion wear' },
  { icon:'🚗', label:'Parking',       val:'Available',                sub:'Free parking at the boutique' },
];

/* ─────────────────────────────────────────────────────────────
   HOOKS & SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function usePhotoMap() {
  const [photos, setPhotos] = useState({});
  const upload = (id, file) => {
    if (!file) return;
    setPhotos(p => ({ ...p, [id]: URL.createObjectURL(file) }));
  };
  return [photos, upload];
}

function MemberCard({ member, theme, photos, upload }) {
  const src = photos[member.id];
  return (
    <div className={`ab-member ab-member-${theme} reveal`}>
      <div className="ab-member-photo">
        <div className="ab-member-photo-ring" />
        <div className="ab-member-photo-inner">
          {src ? <img src={src} alt={member.name} /> : member.icon}
        </div>
        <input type="file" accept="image/*" id={`up-${member.id}`} style={{display:'none'}} onChange={e => upload(member.id, e.target.files[0])} />
        <label htmlFor={`up-${member.id}`} className="ab-member-cam" title="Upload photo">📷</label>
      </div>
      <div className="ab-member-name">{member.name}</div>
      <div className="ab-member-role">{member.role}</div>
      <p className="ab-member-desc">{member.desc}</p>
    </div>
  );
}

/* single gallery cell — shows uploaded image or a styled placeholder */
function GalleryCell({ meta, src, onUpload, isHero }) {
  return (
    <div className={`ab-gallery-cell${isHero ? ' ab-gallery-hero-cell' : ''}`}>
      {src
        ? <img src={src} alt={meta.label} />
        : (
          /* placeholder when no image uploaded yet */
          <div style={{
            width:'100%', height:'100%',
            background:'linear-gradient(135deg,#0f2549,#1a3a6b)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:10,
          }}>
            <span style={{fontSize: isHero ? 72 : 48, opacity:.35}}>{meta.placeholder}</span>
            <span style={{fontSize:11,color:'rgba(255,255,255,.3)',letterSpacing:'2px',textTransform:'uppercase',fontWeight:600}}>Upload Photo</span>
          </div>
        )
      }
      <div className="ab-gallery-overlay" />
      <div className="ab-gallery-info">
        <h4>{meta.label}</h4>
        <span>{meta.sub}</span>
      </div>
      {/* upload trigger */}
      <input type="file" accept="image/*" id={`gal-${meta.id}`} style={{display:'none'}} onChange={e => onUpload(meta.id, e.target.files[0])} />
      <label htmlFor={`gal-${meta.id}`} className="ab-gallery-upload" title="Upload image">📷</label>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function About() {
  const rootRef    = useRef(null);
  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [memberPhotos, uploadMember] = usePhotoMap();
  const [galleryPhotos, uploadGallery] = usePhotoMap();

  useEffect(() => {
    if (!document.getElementById('nisha-css-v4')) {
      const s = document.createElement('style');
      s.id = 'nisha-css-v4';
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.08 }
    );
    rootRef.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="ab-root" ref={rootRef}>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="ab-hero">
        <div className="ab-hero-bg" />
        <div className="ab-orb ab-orb-1" /><div className="ab-orb ab-orb-2" /><div className="ab-orb ab-orb-3" />
        <div className="ab-hero-lines" />
        <div className="ab-hero-inner">
          <div className="ab-hero-eyebrow">Our Story &amp; Legacy</div>
          <h1 className="ab-hero-title">Nisha <em>Boutique</em></h1>
          <p className="ab-hero-subtitle">Where tradition meets elegance</p>
          <div className="ab-hero-divider" />
          <p className="ab-hero-desc">
            Handcrafting exquisite Indian fashion from the heart of Rajapalayam, Tamil Nadu — since 2015.
            Every thread we weave carries a story of artistry, culture, and love.
          </p>
          <div className="ab-hero-btns">
            <a href="#shop"  className="ab-btn ab-btn-primary">Our Shop ↓</a>
            <a href="#teams" className="ab-btn ab-btn-outline">Meet the Team</a>
          </div>
        </div>
      </section>

      {/* ══════════════════════ OWNER ══════════════════════ */}
      <section className="ab-owner">
        <div className="ab-owner-inner">
          <div className="ab-owner-left reveal">
            <div className="ab-owner-photo-wrap">
              <div className="ab-owner-photo-ring" />
              <div className="ab-owner-photo-inner">
                {ownerPhoto ? <img src={ownerPhoto} alt="Nishaa" /> : '👩'}
              </div>
              <input type="file" accept="image/*" id="owner-upload" style={{display:'none'}} onChange={e => { const f=e.target.files[0]; if(f) setOwnerPhoto(URL.createObjectURL(f)); }} />
              <label htmlFor="owner-upload" className="ab-owner-upload-btn" title="Upload owner photo" style={{color:'#fff',cursor:'pointer'}}>📷</label>
            </div>
            <span className="ab-owner-tag">Founder &amp; Owner</span>
            <h2 className="ab-owner-name">Nishaa</h2>
            <p className="ab-owner-role">Founder · Head Designer · Master Tailor</p>
            <div className="ab-owner-exp">
              <span className="ab-exp-num">10+</span>
              <span className="ab-exp-label">Years of<br/>Experience</span>
            </div>
            <blockquote className="ab-owner-quote">
              "Fashion is not just clothing — it is the language of culture, identity, and artistry."
            </blockquote>
          </div>

          <div className="ab-owner-right reveal reveal-delay-2">
            <p>Nishaa founded Nisha Boutique in 2015 with one clear vision — to celebrate the richness of Indian fashion through handcrafted tailoring. With over <strong>10 years of hands-on experience</strong>, she transformed a humble dream into Rajapalayam's most trusted boutique.</p>
            <p>From intricately embroidered Aari blouses to elegantly stitched Chudidars and bridal lehengas, every piece under her guidance reflects deep respect for traditional craftsmanship paired with a sharp eye for contemporary design.</p>
            <p>Today, she leads a passionate team of artisans — each trained to uphold the same standard of excellence she built this boutique on.</p>
            <div className="ab-owner-stats">
              <div className="ab-stat"><div className="ab-stat-num">500+</div><div className="ab-stat-label">Happy Clients</div></div>
              <div className="ab-stat"><div className="ab-stat-num">10+</div><div className="ab-stat-label">Years Active</div></div>
              <div className="ab-stat"><div className="ab-stat-num">3</div><div className="ab-stat-label">Expert Teams</div></div>
              <div className="ab-stat"><div className="ab-stat-num">2015</div><div className="ab-stat-label">Year Founded</div></div>
            </div>
            <div style={{marginTop:28,display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="#teams" className="ab-btn ab-btn-blue">Meet the Team</a>
              <a href="#shop"  className="ab-btn ab-btn-ghost">Shop Info</a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ SHOP — IMAGE SHOWCASE ══════════════════════ */}
      <section className="ab-shop" id="shop">

        {/* BIG HERO IMAGE */}
        <div className="ab-shop-hero reveal">
          {galleryPhotos['img0']
            ? <img src={galleryPhotos['img0']} alt="Nisha Boutique" className="ab-shop-hero-img" />
            : <div className="ab-shop-hero-img" style={{background:'linear-gradient(135deg,#0a1a3a,#1a3a6b)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontSize:120,opacity:.12}}>🏬</span>
              </div>
          }
          <div className="ab-shop-hero-overlay" />
          <div className="ab-shop-hero-content">
            <span className="ab-shop-hero-tag">Our Boutique</span>
            <h2 className="ab-shop-hero-title">Nisha <em>Boutique</em></h2>
            <p className="ab-shop-hero-sub">
              Rajapalayam's most loved tailoring boutique — where every garment is a masterpiece crafted with passion, skill, and love since 2015.
            </p>
          </div>
          {/* upload button for hero image */}
          <div className="ab-shop-hero-upload">
            <input type="file" accept="image/*" id="gal-img0" style={{display:'none'}} onChange={e => uploadGallery('img0', e.target.files[0])} />
            <label htmlFor="gal-img0">📷 Upload Shop Photo</label>
          </div>
        </div>

        {/* INFO STRIP */}
        <div className="ab-shop-strip reveal">
          <div className="ab-shop-strip-item">
            <div className="ab-shop-strip-icon">📍</div>
            <div className="ab-shop-strip-text">
              <div className="ab-shop-strip-label">Location</div>
              <div className="ab-shop-strip-val">Rajapalayam, Tamil Nadu</div>
            </div>
          </div>
          <div className="ab-shop-strip-item">
            <div className="ab-shop-strip-icon">⏰</div>
            <div className="ab-shop-strip-text">
              <div className="ab-shop-strip-label">Open Hours</div>
              <div className="ab-shop-strip-val">Mon–Sat · 9 AM – 8 PM</div>
            </div>
          </div>
          <div className="ab-shop-strip-item">
            <div className="ab-shop-strip-icon">📞</div>
            <div className="ab-shop-strip-text">
              <div className="ab-shop-strip-label">Contact</div>
              <div className="ab-shop-strip-val">+91 98765 43210</div>
            </div>
          </div>
        </div>

        {/* GALLERY GRID — 4 more images */}
        <div className="ab-shop-gallery reveal">
          {GALLERY_META.slice(1).map(meta => (
            <GalleryCell
              key={meta.id}
              meta={meta}
              src={galleryPhotos[meta.id]}
              onUpload={uploadGallery}
              isHero={false}
            />
          ))}
        </div>

        {/* DETAIL CARDS */}
        <div className="ab-shop-details-row reveal">
          {DETAIL_CARDS.map(card => (
            <div key={card.label} className="ab-shop-detail-card">
              <div className="ab-sdc-icon">{card.icon}</div>
              <div className="ab-sdc-label">{card.label}</div>
              <div className="ab-sdc-val">{card.val}</div>
              <div className="ab-sdc-sub">{card.sub}</div>
            </div>
          ))}
        </div>

      </section>

      {/* ══════════════════════ VALUES ══════════════════════ */}
      <section className="ab-values">
        <div className="ab-section-header reveal">
          <span className="ab-eyebrow">Our Promise</span>
          <h2>Why Nisha Boutique?</h2>
        </div>
        <div className="ab-values-grid">
          {VALUES.map((v,i) => (
            <div key={v.title} className={`ab-val-card reveal reveal-delay-${i+1}`}>
              <div className="ab-val-icon">{v.icon}</div>
              <h3>{v.title}</h3><p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════ TEAMS ══════════════════════ */}
      <section className="ab-teams" id="teams">
        <div style={{maxWidth:1100,margin:'0 auto 56px',textAlign:'center'}} className="reveal">
          <span className="ab-eyebrow">Our People</span>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(30px,4vw,48px)',fontWeight:700,color:'var(--ink)',marginTop:8}}>
            Meet Our Teams
          </h2>
          <p style={{fontSize:15,color:'var(--mist)',marginTop:12,maxWidth:520,margin:'12px auto 0'}}>
            Three dedicated teams, one shared passion — crafting garments that make you feel extraordinary.
          </p>
          <p style={{fontSize:12,color:'#94a3b8',marginTop:10}}>
            📷 Click the camera icon on any card to add a team member's photo
          </p>
        </div>

        {/* Boys */}
        <div className="ab-team-section">
          <div className="reveal">
            <div className="ab-team-label ab-team-label-boys">👔 Boys / Gents Team</div>
            <h3 className="ab-team-title">Gents Tailoring Unit</h3>
            <p className="ab-team-desc">Precision cutting and fine stitching for all gents wear — from formal suits to casual kurtas and trousers.</p>
          </div>
          <div className="ab-team-grid ab-team-grid-3">
            {BOYS_TEAM.map(m => <MemberCard key={m.id} member={m} theme="boy" photos={memberPhotos} upload={uploadMember} />)}
          </div>
        </div>

        {/* Girls */}
        <div className="ab-team-section">
          <div className="reveal">
            <div className="ab-team-label ab-team-label-girls">👗 Girls / Ladies Team</div>
            <h3 className="ab-team-title">Ladies Tailoring Unit</h3>
            <p className="ab-team-desc">Specialised in Chudidars, lehengas, blouses, and all ladies ethnic and fusion wear with exceptional finish.</p>
          </div>
          <div className="ab-team-grid ab-team-grid-2">
            {GIRLS_TEAM.map(m => <MemberCard key={m.id} member={m} theme="girl" photos={memberPhotos} upload={uploadMember} />)}
          </div>
        </div>

        {/* Aari */}
        <div className="ab-team-section">
          <div className="reveal">
            <div className="ab-team-label ab-team-label-aari">🪡 Aari Work Team</div>
            <h3 className="ab-team-title">Aari &amp; Embroidery Unit</h3>
            <p className="ab-team-desc">Bringing ancient embroidery art to life — hand-stitched thread work, zari, stones, and mirror embellishments for bridal and festive wear.</p>
          </div>
          <div className="ab-team-grid ab-team-grid-2">
            {AARI_TEAM.map(m => <MemberCard key={m.id} member={m} theme="aari" photos={memberPhotos} upload={uploadMember} />)}
          </div>
        </div>
      </section>

    </div>
  );
}