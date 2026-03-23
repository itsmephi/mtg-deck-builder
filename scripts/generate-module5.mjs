import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.50 inches

// ─── Color Palette ───────────────────────────────────────────────────────────
const C = {
  bg: "F5F0E8",
  heading: "BF5700",
  body: "2D2D2D",
  secondary: "6B6B6B",
  muted: "999999",
  cardBg: "FDFAF4",
  cardBorder: "EDE8DF",
  accent: "BF5700",
  headerPrimary: "BF5700",
  headerSecondary: "6B6B6B",
  tagWarn: "C0392B",
  divider: "D8D0C4",
  titleBar: "D8D0C4",
  fadedNum: "EDE8DF",
  white: "FFFFFF",
};

// ─── Layout Constants ─────────────────────────────────────────────────────────
const L = {
  leftMargin: 0.65,
  titleY: 0.42,
  titleW: 12.0,
  titleH: 0.65,
  dividerY: 1.15,
  contentY: 1.35,
  col2W: 5.80,
  col2Gap: 0.40,
  col2Left: 0.65,
  col2Right: 6.85,
  col2HeaderH: 0.44,
  accentW: 0.05,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addBg(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { color: C.bg },
    line: { type: "none" },
  });
}

function addTitleAndDivider(slide, title) {
  slide.addText(title, {
    x: L.leftMargin, y: L.titleY, w: L.titleW, h: L.titleH,
    fontFace: "Georgia", fontSize: 32, bold: true, color: C.heading,
    valign: "middle",
  });
  slide.addShape(pptx.ShapeType.line, {
    x: L.leftMargin, y: L.dividerY, w: L.titleW, h: 0,
    line: { color: C.divider, width: 1 },
  });
}

// Full-width card with left accent bar
function addCard(slide, x, y, w, h, heading, body) {
  // Card background
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 0.75 },
  });
  // Left accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w: L.accentW, h,
    fill: { color: C.accent },
    line: { type: "none" },
  });
  // Heading
  if (heading) {
    slide.addText(heading, {
      x: x + 0.18, y: y + 0.10, w: w - 0.25, h: 0.30,
      fontFace: "Georgia", fontSize: 14, bold: true, color: C.heading,
      valign: "middle",
    });
  }
  // Body
  if (body) {
    slide.addText(body, {
      x: x + 0.18, y: y + (heading ? 0.42 : 0.12), w: w - 0.25,
      h: h - (heading ? 0.50 : 0.20),
      fontFace: "Calibri", fontSize: 12, color: C.secondary,
      valign: "top", wrap: true,
    });
  }
}

// 2-column panel helper
function add2ColPanel(slide, side, header, bullets) {
  const x = side === "left" ? L.col2Left : L.col2Right;
  const y = L.contentY;
  const w = L.col2W;
  const headerH = L.col2HeaderH;
  const bodyH = 5.40;
  const headerColor = side === "left" ? C.headerPrimary : C.headerSecondary;

  // Header bar
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h: headerH,
    fill: { color: headerColor },
    line: { type: "none" },
  });
  slide.addText(header, {
    x: x + 0.10, y, w: w - 0.20, h: headerH,
    fontFace: "Calibri", fontSize: 13, bold: true, color: C.white,
    align: "center", valign: "middle",
  });

  // Body panel
  const bodyY = y + headerH;
  const bodyH2 = bodyH - headerH;
  slide.addShape(pptx.ShapeType.rect, {
    x, y: bodyY, w, h: bodyH2,
    fill: { color: C.cardBg },
    line: { color: C.cardBorder, width: 0.75 },
  });

  // Bullets
  const bulletItems = bullets.map((b) => ({
    text: b,
    options: {
      bullet: { type: "bullet", characterCode: "2022" },
      color: C.body,
      fontSize: 13,
      fontFace: "Calibri",
      paraSpaceAfter: 6,
    },
  }));
  slide.addText(bulletItems, {
    x: x + 0.22, y: bodyY + 0.18,
    w: w - 0.35, h: bodyH2 - 0.25,
    valign: "top", wrap: true,
  });
}

// Image placeholder
function addImagePlaceholder(slide, label) {
  const x = 1.5, y = 1.5, w = 10.33, h = 5.0;
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.bg },
    line: { color: C.divider, width: 1.5 },
  });
  slide.addText(label, {
    x, y, w, h,
    fontFace: "Calibri", fontSize: 13, color: C.muted,
    align: "center", valign: "middle", wrap: true,
  });
}

// ─── SLIDE 1 — Title ──────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);

  // Left vertical bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.55, h: 7.50,
    fill: { color: C.titleBar },
    line: { type: "none" },
  });

  // Module number
  slide.addText("MODULE 5", {
    x: 0.90, y: 1.80, w: 10, h: 0.80,
    fontFace: "Georgia", fontSize: 52, bold: true, color: C.heading,
  });

  // Subtitle
  slide.addText("Low Poly, UVs, and Texel Density", {
    x: 0.90, y: 2.55, w: 11, h: 0.70,
    fontFace: "Georgia", fontSize: 30, color: C.body,
  });

  // Short divider
  slide.addShape(pptx.ShapeType.line, {
    x: 0.90, y: 3.55, w: 3.50, h: 0,
    line: { color: C.divider, width: 1 },
  });

  // Course name
  slide.addText("AET 3D Modeling & Texturing  \u00B7  UT Austin", {
    x: 0.90, y: 3.70, w: 9, h: 0.35,
    fontFace: "Calibri", fontSize: 13, color: "888888",
  });
}

// ─── SLIDE 2 — Pipeline Bar ───────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Where We Are in the Pipeline");

  const stages = [
    "Reference", "Blockout", "High Proxy", "High Poly",
    "Low Poly", "UVs", "Bake", "Texture",
  ];
  const active = new Set(["Low Poly", "UVs"]);
  const boxW = 1.45;
  const boxH = 0.55;
  const gap = 0.06;
  const startX = 0.65;
  const rowY = 2.10;

  stages.forEach((stage, i) => {
    const x = startX + i * (boxW + gap);
    const isActive = active.has(stage);
    slide.addShape(pptx.ShapeType.rect, {
      x, y: rowY, w: boxW, h: boxH,
      fill: { color: isActive ? C.accent : C.fadedNum },
      line: { type: "none" },
    });
    slide.addText(stage, {
      x, y: rowY, w: boxW, h: boxH,
      fontFace: "Calibri", fontSize: 11,
      bold: isActive,
      color: isActive ? C.white : C.secondary,
      align: "center", valign: "middle",
    });

    if (isActive) {
      slide.addText("\u25BC you are here", {
        x, y: rowY + boxH + 0.08, w: boxW, h: 0.30,
        fontFace: "Calibri", fontSize: 10, italic: true,
        color: C.heading, align: "center",
      });
    }
  });

  // Subtitle
  slide.addText(
    "The high poly is the detail source. The low poly is what ships.",
    {
      x: L.leftMargin, y: 3.50, w: 12, h: 0.40,
      fontFace: "Calibri", fontSize: 13, color: C.secondary,
      italic: true,
    }
  );
}

// ─── SLIDE 3 — What Is a Low Poly? ───────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "What Is a Low Poly?");

  const cards = [
    {
      heading: "The game engine mesh",
      body: "The actual model that runs in real-time. Optimized for performance. This is what the player sees.",
    },
    {
      heading: "Matched to the high poly",
      body: "The low poly silhouette should closely follow the high poly. The closer the match, the cleaner the bake.",
    },
    {
      heading: "Triangles are fine here",
      body: "Unlike high poly (quads for SubD), the low poly will be triangulated on export. Focus on efficient triangle placement, not quad flow.",
    },
    {
      heading: "Silhouette is everything",
      body: "The normal map fakes surface detail but cannot change the outline. Every triangle should serve the silhouette or be removed.",
    },
  ];

  const cardW = 11.60;
  const cardH = 1.35;
  const startY = L.contentY + 0.05;
  const spacing = cardH + 0.22;

  cards.forEach((card, i) => {
    addCard(slide, L.leftMargin, startY + i * spacing, cardW, cardH, card.heading, card.body);
  });
}

// ─── SLIDE 4 — Starting from the High Proxy ──────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Starting from the High Proxy");

  add2ColPanel(slide, "left", "DUPLICATE AND REDUCE", [
    "High proxy topology is already clean",
    "Proportions didn't change much during high poly",
    "Fastest path: duplicate, delete edges, clean up",
    "Good for most hard-surface props",
  ]);
  add2ColPanel(slide, "right", "REBUILD FROM SCRATCH", [
    "Proportions shifted significantly during high poly",
    "Proxy has messy topology causing UV or baking problems",
    "Quad Draw lets you retopo directly on the high poly surface",
    "Better for organic forms or heavily reshaped meshes",
  ]);
}

// ─── SLIDE 5 — Where Triangles Matter ────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Where Triangles Matter");

  add2ColPanel(slide, "left", "SPEND TRIANGLES", [
    "Silhouette edges the camera reads",
    "Curved surfaces that define the form",
    "Transitions between major parts",
    "Any edge that changes the outline",
  ]);
  add2ColPanel(slide, "right", "SAVE TRIANGLES", [
    "Flat planes (one quad is enough)",
    "Faces hidden by other geometry",
    "Bottoms of props sitting on surfaces",
    "Backs of wall-mounted objects",
    "Interior faces the player never sees",
  ]);
}

// ─── SLIDE 6 — Smoothing Groups and Hard Edges ───────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Smoothing Groups and Hard Edges");

  add2ColPanel(slide, "left", "SOFT EDGE", [
    "Normals blend smoothly across the edge",
    "Surface reads as one continuous curve",
    "Use on rounded, continuous surfaces",
    "Default state in Maya",
  ]);
  add2ColPanel(slide, "right", "HARD EDGE", [
    "Normals split at the edge",
    "Creates a visible shading break",
    "Use at sharp corners, panel seams, material breaks",
    "Must have a matching UV seam",
  ]);
}

// ─── SLIDE 7 — Hard Edges and UV Seams ───────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Hard Edges and UV Seams");

  const steps = [
    {
      num: "01",
      heading: "The rule",
      body: "Every hard edge needs a UV seam at the same location. No exceptions. A hard edge without a matching UV seam will cause shading artifacts after baking.",
    },
    {
      num: "02",
      heading: "The reverse is not true",
      body: "Not every UV seam needs a hard edge. You can cut UVs at soft edges for unwrapping convenience without affecting shading.",
    },
    {
      num: "03",
      heading: "Why it matters",
      body: "At export, both hard edges and UV seams split vertices. The game engine needs the normal data to match the UV data at every split. Mismatches create visible seams in the normal map.",
    },
  ];

  const startY = L.contentY + 0.10;
  const cardH = 1.55;
  const gap = 0.25;

  steps.forEach((step, i) => {
    const y = startY + i * (cardH + gap);
    const x = L.leftMargin;
    const w = 11.60;

    // Card bg
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w, h: cardH,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 0.75 },
    });
    // Left accent
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: L.accentW, h: cardH,
      fill: { color: C.accent },
      line: { type: "none" },
    });
    // Faded number
    slide.addText(step.num, {
      x: x + 0.15, y: y + 0.10, w: 1.10, h: cardH - 0.20,
      fontFace: "Georgia", fontSize: 42, bold: true, color: C.fadedNum,
      valign: "middle",
    });
    // Step heading
    slide.addText(step.heading, {
      x: x + 1.30, y: y + 0.14, w: 9.90, h: 0.38,
      fontFace: "Georgia", fontSize: 15, bold: true, color: C.heading,
      valign: "middle",
    });
    // Step body
    slide.addText(step.body, {
      x: x + 1.30, y: y + 0.54, w: 9.90, h: cardH - 0.62,
      fontFace: "Calibri", fontSize: 12, color: C.secondary,
      valign: "top", wrap: true,
    });
  });
}

// ─── SLIDE 8 — Image Placeholder ─────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Low Poly Wireframe Example");
  addImagePlaceholder(
    slide,
    "[INSERT IMAGE: Low poly wireframe example showing clean triangle distribution vs. high poly comparison]"
  );
}

// ─── SLIDE 9 — What Are UVs? ──────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "What Are UVs?");

  const cards = [
    {
      heading: "2D coordinates on a 3D mesh",
      body: "Every vertex has a UV coordinate (U = horizontal, V = vertical) that tells the texture where to map onto that point on the surface.",
    },
    {
      heading: "No UVs = no texture",
      body: "A mesh without UVs cannot receive any texture information. UVs are required before baking or painting.",
    },
    {
      heading: "Shells and seams",
      body: "Cutting UV seams creates separate shells. Each shell is a flat 2D piece of the 3D surface, like unfolding a cardboard box.",
    },
    {
      heading: "0-1 UV space",
      body: "All shells must fit inside the 0-1 UV square. This is the area that maps to one texture image. Anything outside gets no texture data.",
    },
  ];

  const cardW = 11.60;
  const cardH = 1.35;
  const startY = L.contentY + 0.05;
  const spacing = cardH + 0.22;

  cards.forEach((card, i) => {
    addCard(slide, L.leftMargin, startY + i * spacing, cardW, cardH, card.heading, card.body);
  });
}

// ─── SLIDE 10 — Projection Types ─────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Projection Types");

  const cards = [
    {
      heading: "Planar",
      body: "Projects from a flat plane. Best for walls, panels, flat tops. Choose the axis that faces the surface most directly.",
    },
    {
      heading: "Cylindrical",
      body: "Wraps around a cylinder axis. Best for tubes, barrels, handles. Align the axis to the length of the object.",
    },
    {
      heading: "Spherical",
      body: "Wraps around a sphere. Best for balls, domes, rounded objects. Creates pinching at the poles.",
    },
    {
      heading: "Automatic",
      body: "Projects from multiple angles at once. Good starting point for complex shapes. Usually needs cleanup with Unfold and Optimize.",
    },
  ];

  const cardW = 11.60;
  const cardH = 1.35;
  const startY = L.contentY + 0.05;
  const spacing = cardH + 0.22;

  cards.forEach((card, i) => {
    addCard(slide, L.leftMargin, startY + i * spacing, cardW, cardH, card.heading, card.body);
  });
}

// ─── SLIDE 11 — Seam Placement ────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Seam Placement");

  const steps = [
    {
      num: "01",
      heading: "Cut at hard edges",
      body: "You already have a shading break there. The seam is invisible because the surface already has a visible edge.",
    },
    {
      num: "02",
      heading: "Cut at part boundaries",
      body: "Natural material breaks and part separations are ideal seam locations. The viewer expects a visual break here.",
    },
    {
      num: "03",
      heading: "Hide remaining seams",
      body: "Place any additional seams where the camera won't see them: bottoms, backs, undersides, areas covered by other geometry.",
    },
    {
      num: "04",
      heading: "The tradeoff",
      body: "Fewer seams = easier to paint across, but more stretching. More seams = less stretching, but higher vertex count in engine and more seam edges to hide.",
    },
  ];

  const startY = L.contentY + 0.05;
  const cardH = 1.18;
  const gap = 0.16;

  steps.forEach((step, i) => {
    const y = startY + i * (cardH + gap);
    const x = L.leftMargin;
    const w = 11.60;

    slide.addShape(pptx.ShapeType.rect, {
      x, y, w, h: cardH,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 0.75 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: L.accentW, h: cardH,
      fill: { color: C.accent },
      line: { type: "none" },
    });
    slide.addText(step.num, {
      x: x + 0.15, y: y + 0.05, w: 1.10, h: cardH - 0.10,
      fontFace: "Georgia", fontSize: 38, bold: true, color: C.fadedNum,
      valign: "middle",
    });
    slide.addText(step.heading, {
      x: x + 1.30, y: y + 0.10, w: 9.90, h: 0.34,
      fontFace: "Georgia", fontSize: 15, bold: true, color: C.heading,
      valign: "middle",
    });
    slide.addText(step.body, {
      x: x + 1.30, y: y + 0.46, w: 9.90, h: cardH - 0.52,
      fontFace: "Calibri", fontSize: 12, color: C.secondary,
      valign: "top", wrap: true,
    });
  });
}

// ─── SLIDE 12 — Texel Density (2x2 grid with tag pills) ──────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Texel Density");

  const cards = [
    {
      tag: "WHAT IT IS",
      heading: "Pixels per world unit",
      body: "A texel density of 512 means 512 texture pixels for every meter of world space. This number should be consistent across every asset in a scene.",
      col: 0, row: 0,
    },
    {
      tag: "WHY IT MATTERS",
      heading: "Visual consistency",
      body: "Inconsistent texel density is one of the most visible mistakes in environment art. One blurry prop next to a crisp one breaks the entire scene.",
      col: 1, row: 0,
    },
    {
      tag: "HOW TO CHECK",
      heading: "Checker texture",
      body: "Apply a checker texture. The squares should be the same physical size on every asset in the scene. Stretched or compressed squares mean the density is off.",
      col: 0, row: 1,
    },
    {
      tag: "HERO VS. BACKGROUND",
      heading: "Budget by role",
      body: "Hero props may get higher texel density (more pixels per meter). Background props may get lower. The key is that within each tier, density stays consistent.",
      col: 1, row: 1,
    },
  ];

  const cardW = 5.85;
  const cardH = 2.40;
  const colGap = 0.43;
  const rowGap = 0.22;
  const startX = L.leftMargin;
  const startY = L.contentY + 0.10;

  cards.forEach((card) => {
    const x = startX + card.col * (cardW + colGap);
    const y = startY + card.row * (cardH + rowGap);

    // Card bg
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: cardW, h: cardH,
      fill: { color: C.cardBg },
      line: { color: C.cardBorder, width: 0.75 },
    });
    // Left accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: L.accentW, h: cardH,
      fill: { color: C.accent },
      line: { type: "none" },
    });

    // Tag pill
    const pillX = x + 0.18;
    const pillY = y + 0.14;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: pillX, y: pillY, w: 1.60, h: 0.30,
      fill: { color: C.accent },
      line: { type: "none" },
      rectRadius: 0.05,
    });
    slide.addText(card.tag, {
      x: pillX, y: pillY, w: 1.60, h: 0.30,
      fontFace: "Calibri", fontSize: 8, bold: true, color: C.white,
      align: "center", valign: "middle",
    });

    // Card heading
    slide.addText(card.heading, {
      x: x + 0.18, y: pillY + 0.36, w: cardW - 0.28, h: 0.34,
      fontFace: "Georgia", fontSize: 14, bold: true, color: C.heading,
      valign: "middle",
    });
    // Card body
    slide.addText(card.body, {
      x: x + 0.18, y: pillY + 0.74, w: cardW - 0.28, h: cardH - 0.94,
      fontFace: "Calibri", fontSize: 12, color: C.secondary,
      valign: "top", wrap: true,
    });
  });
}

// ─── SLIDE 13 — How UVs Affect Vertex Count ──────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "How UVs Affect Vertex Count");

  add2ColPanel(slide, "left", "WHAT HAPPENS AT EXPORT", [
    "UV seams split vertices",
    "Maya shows 1 vert at a seam, the engine sees 2",
    "Hard edges also split verts",
    "A mesh with many seams and hard edges has a higher vert count in engine than Maya reports",
  ]);
  add2ColPanel(slide, "right", "WHAT THIS MEANS", [
    "Not a reason to avoid seams",
    "Clean UVs matter more than vert count savings",
    "Just be aware when budgeting: in-engine vert count will be higher than Maya reports",
    "Smoothing groups, UV seams, and vertex colors all contribute to splits",
  ]);
}

// ─── SLIDE 14 — Check Your Work ──────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Check Your Work");

  add2ColPanel(slide, "left", "LOW POLY CHECKS", [
    "Silhouette matches high poly at intended distance",
    "No unnecessary geometry on flat surfaces",
    "Hidden faces deleted",
    "Hard/soft edges set intentionally",
    "History deleted, transforms frozen, pivot correct",
  ]);
  add2ColPanel(slide, "right", "UV CHECKS", [
    "Checker texture shows consistent texel density",
    "No extreme stretching or compression",
    "All shells inside 0-1 UV space",
    "No unintentional overlapping UVs",
    "Seam at every hard edge",
    "Shells oriented consistently",
  ]);
}

// ─── SLIDE 15 — Image Placeholder ────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "UV Layout Example");
  addImagePlaceholder(
    slide,
    "[INSERT IMAGE: UV layout example showing clean shell packing in 0-1 space with checker texture applied]"
  );
}

// ─── SLIDE 16 — Assignment: Low Poly + UVs ───────────────────────────────────
{
  const slide = pptx.addSlide();
  addBg(slide);
  addTitleAndDivider(slide, "Assignment: Low Poly + UVs");

  add2ColPanel(slide, "left", "LEVEL 1 - Beginner", [
    "Build a low poly from your high proxy or new blockout",
    "UV unwrap with proper seam placement",
    "Consistent texel density shown with checker texture",
    "Hard edges with matching UV seams",
    "Context note: triangle budget decisions",
    "Submit: .ma file, 4 screenshots, reference board PNG",
  ]);
  add2ColPanel(slide, "right", "LEVEL 2 - Intermediate", [
    "Everything in Level 1",
    "State a target texel density and scale all shells to match",
    "Mirrored or overlapping UVs where appropriate",
    "Smoothing groups fully resolved across entire mesh",
    "Texel density note with target value and reasoning",
  ]);
}

// ─── Write file ───────────────────────────────────────────────────────────────
await pptx.writeFile({ fileName: "Module5-LowPoly-UVs-TexelDensity.pptx" });
console.log("Done: Module5-LowPoly-UVs-TexelDensity.pptx");
