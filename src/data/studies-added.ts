import type { StudyCandidate } from './studies'

/*
 * Studies added 2026-10-08, chosen from PubMed search results (tools/pubmed-candidates.mjs).
 * `plain` is OUR one- or two-sentence description of what the study was, written from its PubMed title and
 * abstract. It says what was tested and in what (cells, animals or people). Where the abstract states a
 * null or negative result, we say so. It never gives a dose, a use, or advice.
 * Every PMID is re-checked against NCBI at build time by tools/verify-pmids.ts.
 */
export const ADDED_CANDIDATES: StudyCandidate[] = [
  // ---- TB-500 (the 7-amino-acid fragment; full-length thymosin β4 is a separate record)
  { pmid: '22962027', expectKeyword: 'TB-500', compounds: ['tb-500'], speciesFromTitle: null, studyType: 'in-vitro', tags: [],
    plain: 'Chemists worked out what is in a product sold as TB-500: a seven-amino-acid fragment of thymosin β4. They also built a lab method to detect it in blood and urine. This is an identification study, not a test of any effect.' },
  { pmid: '38382158', expectKeyword: 'TB-500', compounds: ['tb-500'], speciesFromTitle: 'rat', studyType: 'animal', tags: ['wound-healing'],
    plain: 'Measured TB-500 and its breakdown products in lab samples and in rats, then screened each one in a wound-healing test on cells. Only one breakdown product showed activity. The authors suggest earlier reports about TB-500 may be due to that product rather than TB-500 itself.' },

  // ---- GHK-Cu
  { pmid: '17147644', expectKeyword: 'ulcers', compounds: ['ghk-cu'], speciesFromTitle: 'human', studyType: 'controlled-human', tags: ['wound-healing'],
    plain: 'A 1994 randomized, placebo-controlled trial of a GHK-copper gel on diabetic foot ulcers. The gel was put on the skin alongside standard wound care. It tested a finished topical product, not a vial of research peptide.' },
  { pmid: '29986520', expectKeyword: 'GHK-Cu', compounds: ['ghk-cu'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review that gathers lab and animal findings on GHK-Cu, skin repair and gene activity. A review sums up other studies. It is not a new experiment.' },
  { pmid: '38879894', expectKeyword: 'silicosis', compounds: ['ghk-cu'], speciesFromTitle: null, studyType: 'animal', tags: [],
    plain: 'A mouse study of GHK-Cu in a model of lung scarring caused by silica dust. A result in mice does not show what happens in people.' },

  // ---- KPV
  { pmid: '18061177', expectKeyword: 'KPV', compounds: ['kpv'], speciesFromTitle: null, studyType: 'animal', tags: ['mechanistic'],
    plain: 'Tested how the three-amino-acid peptide KPV gets into gut cells through a transporter called PepT1. It used human cell lines and two mouse models of colitis.' },
  { pmid: '18092346', expectKeyword: 'KPV', compounds: ['kpv'], speciesFromTitle: 'mouse', studyType: 'animal', tags: [],
    plain: 'Tested KPV in two mouse models of inflammatory bowel disease.' },
  { pmid: '12750433', expectKeyword: 'KPV', compounds: ['kpv'], speciesFromTitle: null, studyType: 'animal', tags: ['mechanistic'],
    plain: 'Compared KPV with related hormone fragments in a mouse model of sudden inflammation. The authors concluded KPV probably does not act through the same receptors as its parent hormone.' },

  // ---- LL-37
  { pmid: '27117377', expectKeyword: 'LL-37', compounds: ['ll-37'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of LL-37, the only human member of a family of germ-fighting peptides the body makes. It covers how LL-37 attacks microbes and how it signals to immune cells.' },
  { pmid: '36769137', expectKeyword: 'LL-37', compounds: ['ll-37'], speciesFromTitle: 'human', studyType: 'in-vitro', tags: [],
    plain: 'A lab study on human platelets (a type of blood cell) outside the body. It looked at how LL-37 changes their germ-fighting activity.' },
  { pmid: '38642493', expectKeyword: 'LL-37', compounds: ['ll-37'], speciesFromTitle: null, studyType: 'in-vitro', tags: [],
    plain: 'A cell study showing that vitamin D raises production of the protein LL-37 is cut from. It also notes that LL-37 can be toxic to the body’s own bone cells in a dish.' },

  // ---- Thymosin α1
  { pmid: '11381492', expectKeyword: 'Thymosin alpha-1', compounds: ['thymosin-alpha-1'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A 2001 pharmacy review of thymosin alpha-1 as a drug candidate: how it is thought to work, how the body handles it, and the hepatitis B and C trials running at the time.' },
  { pmid: '30063866', expectKeyword: 'sepsis', compounds: ['thymosin-alpha-1'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of clinical studies that gave thymosin alpha 1 to hospital patients with sepsis, a life-threatening reaction to infection.' },
  { pmid: '30063864', expectKeyword: 'thymosin alpha 1', compounds: ['thymosin-alpha-1'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of how much thymosin alpha 1 is naturally in the blood, in health and in illness. The authors say basic questions about normal levels are still open.' },

  // ---- Epitalon
  { pmid: '40141333', expectKeyword: 'Epitalon', compounds: ['epitalon'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A 2025 overview of Epitalon, a four-amino-acid peptide modeled on an extract of cow pineal gland. It collects the lab and animal work to date.' },
  { pmid: '12937682', expectKeyword: 'Epithalon', compounds: ['epitalon'], speciesFromTitle: 'human', studyType: 'in-vitro', tags: [],
    plain: 'A 2003 lab study in cultured human fetal cells. The authors reported that adding the peptide switched on telomerase, an enzyme that lengthens the ends of chromosomes. Cells in a dish are not a body.' },
  { pmid: '32019204', expectKeyword: 'Epitalon', compounds: ['epitalon'], speciesFromTitle: null, studyType: 'in-vitro', tags: ['mechanistic'],
    plain: 'A lab study of how the peptide changes gene activity while stem cells turn into nerve cells, with a proposed explanation of how.' },

  // ---- MOTS-c
  { pmid: '25738459', expectKeyword: 'MOTS-c', compounds: ['mots-c'], speciesFromTitle: null, studyType: 'animal', tags: [],
    plain: 'The 2015 paper that first described MOTS-c, a peptide coded in the mitochondria’s own DNA. In mice, the authors reported it prevented diet-related obesity and insulin resistance. The work was done in cells and mice.' },
  { pmid: '33473109', expectKeyword: 'MOTS-c', compounds: ['mots-c'], speciesFromTitle: null, studyType: 'animal', tags: [],
    plain: 'A study of MOTS-c and exercise. In people, exercise raised the body’s own MOTS-c in muscle and blood. The peptide itself was given only to mice, where older mice showed better physical capacity.' },
  { pmid: '36761202', expectKeyword: 'MOTS-c', compounds: ['mots-c'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of MOTS-c research in metabolism and aging.' },

  // ---- SS-31 (elamipretide)
  { pmid: '37268435', expectKeyword: 'Elamipretide', compounds: ['ss-31'], speciesFromTitle: 'human', studyType: 'controlled-human', tags: [],
    plain: 'A phase 3 randomized trial of elamipretide (SS-31) in people with primary mitochondrial myopathy, a genetic muscle disease. It did not improve walking distance or fatigue at 24 weeks compared with placebo. It was well tolerated.' },
  { pmid: '39940712', expectKeyword: 'Elamipretide', compounds: ['ss-31'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A 2025 review of elamipretide: its structure, how it is thought to act on mitochondria, and where it has been tested.' },
  { pmid: '31747905', expectKeyword: 'Elamipretide', compounds: ['ss-31'], speciesFromTitle: 'mouse', studyType: 'animal', tags: [],
    plain: 'A mouse study of memory problems triggered by a bacterial toxin, and whether SS-31 changed them.' },

  // ---- Humanin
  { pmid: '19997871', expectKeyword: 'Humanin', compounds: ['humanin'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of humanin, a 24-amino-acid peptide first noticed for protecting nerve cells in lab models related to Alzheimer’s disease, and of the receptors it binds.' },
  { pmid: '27082450', expectKeyword: 'Humanin', compounds: ['humanin'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A review of how humanin interacts with the growth factor IGF-I. Humanin was the first new peptide found coded in mitochondrial DNA in over thirty years.' },
  { pmid: '40877234', expectKeyword: 'HUMANIN', compounds: ['humanin'], speciesFromTitle: 'human', studyType: 'in-vitro', tags: [],
    plain: 'A study of human immune cells called macrophages. It found they make humanin while clearing away dead cells.' },

  // ---- Selank
  { pmid: '18454096', expectKeyword: 'selank', compounds: ['selank'], speciesFromTitle: null, studyType: 'controlled-human', tags: [],
    plain: 'A 2008 randomized study of 62 patients with anxiety disorders, comparing Selank with the tranquilizer medazepam. Published in Russian.' },
  { pmid: '28280289', expectKeyword: 'Selank', compounds: ['selank'], speciesFromTitle: 'rat', studyType: 'animal', tags: [],
    plain: 'A rat study of Selank given together with diazepam under long-term mild stress.' },
  { pmid: '26924987', expectKeyword: 'Selank', compounds: ['selank'], speciesFromTitle: null, studyType: null, tags: ['mechanistic'],
    plain: 'A study of which genes linked to GABA nerve signaling change their activity within an hour of Selank being given.' },

  // ---- Semax
  { pmid: '24661604', expectKeyword: 'semax', compounds: ['semax'], speciesFromTitle: 'rat', studyType: 'animal', tags: [],
    plain: 'A rat study of stroke-like brain injury. It tracked which immune and blood-vessel genes changed activity after Semax.' },
  { pmid: '32342318', expectKeyword: 'Semax', compounds: ['semax', 'selank'], speciesFromTitle: null, studyType: null, tags: [],
    plain: 'A brain-imaging study in 52 healthy volunteers who received Semax, Selank or a placebo. It looked at changes in the resting connections between brain regions.' },
  { pmid: '41171324', expectKeyword: 'Semax', compounds: ['semax'], speciesFromTitle: 'rat', studyType: 'in-vitro', tags: [],
    plain: 'A lab study on slices of rat brain. It measured calcium signals inside nerve cells after Semax was applied.' },

  // ---- Pinealon
  { pmid: '21978084', expectKeyword: 'Pinealon', compounds: ['pinealon'], speciesFromTitle: null, studyType: 'in-vitro', tags: [],
    plain: 'A cell study. The authors reported that pinealon limited the build-up of reactive oxygen molecules in several cell types put under stress.' },
  { pmid: '22567179', expectKeyword: 'Pinealon', compounds: ['pinealon'], speciesFromTitle: 'rat', studyType: 'animal', tags: [],
    plain: 'A rat study of offspring whose mothers were fed a high-methionine diet during pregnancy. Some also received pinealon.' },

  // ---- Ipamorelin
  { pmid: '9849822', expectKeyword: 'Ipamorelin', compounds: ['ipamorelin'], speciesFromTitle: null, studyType: null, tags: [],
    plain: 'The 1998 paper that introduced ipamorelin, a five-amino-acid compound that triggers growth hormone release. It was tested in cells and animals.' },
  { pmid: '10496658', expectKeyword: 'ipamorelin', compounds: ['ipamorelin'], speciesFromTitle: 'human', studyType: 'controlled-human', tags: [],
    plain: 'A trial in healthy volunteers that measured how the body handles ipamorelin and how growth hormone levels respond. It was given by infusion in a clinic.' },
  { pmid: '25331030', expectKeyword: 'ipamorelin', compounds: ['ipamorelin'], speciesFromTitle: null, studyType: 'controlled-human', tags: [],
    plain: 'A small phase 2 randomized trial of ipamorelin for slow bowel recovery after bowel surgery. It found no significant difference from placebo. It was well tolerated.' },

  // ---- CJC-1295 (our record is the no-DAC form)
  { pmid: '16352683', expectKeyword: 'CJC-1295', compounds: ['cjc-1295'], speciesFromTitle: 'human', studyType: 'controlled-human', tags: [],
    plain: 'A randomized trial in healthy adults of the long-acting form of CJC-1295. It measured hormone levels for up to 28 days. This is not the no-DAC form on this page, so its findings do not carry over.' },
  { pmid: '34665524', expectKeyword: 'growth hormone releasing hormone', compounds: ['cjc-1295'], speciesFromTitle: null, studyType: null, tags: [],
    plain: 'An anti-doping lab paper on better ways to detect synthetic copies of growth-hormone-releasing hormone, the group CJC-1295 belongs to. These are banned in sport.' },

  // ---- Sermorelin
  { pmid: '18031173', expectKeyword: 'Sermorelin', compounds: ['sermorelin'], speciesFromTitle: null, studyType: 'review', tags: [],
    plain: 'A 1999 review of sermorelin, a 29-amino-acid copy of the active part of the body’s growth-hormone-releasing hormone. It covers its medical use to diagnose and treat growth hormone deficiency in children.' },
  { pmid: '33842627', expectKeyword: 'sermorelin', compounds: ['sermorelin'], speciesFromTitle: null, studyType: null, tags: [],
    plain: 'A computer screen of tumor gene data from glioma patients that flagged sermorelin as a candidate worth testing. This is a data-mining result, not a treatment trial.' },
]
