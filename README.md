# History Inside Studio

A semi-automated content production system for historical analysis channels.

## What this is
This repository is a **production system**, not a single project.

It automates:
- Script structuring
- Cut-based SSML generation
- Image prompt generation (18th century engraving style)
- Voice generation (EdgeTTS – local)
- Draft video composition (moviepy)
- Metadata, thumbnail text, pinned comments

Final creative judgment remains human.

## Philosophy
- Structure over narration
- Analysis over opinion
- Automation of labor, not thought

## Quick Start
1. Deploy `/frontend` to Cloudflare Pages
2. Deploy `/worker` using Wrangler
3. Generate scripts and assets via dashboard
4. Run video automation locally

See `/docs/WORKFLOW.md`
