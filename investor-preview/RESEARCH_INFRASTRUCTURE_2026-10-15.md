# M3MM.NET — Evidence-based infrastructure research and purchasing gates
**Research date:** 2026-10-15. **Scope:** dedicated lab gateway, NAS, backup/DR, Proxmox, always-on application server, local AI workstation, network, UPS, rack, operations and governance. **Status:** planning, NOT purchased, installed, approved or production verified. Prices are USD snapshots; check at checkout.

## Executive conclusion
Build a *recoverable* small-business platform in phases, not a miniature enterprise data center. Preserve Xfinity household Wi-Fi and devices. Keep the existing Cisco, D-Link, NETGEAR, Ubuntu RTX 3050 server, Windows Ryzen 9/RTX 3070 Ti, ThinkPad, Pis and USB-dock-attached drives. Never count old Linux installation in the Ubuntu server chassis as a separate physical server.

Separate roles:
1. Xfinity = household internet/Wi-Fi, unchanged.
2. **UCG-Fiber** = dedicated lab firewall and routing, downstream of Xfinity (double NAT may be acceptable for outbound services; no Xfinity bridge-mode or port forwarding without a separate approved change).
3. Cisco 2960-CX = existing managed lab core; D-Link/NETGEAR unmanaged switches are **single-VLAN edge segments**, not independent VLAN-aware trunks.
4. **NAS** = file shares, snapshots, backup destination; a mirror is *not* backup.
5. **Proxmox** = VMs and container workloads, including monitoring, isolated agents and staging.
6. **Modern always-on server** = separate dedicated application/API services only if uptime/resource demand justifies additional machine; assess whether Proxmox can carry these workloads first.
7. **AI workstation** = separate high-VRAM NVIDIA compute, benchmark-driven, not the application server.
8. **Independent off-site copy** = encrypted backup with tested restoration and custody plan.

## Primary researched products and pricing (snapshot, not a guaranteed cart)
| System | Specific evidence | Planning impact |
|---|---|---|
| Lab gateway | Ubiquiti UCG-Fiber official store **$279**, currently **$307 surcharge-included**; built-in UniFi Network, four 2.5GbE RJ45 ports, 10G connectivity, up to 5Gbps IDS/IPS. https://store.ui.com/us/en/category/cloud-gateways/collections/cloud-gateway-fiber/products/ucg-fiber ; https://techspecs.ui.com/unifi/cloud-gateways/ucg-fiber | **Keep $308 gateway allowance**; do not confuse with UXG-Fiber (requires separate management). Add UPS/patching separately. |
| Four-bay NAS | Micro Center **Synology DS925+ $711.99** at research time: https://www.microcenter.com/product/698130/synology-diskstation-ds925-4-bay-diskless-nas ; dual 2.5GbE and four drive bays per https://www.synology.com/en-us/products/DS925%2B | Previous $600 NAS enclosure allowance is low. |
| 8TB NAS drives | Micro Center Seagate IronWolf 8TB CMR **$329.99 each**: https://www.microcenter.com/product/712833/seagate-ironwolf-8tb-7200-rpm-sata-iii-6gb-s-35-internal-cmr-nas-hard-drive | Two drives **$659.98** vs previous $460; enclosure+two drives **$1,371.97** before tax. **Confirm Synology DS925+ drive compatibility first**: https://www.synology.com/en-us/compatibility?model=DS925%2B. Nonlisted disks may receive limited vendor support. |
| Alternate NAS | QNAP TS-464-8G official store from **$639**: https://store.qnap.com/nas/smb-desktop/2-4-bay.html ; dual 2.5GbE, M.2 and PCIe expansion. | Evaluate warranty, OS, snapshots, updates, backups and disk compatibility; no NAS exposed directly to public internet. |
| UPS | CyberPower CP1500PFCLCD **1500VA/1000W**, sine-wave; MSRP **$274.95**: https://www.cyberpowersystems.com/product/ups/pfc-sinewave/cp1500pfclcd/ | Previous $240 per UPS may be optimistic. **Measure real peak load**; separate network/NAS and high-load GPU UPS; verify USB shutdown support and battery replacement cost. |
| AI GPU | NVIDIA RTX 5090 **32GB VRAM**, **575W** GPU power, **1000W recommended system power** for reference build: https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/ | GPU $2,600 budget is only a placeholder. Check actual board price, physical clearance, PSU 12V-2x6/CEM compliance, cooling, CUDA compatibility and cost per measured model task. A 1000W UPS may be undersized for AI PC plus other loads. |
| Proxmox | Official recommendations: hardware virtualization, guest RAM plus host overhead, SSD storage, additional ZFS memory; https://www.proxmox.com/en/products/proxmox-virtual-environment/requirements | Do not buy an under-RAM'd mini PC or run Proxmox directly on Windows workstation without deliberate reimaging. Test VM restore. |
| TrueNAS | Official minimum x86-64, 8GB RAM, SSD boot and >=2 drives; 16–32GB+ better for demanding shares/iSCSI; https://www.truenas.com/docs/scale/gettingstarted/scalehardwareguide/ | DIY NAS only if maintenance skills/time and hardware cost justify it. Avoid assuming every NAS supports ECC. |
| Proxmox Backup Server | Modern 4+ core x86, 4GiB+ OS plus additional RAM per TiB, redundant storage recommended: https://pbs.proxmox.com/docs/installation.html | PBS can run as dedicated host or appropriately isolated VM, but its backup data must be independent of the VM host. |

## Research corrections to investor roadmap
Current investor planning sheet subtotal is **$11,508** equipment plus **$165/mo** estimated incremental operations. These are **unverified allowance estimates**. At least two line items already understate observed prices:
- NAS enclosure $600 vs observed $711.99 = **+$111.99**.
- 2 × 8TB NAS drives budgeted $230 each vs observed $329.99 each = **+$199.98**.
- Combined documented gap = **+$311.97**, making the like-for-like equipment subtotal **$11,819.97** before correcting UPS or other components, and before taxes.
- Two UPS at CyberPower MSRP $274.95 vs budget $240 each would add **$69.90** if that model is chosen, yielding **$11,889.87** illustrative equipment subtotal with only these substitutions.
- This is **not a verified total system quote**; the GPU, server, rack, NICs, UPS sizing, shipping and recurring power remain open.
- Do not add contingency as if it were a hardware device; maintain separate subtotal, sales tax, shipping, contingency, ongoing operations and replacement reserves.

## Phase-by-phase acceptance checklist
### P0 — recoverability and safety
- Verify Windows C: filesystem warning/Event55/Event153; don't run write repairs until a **separate verified backup and representative restore** exist.
- Audit Ubuntu USB-attached disks by serial/UUID, filesystem, mount point, SMART/health where available; don't format or infer mounts from USB detection.
- Inventory critical data and backup retention; establish 3-2-1 style separation, offline/immutable copy where feasible, quarterly sample restores, RPO/RTO per workload.
- Confirm UPS actual load, battery runtime, controlled shutdown of NAS/Proxmox/server, power draw at idle and under AI load.

### P1 — lab firewall/network
- Read-only Cisco `show interfaces status`, `show vlan brief`, `show interfaces trunk`, `show spanning-tree summary`, `show mac address-table`; determine TP-Link-facing Cisco uplink.
- Owner-reported: Xfinity -> TP-Link -> Cisco; Cisco port 1 -> D-Link -> Ubuntu on D-Link port 4/Pis; Cisco port 3 -> NETGEAR -> Windows/ThinkPad. Actual switch config and upstream DHCP remain unverified.
- Create dedicated UCG-Fiber lab-only subnet behind Xfinity; prevent lab-to-home access by default except explicitly approved flows. Test Internet, DNS, DHCP, Tailscale and rollback before any production migration.
- Suggested *logical* zones (not deployed): management, server/apps, AI compute, development/agent sandbox, storage, monitoring, guest/IoT only if needed. On unmanaged edge switches assign **one** access VLAN per uplink; do not promise multi-VLAN edge without compatible managed hardware.

### P2 — NAS and recovery
- Capacity model: two 8TB disks mirrored provide roughly 8TB decimal raw usable (less filesystem overhead); **not 16TB usable**. Four bays allow expansion but RAID/SHR design and mixed-drive behavior depend on NAS.
- NAS choice matrix: Synology DS925+ (ease of management, check approved disks), QNAP TS-464 (expansion, update discipline), DIY TrueNAS (control, more maintenance). Verify file shares, snapshots, encryption/key custody, ransomware-safe backup copy, user permissions and SMART alerting.
- NAS is not the sole backup destination for its own data. Preserve separate off-site/air-gapped copy and independent recovery instructions.

### P3 — virtualization and application services
- Start with one Proxmox host, not a cluster. Proposed VMs: management/monitoring, Docker applications, staging/CI, isolated agent sandbox; avoid overcommitting memory and SSD endurance.
- Set resource budgets per VM, least privilege, backups and restore rehearsals. Confirm actual service load before buying a separate modern always-on server.
- Only migrate off aging Pentium chassis when equivalent services and rollback are tested; existing Ubuntu AI server can remain as a lab GPU node while migration proceeds.

### P4 — dedicated AI workstation
- Define target models, context lengths, concurrency, quantization, batch latency, tokens/sec and VRAM budget before buying. Benchmark existing RTX 3050 and RTX 3070 Ti first.
- 24–32GB VRAM GPU class is a practical enthusiast target; larger enterprise VRAM is a distinct high-cost tier and should be justified by measured workloads or revenue.
- Target CPU 12–16 cores, 128GB RAM (validated memory support and stable clocks), NVMe OS/projects/models, airflow, PSU power headroom, compatible GPU dimensions and correct power cabling. Do not claim all 70B models run fully on 32GB at every precision/context.
- Check power circuits, heat/noise, idle watts, UPS sizing, CUDA/container drivers, model licensing, data privacy and remote management.

### P5 — operations, security and productization
- Separate account roles, MFA, GitHub branch protection, secret scanning, encrypted backup keys, incident response, change approval, asset inventory, patch cadence, and logs.
- Monitoring: Uptime Kuma, UPS state, disk SMART, NAS snapshots, hypervisor health, certificate expiration, GPU thermals and Tailscale peer availability. Alerts must have an owner and response procedure.
- No public exposure of Proxmox/NAS/SSH admin ports; use approved VPN/identity-aware access. Keep client datasets separate from experiments and agent sandboxes.
- Budget per software product: engineering hours, staging/CI, hosting/API/storage consumption, legal/license review, support/maintenance, launch proof and measurable business value. Shared hardware is budgeted once, not per app.

## Operating-cost model (replace placeholders with meter readings)
- Electricity formula: `watts × 24 × 30 / 1000 × $/kWh` for continuously running gear.
- Example: 100W 24/7 at $0.15/kWh ≈ **$10.80/month**; 400W 24/7 ≈ **$43.20/month**. Actual utility rate, cooling overhead and utilization are unknown.
- Budget replacement UPS batteries, NAS disks, off-site backup media, domains, DNS/certificates, optional monitoring, paid APIs, cloud backup, insurance and labor separately. $165/month is a **planning placeholder**, not a verified fully loaded business OPEX figure.
- Record each purchase's vendor, SKU, price date, tax, shipping, warranty, quantity, compatibility, power draw, owner, maintenance cycle and acceptance evidence.

## Security and business references
- NIST Small Business CSF 2.0 quick start: https://www.nist.gov/publications/nist-cybersecurity-framework-20-small-business-quick-start-guide
- CISA ransomware guidance (segmentation, recovery and remote access): https://www.cisa.gov/stopransomware/ransomware-guide
- CISA MFA guidance: https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/require-multifactor-authentication

## Research limitations and decision gates
This document reviews representative official vendor specifications and publicly listed product prices; it is not an exhaustive compatibility lab or live stock guarantee. Final parts depend on room/power survey, network port and VLAN audit, source-data inventory, backup restore, workload benchmarks, and owner-approved spending. No equipment ordered, services deployed or household network changed. Proposed investor silver and recurring contributions are uncommitted and are **not** counted as received funds or purchase authorization.
