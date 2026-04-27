import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Settings, Archive, ChevronRight, ChevronDown, Clock, ArrowLeft,
  Loader2, Sparkles, X, CheckCircle2, Hash, ExternalLink, Trash2,
  Radio, FileText, Calendar, Save, AlertCircle, Inbox, Filter, BarChart3
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
//  STYLES — editorial dossier aesthetic
// ─────────────────────────────────────────────────────────────────────────
const styleSheet = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..900&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@200..800&family=JetBrains+Mono:wght@400..700&display=swap');

  .dgs-root {
    font-family: 'Inter Tight', system-ui, sans-serif;
    background: #F4EFE3;
    background-image:
      radial-gradient(circle at 20% 10%, rgba(139, 26, 26, 0.025), transparent 40%),
      radial-gradient(circle at 80% 90%, rgba(63, 58, 46, 0.03), transparent 40%);
    color: #1A1814;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'ss01', 'cv11';
  }
  .dgs-disp { font-family: 'Fraunces', 'Times New Roman', serif; font-feature-settings: 'ss01', 'ss02'; letter-spacing: -0.02em; }
  .dgs-ital { font-family: 'Instrument Serif', serif; font-style: italic; letter-spacing: 0; }
  .dgs-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: 'zero', 'ss02'; }
  .dgs-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 500; }
  .dgs-rule-thick { border-top: 2px solid #8B1A1A; }
  .dgs-rule-thin { border-top: 1px solid #D4CCB6; }
  .dgs-rule-double { border-top: 3px double #8B1A1A; }
  .dgs-paper {
    background: #FFFDF7;
    border: 1px solid #E5DDC8;
    box-shadow: 0 1px 0 rgba(26, 24, 20, 0.04), 0 12px 30px -18px rgba(63, 58, 46, 0.18);
  }
  .dgs-score {
    background: #8B1A1A;
    color: #FFF8E7;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 0.04em;
    padding: 4px 10px;
    border-radius: 2px;
    line-height: 1.1;
    display: inline-block;
  }
  .dgs-score-mid { background: #B86A3D; }
  .dgs-score-low { background: #6B6359; }
  .dgs-quote {
    border-left: 3px solid #8B1A1A;
    background: #FAF4E2;
    padding: 16px 20px;
    font-family: 'Fraunces', serif;
    font-size: 15.5px;
    line-height: 1.55;
    color: #2A2620;
    font-weight: 350;
  }
  .dgs-link {
    color: #8B1A1A;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.15s ease;
    border-bottom: 1px solid transparent;
  }
  .dgs-link:hover { border-bottom-color: #8B1A1A; }
  .dgs-btn-primary {
    background: #8B1A1A;
    color: #FFF8E7;
    padding: 10px 18px;
    font-family: 'Inter Tight', sans-serif;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.01em;
    border-radius: 2px;
    transition: all 0.15s ease;
    cursor: pointer;
    border: 1px solid #8B1A1A;
  }
  .dgs-btn-primary:hover { background: #6F1414; }
  .dgs-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .dgs-btn-ghost {
    background: transparent;
    color: #1A1814;
    padding: 8px 14px;
    font-family: 'Inter Tight', sans-serif;
    font-weight: 500;
    font-size: 13px;
    border-radius: 2px;
    transition: all 0.15s ease;
    cursor: pointer;
    border: 1px solid #D4CCB6;
  }
  .dgs-btn-ghost:hover { background: #FAF4E2; border-color: #8B1A1A; color: #8B1A1A; }
  .dgs-btn-ghost.active { background: #1A1814; color: #FFF8E7; border-color: #1A1814; }
  .dgs-input, .dgs-textarea {
    width: 100%;
    background: #FFFDF7;
    border: 1px solid #D4CCB6;
    border-radius: 2px;
    padding: 10px 14px;
    font-family: 'Inter Tight', sans-serif;
    font-size: 14px;
    color: #1A1814;
    transition: border-color 0.15s ease;
  }
  .dgs-textarea {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    line-height: 1.55;
  }
  .dgs-input:focus, .dgs-textarea:focus { outline: none; border-color: #8B1A1A; }
  .dgs-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: #FFFDF7;
    border: 1px solid #D4CCB6;
    border-radius: 999px;
    font-size: 12.5px;
    color: #3F3A2E;
    font-weight: 500;
  }
  .dgs-pill.active { background: #1A1814; color: #FFF8E7; border-color: #1A1814; }
  .dgs-meta { font-size: 13px; color: #6B6359; }
  .dgs-meta-dot::before { content: '·'; margin: 0 8px; color: #B5AC95; }
  .dgs-section-num {
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    color: #8B1A1A;
    font-size: 14px;
    margin-right: 10px;
  }
  .dgs-fade-in { animation: dgsFade 0.4s ease both; }
  @keyframes dgsFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .dgs-stagger > *:nth-child(1) { animation-delay: 0.05s; }
  .dgs-stagger > *:nth-child(2) { animation-delay: 0.12s; }
  .dgs-stagger > *:nth-child(3) { animation-delay: 0.19s; }
  .dgs-stagger > *:nth-child(4) { animation-delay: 0.26s; }
  .dgs-stagger > *:nth-child(5) { animation-delay: 0.33s; }
  .dgs-spinner { animation: dgsSpin 1s linear infinite; }
  @keyframes dgsSpin { to { transform: rotate(360deg); } }
  .dgs-thumbnail {
    width: 144px;
    height: 96px;
    background: linear-gradient(135deg, #2A2620 0%, #4A3F2E 100%);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C9B97E;
    font-family: 'Fraunces', serif;
    font-size: 11px;
    text-align: center;
    padding: 8px;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
  }
  .dgs-thumbnail::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%);
  }
  .dgs-tab-btn {
    padding: 6px 14px;
    font-size: 13px;
    color: #6B6359;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
    background: none;
    border-top: none;
    border-left: none;
    border-right: none;
  }
  .dgs-tab-btn:hover { color: #1A1814; }
  .dgs-tab-btn.active { color: #8B1A1A; border-bottom-color: #8B1A1A; }
  .dgs-segment-chip {
    display: inline-flex;
    padding: 2px 8px;
    border-radius: 2px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.04em;
  }
  .dgs-segment-worth { background: #E8E2CD; color: #5A5234; }
  .dgs-segment-skip { background: #F0E8E0; color: #8B6F57; }
  .dgs-tick {
    border-left: 2px solid #8B1A1A;
    padding-left: 14px;
    margin-bottom: 14px;
    position: relative;
  }
  .dgs-tick.skip { border-left-color: #C8BFA8; }
  .dgs-tick::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 6px;
    width: 8px;
    height: 8px;
    background: #8B1A1A;
    border-radius: 50%;
  }
  .dgs-tick.skip::before { background: #C8BFA8; }
  .dgs-empty {
    text-align: center;
    padding: 80px 20px;
    color: #6B6359;
    font-family: 'Instrument Serif', serif;
    font-style: italic;
    font-size: 18px;
  }
  details > summary { list-style: none; cursor: pointer; }
  details > summary::-webkit-details-marker { display: none; }
  .dgs-modal-backdrop {
    position: fixed; inset: 0; background: rgba(26, 24, 20, 0.45);
    backdrop-filter: blur(3px); z-index: 50;
    display: flex; justify-content: center; padding: 24px;
    overflow-y: auto; animation: dgsFade 0.2s ease;
  }
  .dgs-error {
    border: 1px solid #C9836A;
    background: #FBEFE6;
    color: #6B2E14;
    padding: 12px 14px;
    border-radius: 2px;
    font-size: 13px;
  }
`;

// ─────────────────────────────────────────────────────────────────────────
//  CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────
const STORE_KEYS = {
  videos: 'dgs:videos:v1',
  profile: 'dgs:profile:v1',
  stats: 'dgs:stats:v1'
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const tierFor = (score) => {
  if (score >= 7) return 'must-listen';
  if (score >= 4) return 'scannable';
  return 'skip';
};

const scoreColorClass = (score) => {
  if (score >= 7) return '';
  if (score >= 4) return 'dgs-score-mid';
  return 'dgs-score-low';
};

// Default focus profile — user can customize
const DEFAULT_PROFILE = {
  thesis:'Long-term, conviction-driven growth investing focused on early-to-mid stage secular themes: AI infrastructure, semiconductors, robotics/autonomy, defense tech, healthcare innovation, space infrastructure, and digital platforms. Prioritize durable moats, expanding TAMs, strong execution, and 3–5x upside over 5+ years.',
  holdings:'Keep a concentrated portfolio of around 16–20 names across core growth, high-conviction emerging names, and a small moonshot bucket. Maintain 5–10% cash, cap single positions at 8–10%, and cap any theme at 35%.',
  interests:'AI power and infrastructure, next-gen chips, edge AI, agentic workflows, robotics, autonomous systems, surgical robotics, AI drug discovery, defense tech, space/satellite infrastructure, digital platforms, ad-tech, and real-time AI data systems.',
  ignore: 'Ignore short-term volatility, macro noise, technical-only setups, meme hype, weak AI narratives without revenue traction, excessive leverage, overconcentration, low-liquidity names outside core themes, and any position where the thesis has materially broken.'
}

// Demo data so the tool feels alive on first open
const seedVideos = () => ([
  {
    id: 'seed-1',
    date: todayISO(),
    title: 'Everything You Need to Know about Financial Repression | Hanno Lustig',
    channel: 'The Monetary Matters Network',
    duration: 96,
    category: 'macro',
    score: 8,
    reasoning: 'Lustig is a Stanford researcher using primary data to dissect the mechanisms of financial repression — directly relevant to your dollar-debasement thesis and your BTC allocation premise. Treats whether the dollar system can inflate-and-repress its way out of the debt overhang as the central question.',
    fullReport: {
      summary: 'Hanno Lustig walks through the academic literature on financial repression as a sovereign debt management tool, with quantitative estimates of how much real-rate suppression would be needed to stabilize US debt-to-GDP. He argues the conditions for effective repression in the modern US are weaker than in the post-WWII era due to capital mobility and the size of the foreign holder base.',
      keyTakeaways: [
        'Stabilizing US debt/GDP via repression alone would require ~3% sustained negative real rates for 15+ years',
        'Foreign holders (~30% of marketable Treasuries) are the binding constraint — they can exit',
        'BTC and gold benefit asymmetrically when repression is the dominant policy regime, but only if it is credible and prolonged',
        'The bond market vigilante has been replaced by the term-premium repricing channel'
      ],
      timestamps: [
        { start: '00:00', end: '08:30', topic: 'Setup and definitions of financial repression', worthIt: false, why: 'Standard introductory material; skip if familiar with the concept.' },
        { start: '08:30', end: '24:00', topic: 'Post-WWII repression mechanics — why they worked', worthIt: true, why: 'Critical historical anchor for understanding why current conditions differ. Lustig brings real data on capital controls and forced bank holdings.' },
        { start: '24:00', end: '41:00', topic: 'The math: how negative are real rates need to be?', worthIt: true, why: 'This is the core quantitative argument. The 3% / 15-year figure is the headline number for your model.' },
        { start: '41:00', end: '58:00', topic: 'Why US conditions today are different', worthIt: true, why: 'The foreign-holder argument is the strongest counter to the "we can just inflate away" thesis. Direct input to your TLT positioning.' },
        { start: '58:00', end: '76:00', topic: 'Implications for hard assets — gold and BTC', worthIt: true, why: 'Lustig is unusually rigorous here vs. typical macro commentators. The asymmetry argument supports your IBIT/GLD pair.' },
        { start: '76:00', end: '96:00', topic: 'Q&A — mostly audience clarifications', worthIt: false, why: 'Few new arguments; skip unless a specific question grabs you from the chapter list.' }
      ]
    },
    url: '',
    addedAt: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    id: 'seed-2',
    date: todayISO(),
    title: "Who's Actually Running Iran? with Abbas Milani",
    channel: 'Hoover Institution',
    duration: 66,
    category: 'general',
    score: 7,
    reasoning: 'Milani is a firsthand source on Iranian power structure, and the negotiations are unfolding in real time. Not historical analysis — an interpretation of a power structure in motion, with direct implications for energy markets and your geopolitical risk premium framework.',
    fullReport: {
      summary: 'Milani maps the actual decision-making nodes inside the Iranian regime as of April 2026, distinguishing nominal authority (Supreme Leader, President) from operational control (IRGC commanders, Khamenei\'s office staff). Argues the succession question is the binding variable for any sustained policy shift.',
      keyTakeaways: [
        'Real authority is increasingly concentrated in 4-5 IRGC-adjacent figures, not the formal cabinet',
        'Succession dynamics make the next 18 months unusually unstable',
        'Strait of Hormuz threats are a credible signaling tool, not a serious operational plan',
        'Sanctions relief negotiations are constrained by domestic factional politics, not external willingness'
      ],
      timestamps: [
        { start: '00:00', end: '06:00', topic: 'Intro and Milani background', worthIt: false, why: 'Hoover house intro; skip.' },
        { start: '06:00', end: '22:00', topic: 'Map of the actual power structure', worthIt: true, why: 'The core analytical contribution. Worth listening at normal speed.' },
        { start: '22:00', end: '38:00', topic: 'Succession and the next 18 months', worthIt: true, why: 'Direct input to your oil risk premium thinking.' },
        { start: '38:00', end: '52:00', topic: 'Strait of Hormuz and signaling games', worthIt: true, why: 'Useful framework for parsing future news cycles.' },
        { start: '52:00', end: '66:00', topic: 'US policy options and panel discussion', worthIt: false, why: 'Conventional DC discussion; can read transcript.' }
      ]
    },
    url: '',
    addedAt: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    id: 'seed-3',
    date: todayISO(),
    title: 'The Global Politics Expert: The Real Global Danger is What Comes Next! (Bremmer)',
    channel: 'The Diary Of A CEO',
    duration: 99,
    category: 'general',
    score: 5,
    reasoning: "Bremmer's framework is valuable, but the interview format greatly dilutes the information density. This summary has already extracted the core points, so listening at normal speed offers low value for time spent.",
    fullReport: {
      summary: 'Bremmer presents his "G-Zero" framework updated for 2026, arguing that the absence of global leadership is now structural rather than transitional. Most of the airtime is spent on host-driven personal questions and broad civilizational framing.',
      keyTakeaways: [
        'G-Zero is now treated as a stable equilibrium, not a transition state',
        'Three flashpoints flagged: Taiwan, Iran nuclear, Russia post-conflict',
        'Argues against the "new Cold War" frame — sees more fragmentation than bipolarity'
      ],
      timestamps: [
        { start: '00:00', end: '18:00', topic: 'Personal background and host questions', worthIt: false, why: 'Skip — interview filler.' },
        { start: '18:00', end: '36:00', topic: 'G-Zero framework updated', worthIt: true, why: 'The one section worth your time. Watch at 1.5x.' },
        { start: '36:00', end: '99:00', topic: 'Various flashpoints, audience-friendly framing', worthIt: false, why: 'Surface-level. The takeaways above cover it.' }
      ]
    },
    url: '',
    addedAt: Date.now() - 1000 * 60 * 60 * 4
  },
  {
    id: 'seed-4',
    date: todayISO(),
    title: 'Bloomberg This Weekend | Iran Restricts Strait, Oil Futures Down, Stocks Rally',
    channel: 'Bloomberg Podcasts',
    duration: 153,
    category: 'general',
    score: 4,
    reasoning: 'The geopolitical event itself is valuable, but across 153 minutes the information density is largely exhausted within the subtitle-accessible content, and the media interpretation framework is weaker than what your analysis needs.',
    fullReport: {
      summary: 'Standard weekend roundup format. The Iran/Strait segment is the only piece with novel content; the rest is recap.',
      keyTakeaways: [
        'Oil futures decline interpreted as market not pricing serious disruption',
        'Equity rally on softer-than-expected CPI revision'
      ],
      timestamps: [
        { start: '00:00', end: '22:00', topic: 'Iran/Strait coverage', worthIt: true, why: 'The only segment with marginal new information.' },
        { start: '22:00', end: '153:00', topic: 'General market wrap', worthIt: false, why: 'Skip entirely.' }
      ]
    },
    url: '',
    addedAt: Date.now() - 1000 * 60 * 60 * 5
  }
]);

// Storage helpers (graceful fallback if window.storage unavailable)
const safeGet = async (key) => {
  try {
    if (typeof window === 'undefined' || !window.storage) return null;
    const r = await window.storage.get(key);
    return r ? r.value : null;
  } catch { return null; }
};
const safeSet = async (key, value) => {
  try {
    if (typeof window === 'undefined' || !window.storage) return false;
    await window.storage.set(key, value);
    return true;
  } catch { return false; }
};

// ─────────────────────────────────────────────────────────────────────────
//  CLAUDE API — analyze a video against user profile
// ─────────────────────────────────────────────────────────────────────────
const analyzeVideo = async ({ title, channel, duration, category, transcript, profile }) => {
  const sys = `You are a personal video-digest analyst. The user has subscribed to a YouTube channel that covers macro, geopolitics, finance, and adjacent topics. They watch many long videos and need a personal triage layer.

Your job: given (1) the user's investment-focus profile and (2) a video transcript with timestamps, produce a JSON object that scores how worth-listening-to this video is FOR THIS SPECIFIC USER, and breaks the video into segments flagging which ones are worth their time.

Be honest and discriminating. A good system flags low-density videos as low-density. Do not inflate scores. The user explicitly wants to skip videos that are not directly relevant.

Return ONLY a JSON object — no preamble, no markdown fences. Schema:
{
  "score": integer 1-10,
  "reasoning": "2-4 sentences explaining the score in this user's specific context. Reference their thesis/holdings where relevant.",
  "summary": "3-5 sentence neutral summary of the video's actual content and arguments.",
  "keyTakeaways": ["3-5 bullet-style takeaways, each one sentence"],
  "timestamps": [
    { "start": "MM:SS", "end": "MM:SS", "topic": "short topic label", "worthIt": boolean, "why": "one sentence why this segment is or isn't worth their time" }
  ]
}

Scoring rubric (calibrate strictly):
9-10: Primary-source expert, novel data, directly addresses user's core thesis. Rare.
7-8: Substantively useful — must-listen tier. Strong analysis OR firsthand source on a topic in the user's interest set.
5-6: Mixed signal. Some valuable segments worth scanning; full listen not justified.
3-4: Low density. The summary captures most of the value.
1-2: Skip. Off-topic or shallow given the user's profile.`;

  const userMsg = `USER FOCUS PROFILE
─────────────────
Thesis: ${profile.thesis}
Current holdings: ${profile.holdings}
Topic interests: ${profile.interests}
Topics to ignore/deprioritize: ${profile.ignore}

VIDEO METADATA
─────────────
Title: ${title}
Channel: ${channel}
Duration: ${duration} minutes
Category: ${category || 'general'}

TRANSCRIPT (with timestamps)
─────────────
${transcript}

Return the JSON object now.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: sys,
      messages: [{ role: 'user', content: userMsg }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText.slice(0, 200)}`);
  }
  const data = await response.json();
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim();

  // Strip code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Try to extract first JSON object substring
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Could not parse model response as JSON.');
    parsed = JSON.parse(m[0]);
  }

  // Basic validation
  if (typeof parsed.score !== 'number') throw new Error('Response missing score.');
  parsed.score = Math.max(1, Math.min(10, Math.round(parsed.score)));
  if (!Array.isArray(parsed.timestamps)) parsed.timestamps = [];
  if (!Array.isArray(parsed.keyTakeaways)) parsed.keyTakeaways = [];
  return parsed;
};

// ─────────────────────────────────────────────────────────────────────────
//  COMPONENTS
// ─────────────────────────────────────────────────────────────────────────

const ScoreBadge = ({ score }) => (
  <span className={`dgs-score ${scoreColorClass(score)}`}>{score}/10</span>
);

const Thumbnail = ({ title, channel }) => {
  const initials = (channel || title || '').slice(0, 2).toUpperCase();
  return (
    <div className="dgs-thumbnail">
      <div style={{ position: 'relative', zIndex: 1, fontSize: '24px', fontWeight: 600, opacity: 0.85 }}>
        {initials}
      </div>
    </div>
  );
};

const Header = ({ view, setView, profile }) => (
  <header style={{ borderBottom: '1px solid #E5DDC8', background: '#F4EFE3', position: 'sticky', top: 0, zIndex: 30 }}>
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <button onClick={() => setView('today')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>The Daily Digest</div>
        <div className="dgs-disp" style={{ fontSize: 22, fontWeight: 600, marginTop: 2, lineHeight: 1 }}>
          Signal <span className="dgs-ital" style={{ fontWeight: 400 }}>over</span> Noise
        </div>
      </button>
      <nav style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => setView('today')} className={`dgs-btn-ghost ${view === 'today' ? 'active' : ''}`}>
          <Calendar size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />Today
        </button>
        <button onClick={() => setView('archive')} className={`dgs-btn-ghost ${view === 'archive' ? 'active' : ''}`}>
          <Archive size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />Archive
        </button>
        <button onClick={() => setView('settings')} className={`dgs-btn-ghost ${view === 'settings' ? 'active' : ''}`}>
          <Settings size={13} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />Focus
        </button>
        <button onClick={() => setView('add')} className="dgs-btn-primary">
          <Plus size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />Add Video
        </button>
      </nav>
    </div>
  </header>
);

const TodayView = ({ videos, setView, openReport, deleteVideo }) => {
  const today = todayISO();
  const todayVideos = videos.filter(v => v.date === today);
  const mustListen = todayVideos.filter(v => v.score >= 7).sort((a, b) => b.score - a.score);
  const scannable = todayVideos.filter(v => v.score >= 4 && v.score < 7).sort((a, b) => b.score - a.score);
  const skip = todayVideos.filter(v => v.score < 4);

  // Stats line — derive from local data + tally of "filtered" if present
  const totalScanned = todayVideos.length;
  const triaged = todayVideos.length;
  const filtered = Math.max(0, totalScanned * 5); // mock: assume 5x more were filtered upstream

  if (todayVideos.length === 0) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <DigestMasthead todayVideos={todayVideos} mustListenCount={0} scannableCount={0} />
        <div className="dgs-empty">
          <div style={{ fontSize: 48, color: '#D4CCB6', marginBottom: 12 }}>—</div>
          No videos triaged for today yet.<br />
          <button onClick={() => setView('add')} className="dgs-link" style={{ marginTop: 16, display: 'inline-block', fontFamily: 'Inter Tight', fontStyle: 'normal', fontSize: 14 }}>
            Add your first video →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 80px' }}>
      <DigestMasthead todayVideos={todayVideos} mustListenCount={mustListen.length} scannableCount={scannable.length} />

      {mustListen.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <SectionHeader number="01" label="Today's Must-Listen" count={mustListen.length} />
          <div className="dgs-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {mustListen.map(v => (
              <MustListenCard key={v.id} video={v} onOpen={() => openReport(v.id)} onDelete={() => deleteVideo(v.id)} />
            ))}
          </div>
        </section>
      )}

      {scannable.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <SectionHeader number="02" label="Scannable Summaries" count={scannable.length} />
          <ScannableList videos={scannable} openReport={openReport} deleteVideo={deleteVideo} />
        </section>
      )}

      {skip.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <SectionHeader number="03" label="Filed for Reference" count={skip.length} subtle />
          <div style={{ background: '#FAF4E2', padding: '18px 22px', border: '1px solid #E5DDC8', borderRadius: 2 }}>
            {skip.map(v => (
              <div key={v.id} style={{ padding: '8px 0', borderBottom: '1px solid #E5DDC8', display: 'flex', alignItems: 'center', gap: 12 }} className="last:border-0">
                <ScoreBadge score={v.score} />
                <div style={{ flex: 1, fontSize: 13.5, color: '#3F3A2E' }}>
                  <span style={{ fontWeight: 500 }}>{v.title}</span>
                  <span className="dgs-meta dgs-meta-dot">{v.channel}</span>
                </div>
                <button onClick={() => openReport(v.id)} className="dgs-link" style={{ fontSize: 12.5 }}>view →</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

const DigestMasthead = ({ todayVideos, mustListenCount, scannableCount }) => {
  const today = todayISO();
  return (
    <div className="dgs-paper" style={{ padding: '28px 32px 26px', position: 'relative' }}>
      <div className="dgs-eyebrow" style={{ color: '#6B6359' }}>Vol. 1 · Issue {todayVideos.length || '—'} · {today}</div>
      <h1 className="dgs-disp" style={{ fontSize: 44, fontWeight: 500, lineHeight: 1.05, marginTop: 8, marginBottom: 6, letterSpacing: '-0.025em' }}>
        Video Digest <span className="dgs-ital" style={{ fontWeight: 400, color: '#8B1A1A' }}>—</span> {formatDate(today)}
      </h1>
      <p style={{ color: '#3F3A2E', fontSize: 14.5, lineHeight: 1.5, maxWidth: 540, marginTop: 4 }}>
        {todayVideos.length > 0 ? (
          <>Triaged <strong>{todayVideos.length}</strong> {todayVideos.length === 1 ? 'video' : 'videos'} against your focus profile. <span className="dgs-ital" style={{ color: '#8B1A1A' }}>{mustListenCount}</span> flagged must-listen, <span className="dgs-ital" style={{ color: '#B86A3D' }}>{scannableCount}</span> summarized for scanning.</>
        ) : (
          <>No items in today's digest yet.</>
        )}
      </p>
      {todayVideos.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          {mustListenCount > 0 && <span className="dgs-pill"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B1A1A' }} /> Must-Listen · {mustListenCount}</span>}
          {scannableCount > 0 && <span className="dgs-pill"><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B86A3D' }} /> Scannable · {scannableCount}</span>}
        </div>
      )}
    </div>
  );
};

const SectionHeader = ({ number, label, count, subtle }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span className="dgs-section-num">№ {number}</span>
      <h2 className="dgs-disp" style={{ fontSize: 26, fontWeight: 500, color: subtle ? '#6B6359' : '#1A1814', letterSpacing: '-0.02em' }}>
        {label}
      </h2>
      {count != null && <span className="dgs-mono" style={{ fontSize: 12, color: '#8B1A1A', marginLeft: 4 }}>· {count}</span>}
    </div>
    <div className={subtle ? 'dgs-rule-thin' : 'dgs-rule-thick'} style={{ marginTop: 8 }} />
  </div>
);

const MustListenCard = ({ video, onOpen, onDelete }) => (
  <article className="dgs-paper dgs-fade-in" style={{ padding: 22, display: 'flex', gap: 20, position: 'relative' }}>
    <Thumbnail title={video.title} channel={video.channel} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 className="dgs-disp" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2, marginBottom: 10, paddingRight: 30 }}>
        {video.title}
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14, flexWrap: 'wrap' }}>
        <ScoreBadge score={video.score} />
        <span className="dgs-meta" style={{ marginLeft: 12 }}>{video.channel}</span>
        <span className="dgs-meta dgs-meta-dot">{video.duration} min</span>
        <span className="dgs-meta dgs-meta-dot">{video.category || 'general'}</span>
      </div>
      <div className="dgs-quote">{video.reasoning}</div>
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onOpen} className="dgs-btn-ghost" style={{ borderColor: '#8B1A1A', color: '#8B1A1A' }}>
          View Full Report →
        </button>
        {video.url && (
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="dgs-link" style={{ fontSize: 12.5 }}>
            <ExternalLink size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
            YouTube
          </a>
        )}
      </div>
    </div>
    <button onClick={onDelete} title="Remove" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#B5AC95', cursor: 'pointer', padding: 4 }}>
      <Trash2 size={14} />
    </button>
  </article>
);

const ScannableList = ({ videos, openReport, deleteVideo }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="dgs-paper" style={{ padding: '6px 0' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', background: 'none', border: 'none', cursor: 'pointer', color: '#3F3A2E', fontSize: 13.5, fontWeight: 500 }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {open ? 'Collapse' : 'Expand'} {videos.length} items
      </button>
      {open && (
        <div>
          {videos.map((v, i) => (
            <div key={v.id} style={{ padding: '18px 22px', borderTop: '1px solid #EAE3CE' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <ScoreBadge score={v.score} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="dgs-disp" style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.25, marginBottom: 4 }}>
                    {v.title}
                  </h4>
                  <div className="dgs-meta" style={{ marginBottom: 8 }}>
                    {v.channel}<span className="dgs-meta-dot">{v.duration} min</span>
                  </div>
                  <p style={{ color: '#3F3A2E', fontSize: 13.5, lineHeight: 1.55, marginBottom: 8 }}>
                    {v.reasoning}
                  </p>
                  <button onClick={() => openReport(v.id)} className="dgs-link" style={{ fontSize: 12.5 }}>View Full Report →</button>
                </div>
                <button onClick={() => deleteVideo(v.id)} title="Remove" style={{ background: 'none', border: 'none', color: '#B5AC95', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
//  REPORT MODAL
// ─────────────────────────────────────────────────────────────────────────
const ReportModal = ({ video, onClose }) => {
  if (!video) return null;
  const r = video.fullReport || {};
  return (
    <div className="dgs-modal-backdrop" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 800, width: '100%', background: '#FFFDF7', border: '1px solid #E5DDC8', borderRadius: 2, padding: '28px 36px 40px', height: 'fit-content', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#6B6359' }}>
          <X size={18} />
        </button>

        <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>Full Report · {video.date}</div>
        <h2 className="dgs-disp" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.15, marginTop: 6, marginBottom: 12, paddingRight: 30, letterSpacing: '-0.02em' }}>
          {video.title}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
          <ScoreBadge score={video.score} />
          <span className="dgs-meta" style={{ marginLeft: 12 }}>{video.channel}</span>
          <span className="dgs-meta dgs-meta-dot">{video.duration} min</span>
          <span className="dgs-meta dgs-meta-dot">{video.category}</span>
        </div>

        <div className="dgs-rule-double" style={{ marginBottom: 22 }} />

        <div className="dgs-eyebrow" style={{ color: '#6B6359', marginBottom: 8 }}>Why This Score</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#1A1814', marginBottom: 24 }}>
          {video.reasoning}
        </p>

        {r.summary && (
          <>
            <div className="dgs-eyebrow" style={{ color: '#6B6359', marginBottom: 8 }}>Summary</div>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#1A1814', marginBottom: 24 }}>
              {r.summary}
            </p>
          </>
        )}

        {r.keyTakeaways && r.keyTakeaways.length > 0 && (
          <>
            <div className="dgs-eyebrow" style={{ color: '#6B6359', marginBottom: 10 }}>Key Takeaways</div>
            <ul style={{ marginBottom: 28, paddingLeft: 0, listStyle: 'none' }}>
              {r.keyTakeaways.map((t, i) => (
                <li key={i} style={{ fontSize: 14.5, lineHeight: 1.55, color: '#1A1814', marginBottom: 8, paddingLeft: 22, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#8B1A1A', fontFamily: 'Instrument Serif', fontStyle: 'italic' }}>{i + 1}.</span>
                  {t}
                </li>
              ))}
            </ul>
          </>
        )}

        {r.timestamps && r.timestamps.length > 0 && (
          <>
            <div className="dgs-eyebrow" style={{ color: '#6B6359', marginBottom: 12 }}>Minute-by-Minute</div>
            <div>
              {r.timestamps.map((t, i) => (
                <div key={i} className={`dgs-tick ${t.worthIt ? '' : 'skip'}`}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span className="dgs-mono" style={{ fontSize: 12.5, color: '#1A1814', fontWeight: 600 }}>{t.start}–{t.end}</span>
                    <span className={`dgs-segment-chip ${t.worthIt ? 'dgs-segment-worth' : 'dgs-segment-skip'}`}>
                      {t.worthIt ? 'WORTH IT' : 'SKIP'}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1814' }}>{t.topic}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#3F3A2E', lineHeight: 1.5, marginTop: 2 }}>
                    {t.why}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {video.url && (
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #E5DDC8' }}>
            <a href={video.url} target="_blank" rel="noopener noreferrer" className="dgs-link" style={{ fontSize: 13 }}>
              <ExternalLink size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
              Open on YouTube
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
//  ADD VIDEO VIEW
// ─────────────────────────────────────────────────────────────────────────
const AddVideoView = ({ profile, onAdd, setView }) => {
  const [form, setForm] = useState({
    title: '', channel: '', duration: 60, category: 'macro', url: '', transcript: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const ready = form.title.trim() && form.channel.trim() && form.transcript.trim().length > 100;

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeVideo({
        title: form.title.trim(),
        channel: form.channel.trim(),
        duration: parseInt(form.duration) || 60,
        category: form.category,
        transcript: form.transcript.slice(0, 80000),
        profile
      });
      const video = {
        id: 'v-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        date: todayISO(),
        title: form.title.trim(),
        channel: form.channel.trim(),
        duration: parseInt(form.duration) || 60,
        category: form.category,
        url: form.url.trim(),
        score: result.score,
        reasoning: result.reasoning,
        fullReport: {
          summary: result.summary,
          keyTakeaways: result.keyTakeaways,
          timestamps: result.timestamps
        },
        addedAt: Date.now()
      };
      await onAdd(video);
      setView('today');
    } catch (e) {
      setError(e.message || 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
      <button onClick={() => setView('today')} className="dgs-link" style={{ fontSize: 13, marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} /> Back to today
      </button>

      <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>New Entry</div>
      <h1 className="dgs-disp" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.1, marginTop: 6, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Triage a Video
      </h1>
      <p style={{ color: '#3F3A2E', fontSize: 14.5, lineHeight: 1.55, marginBottom: 28, maxWidth: 540 }}>
        Paste a transcript with timestamps. Claude will score it against your focus profile, write the digest entry, and break out the minute-by-minute report.
      </p>

      <div className="dgs-paper" style={{ padding: 28 }}>
        <FormRow label="Video Title">
          <input className="dgs-input" value={form.title} onChange={e => update('title', e.target.value)} placeholder="Everything You Need to Know about Financial Repression" />
        </FormRow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <FormRow label="Channel">
            <input className="dgs-input" value={form.channel} onChange={e => update('channel', e.target.value)} placeholder="The Monetary Matters Network" />
          </FormRow>
          <FormRow label="Duration (min)">
            <input className="dgs-input" type="number" min="1" value={form.duration} onChange={e => update('duration', e.target.value)} />
          </FormRow>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
          <FormRow label="Category">
            <select className="dgs-input" value={form.category} onChange={e => update('category', e.target.value)}>
              <option value="macro">macro</option>
              <option value="markets">markets</option>
              <option value="geopolitics">geopolitics</option>
              <option value="crypto">crypto</option>
              <option value="tech">tech</option>
              <option value="general">general</option>
            </select>
          </FormRow>
          <FormRow label="YouTube URL (optional)">
            <input className="dgs-input" value={form.url} onChange={e => update('url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
          </FormRow>
        </div>
        <FormRow label="Transcript (with timestamps)" hint="Paste from YouTube transcript download or any tool. Format like '00:12 The host opens with...' works best. Min ~100 chars.">
          <textarea
            className="dgs-textarea"
            rows={14}
            value={form.transcript}
            onChange={e => update('transcript', e.target.value)}
            placeholder={'00:00 Welcome back to the show. Today\'s guest is...\n00:42 Let\'s start with your framework on...\n02:15 The mechanism here is...\n...'}
          />
        </FormRow>

        {error && (
          <div className="dgs-error" style={{ marginBottom: 14 }}>
            <AlertCircle size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={submit} disabled={!ready || loading} className="dgs-btn-primary">
            {loading ? (
              <><Loader2 size={14} className="dgs-spinner" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />Analyzing…</>
            ) : (
              <><Sparkles size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />Analyze & File</>
            )}
          </button>
          <button onClick={() => setView('today')} className="dgs-btn-ghost" disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const FormRow = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label className="dgs-eyebrow" style={{ color: '#3F3A2E', display: 'block', marginBottom: 6 }}>{label}</label>
    {children}
    {hint && <div style={{ fontSize: 12, color: '#6B6359', marginTop: 4, fontStyle: 'italic', fontFamily: 'Instrument Serif', fontSize: 13 }}>{hint}</div>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
//  SETTINGS / PROFILE VIEW
// ─────────────────────────────────────────────────────────────────────────
const SettingsView = ({ profile, onSave, setView }) => {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 80px' }}>
      <button onClick={() => setView('today')} className="dgs-link" style={{ fontSize: 13, marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} /> Back to today
      </button>

      <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>Personal Configuration</div>
      <h1 className="dgs-disp" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.1, marginTop: 6, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Focus Profile
      </h1>
      <p style={{ color: '#3F3A2E', fontSize: 14.5, lineHeight: 1.55, marginBottom: 28, maxWidth: 540 }}>
        This is the lens every video gets scored through. The more specific you are about your thesis, holdings, and what you want to <em className="dgs-ital">ignore</em>, the sharper the triage.
      </p>

      <div className="dgs-paper" style={{ padding: 28 }}>
        <FormRow label="Investment Thesis" hint="What's the macro view driving your decisions?">
          <textarea className="dgs-textarea" style={{ fontFamily: 'Inter Tight', fontSize: 14 }} rows={4} value={form.thesis} onChange={e => setForm({ ...form, thesis: e.target.value })} />
        </FormRow>
        <FormRow label="Current Holdings" hint="Your actual book — anchors what's directly actionable.">
          <textarea className="dgs-textarea" style={{ fontFamily: 'Inter Tight', fontSize: 14 }} rows={3} value={form.holdings} onChange={e => setForm({ ...form, holdings: e.target.value })} />
        </FormRow>
        <FormRow label="Topic Interests" hint="What you actively want signal on.">
          <textarea className="dgs-textarea" style={{ fontFamily: 'Inter Tight', fontSize: 14 }} rows={3} value={form.interests} onChange={e => setForm({ ...form, interests: e.target.value })} />
        </FormRow>
        <FormRow label="Ignore / Deprioritize" hint="Just as important — what should be filtered down even if it sounds vaguely relevant.">
          <textarea className="dgs-textarea" style={{ fontFamily: 'Inter Tight', fontSize: 14 }} rows={3} value={form.ignore} onChange={e => setForm({ ...form, ignore: e.target.value })} />
        </FormRow>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
          <button onClick={save} className="dgs-btn-primary">
            <Save size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />Save Profile
          </button>
          {saved && <span style={{ fontSize: 13, color: '#5A7A4A', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} /> Saved</span>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
//  ARCHIVE VIEW
// ─────────────────────────────────────────────────────────────────────────
const ArchiveView = ({ videos, openReport, setView }) => {
  const byDate = {};
  videos.forEach(v => {
    if (!byDate[v.date]) byDate[v.date] = [];
    byDate[v.date].push(v);
  });
  const dates = Object.keys(byDate).sort().reverse();

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 80px' }}>
      <button onClick={() => setView('today')} className="dgs-link" style={{ fontSize: 13, marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <ArrowLeft size={13} /> Back to today
      </button>

      <div className="dgs-eyebrow" style={{ color: '#8B1A1A' }}>The Archive</div>
      <h1 className="dgs-disp" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1.1, marginTop: 6, marginBottom: 8, letterSpacing: '-0.02em' }}>
        Past Issues
      </h1>
      <p style={{ color: '#3F3A2E', fontSize: 14.5, marginBottom: 28 }}>
        Every digest you've filed, by date.
      </p>

      {dates.length === 0 ? (
        <div className="dgs-empty">No past issues yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {dates.map(date => {
            const dayVideos = byDate[date].sort((a, b) => b.score - a.score);
            const must = dayVideos.filter(v => v.score >= 7).length;
            const scan = dayVideos.filter(v => v.score >= 4 && v.score < 7).length;
            return (
              <div key={date} className="dgs-paper" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #E5DDC8' }}>
                  <div>
                    <div className="dgs-eyebrow" style={{ color: '#6B6359' }}>{date}</div>
                    <h3 className="dgs-disp" style={{ fontSize: 22, fontWeight: 500, marginTop: 2, letterSpacing: '-0.02em' }}>
                      {formatDate(date)}
                    </h3>
                  </div>
                  <div className="dgs-mono" style={{ fontSize: 11.5, color: '#8B1A1A' }}>
                    {must} must · {scan} scan · {dayVideos.length} total
                  </div>
                </div>
                {dayVideos.map(v => (
                  <div key={v.id} style={{ padding: '10px 0', display: 'flex', alignItems: 'flex-start', gap: 12, borderBottom: '1px dotted #EAE3CE' }}>
                    <ScoreBadge score={v.score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="dgs-disp" style={{ fontSize: 15.5, fontWeight: 500, lineHeight: 1.3 }}>{v.title}</div>
                      <div className="dgs-meta" style={{ fontSize: 12.5 }}>{v.channel} · {v.duration}m · {v.category}</div>
                    </div>
                    <button onClick={() => openReport(v.id)} className="dgs-link" style={{ fontSize: 12.5 }}>view →</button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('today');
  const [videos, setVideos] = useState([]);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [reportVideoId, setReportVideoId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedVideos = await safeGet(STORE_KEYS.videos);
      const storedProfile = await safeGet(STORE_KEYS.profile);
      if (!mounted) return;
      if (storedVideos) {
        try {
          const parsed = JSON.parse(storedVideos);
          if (Array.isArray(parsed)) setVideos(parsed);
        } catch {}
      } else {
        // First run: seed with demo data
        const seed = seedVideos();
        setVideos(seed);
        await safeSet(STORE_KEYS.videos, JSON.stringify(seed));
      }
      if (storedProfile) {
        try { setProfile(JSON.parse(storedProfile)); } catch {}
      } else {
        await safeSet(STORE_KEYS.profile, JSON.stringify(DEFAULT_PROFILE));
      }
      setLoaded(true);
    })();
    return () => { mounted = false; };
  }, []);

  const persistVideos = async (next) => {
    setVideos(next);
    await safeSet(STORE_KEYS.videos, JSON.stringify(next));
  };

  const addVideo = async (video) => {
    const next = [video, ...videos];
    await persistVideos(next);
  };

  const deleteVideo = async (id) => {
    if (reportVideoId === id) setReportVideoId(null);
    const next = videos.filter(v => v.id !== id);
    await persistVideos(next);
  };

  const saveProfile = async (p) => {
    setProfile(p);
    await safeSet(STORE_KEYS.profile, JSON.stringify(p));
  };

  const openReport = (id) => setReportVideoId(id);
  const reportVideo = videos.find(v => v.id === reportVideoId);

  return (
    <div className="dgs-root">
      <style>{styleSheet}</style>
      <Header view={view} setView={setView} profile={profile} />

      {!loaded ? (
        <div style={{ padding: 80, textAlign: 'center', color: '#6B6359' }}>
          <Loader2 size={20} className="dgs-spinner" style={{ display: 'inline-block', marginRight: 8, verticalAlign: '-4px' }} />
          Loading your digest…
        </div>
      ) : (
        <>
          {view === 'today' && <TodayView videos={videos} setView={setView} openReport={openReport} deleteVideo={deleteVideo} />}
          {view === 'add' && <AddVideoView profile={profile} onAdd={addVideo} setView={setView} />}
          {view === 'settings' && <SettingsView profile={profile} onSave={saveProfile} setView={setView} />}
          {view === 'archive' && <ArchiveView videos={videos} openReport={openReport} setView={setView} />}
        </>
      )}

      <ReportModal video={reportVideo} onClose={() => setReportVideoId(null)} />

      <footer style={{ borderTop: '1px solid #E5DDC8', padding: '24px', textAlign: 'center', marginTop: 40 }}>
        <div className="dgs-eyebrow" style={{ color: '#8B1A1A', marginBottom: 4 }}>Fin.</div>
        <div style={{ fontSize: 12, color: '#6B6359' }}>
          A personal triage layer for long-form video. <span className="dgs-ital">Read less, listen better.</span>
        </div>
      </footer>
    </div>
  );
}
