# Discord Intel — UI Test Checklist

## 1. Import one JSONL file

1. Open `/discord-intel/import`
2. Drag-and-drop or browse to a `.jsonl` export
3. Click **Import File**
4. **Expected**: summary card shows server name, channel name, and non-zero message count

---

## 2. Open the timeline

1. Click **View timeline** in the import summary (or open `/discord-intel/timeline`)
2. **Expected**:
   - Page opens in full-screen layout (no normal scroll page)
   - Left dark sidebar is visible
   - Right main panel loads messages

---

## 3. Sidebar shows server and channel

1. Inspect the left sidebar
2. **Expected**:
   - Server name appears as a section header in uppercase
   - Channel name appears as `# channel-name` item with message count badge
   - Clicking the channel item highlights it (selected state)

---

## 4. Click channel → only that channel's messages show

1. If multiple channels are imported, click one in the sidebar
2. **Expected**:
   - Channel header updates to the selected channel name and server
   - Message list shows only messages from that channel
   - URL updates to `/discord-intel/timeline?channelId=<id>`

---

## 5. Chinese content line breaks display correctly

1. Find a message that contains Chinese text with `\n` newlines
2. **Expected**:
   - Each logical line breaks correctly in the message body
   - No Chinese characters are squished or broken across lines
   - Mixed Chinese/English is readable

---

## 6. Attachments show inline

1. Find any message with `has_attachments = true`
2. **Expected**:
   - Attachment block appears below the message content
   - At least filename and content type are shown

---

## 7. Image attachments render as thumbnails

1. Find a message with a `image/png` or `image/jpeg` attachment
2. **Expected**:
   - A thumbnail image is rendered inline (max ~420×320px)
   - Filename caption appears below
   - Clicking the image opens the CDN URL in a new tab

---

## 8. Non-image attachments render as file blocks

1. Find a message with a non-image attachment (e.g., `application/zip`)
2. **Expected**:
   - A compact file block shows: filename, content type, file size
   - An **Open** link opens the CDN URL in a new tab
   - No broken image placeholder is shown

---

## 9. Search filters current channel

1. Type a keyword in the **Search** toolbar input
2. Click **Refresh**
3. **Expected**:
   - Only messages containing that keyword are shown
   - Switching to another channel clears the filter results
   - Clearing the search field and refreshing restores all messages

---

## 10. Has media filter works

1. Check **Has media** and click **Refresh**
2. **Expected**:
   - Every visible message has at least one attachment
   - Unchecking and refreshing restores all messages

---

## 11. Load more works

1. Import a channel with > 100 messages
2. Set limit to 50 in the toolbar, click **Refresh**
3. Scroll to the bottom
4. **Expected**:
   - "Load N more" button appears
   - Clicking it appends the next page without removing existing messages
   - Button disappears when all messages are loaded

---

## 12. Import second channel → both appear in sidebar

1. Import a second `.jsonl` from a different Discord channel
2. Open the timeline
3. **Expected**:
   - Sidebar shows both channels (potentially under the same or different server headings)
   - Message counts are correct for each

---

## 13. Switching channels updates messages

1. Click channel A in the sidebar — wait for messages to load
2. Click channel B in the sidebar
3. **Expected**:
   - Message list clears and reloads with channel B's messages
   - Channel header updates to channel B's name
   - URL updates to the new `channelId`
   - Refreshing the page preserves the selected channel (B) via the URL param

---

## 14. Date separators are correct

1. Browse a channel with messages spanning multiple days
2. **Expected**:
   - A date separator like `─── 2026年5月13日 ───` appears whenever the date changes
   - Messages on the same day are grouped together without a separator between them

---

## 15. Author names are populated

1. Browse any channel with messages
2. **Expected**:
   - Author names show the author's display name or username
   - "Unknown" only appears if both `author_global_name` and `author_username` are genuinely null/empty in the database

---

## Known Limitations

- Discord CDN attachment URLs expire (the `ex=`/`is=` query params are time-limited). Images may fail to load after expiry.
- The sidebar does not show real categories (all channels group under "Channels") until category data is populated in `discord_sources.category`.
- There is no auth on any API route.
- The search (`q`) uses `ilike` which is case-insensitive but not full-text; it cannot match across word boundaries efficiently.
