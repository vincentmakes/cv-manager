# Timeline

The timeline is automatically generated from your work experiences. It displays:

- Company logos (or company names if no logo is set)
- Job titles
- Date ranges
- Country flags (when the country changes between experiences)

## Timeline Click Navigation

Clicking any item on the timeline scrolls you to the corresponding experience card and highlights it briefly.

## Parallel Jobs (Timeline Branching)

When two or more work experiences overlap in time, the timeline can automatically render them as **parallel tracks**:

- The concurrent position splits onto a **branch track** above the main timeline
- **S-curve connectors** visually show where the branch forks from and merges back to the main track
- If a parallel position is ongoing (no end date), the branch line extends to the right edge of the timeline
- Cards for branch-track items are positioned separately to avoid overlapping with main-track cards

No configuration is needed — branching is fully automatic based on your experience dates.

### When does a branch get created?

A branch is created when two experiences overlap by **3 or more months**. This threshold filters out brief transitions (starting a new job a month or two before leaving the old one) while correctly showing genuinely concurrent positions.

**Short-duration exceptions:** If an experience is very short (e.g., a 2-month acting role) and falls entirely within the date range of another position, it will always appear on the branch — even if its duration is less than 3 months. The key is that its entire span is contained within the other position's dates.

### When does a branch stay continuous?

If you hold one long-running position (e.g., a part-time or side role) alongside a series of sequential main positions, the branch stays **continuous** — one single branch line running parallel to the main track. Even if one of the sequential positions is too short to meet the overlap threshold on its own, the branch won't merge back and re-fork as long as the same long-running position is the common anchor.

### When is a branch NOT created?

- **Overlaps of 1–2 months** between two long positions are treated as job transitions, not parallel employment. This is the most common case — you start a new role shortly before your notice period ends at the old one.
- **No overlap at all** — sequential positions with no date overlap stay on the main track.
- **Insufficient horizontal space** — if the timeline is very compressed (many items in a short width), branches that would be too narrow to display clearly are automatically flattened back to the main track.

## Timeline Date Format

By default, the timeline shows years only (e.g., "2020 - 2023"). You can change this in **Settings → Advanced → Timeline: Years Only**. When disabled, the timeline uses the same date format as the rest of your CV.
