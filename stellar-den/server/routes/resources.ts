import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";

const router = Router();

function generateGtaChecklist(res: Response) {
  const doc = new PDFDocument({
    size: "LETTER",
    margin: 50,
    info: {
      Title: "GTA Incident Readiness Checklist",
      Author: "AliceSolutions Group",
      Subject: "Toronto & GTA Cybersecurity Preparedness",
    },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="gta-incident-readiness-checklist.pdf"');

  doc.pipe(res);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#0ea5e9")
    .text("Toronto & GTA Incident Readiness Checklist", { align: "center" })
    .moveDown(1.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#1f2937")
    .text(
      "Use this checklist to align executive, IT, privacy, and operations stakeholders on the core actions needed to withstand a security incident in the Greater Toronto Area. It reflects PHIPA and PIPEDA guidance (Office of the Privacy Commissioner of Canada, Sept 9, 2025), Ontario’s Bill 194 updates for public sector security (Information and Privacy Commissioner of Ontario, Aug 2024), and the Canadian Centre for Cyber Security baseline controls.",
    )
    .moveDown(1.2);

  const sections: Array<{ title: string; items: string[] }> = [
    {
      title: "1. Contacts & Escalation",
      items: [
        "Executive sponsors, IT leads, legal counsel, insurance contacts, and PR/communications on a single list with after-hours details.",
        "External DFIR/MDR partners under contract with predefined SLAs for GTA coverage.",
        "Authority to notify stakeholders (board, regulators, law enforcement) with thresholds clearly defined.",
      ],
    },
    {
      title: "2. Legal & Privacy Alignment",
      items: [
        "Document which entities fall under PHIPA (health information custodians) versus PIPEDA (commercial activities).",
        "Prepare breach notification templates and timelines per PHIPA, PIPEDA, and sector-specific rules (e.g., Ontario Energy Board cyber standard, Oct 1, 2024).",
        "Review third-party data-processing agreements for incident clauses and ensure right-to-audit coverage.",
      ],
    },
    {
      title: "3. Resilience & Recovery",
      items: [
        "Backup inventory with RTO/RPO targets, offsite replication, and verification logs for critical GTA systems.",
        "Failover procedures tested quarterly, including cloud workloads and on-prem infrastructure.",
        "Tabletop exercises scheduled (at least semi-annually) with findings tracked to closure.",
      ],
    },
    {
      title: "4. Detection & Response Technology",
      items: [
        "EDR/MDR agents deployed and reporting; confirm alert routing for after-hours incidents.",
        "Log sources centralized (identity, network, SaaS) with retention meeting regulatory and insurer expectations.",
        "Playbooks covering ransomware, business email compromise, insider threat, and supply-chain attacks.",
      ],
    },
    {
      title: "5. Identity & Access",
      items: [
        "Multi-factor authentication enforced for privileged and remote access (verified quarterly).",
        "Privileged access management process documented, with emergency access break-glass logs.",
        "Joiner/mover/leaver automation including third-party identities and contractors.",
      ],
    },
    {
      title: "6. Communications & Evidence",
      items: [
        "Executive and board brief templates ready to fill in within minutes of an incident.",
        "Notification matrix for customers, partners, and regulators with draft messaging.",
        "Evidence retention checklist for forensics, insurance, and legal disclosure.",
      ],
    },
  ];

  sections.forEach(({ title, items }) => {
    doc
      .moveDown(0.8)
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#0f172a")
      .text(title);

    doc.moveDown(0.4).font("Helvetica").fontSize(11).fillColor("#1f2937");

    items.forEach((item) => {
      doc.circle(doc.x + 2, doc.y + 4, 2).fill("#0ea5e9").fillColor("#1f2937").fontSize(11).text(`   ${item}`, { paragraphGap: 6 });
      doc.moveDown(0.2);
    });
  });

  doc
    .moveDown(1.2)
    .font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor("#475569")
    .text(
      "Prepared by AliceSolutions Group · Toronto, Ontario · https://alicesolutionsgroup.com | For advisory assistance or custom tabletop exercises, email udi.shkolnik@alicesolutionsgroup.com.",
      { align: "center" },
    );

  doc.end();
}

router.get("/gta-incident-readiness-checklist.pdf", (_req: Request, res: Response) => {
  try {
    generateGtaChecklist(res);
  } catch (error) {
    console.error("Failed to generate GTA checklist PDF:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate checklist",
    });
  }
});

export default router;

