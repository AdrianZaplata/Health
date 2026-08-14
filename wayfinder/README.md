# Wayfinder tracker (local-markdown)

This repo has no external issue tracker, so the wayfinder map lives here as markdown.

## Wayfinding operations

- **The map** is [`map.md`](./map.md) (label `wayfinder:map`). It is an index, not a store — decisions live in their tickets.
- **Tickets** are files in [`tickets/`](./tickets/), named `NNN-slug.md`. The `NNN` id is the ticket's identity; its `title` frontmatter field is its name — refer to tickets by name, never by bare id.
- **Ticket frontmatter** carries the tracker state:
  - `status: open | closed`
  - `assignee:` — a non-empty assignee on an open ticket **is** the claim; empty means unclaimed.
  - `type: research | prototype | grilling | task` (the `wayfinder:<type>` label)
  - `mode: HITL | AFK`
  - `blocked-by: [NNN, ...]` — ids of tickets that must close first.
- **Frontier query**: open tickets whose `blocked-by` lists only closed tickets and whose `assignee` is empty. In practice: `grep -l "status: open" wayfinder/tickets/*.md` then check blockers.
- **Resolution**: append a `## Resolution` section to the ticket, set `status: closed`, and add a one-line gist to the map's *Decisions so far*.
- **Assets** (research findings, prototypes) live in [`research/`](./research/) and are linked from their ticket, not pasted in. (This repo keeps research on the main working branch rather than throwaway branches, since the tracker itself is in-repo.)
