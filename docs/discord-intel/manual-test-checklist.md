# Discord Intel — Manual Test Checklist

## 0. Prerequisites

- [ ] Supabase project is running
- [ ] Required env vars are set (see §2)
- [ ] Next.js dev server is running (`npm run dev`)

---

## 1. Run schema.sql in Supabase

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of `docs/discord-intel/schema.sql`
3. Click **Run**
4. Confirm the four tables exist in the **Table Editor**:
   - `discord_sources`
   - `discord_import_runs`
   - `discord_messages`
   - `discord_attachments`

---

## 2. Add environment variables

Add to your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

Restart the dev server after adding these.

---

## 3. Start Next.js

```bash
npm run dev
```

---

## 4. Import — first file

1. Open [http://localhost:3000/discord-intel/import](http://localhost:3000/discord-intel/import)
2. Drag-and-drop or browse to a `.jsonl` export from the Chrome extension
3. Click **Import File**
4. **Expected**: summary card appears showing:
   - Correct server name and channel name
   - Declared count matching `message_count` in the manifest
   - Parsed count ≥ 0
   - Inserted/Updated count > 0
   - Parse Errors = 0 (for a clean export)

---

## 5. Verify timeline

1. Open [http://localhost:3000/discord-intel/timeline](http://localhost:3000/discord-intel/timeline)
2. Click **Search** (or wait for auto-load)
3. **Expected**:
   - Messages appear ordered newest-first
   - Each card shows author name, timestamp, content, channel tag
   - Messages with images show the **Attachment** badge

---

## 6. Re-import the same file (deduplication check)

1. Go back to the import page
2. Upload the **same** `.jsonl` file again
3. Click **Import File**
4. **Expected**:
   - `Duplicates` count equals the number of messages in the file
   - `Inserted / Updated` count equals 0 or the full count (upsert still runs, row count returned by Supabase)
   - No new rows appear in `discord_messages` in Supabase
   - Timeline message count is unchanged

---

## 7. Import a second channel

1. Upload a `.jsonl` file from a **different** Discord channel
2. Click **Import File**
3. **Expected**:
   - Summary shows the new channel name
   - `discord_sources` in Supabase has a second row

---

## 8. Timeline shows both channels

1. Open the timeline
2. Leave Channel ID empty and click **Search**
3. **Expected**: messages from both channels are interleaved by date

---

## 9. Filter by channel ID

1. In the timeline, paste the `channel_id` from the first import into **Channel ID**
2. Click **Search**
3. **Expected**: only messages from that channel appear

---

## 10. Filter by date

1. Set **From** to a date within the import range
2. Set **To** to a date within the import range
3. Click **Search**
4. **Expected**: only messages within that date window appear

---

## 11. Check attachments display

1. Find a message with at least one image attachment
2. **Expected**:
   - **Attachment** badge is visible
   - Attachment card shows filename, content type, file size, dimensions
   - **Open** link opens the CDN URL in a new tab

---

## 12. Has-attachments filter

1. Check the **Has attachments** checkbox in the timeline
2. Click **Search**
3. **Expected**: only messages that have attachments are shown

---

## 13. Load more pagination

1. Import a channel with > 100 messages
2. Open the timeline with limit = 50
3. **Expected**:
   - "Load more (N remaining)" button appears at the bottom
   - Clicking it appends the next page without refreshing the existing cards

---

## Known Limitations

- CDN attachment URLs from Discord expire (the `ex=` / `is=` query params are time-limited). The URLs are stored as-is; re-importing the same file with fresh CDN URLs will update them because attachments are deleted and re-inserted on each import.
- `message_count_declared` comes from the manifest and may differ from `parsedCount` if some rows failed JSON parsing.
- There is no authentication on the import or messages routes. Do not expose this to the public internet without adding auth.
- The timeline does not support full-text search. That is intentional for this version.
