## Legal Documents Duplication Map (Runtime vs Documentation)

This map defines the single source of truth for legal documents and how they are referenced in code. Runtime TXT sources live under `server/Contracts/` and are consumed by services, routes, and seed scripts. Human-facing documentation in Markdown lives under `docs/08-legal/`.

### Canonical Sources
- Runtime canonical: `server/Contracts/**` (TXT)
- Documentation canonical: `docs/08-legal/**` (MD)

### Core Documents Mapping

| ID | Runtime TXT | Documentation MD | Code References (examples) |
| --- | --- | --- | --- |
| PPA | `server/Contracts/01-core-platform/PPA.txt` | `docs/08-legal/01-core-platform/platform-participation-agreement.md` | `server/seed-legal-documents.js`, `server/add-legal-documents.js`, `server/services/legal-framework.js` |
| ESCA | `server/Contracts/01-core-platform/InternalMutual Confidentiality & Non-Exfiltration Agreement.txt` | `docs/08-legal/01-core-platform/electronic-signature-consent.md` | `server/add-legal-documents.js` |
| MNDA | `server/Contracts/templates/Mutual_Confidentiality_Non_Exfiltration_Agreement.txt` | `docs/08-legal/01-core-platform/mutual-non-disclosure-agreement.md` | `server/services/legal-document-service.js` |
| PTSA | `server/Contracts/02-subscription-billing/PLATFORM TOOLS SUBSCRIPTION AGREEMENT (PTSA).txt` | `docs/08-legal/02-subscription-billing/platform-tools-subscription-agreement.md` | `server/seed-legal-documents.js`, `server/services/legal-framework.js`, `server/routes/legal-pack-helpers.js` |
| SOBA | `server/Contracts/02-subscription-billing/SEAT ORDER & BILLING AUTHORIZATION (SOBA).txt` | (covered in indexes) | `server/seed-legal-documents.js`, `server/routes/documents-api.js`, `server/routes/legal-pack-helpers.js`, `server/services/legal-framework.js` |
| ISEA | `server/Contracts/03-venture-project/IDEA SUBMISSION & EVALUATION AGREEMENT.txt` | (covered in indexes) | `server/seed-legal-documents.js` |
| JDA | `server/Contracts/03-venture-project/JOINT DEVELOPMENT AGREEMENT (JDA).txt` | (covered in indexes) | `server/seed-legal-documents.js` |
| PCA | `server/Contracts/03-venture-project/PARTICIPANT COLLABORATION AGREEMENT (PCA).txt` | (covered in indexes) | `server/seed-legal-documents.js` |
| PPNA | `server/Contracts/08-templates/Per-Project NDA Addendum (Security-Tiered).txt` | `docs/08-legal/08-templates/per-project-nda-addendum-template.md` | `server/seed-legal-documents.js`, `server/routes/legal-pack-helpers.js`, `server/services/legal-document-service.js` |

Note: The documentation directory also contains master indexes: `docs/08-legal/LEGAL_DOCUMENTS_MASTER_INDEX.md`, `docs/08-legal/RBAC_LEGAL_DOCUMENT_ACCESS_CONTROL.md`.

### Usage Guidance
- Do not remove or rename TXT files under `server/Contracts/**` without updating all code references listed above.
- For content edits: update the TXT runtime source and mirror substantive changes in the MD docs with a changelog note.
- For new documents: add TXT under `server/Contracts/**`, add MD under `docs/08-legal/**`, and register IDs in `server/services/legal-framework.js` and `frontend/src/lib/legal-framework.ts`.

### Known Gaps To Address
- SOBA and venture-project MD counterparts: add explicit MD pages mirroring TXT content for ISEA, JDA, PCA, and SOBA.
- Tiered PPNA variants referenced in `legal-document-service.js`: ensure corresponding TXT/MD entries are present and indexed.


