export type PartnerLogo = {
  name: string;
  alt: string;
  href?: string;
  imageSrc?: string;
  textOnly?: boolean;
};

export type LogosMode = "auto" | "standards" | "partners" | "hidden" | "sample";

export type StandardItem = {
  key: "soc2" | "hipaa" | "oversight";
  label: string;
  status: string;
};

export const logosConfig: { mode: LogosMode } = {
  mode: "auto",
};

export const partnerLogos: PartnerLogo[] = [];

export const samplePartners: PartnerLogo[] = [
  {
    name: "Sample partner",
    alt: "Sample partner logo (placeholder)",
    textOnly: true,
  },
  {
    name: "Sample clinic network",
    alt: "Sample clinic network logo (placeholder)",
    textOnly: true,
  },
];

export const standards: StandardItem[] = [
  {
    key: "soc2",
    label: "SOC 2 Type II",
    status: "Program in progress",
  },
  {
    key: "hipaa",
    label: "HIPAA-aligned controls",
    status: "Policies documented",
  },
  {
    key: "oversight",
    label: "Human oversight",
    status: "Clinician review required",
  },
];
