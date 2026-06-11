# EM Feud — Setup & Question Management Guide

## Running the App

**Install dependencies (first time only):**
```bash
npm install
```

**Start the dev server:**
```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

**Build for production:**
```bash
npm run build
```

---

## Game Routes

| URL | Description |
|-----|-------------|
| `/games/emfeud` | The game itself |
| `/games/emfeud/form` | Question Set Builder — upload a new CSV here |

---

## How Questions Are Loaded (Priority Order)

The game picks questions from the first available source:

1. **Browser localStorage** — questions saved via the in-app uploader take top priority
2. **`/public/data/EMFeud.csv`** — the default question set, fetched on startup if localStorage is empty
3. **Hardcoded fallback** — 6 built-in questions in `src/components/EmFeud.tsx`, used only if the CSV fetch fails

---

## Uploading New Questions

### Option A — Replace the CSV file (recommended for everyone)

This is the best approach when running a new game night so all devices/browsers get the new questions automatically.

1. Edit or replace `public/data/EMFeud.csv` with your new questions
2. **Restart the dev server** (`Ctrl+C`, then `npm run dev`) so Vite serves the updated file
3. Open `/games/emfeud` — the new questions will load automatically on any fresh browser or device that has no saved questions in localStorage

> **If players already visited the game before:** their browser may have old questions saved in localStorage. They need to go to `/games/emfeud/form` and click **Clear**, then refresh.

### Option B — Use the in-app Question Set Builder (no restart needed)

Good for a quick one-off change without touching any files.

1. Go to `/games/emfeud/form`
2. Drop or browse for your `.csv` file
3. Preview the questions, then click **Save & Use in Game**
4. Click **▶ Go play with these questions** or navigate to `/games/emfeud`

This saves to the browser's localStorage — it only affects the device/browser you're on.

To remove and revert to the CSV: click **Clear** on the form page.

---

## CSV Format

3 columns: `Question`, `Answer`, `Points`

Each answer gets its own row. You can leave the Question column blank for rows 2+ under the same question — the parser carries the previous question forward.

```csv
Question,Answer,Points
Name something you always find at a BBQ,Hot Dog,35
,Hamburger,30
,Corn,20
,Soft Drinks,15
Name things you do first thing in the morning,Check phone,38
,Brush teeth,25
,Bathroom,10
```

**Rules:**
- First row is a header and is skipped automatically
- Answers are displayed in the order they appear in the file
- Points should be whole numbers
- Use quotes around any text that contains a comma: `"Eat, drink, and be merry",30`

Download a sample from the form page (`/games/emfeud/form` → Download sample CSV).

---

## File Locations

| File | Purpose |
|------|---------|
| `public/data/EMFeud.csv` | Default question set — edit this for a new game |
| `src/components/EmFeud.tsx` | Main game component |
| `src/components/EmFeudForm.tsx` | Question Set Builder UI and CSV parser |
| `public/audio/ding.mp3` | Sound played when an answer tile is revealed |
| `public/audio/buzzersound.mp3` | Strike buzzer sound |
| `public/audio/crowd.mp3` | Crowd cheer on the winner screen |
| `public/audio/alexzavesa-calm.mp3` | Background music during the game |
| `public/audio/bombinsound-upbeat.mp3` | Background music on the setup screen |
