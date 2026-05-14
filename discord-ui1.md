You are working inside my existing Next.js 15 app under the app router.

Current module:
- app/discord-intel/import/page.tsx
- app/discord-intel/timeline/page.tsx
- app/api/discord-intel/import/route.ts
- app/api/discord-intel/messages/route.ts
- lib/discord-intel/*

Current problem:
The timeline page mixes messages from all channels together. Each message card is too large and hard to read. Author names display as “Unknown”. Attachments are shown as bulky blocks instead of Discord-style inline media.

Goal:
Redesign /discord-intel/timeline into a Discord-like channel reader.

Target layout:
- Full-page app layout
- Left sidebar with server/category/channel tree
- Right main panel with selected channel messages
- Compact Discord-style message rows
- Inline attachments, especially images
- Sticky channel header
- Basic filters/search should remain available but should not dominate the UI

Do not implement AI, translation, OCR, pgvector, or semantic search in this task.

Use existing dependencies only:
- Next.js 15
- React 19
- lucide-react
- @supabase/supabase-js

Do not add new UI libraries.

==================================================
1. API changes
==================================================

Add a new API route:

app/api/discord-intel/sources/route.ts

GET /api/discord-intel/sources

It should return all imported Discord sources/channels.

Return shape:

{
  "items": [
    {
      "id": "...",
      "external_channel_id": "...",
      "external_server_id": "...",
      "server_name_clean": "美股会员网",
      "channel_name_clean": "六便士-股票中长线-s0",
      "category": null,
      "tags": [],
      "priority": 3,
      "enabled": true,
      "message_count": 103,
      "attachment_count": 12,
      "last_message_at": "2026-05-13T15:47:00Z"
    }
  ]
}

Implementation notes:
- Query discord_sources.
- Include message count and latest message timestamp from discord_messages.
- If counting attachments is too expensive, skip attachment_count or return 0 for now.
- Order by server_name_clean, category, channel_name_clean.
- Keep implementation simple and stable.

Update existing messages API if needed:

app/api/discord-intel/messages/route.ts

Support query params:
- channel_name_clean
- channelId
- sourceId
- q
- from
- to
- hasAttachments
- limit
- offset

Important:
- channelId should filter by external_channel_id.
- sourceId should filter by discord_sources.id.
- q should search content with simple ilike for now.
- Return messages newest first.
- Include source info.
- Include attachments.

Fix author display:
Current UI shows "Unknown". Use this fallback order:

author_global_name
author_username
author_external_id
"Unknown"

Make sure messages API returns these fields correctly.

==================================================
2. Components
==================================================

Create a local component folder:

app/discord-intel/components/

Add:

DiscordIntelLayout.tsx
ChannelSidebar.tsx
ChannelTree.tsx
MessageList.tsx
MessageRow.tsx
AttachmentPreview.tsx
TimelineToolbar.tsx

Keep components simple.

==================================================
3. Sidebar design
==================================================

Implement ChannelSidebar.

Desktop layout:
- Width: 300px
- Full height
- Dark Discord-like background
- Sticky/fixed left side
- Scrollable channel list

Hierarchy:
server_name_clean
  category or "Channels"
    # channel_name_clean

If category is null, use "Channels".

Channel item should show:
- # icon
- channel name
- message count badge
- last message date if useful
- selected state

Example:

美股会员网
  股票中长线
    # 六便士-股票中长线-s0    103
  查询终端
    # 鲸鱼-查询终端

If there is no real category data, group like:
server_name_clean
  Channels
    # channel_name_clean

Behavior:
- Clicking a channel sets selectedChannelId.
- It should update the message list.
- Default select first source if no channel selected.
- Keep selected channel in URL query param:
  /discord-intel/timeline?channelId=...

Use URL query so refresh keeps selected channel.

Mobile:
- Sidebar can collapse above messages.
- Simple implementation is okay.

==================================================
4. Main timeline design
==================================================

Right panel:
- Sticky header with selected channel name.
- Header shows:
  # channel name
  server name
  message count
  last message date
- Small toolbar with:
  search input
  from date
  to date
  has attachments checkbox
  limit selector
  refresh button

Messages:
- Render compact Discord-style rows.
- Do not use large cards.
- Use avatar placeholder circle on left.
- Author + timestamp on one line.
- Content below.
- Attachments below content.
- Reduce vertical padding.

Message row style:
- max width: none
- padding: 8px 16px
- hover background
- no huge card borders
- group visually like Discord

Date separators:
- Insert separator when date changes:
  ─── 2026年5月13日 ───

Content:
- Preserve line breaks with whitespace-pre-wrap.
- Chinese and English should both display cleanly.
- Long content should wrap.
- URLs should be clickable if easy; otherwise leave plain text.

Badges:
Show compact badges only when relevant:
- @everyone
- pinned
- attachment
- edited

==================================================
5. Attachments
==================================================

Implement AttachmentPreview.

For each attachment:
If content_type starts with image/:
- Show image thumbnail inline.
- Max width around 420px.
- Max height around 320px.
- Border radius.
- Filename below or overlay.
- Link opens original URL in new tab.

For non-image:
- Show compact file block:
  icon
  filename
  content type
  size
  open link

Use attachment fields:
- filename
- title
- content_type
- size_bytes
- width
- height
- url
- proxy_url

Prefer proxy_url for image src if available, else url.

Do not download or store files in this task.

==================================================
6. Timeline page rewrite
==================================================

Rewrite app/discord-intel/timeline/page.tsx.

It can be a client component.

State:
- sources
- selectedChannelId
- messages
- loadingSources
- loadingMessages
- filters:
  q
  from
  to
  hasAttachments
  limit
  offset

Behavior:
- Load sources on mount.
- Select channel from URL or first source.
- Load messages whenever selected channel or filters change.
- Load more appends messages.
- Refresh reloads current channel.
- Show empty state if no messages.

Important:
Do not mix all channels by default. The default should be first channel selected.

==================================================
7. Visual style
==================================================

Make it closer to Discord but still match the app:

Sidebar:
- dark background: #1e1f22 or similar
- channel text muted
- selected item background
- small badges

Main:
- light or neutral background is okay
- messages should be compact
- avoid large cards
- avoid huge empty space
- font should be readable for Chinese

Use CSS modules, global CSS, or Tailwind if project already uses it.
If no Tailwind, use plain CSS module or inline className with existing CSS approach.

Do not introduce shadcn or any new component library.

==================================================
8. Fix "Unknown" author issue
==================================================

use channel_name_clean

==================================================
9. Keep import page working
==================================================

Do not break app/discord-intel/import/page.tsx.

After import completes, link to:
"/discord-intel/timeline?channelId={manifest.channel_id}"

==================================================
10. Manual QA
==================================================

Create or update:

docs/discord-intel/ui-test-checklist.md

Include:

1. Import one JSONL file.
2. Open /discord-intel/timeline.
3. Confirm sidebar shows server and channel.
4. Click channel.
5. Confirm only that channel’s messages show.
7. Confirm Chinese content line breaks display correctly.
8. Confirm attachments show inline.
9. Confirm image attachments render as thumbnails.
10. Confirm non-image attachments render as file blocks.
11. Confirm search filters current channel.
12. Confirm has attachments filter works.
13. Confirm load more works.
14. Import second channel.
15. Confirm sidebar shows both channels.
16. Confirm switching channels updates messages.

==================================================
11. Deliverable report
==================================================

After implementation, report:

- Files added
- Files changed
- API routes added/modified
- How to test
- Known limitations