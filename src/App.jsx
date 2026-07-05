import { useState, useEffect } from "react";

// =====================================================================
// Privacy Pulse v2 — DPDP consent prototype for Instagram India
// Every control is live: inputs, toggles, likes, nav, rights actions.
// Ashutosh Palai · Vedantu PM Intern Assignment · Deliverable 2
// =====================================================================

const IG = "linear-gradient(45deg,#F58529 0%,#DD2A7B 50%,#8134AF 80%,#515BD4 100%)";
const PINK = "#DD2A7B";

const PURPOSES = [
  {
    id: "essential", name: "Essential", locked: true, emoji: "🔐",
    desc: "Account, security, posts from people you follow. Instagram cannot run without this.",
    data: "Phone number, username, login activity"
  },
  {
    id: "personalisation", name: "Personalisation", locked: false, emoji: "✨",
    desc: "Suggested posts, Reels and accounts based on what you watch and like.",
    data: "Watch time, likes, searches inside Instagram"
  },
  {
    id: "ads", name: "Personalised ads", locked: false, emoji: "🎯",
    desc: "Ads picked for you instead of generic ads. You'll see ads either way.",
    data: "Interests inferred from your activity"
  },
  {
    id: "offapp", name: "Off-app activity", locked: false, emoji: "🌐",
    desc: "Activity other websites and apps share with Instagram about you.",
    data: "Visits to sites using Meta tools"
  },
];

const LANGS = ["English", "हिन्दी", "ଓଡ଼ିଆ", "বাংলা", "தமிழ்", "తెలుగు", "मराठी", "+16"];

const STEPS = [
  { key: "signup", label: "Sign up", note: "Standard entry — nothing changes here" },
  { key: "notice", label: "Plain-language notice", note: "§5 — itemised notice, 22 languages" },
  { key: "consent", label: "Granular consent", note: "§6 — free, specific, informed, per-purpose" },
  { key: "feed", label: "Home feed", note: "Essential-only users get a full working app" },
  { key: "hub", label: "Privacy Hub", note: "§6(4) — withdrawal as easy as giving · §11–13 rights" },
  { key: "request", label: "Data request tracker", note: "Self-serve access with visible status" },
];
const SCREEN_TO_STEP = { signup: 0, notice: 1, consent: 2, feed: 3, hub: 4, correct: 4, del: 4, request: 5 };

// ------------------------------- atoms -------------------------------

function Toggle({ on, locked, onChange }) {
  return (
    <button onClick={locked ? undefined : onChange} className="relative shrink-0"
      style={{
        width: 46, height: 27, borderRadius: 14, border: "none", padding: 0,
        background: locked ? "#c7c7cc" : on ? PINK : "#dcdce1",
        transition: "background .25s", cursor: locked ? "default" : "pointer"
      }}
      aria-label={locked ? "Always on" : on ? "On" : "Off"}>
      <span style={{
        position: "absolute", top: 2.5, left: on || locked ? 21.5 : 2.5,
        width: 22, height: 22, borderRadius: 11, background: "#fff",
        boxShadow: "0 1.5px 4px rgba(0,0,0,.3)", transition: "left .25s cubic-bezier(.4,0,.2,1)"
      }} />
    </button>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1.5 text-[9px] font-medium text-gray-400 uppercase tracking-wide">{label}</div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl pl-3 pr-3 pt-5 pb-2 text-[13px] bg-gray-50 outline-none focus:border-gray-500 focus:bg-white transition-colors"
        style={{ fontFamily: "inherit" }} />
    </div>
  );
}

function GradBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-3 rounded-xl text-white text-[13.5px] font-semibold active:scale-[.98] transition-transform"
      style={{
        background: disabled ? "#e5c3d4" : IG, border: "none", cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 14px rgba(221,42,123,.35)"
      }}>
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="w-full py-2.5 rounded-xl text-[12.5px] font-semibold border active:scale-[.98] transition-transform bg-white"
      style={{ borderColor: danger ? "#fca5a5" : "#d1d5db", color: danger ? "#dc2626" : "#111", cursor: "pointer" }}>
      {children}
    </button>
  );
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-semibold text-black select-none">
      <span>9:41</span>
      <span className="flex items-center gap-1"><span>▂▄▆█</span><span>📶</span><span>🔋</span></span>
    </div>
  );
}

function StoryRing({ label, hue }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div style={{ padding: 2.5, borderRadius: "50%", background: IG }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%", border: "2.5px solid #fff",
          background: `linear-gradient(135deg, hsl(${hue},70%,70%), hsl(${hue + 40},70%,55%))`
        }} />
      </div>
      <span className="text-[8.5px] text-gray-700 max-w-[54px] truncate">{label}</span>
    </div>
  );
}

// ------------------------------- app -------------------------------

export default function App() {
  const [screen, setScreen] = useState("signup");
  const [lang, setLang] = useState("English");
  const [consents, setConsents] = useState({ personalisation: true, ads: false, offapp: false });
  const [form, setForm] = useState({ phone: "+91 98765 43210", name: "Riya Sharma", dob: "14 Aug 2001", pass: "riya@insta" });
  const [likes, setLikes] = useState({ p1: false, p2: false });
  const [saves, setSaves] = useState({ p1: false, p2: false });
  const [toast, setToast] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [correctName, setCorrectName] = useState("Riya Sharma");
  const [corrected, setCorrected] = useState(false);
  const [reqPlacedAt, setReqPlacedAt] = useState(null);

  const step = SCREEN_TO_STEP[screen];
  const granted = 1 + Object.values(consents).filter(Boolean).length;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const go = (s) => setScreen(s);
  const goStep = (i) => setScreen(STEPS[i].key === "request" ? "request" : STEPS[i].key);
  const ping = (msg) => setToast(msg);
  const flip = (id) => { setConsents((c) => ({ ...c, [id]: !c[id] })); ping("Choice saved — applies immediately"); };

  const posts = [
    { id: "p1", user: "wanderlust.diaries", hue: 275, caption: "Golden hour at Puri beach 🌅", likes: 2431 },
    { id: "p2", user: "kgp.moments", hue: 225, caption: "Illumination night hits different ✨", likes: 1208 },
  ];

  // ---------------- screens ----------------
  const screens = {

    signup: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="flex-1 flex flex-col justify-center px-7 pb-6">
          <div className="text-center mb-7" style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: 34, fontWeight: 600 }}>Instagram</div>
          <div className="space-y-2.5">
            <Field label="Mobile number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Date of birth" value={form.dob} onChange={(v) => setForm({ ...form, dob: v })} />
            <Field label="Password" type="password" value={form.pass} onChange={(v) => setForm({ ...form, pass: v })} />
          </div>
          <div className="mt-5">
            <GradBtn onClick={() => go("notice")} disabled={!form.phone || !form.name}>Sign up</GradBtn>
          </div>
          <div className="mt-4 text-[10.5px] text-gray-500 text-center leading-relaxed px-2">
            Next: we show you exactly what data Instagram uses — and you choose. No fine print.
          </div>
        </div>
      </div>
    ),

    notice: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-2">
          <div className="text-[17px] font-bold leading-snug">Before you start — what we use, in plain words</div>
          // Inside your "notice" screen definition
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {LANGS.map((l) => (
              <button
                key={l}
                // Only attach onClick if it's not the "+16" button
                onClick={l === "+16" ? undefined : () => { setLang(l); ping(`Notice now in ${l}`); }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${l === "+16" ? "cursor-default" : "cursor-pointer"
                  }`}
                style={l === lang ? { background: "#111", color: "#fff", borderColor: "#111" } : { borderColor: "#d1d5db", color: "#374151", background: "#fff" }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 mt-3 space-y-2 pb-2">
          {PURPOSES.map((p) => (
            <div key={p.id} className="rounded-2xl border border-gray-200 p-3 bg-white">
              <div className="flex items-center gap-2">
                <span className="text-[15px]">{p.emoji}</span>
                <span className="text-[12.5px] font-semibold">{p.name}</span>
                {p.locked && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">always on</span>}
              </div>
              <div className="text-[10.5px] text-gray-600 mt-1 leading-snug">{p.desc}</div>
              <div className="text-[9.5px] mt-1 font-medium" style={{ color: PINK }}>Data involved: {p.data}</div>
            </div>
          ))}
          <button onClick={() => ping("Full notice opened — grievance officer & rights inside")}
            className="w-full text-[10px] text-gray-400 underline py-1 bg-transparent border-none cursor-pointer">
            Read the full notice · Your rights under the DPDP Act, 2023
          </button>
        </div>
        <div className="px-5 pb-5 pt-2">
          <GradBtn onClick={() => go("consent")}>Choose what to allow</GradBtn>
        </div>
      </div>
    ),

    consent: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-2">
          <div className="text-[17px] font-bold">Your call, purpose by purpose</div>
          <div className="text-[10.5px] text-gray-500 mt-1">Switch anything off — Instagram still works fully. Change your mind anytime in Your Data.</div>
        </div>
        <div className="flex-1 px-5 mt-3 space-y-2 overflow-y-auto no-scrollbar pb-2">
          {PURPOSES.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-2xl border p-3 gap-3 transition-colors"
              style={{ borderColor: (p.locked || consents[p.id]) ? "#f3c6da" : "#e5e7eb", background: (p.locked || consents[p.id]) ? "#fef7fa" : "#fff" }}>
              <div>
                <div className="text-[12.5px] font-semibold">{p.emoji} {p.name}</div>
                <div className="text-[10.5px] text-gray-600 leading-snug mt-0.5">{p.locked ? "Required to run your account" : p.desc}</div>
              </div>
              <Toggle on={p.locked ? true : consents[p.id]} locked={p.locked} onChange={() => flip(p.id)} />
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-2">
          <GradBtn onClick={() => { go("feed"); ping("Consent recorded in your ledger"); }}>
            Confirm — allow {granted} of 4
          </GradBtn>
          <div className="text-[9.5px] text-gray-400 text-center mt-2">No hidden defaults. What you see is what we store.</div>
        </div>
      </div>
    ),

    feed: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
          <div style={{ fontFamily: "'Segoe Script','Brush Script MT',cursive", fontSize: 22, fontWeight: 600 }}>Instagram</div>
          <div className="flex items-center gap-3">
            <button onClick={() => ping("2 new likes on your reel")} className="bg-transparent border-none cursor-pointer text-[17px]">🤍</button>
            <button onClick={() => go("hub")}
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full text-white border-none cursor-pointer"
              style={{ background: IG }}>🛡 Your Data</button>
          </div>
        </div>
        <div className="px-3 py-2 text-[10px] flex items-center gap-1.5" style={{ background: "#f0fdf4", color: "#166534" }}>
          ✓ You're set — {granted} of 4 purposes allowed. Manage anytime from Your Data.
        </div>

        <div className="flex gap-3 px-3 py-2 overflow-x-auto border-b border-gray-100 no-scrollbar">
          {["Your story", "aarav_k", "diya.paints", "kgp.official", "chai.reels"].map((n, i) => (
            <StoryRing key={n} label={n} hue={200 + i * 45} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {posts.map((p) => (
            <div key={p.id} className="border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <div style={{ width: 28, height: 28, borderRadius: 14, background: `hsl(${p.hue},65%,60%)` }} />
                <div className="text-[11.5px] font-semibold">{p.user}</div>
              </div>
              <div onDoubleClick={() => { setLikes((l) => ({ ...l, [p.id]: true })); ping("❤️"); }}
                style={{ height: 145, background: `linear-gradient(135deg, hsl(${p.hue},60%,78%), hsl(${p.hue + 50},60%,60%))`, cursor: "pointer" }} />
              <div className="flex items-center gap-3.5 px-3 pt-2 text-[17px]">
                <button onClick={() => setLikes((l) => ({ ...l, [p.id]: !l[p.id] }))} className="bg-transparent border-none cursor-pointer p-0">
                  {likes[p.id] ? "❤️" : "🤍"}
                </button>
                <button onClick={() => ping("Comments open")} className="bg-transparent border-none cursor-pointer p-0">💬</button>
                <button onClick={() => ping("Shared to your story")} className="bg-transparent border-none cursor-pointer p-0">📤</button>
                <button onClick={() => setSaves((s) => ({ ...s, [p.id]: !s[p.id] }))} className="bg-transparent border-none cursor-pointer p-0 ml-auto">
                  {saves[p.id] ? "🔖" : "📑"}
                </button>
              </div>
              <div className="px-3 pt-1.5 text-[11px]">
                <span className="font-semibold">{(p.likes + (likes[p.id] ? 1 : 0)).toLocaleString()} likes</span>
                <div className="text-gray-600 mt-0.5"><span className="font-semibold text-black">{p.user}</span> {p.caption}</div>
              </div>
            </div>
          ))}
          <div className="text-center text-[10px] text-gray-400 py-3">You're all caught up ✓</div>
        </div>
        <div className="flex justify-around py-2.5 border-t border-gray-100 text-[19px]">
          <button className="bg-transparent border-none cursor-pointer p-0" onClick={() => ping("You're on Home")}>🏠</button>
          <button className="bg-transparent border-none cursor-pointer p-0" onClick={() => ping("Search — out of happy-path scope")}>🔍</button>
          <button className="bg-transparent border-none cursor-pointer p-0" onClick={() => ping("Create — out of happy-path scope")}>➕</button>
          <button className="bg-transparent border-none cursor-pointer p-0" onClick={() => ping("Reels — out of happy-path scope")}>🎬</button>
          <button className="bg-transparent border-none cursor-pointer p-0" onClick={() => go("hub")}>👤</button>
        </div>
      </div>
    ),

    hub: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-1 flex items-center gap-2.5">
          <button onClick={() => go("feed")} className="text-[20px] bg-transparent border-none cursor-pointer p-0">‹</button>
          <div className="text-[17px] font-bold">Your Data</div>
        </div>
        <div className="px-5 mt-2.5">
          <div className="rounded-2xl p-3.5 text-white" style={{ background: IG }}>
            <div className="text-[10px] opacity-90">Consent health · {form.name}</div>
            <div className="text-[14px] font-bold mt-0.5">{granted} of 4 purposes allowed · updated just now</div>
            <div className="flex gap-1 mt-2">
              {PURPOSES.map((p) => (
                <div key={p.id} className="flex-1 h-1.5 rounded-full"
                  style={{ background: (p.locked || consents[p.id]) ? "#fff" : "rgba(255,255,255,.3)" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 px-5 mt-3 space-y-1.5 overflow-y-auto no-scrollbar pb-3">
          {PURPOSES.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 bg-white">
              <div className="text-[11.5px] font-medium">{p.emoji} {p.name}</div>
              <Toggle on={p.locked ? true : consents[p.id]} locked={p.locked} onChange={() => flip(p.id)} />
            </div>
          ))}
          <div className="pt-2 space-y-2">
            <button onClick={() => { setReqPlacedAt(new Date()); go("request"); }}
              className="w-full py-3 rounded-xl text-white text-[12.5px] font-semibold border-none cursor-pointer active:scale-[.98] transition-transform"
              style={{ background: "#111" }}>
              ⬇ Download my data
            </button>
            <div className="grid grid-cols-2 gap-2">
              <GhostBtn onClick={() => go("correct")}>✎ Correct my info</GhostBtn>
              <GhostBtn danger onClick={() => go("del")}>🗑 Delete my data</GhostBtn>
            </div>
            <button onClick={() => ping("Email drafted to dpo@instagram.in")}
              className="w-full text-[9.5px] text-gray-400 bg-transparent border-none cursor-pointer py-1">
              Grievance officer · dpo@instagram.in · replies within 7 days
            </button>
          </div>
        </div>
      </div>
    ),

    correct: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-1 flex items-center gap-2.5">
          <button onClick={() => go("hub")} className="text-[20px] bg-transparent border-none cursor-pointer p-0">‹</button>
          <div className="text-[17px] font-bold">Correct my info</div>
        </div>
        <div className="flex-1 px-5 mt-4 space-y-3">
          <div className="text-[11px] text-gray-500">Right to correction — §12, DPDP Act 2023. Edit the record we hold, and it updates everywhere it's used.</div>
          <Field label="Full name on record" value={correctName} onChange={(v) => { setCorrectName(v); setCorrected(false); }} />
          <GradBtn onClick={() => { setForm({ ...form, name: correctName }); setCorrected(true); ping("Record corrected across all systems"); }}>
            Save correction
          </GradBtn>
          {corrected && (
            <div className="rounded-xl p-3 text-[11px]" style={{ background: "#f0fdf4", color: "#166534" }}>
              ✓ Corrected. New value "{form.name}" is now the single source of truth — no support ticket needed.
            </div>
          )}
          <button onClick={() => go("hub")} className="w-full text-[11px] text-gray-500 bg-transparent border-none cursor-pointer py-1">‹ Back to Your Data</button>
        </div>
      </div>
    ),

    del: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-1 flex items-center gap-2.5">
          <button onClick={() => { setConfirmDel(false); go("hub"); }} className="text-[20px] bg-transparent border-none cursor-pointer p-0">‹</button>
          <div className="text-[17px] font-bold">Delete my data</div>
        </div>
        <div className="flex-1 px-5 mt-4 space-y-3">
          <div className="text-[11px] text-gray-500">Right to erasure — §12, DPDP Act 2023. One request, no maze.</div>
          <div className="rounded-2xl border border-gray-200 p-3.5 space-y-2 bg-white">
            <div className="text-[12px] font-semibold">What gets erased</div>
            <div className="text-[10.5px] text-gray-600">Profile, posts, messages, activity history, inferred interests.</div>
            <div className="text-[12px] font-semibold pt-1">What we must retain, and why</div>
            <div className="text-[10.5px] text-gray-600">Payment records (tax law, 7 yrs) and security logs (fraud prevention) — explained in plain language, not buried.</div>
          </div>
          {!confirmDel ? (
            <GhostBtn danger onClick={() => setConfirmDel(true)}>Request deletion</GhostBtn>
          ) : (
            <div className="space-y-2">
              <div className="rounded-xl p-3 text-[11px]" style={{ background: "#fef2f2", color: "#991b1b" }}>
                This is permanent after a 30-day grace window. Confirm?
              </div>
              <div className="grid grid-cols-2 gap-2">
                <GhostBtn onClick={() => { setConfirmDel(false); ping("Deletion cancelled"); }}>Keep my account</GhostBtn>
                <button onClick={() => { setConfirmDel(false); ping("Deletion scheduled — 30-day grace window started"); go("hub"); }}
                  className="w-full py-2.5 rounded-xl text-[12.5px] font-semibold text-white border-none cursor-pointer"
                  style={{ background: "#dc2626" }}>
                  Confirm deletion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ),

    request: (
      <div className="flex flex-col h-full">
        <StatusBar />
        <div className="px-5 pt-1 flex items-center gap-2.5">
          <button onClick={() => go("hub")} className="text-[20px] bg-transparent border-none cursor-pointer p-0">‹</button>
          <div className="text-[17px] font-bold">Data request</div>
        </div>
        <div className="flex-1 px-5 mt-3 overflow-y-auto no-scrollbar pb-4">
          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-[12.5px] font-semibold">Request #DPR-2026-48291</div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fdf2f8", color: PINK }}>IN PROGRESS</span>
            </div>
            <div className="text-[10.5px] text-gray-500 mt-0.5">Copy of all data linked to @riya.sharma</div>
            <div className="mt-4">
              {[
                ["Request received", reqPlacedAt ? `Today, ${reqPlacedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Today", true],
                ["Preparing your file", "In progress — usually under 24h", true],
                ["Ready to download", "You'll get a notification here and by SMS", false],
              ].map(([t, d, done], i) => (
                <div key={t} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div style={{
                      width: 19, height: 19, borderRadius: 10, background: done ? PINK : "#e5e5ea",
                      color: "#fff", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {done ? "✓" : ""}
                    </div>
                    {i < 2 && <div style={{ width: 2, height: 30, background: done ? PINK : "#e5e5ea" }} />}
                  </div>
                  <div className="pb-2">
                    <div className="text-[12px] font-medium">{t}</div>
                    <div className="text-[10px] text-gray-500">{d}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => ping("We'll notify you — no need to check back")}
              className="w-full mt-1 py-2 rounded-lg text-[11px] font-medium border border-gray-200 bg-gray-50 cursor-pointer">
              🔔 Notify me when ready
            </button>
          </div>
          <div className="mt-3 rounded-2xl p-3 text-[10.5px] leading-relaxed" style={{ background: "#f0fdf4", color: "#166534" }}>
            ✓ Happy path complete — consent given with full knowledge, and a data right exercised self-serve in under a minute.
          </div>
          <button onClick={() => { setConsents({ personalisation: true, ads: false, offapp: false }); setLikes({ p1: false, p2: false }); setSaves({ p1: false, p2: false }); setCorrected(false); setReqPlacedAt(null); go("signup"); ping("Flow reset"); }}
            className="w-full mt-3 py-2.5 rounded-xl border border-gray-300 text-[11.5px] font-medium bg-white cursor-pointer">
            ↺ Restart the flow
          </button>
        </div>
      </div>
    ),
  };

  // ---------------- shell ----------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{
        background: "radial-gradient(1200px 700px at 70% 20%, #241640 0%, #150e26 55%, #0e0a1a 100%)",
        fontFamily: "-apple-system,'Segoe UI',Roboto,sans-serif"
      }}>
      <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start max-w-5xl w-full justify-center">

        {/* rail */}
        <div className="lg:w-[300px] w-full max-w-sm order-2 lg:order-1 lg:pt-4">
          <div className="text-[10px] font-bold tracking-[.2em]" style={{ color: "#f472b6" }}>PRIVACY PULSE · CLICKABLE PROTOTYPE</div>
          <div className="text-[22px] font-bold mt-1.5 leading-snug text-white">Instagram × DPDP Act 2023 — the happy path</div>
          <div className="text-[12px] mt-2 leading-relaxed" style={{ color: "#b8a8cc" }}>
            Everything in the phone is live — type, toggle, like, navigate. Each step maps to a section of the Act.
          </div>
          <div className="mt-5 space-y-1.5">
            {STEPS.map((s, i) => (
              <button key={s.key} onClick={() => goStep(i)}
                className="w-full text-left rounded-xl px-3.5 py-2.5 cursor-pointer transition-all"
                style={i === step
                  ? { background: "rgba(221,42,123,.16)", border: "1px solid rgba(221,42,123,.55)", transform: "translateX(4px)" }
                  : { background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.08)" }}>
                <div className="text-[12px] font-semibold" style={{ color: i === step ? "#f9a8d4" : "#e9e3f7" }}>
                  {i + 1} · {s.label}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "#8d7ba8" }}>{s.note}</div>
              </button>
            ))}
          </div>
          <div className="mt-5 text-[10px] leading-relaxed" style={{ color: "#6d5f85" }}>
            Bonus flows wired in: correction (§12) and erasure (§12) with plain-language retention notice.<br />
            Ashutosh Palai · Vedantu PM Intern Assignment · Deliverable 2
          </div>
        </div>

        {/* phone */}
        <div className="order-1 lg:order-2 shrink-0">
          <div style={{
            width: 330, height: 660, borderRadius: 46, padding: 11,
            background: "linear-gradient(160deg,#2a2a2e,#0c0c0e)",
            boxShadow: "0 40px 90px rgba(0,0,0,.65), inset 0 1px 1px rgba(255,255,255,.15)"
          }}>
            <div className="relative h-full w-full overflow-hidden bg-white" style={{ borderRadius: 36 }}>
              <div style={{
                position: "absolute", top: 9, left: "50%", transform: "translateX(-50%)",
                width: 92, height: 22, borderRadius: 12, background: "#000", zIndex: 30
              }} />
              <div className="h-full flex flex-col" key={screen} style={{ animation: "ppFade .28s ease" }}>
                {screens[screen]}
              </div>
              {toast && (
                <div style={{
                  position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
                  background: "rgba(17,17,17,.92)", color: "#fff", fontSize: 11, padding: "8px 14px",
                  borderRadius: 20, whiteSpace: "nowrap", maxWidth: "88%", overflow: "hidden",
                  textOverflow: "ellipsis", zIndex: 40, animation: "ppUp .25s ease"
                }}>
                  {toast}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => goStep(i)} className="border-none cursor-pointer p-0"
                style={{
                  width: i === step ? 22 : 7, height: 7, borderRadius: 4,
                  background: i === step ? PINK : "rgba(255,255,255,.25)", transition: "all .25s"
                }} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ppFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes ppUp { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }
        input::selection { background: #fbcfe8; }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;     /* Firefox */
        }
      `}</style>
    </div>
  );
}