# Molecular-visual audit — 2026-09-22

The 36 catalog entries must not be represented by 36 invented experimental folds. This release distinguishes molecular identity from 3D pose and labels the source of every displayed structure.

| Group | Count | Treatment |
| --- | ---: | --- |
| Bundled deposited C-alpha coordinates | 3 | Semaglutide ([7KI0](https://www.rcsb.org/structure/7KI0)), tirzepatide ([7FIM](https://www.rcsb.org/structure/7FIM)), and retatrutide/GLP3 ([8YW5](https://www.rcsb.org/structure/8YW5)). Only resolved residues come from the deposit; missing tails are modeled and disclosed. |
| Bundled predicted coordinates | 1 | Follistatin-344, [AlphaFold P19883](https://alphafold.ebi.ac.uk/entry/P19883), labeled predicted rather than measured. |
| Recorded sequence, no bundled coordinate model | 21 | Residue-order and recorded modifications appear as an open-chain schematic, **not** a claimed fold. We removed the shared alpha-helix generator and its implied hydrogen bonds. |
| No single recorded sequence | 11 | No fabricated molecule. The Wolverine Blend has two separate BPC-157/TB-500 illustrations; Cerebrolysin and Thymalin are mixtures; NAD+ is not a peptide; the remaining seven are unresolved. |

AOD-9604's 16-residue sequence and Cys7–Cys14 disulfide are represented as a constrained, non-planar schematic, not a perfect hoop or an experimental pose ([PubChem](https://pubchem.ncbi.nlm.nih.gov/compound/AOD-9604)). PT-141/bremelanotide and Melanotan II share much of their backbone but differ in C-terminal chemistry: PT-141 is the free acid, Melanotan II is amidated ([FDA Vyleesi chemistry review](https://www.accessdata.fda.gov/drugsatfda_docs/nda/2019/210557Orig1s000ChemR.pdf); [PubChem Melanotan II](https://pubchem.ncbi.nlm.nih.gov/compound/92432)). Their visuals therefore must **not** be made radically different just for variety.

The three GLP-family deposited receptor-bound structures are genuinely related and can look similar. Different sequence lengths, Aib positions, lipid-tether positions, resolved coordinates, and provenance labels distinguish them; visual novelty must not override the underlying structural relationship.

Audit commands: `node tools/structure-inventory.mjs`, `node tools/structure-visual-test.mjs`, `npm run typecheck`. The inventory asserts all 25 recorded molecular identities are unique. The visual test checks all 36 card classifications, the two-peptide blend, non-peptide/mixture absence of invented models, and dossier states. The original homepage peptide fly-through and scroll zoom are unchanged.

Remaining data work: source and validate the seven unresolved single-peptide sequences (tesamorelin, hexarelin, GHRP-6, IGF-1 LR3, P21, pinealon, thymogen) and assess any suitable deposited or predicted structures before replacing their unresolved labels. A named PDB in a catalog record is not the same as bundling and rendering its coordinates.
