/**
 * Public, deliberately non-sensitive environment plan. This does NOT represent
 * live inventory or verified deployment state; verify against private records
 * before claiming an item is completed. No hostnames, IPs or topology secrets.
 */
export type InfrastructureStatus = 'planned' | 'verify' | 'in-progress' | 'complete';
export interface InfrastructureMilestone {
  id: string;
  title: string;
  detail: string;
  phase: string;
  status: InfrastructureStatus;
  dependency: string;
  cost: string;
}
export interface EnvironmentArea {
  slug: string;
  title: string;
  summary: string;
  focus: string[];
  next: string;
}

export const ENVIRONMENT_AREAS: EnvironmentArea[] = [
  {
    slug: 'hardware', title: 'Hardware & inventory',
    summary: 'Document the compute devices, Raspberry Pis, managed networking equipment, and available storage before assigning roles.',
    focus: ['Record device models and capabilities privately', 'Separate equipment already owned from proposed purchases', 'Keep physical layouts and maintenance notes in private operations documentation'],
    next: 'Complete and validate an equipment inventory.',
  },
  {
    slug: 'networking', title: 'Networking',
    summary: 'Design an independent lab network without changing the household Xfinity service or everyday devices.',
    focus: ['Document present connections privately', 'Evaluate managed switch capabilities and VLAN support', 'Plan segmented lab routing with a tested rollback path'],
    next: 'Approve a network design before touching live routing or cables.',
  },
  {
    slug: 'compute', title: 'Compute & virtualization',
    summary: 'Evaluate workload roles, hypervisors, containers, local AI processing, and future Proxmox options.',
    focus: ['Check current host resources and compatibility', 'Compare VM, container, and bare-metal roles', 'Plan gradual migration with backups and restore tests'],
    next: 'Verify system requirements and select a non-disruptive pilot host.',
  },
  {
    slug: 'storage', title: 'Storage & backups',
    summary: 'Plan durable project storage, recovery copies, a future NAS, and restore testing.',
    focus: ['Inventory storage safely', 'Separate working copies from backups', 'Evaluate NAS software and hardware without declaring an unverified deployment complete'],
    next: 'Prove a restore from a verified backup before changes to storage layout.',
  },
  {
    slug: 'security', title: 'Security & access',
    summary: 'Keep household services independent while improving access control, segmentation, and recovery practices.',
    focus: ['Preserve the existing home network', 'Plan least-privilege lab firewall rules', 'Keep credentials, remote-access details and private diagrams off the public website'],
    next: 'Document approvals, failure modes, and rollback procedures.',
  },
  {
    slug: 'budget', title: 'Budget & expansion',
    summary: 'Organize existing assets, optional purchases, recurring services, and power protection by dependency.',
    focus: ['Use a verified bill of materials', 'Split one-time and recurring costs', 'Price UPS, NAS, switches, drives, and compute only after choosing compatible equipment'],
    next: 'Obtain current quotes and confirm priorities before publishing dollar totals.',
  },
];

export const INFRASTRUCTURE_PHASES = [
  { id: 'foundation', name: '01 · Inventory & foundation' },
  { id: 'network', name: '02 · Networking & security' },
  { id: 'compute', name: '03 · Compute & virtualization' },
  { id: 'storage', name: '04 · Storage & backup' },
  { id: 'automation', name: '05 · AI & automation' },
  { id: 'resilience', name: '06 · Reliability & expansion' },
] as const;

export const INFRASTRUCTURE_MILESTONES: InfrastructureMilestone[] = [
  { id: 'device-audit', phase: 'foundation', title: 'Verified equipment inventory', detail: 'Confirm owned computers, Raspberry Pi boards, network gear and storage without publishing sensitive identifiers.', status: 'verify', dependency: 'Access to private inventory records', cost: 'Existing equipment' },
  { id: 'recovery-baseline', phase: 'foundation', title: 'Backup and restore baseline', detail: 'Verify recoverable backups before any operating system, disk or network migration.', status: 'verify', dependency: 'Inventory and backup destination review', cost: 'To be scoped' },
  { id: 'network-design', phase: 'network', title: 'Lab segmentation design', detail: 'Design the lab separately from household Xfinity routing, with an approved rollback plan.', status: 'planned', dependency: 'Current topology and switch capability verification', cost: 'Existing gear first' },
  { id: 'firewall-policy', phase: 'network', title: 'Firewall and remote access plan', detail: 'Specify least-privilege policy, access approval and fail-safe testing.', status: 'planned', dependency: 'Approved segmentation plan', cost: 'To be scoped' },
  { id: 'workload-map', phase: 'compute', title: 'Server workload map', detail: 'Assign proposed workloads across the Ubuntu system, workstations, Pis and future hosts.', status: 'planned', dependency: 'Verified CPU, memory and storage inventory', cost: 'Existing equipment first' },
  { id: 'virtualization-pilot', phase: 'compute', title: 'Virtualization pilot', detail: 'Evaluate Proxmox and alternatives on suitable hardware without modifying daily-use machines.', status: 'planned', dependency: 'Backups, compatibility and maintenance window', cost: 'To be scoped' },
  { id: 'nas-design', phase: 'storage', title: 'NAS and shared-storage design', detail: 'Compare dedicated NAS, existing server and Pi-based approaches for workload fit.', status: 'planned', dependency: 'Storage inventory and recovery requirements', cost: 'Quotes pending' },
  { id: 'restore-test', phase: 'storage', title: 'Recovery test and retention', detail: 'Define versioned backups, retention and a repeatable restore exercise.', status: 'planned', dependency: 'Selected backup destination and safety approval', cost: 'To be scoped' },
  { id: 'ai-services', phase: 'automation', title: 'Local AI service architecture', detail: 'Document model-hosting capacity and safe separation between experiments and reliable services.', status: 'planned', dependency: 'Workload map and capacity verification', cost: 'Existing equipment first' },
  { id: 'orchestration', phase: 'automation', title: 'Automation service organization', detail: 'Plan service ownership, observability, deployment and credential handling.', status: 'planned', dependency: 'Compute and security baseline', cost: 'To be scoped' },
  { id: 'observability', phase: 'resilience', title: 'Monitoring and alerts', detail: 'Plan health checks, logs, capacity reporting and operator response procedures.', status: 'planned', dependency: 'Stable workloads and private inventory', cost: 'To be scoped' },
  { id: 'power-capacity', phase: 'resilience', title: 'UPS and expansion decisions', detail: 'Size power protection and future capacity only after measuring current loads.', status: 'planned', dependency: 'Hardware inventory and measured power use', cost: 'Quotes pending' },
];

export const infrastructureStatusLabel: Record<InfrastructureStatus, string> = {
  planned: 'Planned',
  verify: 'Needs verification',
  'in-progress': 'In progress',
  complete: 'Verified complete',
};
