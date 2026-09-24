import { useEffect, useState } from 'react'
import { publicOperator } from '~/operator'

type PublicOperator = { operator: string; email: string }

export function OperatorIdentity() {
  const [identity, setIdentity] = useState<PublicOperator>({ operator: publicOperator.name, email: publicOperator.email })

  useEffect(() => {
    let active = true
    fetch('/api/editorial')
      .then(response => response.ok ? response.json() as Promise<Partial<PublicOperator>> : {} as Partial<PublicOperator>)
      .then(value => {
        if (active && value.operator && value.email) setIdentity({ operator: value.operator, email: value.email })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return <div className="mv-operator relative mt-4">
    <span className="mv-operator-kicker">PUBLIC OPERATOR</span>
    <strong className="mv-operator-name">{identity.operator}</strong>
    <a href={`mailto:${identity.email}`}>{identity.email}</a>
  </div>
}
