import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = ts.createSourceFile('compounds.ts', readFileSync('src/data/compounds.ts', 'utf8'), ts.ScriptTarget.Latest, true)
const conformers = readFileSync('src/data/conformers.ts', 'utf8')
const property = (node, key) => node.properties.find((p) => ts.isPropertyAssignment(p) && p.name.getText(source).replaceAll("'", '') === key)?.initializer
const value = (node) => node && ts.isStringLiteral(node) ? node.text : null
const list = source.statements.flatMap((statement) => {
  if (!ts.isVariableStatement(statement)) return []
  const declaration = statement.declarationList.declarations.find((item) => item.name.getText(source) === 'COMPOUNDS')
  return declaration && ts.isArrayLiteralExpression(declaration.initializer) ? declaration.initializer.elements : []
}).map((item) => {
  const slug = value(property(item, 'slug'))
  const sequence = value(property(item, 'sequence'))
  return {
    slug,
    sequenceLength: sequence?.length ?? null,
    source: value(property(item, 'structureSource')),
    bundledCoordinates: new RegExp(`(?:^|\\n)  (?:'${slug}'|${slug}): \\{ count:`, 'm').test(conformers),
    cyclic: property(item, 'cyclic')?.getText(source) ?? null,
    modCount: property(item, 'mods')?.elements?.length ?? 0,
    identity: sequence ? JSON.stringify({ sequence, cyclic: property(item, 'cyclic')?.getText(source) ?? null, mods: property(item, 'mods')?.getText(source) ?? null, metal: property(item, 'metal')?.getText(source) ?? null }) : null,
  }
})

console.table(list.map(({ identity, ...summary }) => summary))
console.log(JSON.stringify({ total: list.length, bundled: list.filter((item) => item.bundledCoordinates).length, sequenceOnly: list.filter((item) => item.sequenceLength && !item.bundledCoordinates).length, noSequence: list.filter((item) => !item.sequenceLength).length }, null, 2))
const identities = new Map()
for (const item of list) if (item.identity) identities.set(item.identity, [...(identities.get(item.identity) ?? []), item.slug])
const duplicateIdentities = [...identities.values()].filter((group) => group.length > 1)
if (duplicateIdentities.length) throw new Error(`Duplicate molecular identities: ${JSON.stringify(duplicateIdentities)}`)
console.log(`Unique recorded molecular identities: ${identities.size}; unresolved/composite: ${list.length - identities.size}`)
