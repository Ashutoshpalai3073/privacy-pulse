import { useState } from "react";

// ---------------------------------------------------------------
// Privacy Pulse — DPDP consent prototype for Instagram India
// Happy path: Signup → Notice → Granular consent → Feed → Privacy Hub → Data request
// Ashutosh Palai · Vedantu PM Intern Assignment
// ---------------------------------------------------------------

const IG = "linear-gradient(45deg,#F58529,#DD2A7B,#8134AF,#515BD4)";
const PINK = "#DD2A7B";

const PURPOSES = [
  {
    id: "essential",
    name: "Essential",
    locked: true,
    desc: "Account, security, showing posts from people you follow. Instagram cannot run without this.",
    data: "Phone number, username, login activity",
  },
  {
    id: "personalisation",
    name: "Personalisation",
    locked: false,
    desc: "Suggested posts, Reels and accounts based on what you watch and like.",
    data: "Watch time, likes, searches inside Instagram",
  },
  {
    id: "ads",
    name: "Personalised ads",
    locked: false,
    desc: "Ads picked for you instead of generic ads. You'll still see ads either way.",
    data: "Interests inferred from your activity",
  },
  {
    id: "offapp",
    name: "Off-app activity",
    locked: false,
    desc: "Activity that other websites and apps share with Instagram about you.",
    data: "Visits to sites using Meta tools",
  },
];

const LANGS = ["English", "हिन्दी", "ଓଡ଼ିଆ", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "+16 more"];

const STEPS = [
  { key: "signup", label: "Sign up", note: "Standard entry — nothing changes here" },
  { key: "notice", label: "Plain-language notice", note: "DPDP §5: itemised notice, 22 languages" },
  { key: "consent", label: "Granular consent", note: "DPDP §6: free, specific, informed, per-purpose" },
  { key: "feed", label: "Home feed", note: "Essential-only users get a full working app" },
  { key: "hub", label: "Privacy Hub", note: "§6(4): withdrawal as easy as giving · §11–13: rights" },
  { key: "request", label: "Data request tracker", note: "Self-serve access with visible status" },
];

function Toggle({ on, locked, onChange }) {
  return (
    <button
      onClick={locked ? undefined : onChange}
      className="relative shrink-0"
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: locked ? "#c7c7cc" : on ? PINK : "#e5e5ea",
        transition: "background .2s", cursor: locked ? "default" : "pointer",
      }}
      aria-label={locked ? "Always on" : on ? "On" : "Off"}
    >
      <span style={{
        position: "absolute", top: 2, left: on || locked ? 20 : 2,
        width: 22, height: 22, borderRadius: 11, background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.25)", transition: "left .2s",
      }} />
    </button>
  );
}

function IGWord({ size = 26 }) {
  return (
    <div style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: size, fontWeight: 600 }}>
      Instagram
    </div>
  );
}

function FeedPost({ user, color, caption, likes }) {
  return (
    <div className="border-b border-gray-100 pb-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <div style={{ width: 30, height: 30, borderRadius: 15, background: color }} />
        <div className="text-xs font-semibold">{user}</div>
      </div>
      <div style={{ height: 150, background: color, opacity: 0.25 }} />
      <div className="px-3 pt-2 text-xs">
        <span className="font-semibold">{likes} likes</span>
        <div className="text-gray-600 mt-0.5">
          <span className="font-semibold text-black">{user}</span> {caption}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState("English");
  const [consents, setConsents] = useState({ personalisation: true, ads: false, offapp: false });
  const [reqStage, setReqStage] = useState(0); // 0 none, 1 placed

  const go = (i) => setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
  const grantedCount = 1 + Object.values(consents).filter(Boolean).length;

  // ---------------- screens ----------------
  const screens = [
    // 0 — SIGNUP
    <div key="s0" className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <IGWord size={34} />
        <div className="w-full mt-8 space-y-3">
          {["Mobile number", "Full name", "Date of birth", "Password"].map((p, i) => (
            <div key={p} className="border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
              {i === 0 ? "+91 98765 43210" : i === 1 ? "Riya Sharma" : i === 2 ? "14 Aug 2001" : "••••••••"}
            </div>
          ))}
        </div>
        <button onClick={() => go(1)} className="w-full mt-5 py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: IG }}>
          Sign up
        </button>
        <div className="mt-4 text-[11px] text-gray-500 text-center leading-relaxed">
          Next, we'll show you exactly what data Instagram uses and let you choose. No fine print.
        </div>
      </div>
    </div>,

    // 1 — NOTICE
    <div key="s1" className="flex flex-col h-full">
      <div className="px-5 pt-5">
        <div className="text-lg font-bold">Before you start —<br />here's what we use, in plain words</div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {LANGS.map((l) => (
            <button key={l} onClick={() => setLang(l)}
              className="px-2 py-1 rounded-full text-[10px] border"
              style={l === lang ? { background: "#111", color: "#fff", borderColor: "#111" } : { borderColor: "#d1d5db", color: "#374151" }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-5 mt-4 space-y-2.5">
        {PURPOSES.map((p) => (
          <div key={p.id} className="rounded-xl border border-gray-200 p-3">
            <div className="text-[13px] font-semibold">{p.name}{p.locked && <span className="ml-2 text-[10px] font-normal text-gray-400">always on</span>}</div>
            <div className="text-[11px] text-gray-600 mt-0.5 leading-snug">{p.desc}</div>
            <div className="text-[10px] mt-1" style={{ color: PINK }}>Data involved: {p.data}</div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3">
        <div className="text-[10px] text-gray-400 mb-2">Full notice · Grievance officer contact · Your rights under the DPDP Act, 2023</div>
        <button onClick={() => go(2)} className="w-full py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: IG }}>
          Choose what to allow
        </button>
      </div>
    </div>,

    // 2 — GRANULAR CONSENT
    <div key="s2" className="flex flex-col h-full">
      <div className="px-5 pt-5">
        <div className="text-lg font-bold">Your call, purpose by purpose</div>
        <div className="text-[11px] text-gray-500 mt-1">Switch any of these off — Instagram still works fully. Change your mind anytime in Privacy Hub.</div>
      </div>
      <div className="flex-1 px-5 mt-4 space-y-2.5">
        {PURPOSES.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 gap-3">
            <div>
              <div className="text-[13px] font-semibold">{p.name}</div>
              <div className="text-[11px] text-gray-600 leading-snug">{p.locked ? "Required to run your account" : p.desc}</div>
            </div>
            <Toggle
              on={p.locked ? true : consents[p.id]}
              locked={p.locked}
              onChange={() => setConsents((c) => ({ ...c, [p.id]: !c[p.id] }))}
            />
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-3">
        <button onClick={() => go(3)} className="w-full py-2.5 rounded-lg text-white text-sm font-semibold" style={{ background: IG }}>
          Confirm — allow {grantedCount} of 4
        </button>
        <div className="text-[10px] text-gray-400 text-center mt-2">No hidden defaults. What you see is what we store.</div>
      </div>
    </div>,

    // 3 — FEED
    <div key="s3" className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
        <IGWord size={22} />
        <button onClick={() => go(4)} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-full text-white" style={{ background: IG }}>
          🛡 Your Data
        </button>
      </div>
      <div className="px-3 py-2 flex items-center gap-2 text-[11px] rounded-none" style={{ background: "#f0fdf4", color: "#166534" }}>
        ✓ You're set. {grantedCount} of 4 purposes allowed — manage anytime from Your Data.
      </div>
      <div className="flex-1 overflow-hidden">
        <FeedPost user="wanderlust.diaries" color="#8134AF" caption="Golden hour in Puri 🌅" likes="2,431" />
        <FeedPost user="kgp.moments" color="#515BD4" caption="Illumination night hits different" likes="1,208" />
      </div>
      <div className="flex justify-around py-2.5 border-t border-gray-100 text-lg">
        <span>🏠</span><span>🔍</span><span>➕</span><span>🎬</span><span>👤</span>
      </div>
    </div>,

    // 4 — PRIVACY HUB
    <div key="s4" className="flex flex-col h-full">
      <div className="px-5 pt-5 flex items-center gap-2">
        <button onClick={() => go(3)} className="text-lg">‹</button>
        <div className="text-lg font-bold">Your Data</div>
      </div>
      <div className="px-5 mt-3">
        <div className="rounded-xl p-3 text-white" style={{ background: IG }}>
          <div className="text-[11px] opacity-90">Consent health</div>
          <div className="text-[15px] font-bold">{grantedCount} of 4 purposes allowed · updated today</div>
        </div>
      </div>
      <div className="flex-1 px-5 mt-3 space-y-2">
        {PURPOSES.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <div className="text-[12px] font-medium">{p.name}</div>
            <Toggle
              on={p.locked ? true : consents[p.id]}
              locked={p.locked}
              onChange={() => setConsents((c) => ({ ...c, [p.id]: !c[p.id] }))}
            />
          </div>
        ))}
        <div className="pt-2 space-y-2">
          <button onClick={() => { setReqStage(1); go(5); }} className="w-full py-2.5 rounded-lg text-white text-[13px] font-semibold" style={{ background: "#111" }}>
            ⬇ Download my data
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 rounded-lg border border-gray-300 text-[12px] font-medium">✎ Correct my info</button>
            <button className="py-2 rounded-lg border border-gray-300 text-[12px] font-medium text-red-600">🗑 Delete my data</button>
          </div>
          <div className="text-[10px] text-gray-400 text-center">Grievance officer · dpo@instagram.in · replies within 7 days</div>
        </div>
      </div>
    </div>,

    // 5 — REQUEST TRACKER
    <div key="s5" className="flex flex-col h-full">
      <div className="px-5 pt-5 flex items-center gap-2">
        <button onClick={() => go(4)} className="text-lg">‹</button>
        <div className="text-lg font-bold">Data request</div>
      </div>
      <div className="flex-1 px-5 mt-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="text-[13px] font-semibold">Request #DPR-2026-48291</div>
          <div className="text-[11px] text-gray-500">Copy of all data linked to @riya.sharma</div>
          <div className="mt-4 space-y-0">
            {[
              ["Request received", "Today, 4:12 PM", true],
              ["Preparing your file", "In progress — usually under 24h", true],
              ["Ready to download", "You'll get a notification", false],
            ].map(([t, d, done], i) => (
              <div key={t} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div style={{
                    width: 18, height: 18, borderRadius: 9,
                    background: done ? PINK : "#e5e5ea",
                    color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{done ? "✓" : ""}</div>
                  {i < 2 && <div style={{ width: 2, height: 30, background: done ? PINK : "#e5e5ea" }} />}
                </div>
                <div className="pb-2">
                  <div className="text-[12px] font-medium">{t}</div>
                  <div className="text-[10px] text-gray-500">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-xl p-3 text-[11px]" style={{ background: "#f0fdf4", color: "#166534" }}>
          ✓ That's the whole happy path — consent given with full knowledge, and a data right exercised in under a minute, self-serve.
        </div>
        <button onClick={() => { setReqStage(0); setConsents({ personalisation: true, ads: false, offapp: false }); go(0); }}
          className="w-full mt-3 py-2.5 rounded-lg border border-gray-300 text-[12px] font-medium">
          ↺ Restart the flow
        </button>
      </div>
    </div>,
  ];

  // ---------------- shell ----------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{ background: "#17101f", fontFamily: "-apple-system, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start max-w-5xl w-full justify-center">

        {/* left rail */}
        <div className="lg:w-72 w-full max-w-sm order-2 lg:order-1">
          <div className="text-white">
            <div className="text-[11px] font-bold tracking-widest" style={{ color: "#f472b6" }}>PRIVACY PULSE · PROTOTYPE</div>
            <div className="text-xl font-bold mt-1 leading-snug">Instagram × DPDP Act 2023 — the happy path</div>
            <div className="text-[12px] mt-2" style={{ color: "#b8a8cc" }}>
              Click through the phone, or jump to any step. Every screen maps to a DPDP obligation.
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            {STEPS.map((s, i) => (
              <button key={s.key} onClick={() => go(i)}
                className="w-full text-left rounded-lg px-3 py-2 transition-colors"
                style={i === step ? { background: "rgba(221,42,123,.18)", border: "1px solid rgba(221,42,123,.5)" } : { border: "1px solid rgba(255,255,255,.08)" }}>
                <div className="text-[12px] font-semibold" style={{ color: i === step ? "#f9a8d4" : "#e9e3f7" }}>
                  {i + 1}. {s.label}
                </div>
                <div className="text-[10px]" style={{ color: "#8d7ba8" }}>{s.note}</div>
              </button>
            ))}
          </div>
          <div className="mt-5 text-[10px]" style={{ color: "#6d5f85" }}>
            Ashutosh Palai · Vedantu PM Intern Assignment · Deliverable 2<br />
            Edge cases (decline path, Teen Mode parental consent) covered in the deck.
          </div>
        </div>

        {/* phone */}
        <div className="order-1 lg:order-2 shrink-0">
          <div style={{
            width: 320, height: 640, borderRadius: 40, background: "#000", padding: 10,
            boxShadow: "0 30px 80px rgba(0,0,0,.6)",
          }}>
            <div className="relative h-full w-full overflow-hidden bg-white" style={{ borderRadius: 32 }}>
              {/* notch */}
              <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 96, height: 20, borderRadius: 10, background: "#000", zIndex: 20 }} />
              <div className="h-full pt-8 flex flex-col">{screens[step]}</div>
            </div>
          </div>
          {/* progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => go(i)} style={{
                width: i === step ? 20 : 7, height: 7, borderRadius: 4,
                background: i === step ? PINK : "rgba(255,255,255,.25)", transition: "all .2s",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}