# 📘 Mavericks Intelligence Dashboard: UI/UX Documentation

This document serves as the official UI specification for the Mavericks Analysis Dashboard. It details every interactive element, data field, and visual component currently implemented in the frontend (V2).

---

## 1. Global Shell & Navigation
The dashboard uses a persistent header and a reactive layout that adapts to the analysis scope.

### 1.1 Header Controls
- **Mavericks Logo & Title**: "MAVERICKS V2: Intelligence Dashboard" branding.
- **Scope Toggle (Quad-Switch)**:
    - **Keyword View**: General vertical/industry analysis.
    - **Client View**: Deep-dive into specific brand entities.
    - **COMPARE BRANDS**: Multi-entity side-by-side rivalry mode.
    - **REACH LENS**: Real-time URL evaluation engine.
- **Searchable Selector**: 
    - **Functionality**: A dynamic dropdown with real-time filtering.
    - **Labels**: "Search for keyword..." or "Search for client..." based on scope.
    - **Empty State**: Defaults to "General" if no specific entity is selected.
- **ReachLens Status Badge**: 
    - **Active (Green)**: Indicates ReachLens engine is scraping/active.
    - **Inactive (Grey)**: Engine disabled for the current session.

---

## 2. Phase 01: Source Ingestion (Landing State)
Before analysis, users see the upload interface.

- **Drop Zone**: Large, centered card with dashed borders.
    - **Icon**: Cloud upload illustration.
    - **Text**: "Strategic Asset Upload" / "Drop strategic file or browse sources."
    - **Accepted Formats**: XLSX, XLS, CSV.
- **Upload Progress Bar**: Visible only during active upload, showing percentage progress.

---

## 3. The Dashboard (Analysis Phase)
Once data is ingested, the dashboard populates with the following sections.

### 3.1 KPI Statistics (Top Row)
- **Total Mentions**: Digital count of all articles processed.
- **English Articles**: Count of items verified as English language.
- **Duplicate Rate**: Percentage in red/amber showing volume of repeated content.
- **Processing Errors**: Count of rows that failed validation in Phase 01.

### 3.2 Visual Analysis Grid (Main Grid)
- **Sentiment Breakdown (Donut Chart)**:
    - **Segments**: Positive (Emerald), Negative (Rose), Neutral (Slate).
    - **Interaction**: Hovering shows raw counts and percentages.
- **Intelligence Word Cloud**:
    - **Visuals**: Dynamic sizing based on frequency.
    - **Colors**: Balanced palette to distinguish relative importance.
- **Top Media Outlets (List View)**:
    - **Columns**: Publication Name, Article Count, Reach Index.
    - **Limit**: Top 10 by default.
- **Top Companies & Brands (List View)**:
    - **Columns**: Entity Name, Frequency Count.
- **Top Journalists (List View)**:
    - **Columns**: Author Name, Mention Count.
- **Trending Issues (Hot Topics)**:
    - **Functionality**: Displays NLP-extracted topics with relevance scores.

### 3.3 Sentiment Insights Panels (Mini-Widgets)
- **Positive Insights**: List of keywords associated with "Positive" sentiment scores. (Emerald theme).
- **Negative Risk Factors**: List of keywords associated with "Negative" scores. (Rose theme).

---

## 4. Compare Brands (Head-to-Head Mode)
A specialized view for competitive intelligence.

- **Competitor Selector**: Blue header with "Choose Rival" dropdown.
- **Target vs. Rival Split**: Two-column layout (Column A: Target / Column B: Rose theme Rival).
- **Share of Voice (SOV) Bar**: 
    - **Function**: Bi-directional progress bar showing relative volume split (e.g., Target 60% vs Rival 40%).
- **Net Sentiment Index**: 
    - **Logic**: (Positive - Negative) / Total.
    - **Visual**: Large numeric score (Positive/Negative).
- **Strategy Variance Table**: 
    - **Fields**: Viral Mention Volume, Key Journalist Coverage, Media Outlet Diversity, Agentic/Tech Mentions.
    - **Indicator**: Up/Down arrows showing variance between the two entities.

---

## 5. ReachLens View (Real-time Probe)
The most interactive component of the dashboard.

- **Input Bar**: Dark-themed (Slate-900) URL probe.
    - **Action**: "Analyze" button with loading state.
- **Version Matrix**: 8 selectable modules (v2 to v9) from "Dual-Core" to "Sovereign".
- **Calibration Timer**: Centered countdown during analysis ("CALIBRATING TRUTH MATRIX").
- **Results Deck**:
    - **Total Mentions**: Global footprint.
    - **Agentic Rank**: Confidence tier (e.g., "Gold").
    - **Sovereign Reach**: Final numeric audience estimate.
    - **Social Proof**: Reddit/social engagement counts.
- **Provenance Tag**: Indicates if content is T0 (Origin) or Syndicated.
- **Calculation Logic Log**: Toggleable list showing the "math" behind the version selected.
- **Verification Sources**: Live links to social proof (e.g., Reddit posts).

---

## 6. Design System Tokens
- **Primary Color**: Blue-600 (Actionable).
- **Secondary Color**: Slate-800/900 (Corporate structure).
- **Sentiment Positive**: Emerald-500/600.
- **Sentiment Negative**: Rose-500/600.
- **Background**: Slate-50 (Neutral background).
- **Border Radius**: 2xl (1.5rem) / 3xl (2rem) for cards.
- **Typography**: Bold, high-contrast tracking (Inter/Roboto inspired).
