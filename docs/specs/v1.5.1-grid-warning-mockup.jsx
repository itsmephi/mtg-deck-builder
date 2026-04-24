import { useState } from "react";

const CARDS = {
  swords: {
    name: "Swords to Plowshares",
    img: "https://cards.scryfall.io/art_crop/front/a/c/acee9a1a-352d-4571-a3b2-be3a266403c9.jpg?1673305670",
  },
  bolt: {
    name: "Lightning Bolt",
    img: "https://cards.scryfall.io/art_crop/front/0/c/0c817fe2-f87d-4b60-8a3f-72de4db0e704.jpg?1696451690",
  },
  sheoldred: {
    name: "Sheoldred",
    img: "https://cards.scryfall.io/art_crop/front/d/0/d0d33d52-3d28-4f2d-b7f6-92571f2f0e10.jpg?1674764796",
  },
  counterspell: {
    name: "Counterspell",
    img: "https://cards.scryfall.io/art_crop/front/b/e/be2b4177-e47c-4dde-9ead-31b7602065ec.jpg?1674764066",
  },
};

const WarningTriangleSVG = ({ size = 22, fillColor = "#f59e0b", iconColor = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill={fillColor} stroke="none" />
    <path d="M12 9v4" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="17" r="1" fill={iconColor} />
  </svg>
);

const SmallWarningSVG = () => (
  <svg width={12} height={12} viewBox="0 0 24 24">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#fbbf24" stroke="none" />
    <path d="M12 9v4" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="17" r="1" fill="#171717" />
  </svg>
);

const CrownSVG = ({ size = 18, fill = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M3 18h18v2H3v-2zm0-2l3-8 4 3 2-6 2 6 4-3 3 8H3z" />
  </svg>
);

function CardTile({ card, qty, owned, warningText, pillStyle, showCornerTriangle, showDot, showRing, showOverlayBar, showCrown, label }) {
  const [hovered, setHovered] = useState(false);

  const pillColors = {
    "fully-owned": { bg: "#166534", color: "#4ade80" },
    partial: { bg: "#171717", color: "#a3a3a3" },
    warning: { bg: "#7c2d12", color: "#fb923c" },
  };
  const pill = pillColors[pillStyle] || pillColors.partial;

  const qtyColor = pillStyle === "warning" ? "#f87171" : pillStyle === "fully-owned" ? "#4ade80" : "#e5e5e5";
  const ownedColor = owned >= qty ? "#4ade80" : "#a3a3a3";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: "relative",
          borderRadius: 12,
          cursor: "pointer",
          aspectRatio: "2.5 / 3.5",
          width: "100%",
        }}
      >
        {/* Card inner with clipped art + overlay */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 12, overflow: "hidden" }}>
          <img
            src={card.img}
            alt={card.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* × remove button */}
          <button
            style={{
              position: "absolute", top: 6, right: 6, width: 24, height: 24,
              borderRadius: "50%", background: "#171717", color: "#a3a3a3",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 13, fontWeight: 600,
              opacity: hovered ? 1 : 0, transition: "opacity 0.15s", zIndex: 30,
            }}
          >×</button>

          {/* Slide-up overlay */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              padding: "10px 8px 14px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
              transform: hovered ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.2s ease-out", zIndex: 20,
            }}
          >
            {/* Warning bar inside overlay */}
            {showOverlayBar && warningText && (
              <div style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 5, padding: "4px 8px",
                background: "rgba(245,158,11,0.15)", borderRadius: 6,
                border: "1px solid rgba(245,158,11,0.3)",
              }}>
                <SmallWarningSVG />
                <span style={{ fontSize: 10, fontWeight: 600, color: "#fbbf24", whiteSpace: "nowrap" }}>
                  {warningText}
                </span>
              </div>
            )}

            {/* Qty controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(64,64,64,0.5)", color: "#d4d4d4",
                border: "none", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>−</button>
              <span style={{
                fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                minWidth: 20, textAlign: "center", color: qtyColor,
              }}>{qty}</span>
              <button style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(64,64,64,0.5)", color: "#d4d4d4",
                border: "none", cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>+</button>
            </div>

            {/* Owned */}
            <div style={{ fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
              <span style={{ color: "#a3a3a3" }}>Owned: </span>
              <span style={{ color: ownedColor }}>{owned}</span>
              <span style={{ color: "#a3a3a3" }}>/{qty}</span>
            </div>
          </div>
        </div>

        {/* Corner triangle (current style) */}
        {showCornerTriangle && (
          <div style={{ position: "absolute", top: -7, right: -7, zIndex: 20 }}>
            <WarningTriangleSVG />
          </div>
        )}

        {/* Amber dot (Option A) */}
        {showDot && (
          <div style={{
            position: "absolute", top: 5, right: 5,
            width: 8, height: 8, borderRadius: "50%",
            background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.5)",
            zIndex: 18, opacity: hovered ? 0 : 1, transition: "opacity 0.15s",
          }} />
        )}

        {/* Amber ring (Option B) */}
        {showRing && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 12,
            border: "2px solid rgba(245,158,11,0.45)",
            boxShadow: "inset 0 0 12px rgba(245,158,11,0.08)",
            pointerEvents: "none", zIndex: 15,
          }} />
        )}

        {/* Crown badge */}
        {showCrown && (
          <div style={{
            position: "absolute", top: -7, left: -7, width: 28, height: 28,
            borderRadius: "50%", background: "#eab308",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20,
          }}>
            <CrownSVG />
          </div>
        )}

        {/* Qty pill */}
        <div style={{
          position: "absolute", bottom: -8, left: "50%",
          transform: "translateX(-50%)", zIndex: 20,
          width: 24, height: 24, borderRadius: "50%",
          fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: pill.bg, color: pill.color,
          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
          opacity: hovered ? 0 : 1, transition: "opacity 0.15s",
          pointerEvents: hovered ? "none" : "auto",
        }}>{qty}</div>
      </div>

      {/* Label */}
      <div style={{
        fontSize: 11, color: "#525252", textAlign: "center",
        marginTop: 14, lineHeight: 1.5,
      }}>{label}</div>
    </div>
  );
}

function SectionHeader({ title, note }) {
  return (
    <>
      <div style={{
        fontSize: 13, fontWeight: 600, color: "#737373",
        textTransform: "uppercase", letterSpacing: 0.5,
        marginBottom: note ? 6 : 12, marginTop: 36,
        paddingBottom: 6, borderBottom: "1px solid #262626",
      }}>{title}</div>
      {note && (
        <div style={{ fontSize: 12, color: "#525252", marginBottom: 16, fontStyle: "italic" }}>
          {note}
        </div>
      )}
    </>
  );
}

export default function WarningBadgeMockup() {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
    gap: 20,
    maxWidth: 880,
  };

  return (
    <div style={{
      background: "#141418", color: "#e5e5e5", minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: 32,
    }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: "#a3a3a3", marginBottom: 4 }}>
        Warning Badge Exploration — Overlay-Based Warning
      </h1>
      <p style={{ fontSize: 13, color: "#737373", marginBottom: 28, lineHeight: 1.5 }}>
        Problem: Corner triangle in grid view rides too close to adjacent cards — ownership is ambiguous.<br />
        Direction: Move warning info into the hover overlay. Explore at-rest hints that stay unambiguous.
      </p>

      {/* === ROW: CURRENT === */}
      <SectionHeader
        title="Current — Corner Triangle (for comparison)"
        note="Hover to see the overlay. Notice how the triangle badge could belong to either card in a tight grid."
      />
      <div style={gridStyle}>
        <CardTile card={CARDS.swords} qty={5} owned={3} warningText="Exceeds 4-copy limit"
          pillStyle="warning" showCornerTriangle label={<>Current: corner triangle<br />Ambiguous in tight grid</>} />
        <CardTile card={CARDS.bolt} qty={4} owned={4}
          pillStyle="fully-owned" label={<>Adjacent card — no warning<br />Triangle looks like it could belong here</>} />
        <CardTile card={CARDS.counterspell} qty={4} owned={2}
          pillStyle="partial" label={<>Another neighbor<br />Shows how tight the grid gets</>} />
      </div>

      {/* === ROW: OPTION A === */}
      <SectionHeader
        title="Option A — Amber Dot (at rest) + Warning Bar (on hover)"
        note="Small dot at top-right as a minimal hint. Hover reveals the full warning message in the overlay. Dot disappears on hover since the bar takes over."
      />
      <div style={gridStyle}>
        <CardTile card={CARDS.swords} qty={5} owned={3} warningText="Exceeds 4-copy limit"
          pillStyle="warning" showDot showOverlayBar label={<>Dot at rest → bar on hover<br />Clear ownership, readable message</>} />
        <CardTile card={CARDS.bolt} qty={4} owned={4}
          pillStyle="fully-owned" label={<>No warning — clean tile<br />No ambiguity with neighbor</>} />
        <CardTile card={CARDS.sheoldred} qty={2} owned={1} warningText="Singleton limit (2 copies)"
          pillStyle="warning" showDot showOverlayBar showCrown label={<>Commander + warning<br />Crown top-left, dot top-right, bar on hover</>} />
      </div>

      {/* === ROW: OPTION B === */}
      <SectionHeader
        title="Option B — Amber Border Ring (at rest) + Warning Bar (on hover)"
        note="Subtle amber border glow around the entire card. No corner badge at all — the card itself signals 'attention.' Hover overlay carries the details."
      />
      <div style={gridStyle}>
        <CardTile card={CARDS.swords} qty={5} owned={3} warningText="Exceeds 4-copy limit"
          pillStyle="warning" showRing showOverlayBar label={<>Amber ring at rest → bar on hover<br />Card-level signal, zero corner clutter</>} />
        <CardTile card={CARDS.bolt} qty={4} owned={4}
          pillStyle="fully-owned" label={<>No warning — no ring<br />Clean contrast with flagged neighbor</>} />
        <CardTile card={CARDS.sheoldred} qty={2} owned={1} warningText="Singleton limit (2 copies)"
          pillStyle="warning" showRing showOverlayBar showCrown label={<>Commander + warning<br />Crown top-left, amber ring, bar on hover</>} />
      </div>

      {/* === ROW: OPTION C === */}
      <SectionHeader
        title="Option C — Amber Dot + Ring (at rest) + Warning Bar (on hover)"
        note="Combines both at-rest signals for maximum visibility. Might be overkill, but shown for comparison."
      />
      <div style={gridStyle}>
        <CardTile card={CARDS.swords} qty={5} owned={3} warningText="Exceeds 4-copy limit"
          pillStyle="warning" showDot showRing showOverlayBar label={<>Dot + ring + overlay bar<br />Maximum at-rest visibility</>} />
        <CardTile card={CARDS.bolt} qty={4} owned={4}
          pillStyle="fully-owned" label={<>Clean — no warnings<br />Contrast with flagged neighbor</>} />
      </div>
    </div>
  );
}
