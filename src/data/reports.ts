import type { GoalId } from './goals'

/*
 * What people report online (Reddit, YouTube, forums, podcasts), per compound and goal.
 *
 * Rules for adding a report:
 *   - It must link to the real public post or video (url). No link, no entry.
 *   - `says` is a short, fair summary of what that person described, in their words where possible.
 *   - `outcome` is how THEY described it, not our judgement.
 *   - Never invent, merge or "clean up" reports. One entry per real post.
 * Bond Theory shows these next to the research, labelled as first-hand reports.
 */
export type Platform = 'reddit' | 'youtube' | 'forum' | 'podcast' | 'tiktok' | 'other'
export type ReportedOutcome = 'helped' | 'mixed' | 'no change' | 'bad reaction'

export interface CommunityReport {
  compound: string
  goal: GoalId
  platform: Platform
  url: string
  /** Where it was posted, e.g. "r/Peptides" or the channel name. */
  where: string
  date: string
  says: string
  outcome: ReportedOutcome
  /** Other things the person was taking or doing at the same time, if they said. */
  alongside?: string[]
}

export const COMMUNITY_REPORTS: CommunityReport[] = []

export function reportsFor(compound: string, goal?: GoalId): CommunityReport[] {
  return COMMUNITY_REPORTS.filter((r) => r.compound === compound && (!goal || r.goal === goal))
}
