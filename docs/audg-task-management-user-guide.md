# AUDG Task Management — User Guide

**Platform:** LONGi KK · AI Table  
**Audience:** AU Distribution team (requesters, assignees, leads)  
**Purpose:** One place to submit, track, update, and close team tasks — not a second weekly Excel.

> **Mental model:** Form → Task Pool → Views → Update → Complete

---

## 1. Quick Start

### What this tool is for
- Collect task requests in one place (instead of chat / email / weekly notes)
- Assign a single owner and track status clearly
- Support weekly meeting follow-up with filters and views

### Who does what

| Role | Main job |
|------|----------|
| **Requester** | Submit a clear request via the form |
| **Assignee (Owner)** | Execute the task; update status and progress weekly |
| **Lead / Manager** | Review Key tasks, overdue items, and Need Support in weekly meeting |

### Where to go
1. Open **AUDG Task Management Tool**
2. In the left sidebar, open **Task Management**
3. Use the top tabs / views:
   - **Task Collection Form** — submit a new request
   - **Task Pool** — full backlog
   - **Personal View** — my open tasks
   - **Key task** — starred / critical items
   - Role tabs (Sales, Delivery, Marketing, etc.) — line review

---

## 2. Create a Task (Submit)

### Preferred: Task Collection Form
Use the form for day-to-day requests. It reduces missing fields.

**Steps**
1. Open **Task Collection Form**
2. Fill required fields (see table below)
3. Add attachments / links if useful
4. Submit
5. Confirm the record appears in **Task Pool**

### Required fields

| Field | What to enter |
|-------|----------------|
| **Task Type** | Role line responsible for delivery (see §6) |
| **Workstream** | General work category under that Task Type |
| **Task Topics** | Short, clear title (customer / topic / action) |
| **Task Description** | Concrete ask: what, for whom, success criteria |
| **Requester** | Who raised the request |
| **Assignee** | Single owner (one person only) |
| **Priority** | Urgent / High / Med *(or P0 / P1 / P2 if your table uses that)* |
| **Due date** | Target deadline |

### Optional fields
- **Attachments** — files, screenshots, templates
- **Link** — Drive / Zoho / related table
- **Support person** — only if help from someone else is needed

### Alternative: Add record in the table
Use **Add record** in Task Pool when you already know the field structure (admins / bulk cleanup).  
New users should prefer the form.

### Bulk import (occasional)
Use **Import from Excel** in the sidebar only for migration or batch backfill.  
After import, check: Assignee, Status, Due date, Task Type.

---

## 3. Find & View Tasks

### Recommended views

| View | Who | Use it for |
|------|-----|------------|
| **Task Pool** | Everyone | Full backlog, usually grouped by Task Type |
| **Personal View / My Tasks** | Assignee | My open work |
| **Key task** | Leads | Starred / critical items |
| Role tabs (Sales / Delivery / Marketing…) | Role owners | Review by line |
| **Weekly Meeting** *(if configured)* | Managers | Meeting screen: P0–P1 / Need Support / due soon |
| **Overdue** *(if configured)* | Managers | Exceptions |

### Useful toolbar actions
- **Filter** — e.g. Status ≠ Completed; Assignee = me
- **Sort** — by Due date / Priority
- **Grouped by** — Task Type (default in Task Pool)
- **Fields** — show / hide columns
- **Search** — find by topic or keyword
- **Key task (★)** — mark items that must be watched

### Tip
If you “cannot find my task”, first open **Personal View** and check:
1. Are you the **Assignee**?
2. Is a filter hiding Completed / other statuses?
3. Are you looking under the wrong Task Type group?

---

## 4. Update Progress

Update at least weekly (or when status changes). Keep updates short and actionable.

### What to update (minimum)

1. **Status**
   - `Not Started` → work not begun
   - `In progress` → actively working
   - `Blocked` *(if available)* → waiting on dependency / decision
   - `Completed` / `Done` → finished
2. **History / Latest Progress** — date + what changed  
   Example: `2026-07-24 Testing completed; waiting for client confirmation`
3. **Next Action** *(if available)* — who does what next  
   Example: `Jessie to send final deck by Fri`
4. **Need Support** *(if available)* — tick the box, assign support person, write what you need

### How to edit
- Click a cell to edit text
- Click **Status** / **Priority** to pick from the dropdown
- Click **Assignee / Requester** to select people
- Upload files in **Attachments**; paste URLs in **Link**

### Good update examples
- ✅ `2026-08-05 Draft sent to Jack; next: revise pricing slide`
- ✅ `Blocked: waiting warehouse stock confirmation from Helen`
- ❌ `Ongoing` / `In discussion` (too vague)
- ❌ Pasting a full weekly report into one cell

---

## 5. Complete a Task

When the deliverable is done:

1. Set **Status** = `Completed` (or `Done`)
2. Add a final note in **History** (result + link to output if any)
3. Unstar **Key task** if it no longer needs meeting attention
4. Leave the row in the table — do not delete (archive via filter / Archive view)

Completed tasks should normally **not** appear in Personal View or Weekly Meeting (if those views exclude Completed).

---

## 6. Collaboration Rules

### Do
- One row = one task
- One **Assignee** only (single owner)
- Choose the correct **Task Type** + **Workstream**
- Put details in **Task Description**, not in the title only
- Update progress every week for open items
- When you need help: use **Need Support** + support person + clear ask

### Don’t
- Don’t leave Task Type / Workstream blank and “inherit” from the row above (Excel habit)
- Don’t put inventory MW lists, full event calendars, or long weekly narratives into one task
- Don’t invent free-text status labels
- Don’t assign multiple co-owners
- Don’t maintain the same item in both this AI table and the old Action Tracking Excel

### Cross-team work
Pick **Task Type** by the **primary owner’s role line**.  
Do not create two duplicate rows for the same piece of work.

---

## 7. Task Type & Workstream (How to choose)

**Task Type** = role line. **Workstream** = general category under that line. Details go in the description.

| Task Type | Typical work |
|-----------|----------------|
| **Delivery & Logistics** | Contract, credit, shipment, stock, warehouse, ops reporting |
| **Marketing** | Events, brand tours, co-marketing, content, leads, marketing fund |
| **Sales Support** | Enablement, warehouse support, CRM routing, visit coord, toolkit |
| **Product & Solution** | Certification, aftersales, technical support, solutions, enablement |
| **Sales** | Pipeline, customer engagement, capability building, weekly sync |

If unsure: choose the owner’s role line, write a clear topic, and let the lead adjust Workstream if needed.

---

## 8. Weekly Meeting (for leads)

Suggested meeting flow (project on screen):

1. **Overdue** first
2. **Need Support** items
3. **Key task** / P0–P1 by role line
4. Update live: Status, support person, due date, next action

Do **not** open a separate Excel for the same follow-ups.

---

## 9. Notifications (what you may receive)

Depending on automation setup, you may get reminders for:
- Due date approaching (assignee)
- Need Support flagged (support person / lead)
- Weekly progress update reminder (assignee)

**What to do when notified:** open the record → update Status / History / Next Action (or clear Need Support when resolved).

---

## 10. Field Glossary

| Field | Meaning |
|-------|---------|
| **No** | Task ID |
| **Task Topics** | Short title |
| **Status** | Not Started / In progress / Completed (and Blocked / On hold if enabled) |
| **Remaining Time** | Days to due date (negative = overdue) |
| **Key task** | Star for critical / meeting watchlist |
| **History** | Progress log |
| **Task Type** | Role line |
| **Workstream** | Category under the role line |
| **Priority** | Urgency level |
| **Task Description** | Detailed request |
| **Attachments / Link** | Files and related URLs |
| **Requester** | Who asked |
| **Assignee** | Who owns delivery |

---

## 11. FAQ

**Q: I submitted a form but can’t see the task.**  
A: Check Task Pool filters, your access permission, and whether you are looking at Personal View with Assignee = you.

**Q: Remaining Time is negative.**  
A: The task is overdue. Update Status / Next Action, or renegotiate Due date with the requester/lead.

**Q: Should I create a new table for my workstream?**  
A: Usually no. Add a row in Task Management and link out to specialist docs/tables if needed.

**Q: Can two people own one task?**  
A: No. One Assignee; others go to Support if needed.

**Q: What belongs outside this table?**  
A: Full contract ledgers, inventory MW ops reports, annual event calendars, marketing fund full books — keep those in dedicated trackers and **link** them from the task.

---

## One-page checklist

**Requester**
- [ ] Submit via Task Collection Form
- [ ] Clear topic + description + due date
- [ ] One assignee selected

**Assignee**
- [ ] Move Status to In progress when started
- [ ] Weekly History / Next Action update
- [ ] Flag Need Support early (don’t wait for the meeting)
- [ ] Set Completed when done + final note

**Lead**
- [ ] Review Overdue → Need Support → Key / high priority
- [ ] Decide in the meeting; update the row live

---

*Document type: end-user operating guide. Paste into the AI Table **User Manual** section as needed. Align field labels with your live table if names differ slightly (e.g. Completed vs Done, Priority vs P0/P1/P2).*
