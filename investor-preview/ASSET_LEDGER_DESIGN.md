# M3MM.NET — financial dashboard and asset ledger specification
**Date:** 2026-10-15. **Status:** schema and public-page placeholders only. No brokerage positions, coin ownership, cash receipts or live feeds have been imported into CompanySite.

## Three distinct financial views
1. **Overall budget**: proposed infrastructure capex, 15% purchasing allowance, recurring operating allowances, funded versus unfunded amounts only after verifiable source records. Current proposed capex $12,908, rounded purchasing envelope $14,900, monthly allowances $630. No committed funding or revenue inferred.
2. **Environment budget**: unique build IDs and detailed BOM for NAS, Linux app server, Proxmox, AI workstation (starter GPU and future 2x5090 tracked as upgrade scenarios, not additive purchases), Linux desktop still needing BOM, firewall, switch/network, backups, UPS, rack/cooling, offsite DR, remote management, software and operations. Each item: category, asset_id, phase, SKU, model, quantity, vendor quote URL/date, base price, tax, shipping, contingency, monthly electricity, recurring license, warranty, purchase status, owner, migration dependency, validation evidence, planned replacement and depreciation treatment. Existing assets are tracked at historical cost separately and not re-purchased in the budget.
3. **Assets dashboard**: account portfolios, precious metals, equipment and liabilities in distinct ownership buckets. Personal assets must never be assumed to be M3MM.NET business assets or pledged collateral.

## Portfolio ledger (private only)
Each brokerage portfolio has a unique **internal pseudonymous** account ID; do not publish account numbers or broker authentication. Fields: owner (individual/entity), legal title, account classification, source institution, ticker, ISIN/CUSIP where appropriate, asset class, currency, shares, average cost, acquisition dates, transaction type, fee, realized gains, market price, price timestamp, valuation source, unrealized gain, cash, dividends, corporate actions, sync status and manual adjustment audit. **Portfolio A** is existing stock account (identity pending); **Portfolio B** is proposed biweekly $250 founder + $250 collective investor pool (actual transfers and account identity unverified). Keep transfers and trades separate to avoid counting contributions as investment returns. Use broker's read-only OAuth connector where supported; otherwise owner-approved manual imports. Never scrape passwords or store brokerage tokens in the public website or GitHub.

## Physical metal ledger (private only)
Store: metal, mint, exact product/series, year, denomination, fine purity, fine troy ounces **per coin**, quantity, proof/bullion/graded condition, certification where present, purchase/transfer date, acquisition cost, premium, physical custodian/location (restricted), owner, transfer agreement, insurance, market spot feed, dealer bid and quote timestamp, valuation and verification method. Separate American Silver Eagle 1-oz bullion from other American-minted silver and from gold Eagles, Buffalos, fractional coins and foreign mint coins. The 120 silver coins are a **proposal**, not verified owned inventory. The phrase “12p more gold coins” needs confirmation of quantity (possibly 120), product, size and legal ownership; do not prefill gold quantity or value.

## API monitoring design
- Market quotes: use an appropriately licensed market-data provider for public stock/ETF prices and gold/silver spot, respecting delay, rate limits, licensing and market-hours flags.
- Holdings: read-only authorized brokerage connection or manual import. Price API alone **cannot** discover holdings or prove coin custody.
- Metal valuation: compute `sum(quantity * fine_oz_per_coin * price_per_fine_oz)` as **spot melt benchmark**, then separately display verifiable dealer bid/numismatic premium; never conflate face value with market value.
- Reconciliation: idempotent transaction IDs, source-of-truth priority, date/time/currency, manual owner approval for coin acquisitions and broker corrections; avoid duplicate entries.
- Security: server-side token storage in secrets manager, least-privilege scopes, encrypted database/backups, audit trail, MFA, no tokens/holdings in client JavaScript or public GitHub. Use separate private authenticated dashboard, not public investor marketing pages.
- Dashboard freshness: explicit source timestamp, delayed/real-time label, last successful holdings sync, stale/unavailable warnings; no invented zero holdings when data missing.
- Publishing: private authenticated dashboard can show positions. Public investor page only shows consented aggregated numbers with provenance and date, if ownership and securities/legal review permit.

## Questions to resolve before any live valuation or public disclosure
- Is “12p more gold coins” intended to mean **120 gold coins**, or 12, and what exact denomination/weight?
- Are the 120 silver coins actually owned/transferred or only promised? What mint/series and year?
- Is the $250 from investors collectively or **per investor**, and what legal funding instrument (gift, loan, equity, collateral)?
- Which brokerage accounts are personal versus legally owned by M3MM.NET, and which can be disclosed to investors?
- Should private dashboard live behind SSO/VPN on a business server or approved hosted service? No public brokerage authentication.

## Cost-control note
Do not conflate asset holdings (stocks, metals) with business cash available for equipment. Do not use retirement accounts or personal positions as business capital without documented authority. Investor returns, silver market appreciation and coin sales are not guaranteed. Have a CPA and qualified attorney review accounting, ownership, securities solicitation and disclosures.
