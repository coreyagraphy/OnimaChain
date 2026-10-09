/**
 * Official (non-PubMed) records attached to educational molecule records.
 * These are FDA application overviews and DailyMed searches — not invented
 * labels, not off-label marketing, and not a substitute for the full PI.
 * Quote only indications retrieved from those records.
 */

export type OfficialKind = "fda-application" | "dailymed-index";

export interface OfficialSource {
  id: string;
  compounds: string[];
  kind: OfficialKind;
  title: string;
  identifier: string;
  url: string;
  retrieved: string;
  /** Verbatim or closely paraphrased indication from the cited record. */
  indication: string;
  limitation?: string;
}

export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    id: "fda-ozempic-209637",
    compounds: ["semaglutide"],
    kind: "fda-application",
    title: "Ozempic (semaglutide) — Drugs@FDA application overview",
    identifier: "NDA 209637",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=209637",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved (2017) as Ozempic for type 2 diabetes. The current DailyMed label lists it as a GLP-1 receptor agonist used with diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.",
    limitation:
      "Approved uses are brand- and indication-specific; this educational record is not a product listing.",
  },
  {
    id: "dailymed-ozempic",
    compounds: ["semaglutide"],
    kind: "dailymed-index",
    title: "Ozempic (semaglutide) — DailyMed label index",
    identifier: "DailyMed query OZEMPIC",
    url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=OZEMPIC",
    retrieved: "2026-09-21",
    indication:
      "OZEMPIC (semaglutide) injection, for subcutaneous use. Initial U.S. approval: 2017. Boxed warning for rodent thyroid C-cell tumors; human relevance unknown.",
  },
  {
    id: "fda-wegovy-215256",
    compounds: ["semaglutide"],
    kind: "fda-application",
    title: "Wegovy (semaglutide) — Drugs@FDA application overview",
    identifier: "NDA 215256",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215256",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved (2021) as Wegovy, a separate semaglutide brand for chronic weight management in eligible patients. Approval cannot be transferred to other formulations.",
  },
  {
    id: "fda-mounjaro-215866",
    compounds: ["tirzepatide"],
    kind: "fda-application",
    title: "Mounjaro (tirzepatide) — Drugs@FDA application overview",
    identifier: "NDA 215866",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=215866",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved (2022) as Mounjaro, a product-specific tirzepatide brand for type 2 diabetes. Consult the linked current FDA label for eligible ages, uses, and limitations; this record does not certify another preparation.",
    limitation: "Boxed warning for thyroid C-cell tumors in rats; human relevance not determined.",
  },
  {
    id: "dailymed-mounjaro",
    compounds: ["tirzepatide"],
    kind: "dailymed-index",
    title: "Mounjaro (tirzepatide) — DailyMed label index",
    identifier: "DailyMed query MOUNJARO",
    url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=MOUNJARO",
    retrieved: "2026-09-21",
    indication:
      "MOUNJARO (tirzepatide) injection, for subcutaneous use. Dual GIP and GLP-1 receptor agonist. Initial U.S. approval: 2022.",
  },
  {
    id: "fda-zepbound-217806",
    compounds: ["tirzepatide"],
    kind: "fda-application",
    title: "Zepbound (tirzepatide) — Drugs@FDA application overview",
    identifier: "NDA 217806",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=217806",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved as Zepbound, a tirzepatide brand for chronic weight management in eligible patients. Approval is specific to the labeled product and indication.",
  },
  {
    id: "fda-egrifta-022505",
    compounds: ["tesamorelin"],
    kind: "fda-application",
    title: "Egrifta (tesamorelin) — Drugs@FDA application overview",
    identifier: "NDA 022505",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=022505",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved as Egrifta / EGRIFTA WR for reduction of excess abdominal fat in HIV-infected adults with lipodystrophy.",
    limitation:
      "The label states it is not indicated for weight-loss management and has a weight-neutral effect. Long-term cardiovascular safety has not been established.",
  },
  {
    id: "dailymed-egrifta",
    compounds: ["tesamorelin"],
    kind: "dailymed-index",
    title: "EGRIFTA WR (tesamorelin) — DailyMed label index",
    identifier: "DailyMed query EGRIFTA",
    url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=EGRIFTA",
    retrieved: "2026-09-21",
    indication:
      "EGRIFTA WR is indicated for the reduction of excess abdominal fat in HIV-infected adult patients with lipodystrophy. Not indicated for weight loss management.",
  },
  {
    id: "fda-vyleesi-210557",
    compounds: ["pt-141"],
    kind: "fda-application",
    title: "Vyleesi (bremelanotide) — Drugs@FDA application overview",
    identifier: "NDA 210557",
    url: "https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=210557",
    retrieved: "2026-09-21",
    indication:
      "FDA-approved (2019) as Vyleesi for acquired, generalized hypoactive sexual desire disorder (HSDD) in premenopausal women.",
    limitation:
      "Not approved as a general sexual-performance product. The label excludes use when low desire is due to a co-existing medical or psychiatric condition, relationship problem, or substance.",
  },
  {
    id: "dailymed-vyleesi",
    compounds: ["pt-141"],
    kind: "dailymed-index",
    title: "Vyleesi (bremelanotide) — DailyMed label index",
    identifier: "DailyMed query VYLEESI",
    url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=VYLEESI",
    retrieved: "2026-09-21",
    indication:
      "VYLEESI (bremelanotide injection), for subcutaneous use. Initial U.S. approval: 2019. Contraindicated in uncontrolled hypertension or known cardiovascular disease.",
  },
  {
    id: "fda-forzinity-2025",
    compounds: ["ss-31"],
    kind: "fda-application",
    title: "Forzinity (elamipretide) — FDA drug-trials snapshot",
    identifier: "FDA approval September 19, 2025",
    url: "https://www.fda.gov/drugs/drug-trials-snapshots/drug-trials-snapshots-forzinity",
    retrieved: "2026-09-23",
    indication: "FDA granted accelerated approval to Forzinity to improve muscle strength in adults and children with Barth syndrome weighing at least 30 kg.",
    limitation: "This is a product- and indication-specific approval. It does not establish a general benefit of elamipretide for aging or other mitochondrial conditions.",
  },
];

export function officialSourcesFor(slug: string): OfficialSource[] {
  return OFFICIAL_SOURCES.filter((s) => s.compounds.includes(slug));
}
