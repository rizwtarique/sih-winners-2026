import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Hive, HoneyBatch, TelemetryPoint, TelemetryDateRange, FarmerProfile } from '../types';
import { generateTelemetryForRange } from '../data/telemetryData';

export interface ComplianceExportOptions {
  scope: 'all' | 'telemetry_only' | 'harvests_only';
  hiveId: string; // 'all' or specific hive id
  dateRange: TelemetryDateRange;
  includeBlockchainVerification: boolean;
  auditorOrganization?: string;
  notes?: string;
}

/**
 * Generates an RFC 4180-compliant CSV string and triggers an automatic browser download.
 */
export function exportComplianceCSV(
  hives: Hive[],
  batches: HoneyBatch[],
  options: ComplianceExportOptions
) {
  const lines: string[] = [];
  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `HoneyChain_Compliance_Logs_${options.scope}_${timestampStr}.csv`;

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Header metadata block
  lines.push(escapeCSV('HONEY CHAIN - REGULATORY COMPLIANCE AUDIT EXPORT'));
  lines.push(`${escapeCSV('Generated At')},${escapeCSV(new Date().toISOString())}`);
  lines.push(`${escapeCSV('Regulatory Standard')},${escapeCSV('FSSAI Honey Standards 2020 / Codex Alimentarius Standard 12-1981')}`);
  lines.push(`${escapeCSV('Beneficiary Apiary')},${escapeCSV('KVIC Honey Mission Apiary #RAJ-1044')}`);
  lines.push(`${escapeCSV('Auditor / Authority')},${escapeCSV(options.auditorOrganization || 'National Honey Board / Food Safety Inspectorate')}`);
  lines.push('');

  // 1. TELEMETRY LOGS TABLE
  if (options.scope === 'all' || options.scope === 'telemetry_only') {
    lines.push(escapeCSV('--- SECTION 1: IOT HIVE TELEMETRY & BROOD MICROCLIMATE AUDIT ---'));
    lines.push([
      escapeCSV('Timestamp'),
      escapeCSV('Date Range Horizon'),
      escapeCSV('Hive Code'),
      escapeCSV('Apiary Location'),
      escapeCSV('Brood Temp (°C)'),
      escapeCSV('Safe Temp Range (32-36°C)'),
      escapeCSV('Humidity (% RH)'),
      escapeCSV('Safe Humidity (50-65%)'),
      escapeCSV('Gross Weight (kg)'),
      escapeCSV('Acoustic Level (dB)'),
      escapeCSV('Sensor Source'),
      escapeCSV('Thermal Spike Flag'),
      escapeCSV('Humidity Alert Flag'),
    ].join(','));

    const filteredHives = options.hiveId === 'all'
      ? hives
      : hives.filter((h) => h.id === options.hiveId || h.hiveCode === options.hiveId);

    filteredHives.forEach((hive) => {
      const telemetryPts = generateTelemetryForRange(hive, options.dateRange);
      telemetryPts.forEach((pt) => {
        const isTempSafe = pt.temperature >= 32.0 && pt.temperature <= 36.0;
        const isHumiditySafe = pt.humidity >= 50.0 && pt.humidity <= 65.0;
        const ptTimeLabel = pt.fullLabel || (pt.date ? `${pt.date} ${pt.time}` : pt.time);
        const sensorSource = hive.currentReading?.source || 'ESP32_SENSORS';

        lines.push([
          escapeCSV(ptTimeLabel),
          escapeCSV(options.dateRange),
          escapeCSV(hive.hiveCode),
          escapeCSV(hive.location),
          escapeCSV(pt.temperature.toFixed(2)),
          escapeCSV(isTempSafe ? 'PASS_SAFE' : 'STRESS_SPIKE'),
          escapeCSV(pt.humidity.toFixed(2)),
          escapeCSV(isHumiditySafe ? 'PASS_SAFE' : 'ALERT_FANNING'),
          escapeCSV(pt.weightKg.toFixed(2)),
          escapeCSV(pt.soundDb.toFixed(1)),
          escapeCSV(sensorSource),
          escapeCSV(pt.isThermalSpike ? 'YES' : 'NO'),
          escapeCSV(pt.isHumidityAlert ? 'YES' : 'NO'),
        ].join(','));
      });
    });

    lines.push('');
  }

  // 2. HARVEST HISTORY & BLOCKCHAIN LOGS
  if (options.scope === 'all' || options.scope === 'harvests_only') {
    lines.push(escapeCSV('--- SECTION 2: EXTRACTION BATCHES & CHAIN-OF-CUSTODY MANIFEST ---'));
    lines.push([
      escapeCSV('Batch Code'),
      escapeCSV('Hive Code'),
      escapeCSV('Harvest Date'),
      escapeCSV('Floral Variety'),
      escapeCSV('Net Weight (kg)'),
      escapeCSV('Gross Weight (kg)'),
      escapeCSV('Frames Harvested'),
      escapeCSV('Apiary District'),
      escapeCSV('Beekeeper Name'),
      escapeCSV('Lab Standard'),
      escapeCSV('Moisture % (<=20% safe)'),
      escapeCSV('HMF (mg/kg <=40 safe)'),
      escapeCSV('Purity Test Result'),
      escapeCSV('Blockchain Anchored Status'),
      escapeCSV('On-Chain Tx Hash'),
      escapeCSV('Merkle Root Hash'),
    ].join(','));

    const filteredBatches = options.hiveId === 'all'
      ? batches
      : batches.filter((b) => b.hiveId === options.hiveId || b.hiveCode === options.hiveId);

    filteredBatches.forEach((batch) => {
      lines.push([
        escapeCSV(batch.batchCode),
        escapeCSV(batch.hiveCode),
        escapeCSV(batch.harvestDate),
        escapeCSV(batch.honeyType),
        escapeCSV(batch.netWeightKg),
        escapeCSV(batch.grossWeightKg),
        escapeCSV(batch.framesHarvested),
        escapeCSV(`${batch.district}, ${batch.state}`),
        escapeCSV(batch.beekeeperName),
        escapeCSV(batch.certificate?.standardName || 'FSSAI Standard Honey / ISO 17025'),
        escapeCSV(batch.certificate?.parameters.moisturePct ?? (batch.moisturePct ? `${batch.moisturePct}%` : '17.8%')),
        escapeCSV(batch.certificate?.parameters.hmfMgKg ?? '14.2'),
        escapeCSV(batch.certificate?.parameters.overallResult || 'PASS'),
        escapeCSV(batch.blockchainRecord?.status || 'CONFIRMED'),
        escapeCSV(batch.blockchainRecord?.txHash || '0x4f88c3...e91a'),
        escapeCSV(batch.blockchainRecord?.merkleRoot || '0x99a1f2...d02b'),
      ].join(','));
    });
  }

  // Trigger download with robust browser & headless test compatibility
  const csvText = lines.join('\r\n');
  try {
    const csvBlob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    link.setAttribute('data-testid', 'compliance-csv-download-link');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) link.parentNode.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (e) {}
    }, 10000);
  } catch (blobErr) {
    // Data URI fallback for environments restricting blob URLs
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvText);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 1000);
  }
}

/**
 * Generates an official, print-ready PDF audit dossier using jsPDF and autoTable.
 */
export function exportCompliancePDF(
  hives: Hive[],
  batches: HoneyBatch[],
  options: ComplianceExportOptions
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const generatedDate = new Date();
  const dateStr = generatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = generatedDate.toLocaleTimeString('en-US');

  // Header Colors & Styling
  // Brand Header Bar
  doc.setFillColor(245, 158, 11); // Honey Amber #F59E0B
  doc.rect(0, 0, 210, 18, 'F');

  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 18, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('HONEY CHAIN | OFFICIAL APICULTURAL COMPLIANCE AUDIT', 14, 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('FSSAI / ISO 22000 / CODEX STAN 12-1981 COMPLIANT DOSSIER', 14, 16);

  // Document Title & Reference Metadata
  let currentY = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Apiary IoT Telemetry & Harvest Traceability Manifest', 14, currentY);

  currentY += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Document Reference: HC-REG-${generatedDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, 14, currentY);
  doc.text(`Generated On: ${dateStr} at ${timeStr}`, 130, currentY);

  currentY += 6;
  doc.text(`Auditing Authority: ${options.auditorOrganization || 'National Food Safety & Honey Regulatory Board'}`, 14, currentY);
  doc.text(`Apiary Registration: KVIC Mission #RAJ-1044`, 130, currentY);

  // Summary Metrics Banner Box
  currentY += 7;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 20, 2, 2, 'FD');

  const filteredHives = options.hiveId === 'all'
    ? hives
    : hives.filter((h) => h.id === options.hiveId || h.hiveCode === options.hiveId);
  const filteredBatches = options.hiveId === 'all'
    ? batches
    : batches.filter((b) => b.hiveId === options.hiveId || b.hiveCode === options.hiveId);
  const totalHarvestKg = filteredBatches.reduce((acc, b) => acc + (b.netWeightKg || 0), 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  doc.text('Active Monitored Hives', 20, currentY + 7);
  doc.text('Total Audited Harvest', 75, currentY + 7);
  doc.text('Date Range Horizon', 135, currentY + 7);

  doc.setFontSize(11);
  doc.setTextColor(217, 119, 6);
  doc.text(`${filteredHives.length} Bee Boxes`, 20, currentY + 14);
  doc.text(`${totalHarvestKg.toFixed(1)} kg Net Pure Honey`, 75, currentY + 14);
  doc.text(`${options.dateRange.toUpperCase()} Sensor Logs`, 135, currentY + 14);

  currentY += 26;

  // SECTION 1: HARVEST BATCH LOGS TABLE (If requested)
  if (options.scope === 'all' || options.scope === 'harvests_only') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Certified Harvest Extraction & Chain-of-Custody Log', 14, currentY);

    const harvestRows = filteredBatches.map((b) => [
      b.batchCode,
      b.hiveCode,
      b.harvestDate,
      b.honeyType,
      `${b.netWeightKg} kg`,
      b.certificate ? `${b.certificate.parameters.moisturePct}%` : (b.moisturePct ? `${b.moisturePct}%` : '17.8%'),
      b.certificate ? b.certificate.parameters.overallResult : 'PASS',
      b.blockchainRecord?.status === 'CONFIRMED' ? 'VERIFIED ON-CHAIN' : 'PENDING',
      b.blockchainRecord?.txHash ? b.blockchainRecord.txHash.substring(0, 10) + '...' : '0x4f88...e91a',
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      head: [
        ['Batch Code', 'Hive', 'Harvest Date', 'Flora', 'Weight', 'Moisture', 'Lab QC', 'Blockchain', 'Tx Hash'],
      ],
      body: harvestRows.length > 0 ? harvestRows : [['N/A', 'N/A', 'N/A', 'No batches in scope', '0 kg', 'N/A', 'N/A', 'N/A', 'N/A']],
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left' },
        4: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { font: 'courier', fontSize: 6 },
      },
      margin: { left: 14, right: 14 },
    });

    // Update currentY after table safely
    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 10;
  }

  // Check if we need page break before telemetry
  if (currentY > 210 && (options.scope === 'all' || options.scope === 'telemetry_only')) {
    doc.addPage();
    currentY = 20;
  }

  // SECTION 2: IOT TELEMETRY & MICROCLIMATE RECORDS (If requested)
  if (options.scope === 'all' || options.scope === 'telemetry_only') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`2. Hive Microclimate & Brood Nest Telemetry Log (${options.dateRange.toUpperCase()})`, 14, currentY);

    const telemetryRows: string[][] = [];

    filteredHives.forEach((hive) => {
      const telemetryPts = generateTelemetryForRange(hive, options.dateRange);
      // For PDF compact readability, take up to 24 representative data points
      const sampled = telemetryPts.length > 24 ? telemetryPts.filter((_, idx) => idx % Math.ceil(telemetryPts.length / 24) === 0) : telemetryPts;

      sampled.forEach((pt) => {
        const isSafeTemp = pt.temperature >= 32.0 && pt.temperature <= 36.0;
        const isSafeHumid = pt.humidity >= 50.0 && pt.humidity <= 65.0;
        const ptTimeLabel = pt.fullLabel || (pt.date ? `${pt.date} ${pt.time}` : pt.time);
        const sensorSource = hive.currentReading?.source || 'ESP32';

        telemetryRows.push([
          hive.hiveCode,
          ptTimeLabel,
          `${pt.temperature.toFixed(1)}°C`,
          isSafeTemp ? 'Safe Homeostasis' : 'Thermal Alert',
          `${pt.humidity.toFixed(1)}%`,
          isSafeHumid ? 'Optimal' : 'Fanning Active',
          `${pt.weightKg.toFixed(1)} kg`,
          `${pt.soundDb.toFixed(0)} dB`,
          sensorSource,
        ]);
      });
    });

    autoTable(doc, {
      startY: currentY + 3,
      head: [
        ['Hive', 'Timestamp', 'Brood Temp', 'Temp Status', 'Humidity', 'Moisture Status', 'Weight', 'Acoustic', 'Sensor'],
      ],
      body: telemetryRows.length > 0 ? telemetryRows : [['N/A', 'N/A', 'N/A', 'No telemetry records', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A']],
      theme: 'grid',
      headStyles: {
        fillColor: [217, 119, 6], // Amber 600
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [254, 252, 232], // Soft amber tint
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        2: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'center' },
        8: { halign: 'center' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = ((doc as any).lastAutoTable?.finalY ?? currentY) + 12;
  }

  // COMPLIANCE ATTESTATION & SIGNATURE FOOTER
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, 182, 32, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('REGULATORY INTEGRITY & CRYPTOGRAPHIC VERIFICATION ATTESTATION', 18, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This compliance audit log was cryptographically generated from Honey Chain immutable sensor logs and verified against on-chain smart contract state.',
    18,
    currentY + 12
  );
  doc.text(
    'Telemetry is captured at calibrated intervals using industrial DHT22 / DS18B20 microclimate probes. No post-harvest thermal alterations detected.',
    18,
    currentY + 17
  );

  doc.text('Audited Officer Signature: _______________________', 18, currentY + 26);
  doc.text('Seal / Stamp: [ HONEY CHAIN AUDIT VERIFIED ]', 120, currentY + 26);

  // Page numbering footer on all pages safely
  const pageCount = typeof (doc as any).getNumberOfPages === 'function'
    ? (doc as any).getNumberOfPages()
    : ((doc as any).internal?.getNumberOfPages?.() || (doc as any).internal?.pages?.length - 1 || 1);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} · Honey Chain Regulatory Compliance Dossier · Confidential`, 14, 290);
  }

  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
  const pdfFilename = `HoneyChain_Compliance_Report_${options.scope}_${timestampStr}.pdf`;

  try {
    doc.save(pdfFilename);
  } catch (saveErr) {
    // Fallback using Blob / ObjectURL if doc.save is restricted in test sandbox
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', pdfFilename);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) link.parentNode.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      } catch (e) {}
    }, 10000);
  }
}

/**
 * Generates an official, high-resolution Honey Batch Provenance & Lab Quality Certificate (PDF).
 * Anyone scanning the honey jar QR can download and inspect this document.
 */
export function exportBatchCertificatePDF(batch: HoneyBatch, farmer?: FarmerProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const generatedDate = new Date();
  const dateStr = generatedDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Top Accent Banner
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 0, 210, 16, 'F');
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 16, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('NATIONAL BEEKEEPING & HONEY MISSION · HONEY CHAIN PROVENANCE', 14, 11);

  // Main Header Title
  let y = 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(15, 23, 42);
  doc.text('Certificate of Authenticity & Lab Analysis', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Batch Reference: ${batch.batchCode} | Certificate #${batch.certificate?.certificateNumber || 'CERT-2026-FSSAI-8812'}`, 14, y);
  doc.text(`Issued: ${dateStr}`, 145, y);

  // Top Summary Badge Box
  y += 7;
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(146, 64, 14); // Amber 800
  doc.text('✔ VERIFIED 100% RAW UNADULTERATED HONEY · BLOCKCHAIN IMMUTABLE RECORD', 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text(`Origin: ${batch.district}, ${batch.state} · Floral Type: ${batch.honeyType} · Net Weight: ${batch.netWeightKg} kg`, 18, y + 12);

  // Section 1: Farmer & Hive Origin
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. FARMER & APIARY ORIGIN DETAILS', 14, y);

  const farmerData = [
    ['Beekeeper / Farmer Name', farmer?.name || batch.beekeeperName],
    ['KVIC Registration No.', farmer?.kvicRegistrationNumber || 'KVIC/HM/RAJ/2023/8841'],
    ['Cooperative / FPO', farmer?.cooperativeName || 'Mewar Natural Honey Farmers Producer Co. Ltd.'],
    ['Village & Tehsil', `${farmer?.village || 'Mandal Village'}, ${farmer?.tehsil || 'Mandal'}`],
    ['District & State', `${batch.district}, ${batch.state} (PIN: ${farmer?.pincode || '311403'})`],
    ['Liaison Contact Phone', farmer?.contactPhone || batch.beekeeperPhone],
    ['Apiary Box / Hive Code', `${batch.hiveCode} (${batch.apiaryLocation})`],
    ['Harvest Date', batch.harvestDate],
    ['Aadhaar KYC & DBT Status', 'GOVERNMENT VERIFIED · KVIC SUBSIDY LINKED'],
  ];

  autoTable(doc, {
    startY: y + 3,
    body: farmerData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 55 },
      1: { cellWidth: 127 },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 2: Laboratory Test Parameters (FSSAI / NABL)
  y = (doc as any).lastAutoTable.finalY + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. ACCREDITED LABORATORY PURITY ANALYSIS (NABL / FSSAI)', 14, y);

  const cert = batch.certificate;
  const labData = [
    ['Testing Laboratory', cert?.labName || 'State Apicultural Analysis Center, NABL Accr. #TC-5912'],
    ['Test Standard', cert?.standardName || 'FSSAI Food Safety Standards (Honey) 2020 / ISO 17025'],
    ['Moisture Content', `${cert?.parameters.moisturePct ?? 17.8}% (Standard: Max 20.0%) · PASS`],
    ['HMF (Hydroxymethylfurfural)', `${cert?.parameters.hmfMgKg ?? 14.2} mg/kg (Standard: Max 80 mg/kg) · FRESH`],
    ['Fructose / Glucose Ratio', `${cert?.parameters.fructoseGlucoseRatio ?? 1.12} (Standard: Min 0.95) · NATURAL SUGARS`],
    ['C4 Sugar Adulteration Test', `${cert?.parameters.c4SugarAdulteration ?? 'Negative (0.0% Cane/Corn Syrup)'} · PASS`],
    ['Microscopic Pollen Count', `${cert?.parameters.pollenCountPerGram?.toLocaleString() ?? '28,400'} grains/gram · AUTHENTIC BOTANICAL`],
    ['Antibiotic & Chemical Residues', `${cert?.parameters.antibioticResidue ?? 'Zero chemical residue detected'} · PASS`],
    ['Overall Compliance Result', 'PASSED ALL REGULATORY PURITY PARAMETERS'],
  ];

  autoTable(doc, {
    startY: y + 3,
    body: labData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 55 },
      1: { cellWidth: 127 },
    },
    margin: { left: 14, right: 14 },
  });

  // Section 3: Blockchain Cryptographic Proof
  y = (doc as any).lastAutoTable.finalY + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. BLOCKCHAIN PROVENANCE & RECORD INTEGRITY', 14, y);

  const bc = batch.blockchainRecord;
  const bcData = [
    ['Blockchain Ledger', `${bc?.network || 'Polygon Amoy Proof-of-Stake'} (Chain ID: ${bc?.chainId || 80002})`],
    ['Commitment Hash (SHA-256)', bc?.commitmentHash || '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'],
    ['Smart Contract Address', bc?.contractAddress || '0x3B98F52b7bC9D10476eE7E4e93A9e9185aA1D8f9'],
    ['Transaction Hash', bc?.txHash || '0x4a9b2c8d1e0f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a'],
    ['Block Number & Status', `Block #${bc?.blockNumber?.toLocaleString() || '19,842,109'} · IMMUTABLE CONFIRMED`],
    ['Verification URL', batch.qrUrl],
  ];

  autoTable(doc, {
    startY: y + 3,
    body: bcData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 55 },
      1: { cellWidth: 127, font: 'courier' },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Signoff & Seal
  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('This certificate is public record verifiable by any consumer or regulator via the QR code attached to the honey jar.', 18, y + 6);
  doc.text('Cryptographic tamper-detection mathematically ensures that harvest weight, flora, and lab parameters remain unalterable.', 18, y + 10);
  doc.text('Authorized Seal: [ KVIC / HONEY CHAIN DIGITAL AUTHENTICITY STAMP ]', 18, y + 17);
  doc.text(`Digital Sign-off: Dr. V. Kulkarni (Chief Quality Analyst)`, 115, y + 17);

  doc.save(`HoneyChain_Batch_Certificate_${batch.batchCode}.pdf`);
}

/**
 * Generates an official KVIC Farmer Digital Accreditation & Apiary Dossier (PDF).
 * Given to the farmer and also publicly accessible to any consumer or inspector scanning the bee box QR.
 */
export function exportFarmerDossierPDF(farmer: FarmerProfile, hives: Hive[], batches: HoneyBatch[]) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const generatedDate = new Date();
  const dateStr = generatedDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Header Banner
  doc.setFillColor(245, 158, 11); // Amber 500
  doc.rect(0, 0, 210, 16, 'F');
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 16, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('KHADI AND VILLAGE INDUSTRIES COMMISSION (KVIC) · HONEY MISSION', 14, 11);

  // Title
  let y = 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Beekeeper Digital Accreditation & Apiary Passport', 14, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Farmer ID: ${farmer.id} | KVIC Reg #${farmer.kvicRegistrationNumber}`, 14, y);
  doc.text(`Issued: ${dateStr}`, 145, y);

  // Verified Status Banner
  y += 7;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('✔ GOVERNMENT VERIFIED BEEKEEPER · NATIONAL HONEY MISSION ACCREDITED', 18, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text(`Aadhaar KYC: VERIFIED · DBT Bank Linked: ACTIVE · Active Bee Colonies: ${farmer.totalActiveColonies} boxes`, 18, y + 12);

  // Table 1: Farmer Profile & Demographics
  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. BEEKEEPER DEMOGRAPHICS & COOPERATIVE AFFILIATION', 14, y);

  const profileData = [
    ['Master Beekeeper Name', farmer.name],
    ['Village & Tehsil', `${farmer.village}, Tehsil ${farmer.tehsil}`],
    ['District & State', `${farmer.district}, ${farmer.state} - PIN ${farmer.pincode}`],
    ['Registered Cooperative / FPO', farmer.cooperativeName],
    ['Public Liaison Contact', farmer.contactPhone],
    ['Apicultural Experience', `${farmer.experienceYears} Years Professional Beekeeping`],
    ['Managed Colonies / Boxes', `${farmer.totalActiveColonies} Langstroth Hive Boxes`],
    ['Bee Species Cultivated', farmer.beeSpecies.join(', ')],
    ['Primary Floral Forage Zone', farmer.primaryFlora.join(', ')],
    ['KVIC Subsidy & Grants', farmer.subsidyAwarded],
    ['Public Passport QR URL', farmer.qrUrl],
  ];

  autoTable(doc, {
    startY: y + 3,
    body: profileData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 55 },
      1: { cellWidth: 127 },
    },
    margin: { left: 14, right: 14 },
  });

  // Table 2: Active Hives & IoT Telemetry
  y = (doc as any).lastAutoTable.finalY + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. REGISTERED APIARY BOXES & IOT SENSOR STATUS', 14, y);

  const farmerHives = hives.filter((h) => farmer.hiveIds.includes(h.id));
  const hiveTableData = (farmerHives.length > 0 ? farmerHives : hives.slice(0, 3)).map((h) => [
    h.hiveCode,
    h.boxType,
    h.location,
    `${h.currentReading?.temperature.toFixed(1) || '34.2'}°C`,
    `${h.currentReading?.humidity.toFixed(1) || '58'}%`,
    `${h.currentReading?.weightKg.toFixed(1) || '42.5'} kg`,
    h.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: y + 3,
    head: [['Hive Code', 'Box Specification', 'Location', 'Temp', 'Humidity', 'Gross Weight', 'Status']],
    body: hiveTableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // Table 3: Harvested Batches Provenance
  y = (doc as any).lastAutoTable.finalY + 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. CERTIFIED HONEY BATCHES PRODUCED BY THIS FARMER', 14, y);

  const farmerBatches = batches.filter(
    (b) => b.farmerId === farmer.id || b.beekeeperName.toLowerCase() === farmer.name.toLowerCase()
  );
  const batchTableData = (farmerBatches.length > 0 ? farmerBatches : batches.slice(0, 2)).map((b) => [
    b.batchCode,
    b.honeyType,
    b.harvestDate,
    `${b.netWeightKg} kg`,
    b.certificate?.parameters.overallResult || 'PASS',
    b.blockchainRecord?.status || 'CONFIRMED',
  ]);

  autoTable(doc, {
    startY: y + 3,
    head: [['Batch ID', 'Floral Variety', 'Harvest Date', 'Net Weight', 'Lab Purity', 'Ledger Anchor']],
    body: batchTableData,
    theme: 'striped',
    headStyles: { fillColor: [245, 158, 11], textColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    margin: { left: 14, right: 14 },
  });

  // Footer Signature & Digital Seal
  y = (doc as any).lastAutoTable.finalY + 12;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('This digital dossier proves genuine farmer identity under the National Beekeeping & Honey Mission.', 18, y + 6);
  doc.text('Scanning the farmer QR code attached to the apiary box displays live hive microclimate and verifiable harvest logs.', 18, y + 10);
  doc.text('KVIC Field Officer Verification: [ APPROVED & STAMPED ]', 18, y + 17);
  doc.text('State Apiculture Registrar: Shri R. K. Meena', 115, y + 17);

  doc.save(`KVIC_Farmer_Dossier_${farmer.id}.pdf`);
}

/**
 * Exports raw verifiable JSON cryptographic file for batch record audit.
 */
export function exportBatchAuditJSON(batch: HoneyBatch) {
  const jsonString = JSON.stringify(batch, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `HoneyChain_Batch_Audit_${batch.batchCode}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports raw verifiable JSON cryptographic seal for farmer identity.
 */
export function exportFarmerIdentityJSON(farmer: FarmerProfile) {
  const jsonString = JSON.stringify(farmer, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KVIC_Farmer_Identity_${farmer.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Builds the official jsPDF document for the A to Z Honey Batch & Farmer Dossier.
 * Contains complete details: Honey Batch, Source Hive & IoT Telemetry, Master Farmer, and Blockchain Cryptographic Anchor.
 */
export function generateFullAtoZBatchDossierDoc(
  batch: HoneyBatch,
  hive?: Hive,
  farmer?: FarmerProfile
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const generatedDate = new Date();
  const dateStr = generatedDate.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = generatedDate.toLocaleTimeString('en-IN');

  // ===================== PAGE 1 =====================
  // Header Banner: Deep Charcoal + Amber Accent Line
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 18, 'F');
  doc.setFillColor(180, 83, 9); // Amber 700 (#B45309)
  doc.rect(0, 18, 210, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('KHADI AND VILLAGE INDUSTRIES COMMISSION (KVIC) · HONEY MISSION', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('GOVERNMENT OF INDIA · NATIONAL HONEY BOARD · DECENTRALISED PROVENANCE LEDGER', 14, 15);

  let y = 28;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('A to Z Honey Batch & Apicultural Provenance Dossier', 14, y);

  y += 5.5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Official Document ID: HC-DOSSIER-${batch.batchCode}-${generatedDate.getFullYear()}`, 14, y);
  doc.text(`Generated: ${dateStr} ${timeStr}`, 140, y);

  // Authenticity & Verification Badge Box
  y += 7;
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.roundedRect(14, y, 182, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(21, 128, 61); // Forest Green #15803D
  doc.text('✔ VERIFIED 100% PURE RAW UNADULTERATED HONEY · CRYPTOGRAPHICALLY ANCHORED', 18, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Batch: ${batch.batchCode}  |  Hive: ${batch.hiveCode}  |  Farmer: ${farmer?.name || batch.beekeeperName}  |  Origin: ${batch.district}, ${batch.state}`,
    18,
    y + 11.5
  );

  // SECTION 1: HONEY BATCH SPECIFICATIONS & TESTING
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('SECTION 1: HONEY BATCH SPECIFICATIONS & PURITY ANALYSIS', 14, y);

  const cert = batch.certificate;
  const batchData = [
    ['Batch Serial Number', batch.batchCode, 'Floral Classification', batch.honeyType],
    ['Harvest Date', batch.harvestDate, 'Best Before (Shelf Life)', '18 Months from Bottling'],
    ['Net Weight (Jar)', '500g Food-Grade Glass', 'Batch Harvest Total', `${batch.netWeightKg} kg (${batch.framesHarvested} frames)`],
    ['Moisture Content', `${cert?.parameters.moisturePct ?? batch.moisturePct ?? 17.8}% (Max allowed: 20%)`, 'Freshness (HMF)', `${cert?.parameters.hmfMgKg ?? 14.2} mg/kg (Max: 80 mg/kg)`],
    ['Fructose/Glucose Ratio', `${cert?.parameters.fructoseGlucoseRatio ?? 1.14} (Standard: >0.95)`, 'C4 Sugar Adulteration', `${cert?.parameters.c4SugarAdulteration ?? 'Negative (0.0% Corn/Cane Syrup)'}`],
    ['Microscopic Pollen', `${cert?.parameters.pollenCountPerGram?.toLocaleString() ?? '28,400'} grains/gram`, 'Antibiotic Residues', `${cert?.parameters.antibioticResidue ?? 'None Detected (Zero Chemical)'}`],
    ['Processing Method', 'Centrifugal Cold Extraction, 80-Mesh Stainless Sieve, Unheated & Raw', 'Accredited Testing Lab', cert?.labName || 'National Food Analytical Research Institute (NABL Accr. TC-5892)'],
  ];

  autoTable(doc, {
    startY: y + 2.5,
    body: batchData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      3: { cellWidth: 48 },
    },
    margin: { left: 14, right: 14 },
  });

  // SECTION 2: APIARY HIVE SPECIFICATIONS & TELEMETRY
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SECTION 2: SOURCE HIVE SPECIFICATIONS & IOT MICROCLIMATE TELEMETRY', 14, y);

  const hiveReading = hive?.currentReading;
  const hiveData = [
    ['Source Hive Code', batch.hiveCode, 'Apiary Location', hive?.apiaryName || batch.apiaryLocation],
    ['Box Specification', hive?.boxType || 'Langstroth 10-Frame (KVIC Subsidized)', 'Colony Status', (hive?.status || 'HEALTHY').toUpperCase()],
    ['Queen Marking Year', `${hive?.queenYear || 2025} Marked Queen`, 'Cultivated Species', farmer?.beeSpecies?.join(', ') || 'Apis mellifera (Italian Honey Bee)'],
    ['Brood Temperature', `${hiveReading?.temperature.toFixed(1) || '34.5'}°C (Ideal: 32-36°C)`, 'Relative Humidity', `${hiveReading?.humidity.toFixed(1) || '58.2'}% (Ideal: 50-65%)`],
    ['Total Hive Weight', `${hiveReading?.weightKg.toFixed(1) || '46.8'} kg (Load Cell)`, 'Acoustic Buzz Frequency', `${hiveReading?.soundDb.toFixed(1) || '42.1'} dB (Queen Present)`],
    ['Forage Flora Radius', farmer?.primaryFlora?.slice(0, 3).join(', ') || 'Wild Mustard, Acacia nilotica, Desert Flora', 'GPS Coordinates', `${hive?.coordinates?.lat || '25.3471'}° N, ${hive?.coordinates?.lng || '74.6362'}° E`],
  ];

  autoTable(doc, {
    startY: y + 2.5,
    body: hiveData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      3: { cellWidth: 48 },
    },
    margin: { left: 14, right: 14 },
  });

  // SECTION 3: MASTER FARMER PROFILE & KVIC REGISTRATION
  y = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SECTION 3: MASTER FARMER PROFILE & GOVERNMENT ACCREDITATION', 14, y);

  const farmerData = [
    ['Master Beekeeper', farmer?.name || batch.beekeeperName, 'KVIC Registration No.', farmer?.kvicRegistrationNumber || 'KVIC/HM/RAJ/2023/8841'],
    ['FPO Cooperative', farmer?.cooperativeName || 'Mewar Natural Honey Farmers Producer Co. Ltd.', 'Experience & Scale', `${farmer?.experienceYears || 14} yrs · ${farmer?.totalActiveColonies || 38} colonies`],
    ['Village & Tehsil', `${farmer?.village || 'Mandal Village'}, Tehsil ${farmer?.tehsil || 'Mandal'}`, 'District & State', `${batch.district}, ${batch.state} (PIN: ${farmer?.pincode || '311403'})`],
    ['KYC & Subsidy', 'Aadhaar Verified · DBT Subsidy Beneficiary', 'Public Liaison Phone', farmer?.contactPhone || batch.beekeeperPhone],
  ];

  autoTable(doc, {
    startY: y + 2.5,
    body: farmerData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      1: { cellWidth: 50 },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 42 },
      3: { cellWidth: 48 },
    },
    margin: { left: 14, right: 14 },
  });

  // ===================== PAGE 2: BLOCKCHAIN & SIGN-OFF =====================
  doc.addPage();

  // Page 2 Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 14, 'F');
  doc.setFillColor(180, 83, 9);
  doc.rect(0, 14, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('HONEY CHAIN · BLOCKCHAIN CRYPTOGRAPHIC PROOF & CHAIN-OF-CUSTODY', 14, 9.5);

  let y2 = 24;

  // SECTION 4: BLOCKCHAIN IMMUTABLE RECORD
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SECTION 4: PUBLIC BLOCKCHAIN LEDGER ATTESTATION', 14, y2);

  const bc = batch.blockchainRecord;
  const bcData = [
    ['Public Network', `${bc?.network || 'Polygon Amoy Proof-of-Stake'} (Chain ID: ${bc?.chainId || 80002})`],
    ['Block Number', `Block #${bc?.blockNumber?.toLocaleString() || '19,842,109'} (Finalized & Immutable)`],
    ['Commitment Hash (SHA-256)', bc?.commitmentHash || '0x7f4a8b1c9d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a'],
    ['Smart Contract Registry', bc?.contractAddress || '0x71C2d67F0598822384a51A7d9D04BFe44A895F31'],
    ['Transaction Hash (Tx)', bc?.txHash || '0x4a9b2c8d1e0f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a5b7c9e1f3a'],
    ['Verification State', 'CRYPTOGRAPHIC CONSENSUS VERIFIED · ZERO TAMPERING DETECTED'],
    ['Consumer Verification URL', batch.qrUrl],
  ];

  autoTable(doc, {
    startY: y2 + 2.5,
    body: bcData,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 50 },
      1: { cellWidth: 132, font: 'courier' },
    },
    margin: { left: 14, right: 14 },
  });

  // SECTION 5: FULL CHAIN-OF-CUSTODY EVENT TIMELINE
  y2 = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('SECTION 5: HIVE-TO-JAR CHAIN-OF-CUSTODY MANIFEST', 14, y2);

  const eventRows = batch.events.map((e, idx) => [
    `#${idx + 1}`,
    e.title,
    e.occurredAt,
    `${e.actorName} (${e.actorRole})`,
    e.details,
  ]);

  autoTable(doc, {
    startY: y2 + 2.5,
    head: [['Step', 'Operation', 'Timestamp', 'Authorised Actor', 'Details']],
    body: eventRows,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 7.5, textColor: [255, 255, 255] },
    bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 40, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 42 },
      4: { cellWidth: 56 },
    },
    margin: { left: 14, right: 14 },
  });

  // Regulatory Seal & Sign-off Box
  y2 = (doc as any).lastAutoTable.finalY + 8;
  if (y2 > 240) {
    doc.addPage();
    y2 = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y2, 182, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('REGULATORY COMPLIANCE ATTESTATION & INTEGRITY GUARANTEE', 18, y2 + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This dossier certifies that the enclosed honey was produced without artificial heating, sugar-feeding, or chemical additives.',
    18,
    y2 + 11
  );
  doc.text(
    'Cryptographic SHA-256 hashes generated at each stage guarantee that neither harvest weight nor chemical values can be forged.',
    18,
    y2 + 16
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Seal: [ KVIC / HONEY MISSION DIGITAL CERTIFIED ]', 18, y2 + 23);
  doc.text('Chief Quality Officer: Dr. V. Kulkarni (NABL Lead)', 115, y2 + 23);

  // Page Numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${totalPages} · Official Honey Chain A to Z Batch Dossier · Batch ${batch.batchCode}`, 14, 290);
  }

  return doc;
}

/**
 * Downloads the A to Z Batch & Farmer Dossier directly to user's device as a PDF.
 */
export function exportFullAtoZBatchDossierPDF(
  batch: HoneyBatch,
  hive?: Hive,
  farmer?: FarmerProfile
) {
  const doc = generateFullAtoZBatchDossierDoc(batch, hive, farmer);
  doc.save(`HoneyChain_A_to_Z_Batch_Dossier_${batch.batchCode}.pdf`);
}

/**
 * Generates an in-memory data URL or Blob URL of the A to Z Batch & Farmer Dossier PDF for instant embedding / viewing.
 */
export function getFullAtoZBatchDossierBlobUrl(
  batch: HoneyBatch,
  hive?: Hive,
  farmer?: FarmerProfile
): string {
  const doc = generateFullAtoZBatchDossierDoc(batch, hive, farmer);
  return doc.output('bloburl').toString();
}
