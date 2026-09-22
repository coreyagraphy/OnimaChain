# Molecule visual sources

The collection must never substitute one product's molecule for another. A card can show one of three honest states:

1. deposited C-alpha coordinates;
2. a sequence-derived conformer labeled as an illustration; or
3. “No single molecule” when the product is a blend, mixture, non-peptide, or not yet verified.

Surface grain, lighting, glow, and color are artistic. They are not atom colors, electron density, or evidence of biological behavior.

## Deposited models bundled into the renderer

| Product | Sequence / coordinate source | What is rendered |
| --- | --- | --- |
| Semaglutide | [RCSB PDB 7KI0](https://www.rcsb.org/structure/7KI0) | Chain P C-alpha coordinates for the resolved receptor-bound core; the one unresolved terminal residue is modeled from the verified sequence. |
| Tirzepatide | [RCSB PDB 7FIM](https://www.rcsb.org/structure/7FIM) | Chain P C-alpha coordinates for the resolved receptor-bound core; the flexible C-terminal tail is modeled from the verified sequence. |
| Retatrutide / GLP3 | [RCSB PDB 8YW5](https://www.rcsb.org/structure/8YW5) | Chain P C-alpha coordinates for the resolved receptor-bound core; the flexible C-terminal tail is modeled from the verified sequence. |
| Follistatin 344 | [UniProt P19883](https://www.uniprot.org/uniprotkb/P19883-1/entry), [AlphaFold DB P19883](https://alphafold.ebi.ac.uk/entry/P19883) | The full 344-residue canonical precursor sequence and AlphaFold model v6. This is a prediction, not an experimental structure. |

## Verified sequences and modifications added in this pass

| Product | Record used |
| --- | --- |
| GHRP-2 / pralmorelin | [PubChem CID 6918245](https://pubchem.ncbi.nlm.nih.gov/compound/GHRP-2): `H-D-Ala-D-2Nal-Ala-Trp-D-Phe-Lys-NH2`. |
| AOD-9604 | [FDA PCAC record](https://www.fda.gov/media/183891/download): 16 residues with a cyclic Cys7–Cys14 disulfide. |
| Semaglutide | PDB 7KI0 sequence plus regulator-listed Aib and lipid-tether positions. |
| Tirzepatide | PDB 7FIM sequence plus regulator-listed Aib, lipid-tether, and terminal-amide positions. |
| Retatrutide / GLP3 | PDB 8YW5 resolved sequence plus the full 39-residue sequence and modifications disclosed for LY3437943. |

Any future structure change should update this file and include the accession, resolved residue range, modification positions, and whether missing residues were modeled.
