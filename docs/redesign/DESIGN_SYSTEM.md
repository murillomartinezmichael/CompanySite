# M3MM design system — company and workspace

## Direction

An editorial company site and a restrained operational workspace, not two unrelated themes. Clear page purpose, short introductions, explicit status and a primary next action. The public menu has six page destinations. Finance records live in their own sidebar hierarchy, never in a crowded public navigation bar.

## Identity and typography

The official logo is unchanged. Space Grotesk supplies headings; Inter supplies body copy, controls and data tables. Existing self-hosted assets are reused. The public heading scale is fluid, from 2.6rem on small screens to 4.8rem on desktop. Workspace headings stop at 3rem to preserve room for records. Numeric values use tabular figures. Do not create a third typography system inside a chart or embedded form.

## Color

Use only the existing dark/light tokens in tailwind.config.mjs. Ink surfaces establish depth; bone text establishes hierarchy; clay highlights primary actions; electric identifies links, chart observations and information. No hardcoded new palettes in individual pages. Contrast is checked in both themes. Warning meaning is conveyed in text as well as color.

## Layout

Public pages use a 1200px container, generous section spacing, simple two-column introductions and a small number of repeated card patterns. Overloaded catalogs move out of Home. Long documents have an in-page contents list. Website package, case study and trade pages retain their specialist purpose and funnel.

The workspace has a 240px desktop sidebar and four groups: Overview, Assets, Records and Planning. Robinhood and Fidelity are subordinate brokerage views, not additional global navigation sections. On mobile the menu becomes a disclosure; Escape closes it and returns focus. Tables may scroll inside a labeled region, but the document must not overflow.

## Controls

Primary controls are at least 44px tall; most forms use 48px fields. Buttons have consistent radius, padding and focus treatment. Navigation uses real links; filters use labeled controls. Forms keep required/optional distinctions, source references, uncertain-save messaging and receipt confirmation. No save is marked successful before an explicit acknowledgement.

## Charts

SVG charts share one rendering system. Date range controls, actual observations, keyboard-focusable points and an accessible data table accompany every series. A single point is explicitly not a trend. Missing observations stay gaps. Metal charts describe estimated metal value, not sale proceeds. Gross assets, margin and net equity are not interchangeable series.

## Privacy and evidence

Workspace pages have no public analytics or chat widget. Templates contain no real record values. Test fixtures stay under tests/redesign and are never imported into shipped source. Synthetic screenshot data is visibly labeled. Authentication, private persistence, real import, daily refresh and deployment are separate acceptance gates.
