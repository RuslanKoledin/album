# ADR 0007: Immutable print profile contract

- Status: provisional accepted
- Date: 23 July 2026
- Scope: M0/B4 print-profile domain model

## Decision

Represent all renderer-relevant manufacturing requirements as one immutable
`PrintProfileV1` value in the domain package. It binds a catalog version and
product specification to:

- page trim, bleed, safe zone and gutter-safe geometry;
- cover canvas, safe zone and spine width;
- minimum, maximum and step of spread count;
- page/spread input mode;
- minimum effective DPI;
- PDF standard, color space, ICC profile and black policy;
- font embedding, transparency and overprint rules.

Every profile is explicitly `mock` or `approved`. An approved profile is invalid
without a UTC approval timestamp and opaque evidence, partner and production
owner identifiers. A mock profile must not carry manufacturing approval.

`renderProfileVersion` is derived from the canonical SHA-256 hash of the full
validated value. Any geometry, output rule, evidence or revision change
therefore creates a different immutable version.

## Activation gate

This decision defines the data shape and invariants only. It does not publish a
profile, change the catalog, create a database row or open render jobs. The
runtime may use a profile only after M0 is `PASSED`, the production values are
entered from signed evidence and `assertApprovedPrintProfile` succeeds.

Until then, the render create boundary continues to return
`RENDER_PROFILE_UNAVAILABLE`.

## Evidence

Focused domain tests prove:

- deterministic version derivation for identical content;
- a changed geometry value changes the version;
- unsafe safe-zone geometry and unreachable spread increments are rejected;
- mock profiles cannot activate production rendering;
- approved profiles require manufacturing evidence.

## Deferred

- Production instance populated from the selected Bishkek print partner.
- Persistence and catalog linkage for approved profile versions.
- Golden PDF generator and physical print proof.
- Render jobs, queue, private output storage and retry.
