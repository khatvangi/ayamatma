import { useState, useMemo, useCallback } from "react";

const CHARS = ["ś","r","ī","r","ā","m","a","r","ā","m","e","t","i","r","ā","m","e","r","ā","m","e","m","a","n","o","r","a","m","e"];
const SPLIT_POINTS = [2,4,6,8,10,12,14,16,18,20,22,24,26];

function C(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1);
  return Math.round(r);
}

// All 14 layers from Appendix B with exact split positions
const LAYERS = [
  { k: 0,  name: "Ekam",           splits: [],                                         meaning: "Brahman nirguṇa. The undivided. One reading. One current. Unity before distinction.",                     segments: ["śrīrāmarāmetirāmerāmemanorame"] },
  { k: 1,  name: "Spanda",         splits: [10],                                       meaning: "First vibration. One becomes two. Observer and observed. Thirteen ways to make the first cut.",          segments: ["śrīrāmarāme","tirāmerāmemanorame"] },
  { k: 2,  name: "Tripuṭī",        splits: [6,20],                                     meaning: "Knower, known, knowing. The Named, the Naming, the Effect. Triadic structure of experience.",          segments: ["śrīrāma","rāmetirāmerāme","manorame"] },
  { k: 3,  name: "Differentiation", splits: [2,10,20],                                  meaning: "Four distinct parts, same substance. Lakṣmī (śrī) separates from the name for the first time.",       segments: ["śrī","rāmarāme","tirāmerāme","manorame"] },
  { k: 4,  name: "Nāma-Rūpa",      splits: [2,6,10,20],                                meaning: "Words emerge. Names and forms. śrī and rāma stand as separate units. The mind can parse them.",        segments: ["śrī","rāma","rāme","tirāmerāme","manorame"] },
  { k: 5,  name: "Morpheme",        splits: [2,6,10,16,20],                             meaning: "Grammar exposed. Internal structure visible. The dative 'me' appears from inside a compound.",          segments: ["śrī","rāma","rāme","tirāme","rāme","manorame"] },
  { k: 6,  name: "Twin Peak",       splits: [2,6,8,10,16,20],                           meaning: "Maximum density. Tradition's mirror. rā (giving) separates for the first time. The seed shows through the flower. 1,716 readings — none explored.",  segments: ["śrī","rāma","rā","me","tirāme","rāme","manorame"] },
  { k: 7,  name: "Tradition ★",     splits: [2,6,10,12,16,20,24],                       meaning: "The known reading. The summit. The tradition reached the peak before the mountain was drawn. 1,716 readings — devotion chose this one.", segments: ["śrī","rāma","rāme","ti","rāme","rāme","mano","rame"] },
  { k: 8,  name: "Nirukta",         splits: [2,4,6,10,12,16,20,24],                     meaning: "Beyond tradition. rāma reveals its components: rā (√rā, to give) and ma (Lakṣmī-bīja, or negation). One step past what the tradition divides.", segments: ["śrī","rā","ma","rāme","ti","rāme","rāme","mano","rame"] },
  { k: 9,  name: "Dissolution",     splits: [2,4,6,8,10,12,16,20,24],                   meaning: "Words into seeds. The rā-me pattern begins to dominate: giving-to-me, giving-to-me. Mirrors Layer 4 exactly: 715 readings.", segments: ["śrī","rā","ma","rā","me","ti","rāme","rāme","mano","rame"] },
  { k: 10, name: "Near-Atomic",     splits: [2,4,6,8,10,12,16,18,20,24],                meaning: "Vibrational meaning. Most compounds broken. Meaning is no longer lexical but vibrational. Mirrors Layer 3: 286 readings.", segments: ["śrī","rā","ma","rā","me","ti","rāme","rā","me","mano","rame"] },
  { k: 11, name: "Almost",          splits: [2,4,6,8,10,12,14,16,18,20,24],             meaning: "Last compound standing: mano + rame. Mind and delight fused while everything else has become bīja. Mirrors Layer 2: 78 readings.", segments: ["śrī","rā","ma","rā","me","ti","rā","me","rā","me","mano","rame"] },
  { k: 12, name: "Penultimate",     splits: [2,4,6,8,10,12,14,16,18,20,24,26],          meaning: "13 ways for one last fusion. Each holds one last compound. Mirrors Layer 1: 13 readings.", segments: ["śrī","rā","ma","rā","me","ti","rā","me","rā","me","mano","ra","me"] },
  { k: 13, name: "Bīja",            splits: [2,4,6,8,10,12,14,16,18,20,22,24,26],       meaning: "Total atomization. 14 atomic pieces. 7 unique seeds. Count returns to 1. Post-analytic unity. rā-me cycling = 57%.", segments: ["śrī","rā","ma","rā","me","ti","rā","me","rā","me","ma","no","ra","me"] },
];

const BIJA_COLORS = { "rā": "#2171b5", "me": "#4a90d9", "ma": "#7eb3e0", "śrī": "#d4a017", "ti": "#9e9e9e", "no": "#7cb342", "ra": "#cb181d" };

function getSegments(splits) {
  const sorted = [...splits].sort((a, b) => a - b);
  const segs = [];
  let start = 0;
  for (const sp of sorted) {
    segs.push(CHARS.slice(start, sp + 1).join(""));
    start = sp + 1;
  }
  segs.push(CHARS.slice(start).join(""));
  return segs.filter(s => s.length > 0);
}

function MeruMountain({ activeLayer, onSelectLayer, hoveredLayer, onHoverLayer }) {
  const max = 1716;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 0" }}>
      {LAYERS.map((layer, k) => {
        const count = C(13, k);
        const w = Math.max(6, (count / max) * 100);
        const isActive = k === activeLayer;
        const isHovered = k === hoveredLayer;
        const isTradition = k === 7;
        const isPeak = k === 6 || k === 7;

        let bg = "rgba(180,180,180,0.25)";
        if (isActive) bg = "#2171b5";
        else if (isHovered) bg = "rgba(33,113,181,0.45)";
        else if (isPeak) bg = "rgba(33,113,181,0.15)";

        return (
          <div key={k}
            onClick={() => onSelectLayer(k)}
            onMouseEnter={() => onHoverLayer(k)}
            onMouseLeave={() => onHoverLayer(null)}
            style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "1px 0", gap: 6 }}
          >
            <div style={{ width: 18, textAlign: "right", fontSize: 10, color: "var(--text-color-secondary, #999)", fontVariantNumeric: "tabular-nums" }}>{k}</div>
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{
                width: `${w}%`, minWidth: 6,
                height: isActive || isHovered ? 20 : 15,
                background: bg, borderRadius: 3,
                transition: "all 0.25s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: isActive || isHovered ? "#fff" : isPeak ? "#2171b5" : "transparent", transition: "color 0.2s" }}>
                  {count.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ width: 90, fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? "#2171b5" : "var(--text-color-secondary, #aaa)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {layer.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StringDisplay({ activeSplits }) {
  const splitSet = new Set(activeSplits);
  return (
    <div style={{ overflowX: "auto", padding: "8px 0" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 0, margin: "0 auto" }}>
        {CHARS.map((ch, i) => {
          const hasSplitAfter = splitSet.has(i);
          return (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              <span style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center", padding: "0 1px",
              }}>
                <span style={{ fontSize: 9, color: "var(--text-color-faint, #bbb)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{i}</span>
                <span style={{ fontSize: 19, fontWeight: 600, color: "var(--text-color-primary, #222)", lineHeight: 1.3 }}>{ch}</span>
              </span>
              {SPLIT_POINTS.includes(i) && (
                <span style={{
                  display: "inline-block", width: 2, height: hasSplitAfter ? 28 : 0,
                  background: "#2171b5", borderRadius: 1, margin: "0 1px", alignSelf: "center",
                  transition: "height 0.3s ease", opacity: hasSplitAfter ? 1 : 0,
                }} />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SegmentBar({ segments, activeLayer }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", padding: "6px 0", minHeight: 34 }}>
      {segments.map((seg, i) => {
        const bjc = activeLayer === 13 ? (BIJA_COLORS[seg] || "#9e9e9e") : null;
        return (
          <span key={i} style={{
            padding: "3px 9px", borderRadius: 5, fontSize: 15, fontWeight: 500,
            background: bjc ? bjc : "rgba(33,113,181,0.07)",
            color: bjc ? "#fff" : "var(--text-color-primary, #333)",
            border: bjc ? "none" : "1px solid rgba(33,113,181,0.15)",
            transition: "all 0.3s ease",
          }}>{seg}</span>
        );
      })}
    </div>
  );
}

function LayerInfo({ layer }) {
  if (!layer) return null;
  const count = C(13, layer.k);
  const mirror = layer.k <= 6 ? 13 - layer.k : 13 - layer.k;
  const mirrorCount = C(13, mirror);
  const isSelfMirror = layer.k === 6 || layer.k === 7;

  return (
    <div style={{
      padding: "10px 14px", borderRadius: 8,
      background: "rgba(33,113,181,0.04)", border: "1px solid rgba(33,113,181,0.1)",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4, flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#2171b5" }}>
          Layer {layer.k}: {layer.name}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-color-secondary, #888)" }}>
          {layer.k} splits · {count.toLocaleString()} readings
          {!isSelfMirror && ` · mirrors Layer ${mirror} (${mirrorCount.toLocaleString()})`}
          {isSelfMirror && " · twin peak"}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "var(--text-color-primary, #444)", lineHeight: 1.5 }}>
        {layer.meaning}
      </div>
    </div>
  );
}

function BijaBar() {
  const atoms = ["śrī","rā","ma","rā","me","ti","rā","me","rā","me","ma","no","ra","me"];
  return (
    <div style={{ textAlign: "center", padding: "4px 0", fontSize: 12, color: "var(--text-color-secondary, #777)" }}>
      <strong style={{ color: "#2171b5" }}>rā + me = 57%</strong> — giving-to-me — the cycling substrate of japa
    </div>
  );
}

function RamMar() {
  const steps = [
    { chars: [["r","#2171b5"],["ā","#2171b5"],["m","#2171b5"],["a","#2171b5"]], label: "rāma — √ram: delight, repose — the name" },
    { chars: [["m","#cb181d"],["a","#cb181d"],["r","#cb181d"],["a","#cb181d"]], label: "mara — √mṛ: death — the mirror" },
    { chars: [["r","#2171b5"],["ā","#2171b5"],["m","#2171b5"],["a","#2171b5"],["r","#4a90d9"],["ā","#4a90d9"],["m","#4a90d9"],["a","#4a90d9"]], label: "rāmarāma — continuous japa" },
    { chars: [["a","#238b45"],["·","#bbb"],["m","#238b45"],["a","#238b45"],["r","#238b45"],["a","#238b45"],["·","#bbb"],["m","#238b45"],["a","#238b45"],["r","#238b45"],["a","#238b45"]], label: "amara — the deathless emerges" },
  ];
  const [step, setStep] = useState(0);

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 3, justifyContent: "center", marginBottom: 10, minHeight: 42 }}>
        {steps[step].chars.map(([ch, col], i) => (
          <div key={`${step}-${i}`} style={{
            width: ch === "·" ? 12 : 32, height: 38,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 5, background: ch === "·" ? "transparent" : col,
            color: ch === "·" ? col : "#fff", fontSize: ch === "·" ? 20 : 20, fontWeight: 700,
          }}>{ch}</div>
        ))}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-color-secondary, #666)", fontStyle: "italic", minHeight: 18, marginBottom: 8 }}>
        {steps[step].label}
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {steps.map((_, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            width: 8, height: 8, borderRadius: "50%", border: "none",
            background: i === step ? "#2171b5" : "var(--text-color-faint, #ccc)",
            cursor: "pointer", padding: 0,
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-color-faint, #aaa)", marginTop: 10, fontStyle: "italic" }}>
        mṛtyor mā amṛtaṃ gamaya — Bṛhadāraṇyaka 1.3.28
      </div>
    </div>
  );
}

export default function App() {
  const [activeLayer, setActiveLayer] = useState(7);
  const [hoveredLayer, setHoveredLayer] = useState(null);
  const [view, setView] = useState("layers");

  const displayLayer = hoveredLayer !== null ? hoveredLayer : activeLayer;
  const layerData = LAYERS[displayLayer];

  const handleSelectLayer = useCallback((k) => {
    setActiveLayer(k);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", maxWidth: 740, margin: "0 auto", padding: 16 }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(3px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 300, color: "var(--text-color-secondary, #666)", marginBottom: 2 }}>
          श्रीराम रामेति रामे रामे मनोरमे । सहस्रनाम तत्तुल्यं रामनाम वरानने ॥
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: "4px 0 2px", color: "var(--text-color-primary, #222)" }}>
          The Mountain Inside the Name
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-color-faint, #999)", margin: 0 }}>
          29 characters · 13 split-points · 2¹³ = 8,192 segmentations · Meru Prastāra
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
        {[["layers","14 Layers"],["reversal","ram ↔ mar"]].map(([key,label]) => (
          <button key={key} onClick={() => setView(key)} style={{
            padding: "5px 16px", borderRadius: 16, border: "none", cursor: "pointer", fontSize: 12, fontWeight: view === key ? 700 : 400,
            background: view === key ? "#2171b5" : "rgba(33,113,181,0.06)",
            color: view === key ? "#fff" : "var(--text-color-primary, #555)", transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {view === "layers" && (
        <>
          {/* String */}
          <div style={{ textAlign: "center" }}>
            <StringDisplay activeSplits={layerData.splits} />
            <SegmentBar segments={layerData.segments} activeLayer={displayLayer} />
          </div>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "6px 0 10px", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2171b5" }}>{displayLayer}</div>
              <div style={{ fontSize: 10, color: "var(--text-color-secondary, #888)" }}>layer</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2171b5" }}>{C(13, displayLayer).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "var(--text-color-secondary, #888)" }}>readings</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2171b5" }}>{layerData.segments.length}</div>
              <div style={{ fontSize: 10, color: "var(--text-color-secondary, #888)" }}>segments</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-color-faint, #bbb)" }}>8,192</div>
              <div style={{ fontSize: 10, color: "var(--text-color-secondary, #888)" }}>total</div>
            </div>
          </div>

          {/* Layer info */}
          <LayerInfo layer={layerData} />

          {displayLayer === 13 && <BijaBar />}

          {/* Mountain */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: "var(--text-color-secondary, #999)", marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Meru Prastāra — click a layer
            </div>
            <MeruMountain activeLayer={activeLayer} onSelectLayer={handleSelectLayer} hoveredLayer={hoveredLayer} onHoverLayer={setHoveredLayer} />
          </div>

          {/* Spiritual arc key */}
          <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "8px 0 4px", fontSize: 10, color: "var(--text-color-faint, #aaa)", flexWrap: "wrap" }}>
            <span>← sṛṣṭi (creation)</span>
            <span style={{ color: "#2171b5", fontWeight: 600 }}>★ saṃsāra (peak)</span>
            <span>jñāna (return) →</span>
          </div>
        </>
      )}

      {view === "reversal" && <RamMar />}

      <div style={{ textAlign: "center", fontSize: 9, color: "var(--text-color-faint, #ccc)", marginTop: 16, paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        ayamatma.com · śrīrāma nivedana
      </div>
    </div>
  );
}
