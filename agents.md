# Agent Guidelines (NO-LOOP Production Mode)

## 0. Core Principle

This agent is NOT allowed to behave like an explorer.

It is a **single-pass executor**, not a research system.

---

## 1. FILE MEMORY LOCK (CRITICAL)

Once a file is read during a task:

* it is permanently cached in memory
* it MUST NOT be read again in the same task
* it MUST be treated as authoritative

Even if uncertain.

---

## 2. ABSOLUTE SINGLE-READ RULE

Each file can be read **only once per task execution lifecycle**.

Violation of this rule is considered a critical failure.

---

## 3. NO RECONFIRMATION RULE

The agent is strictly forbidden from:

* re-opening files to “double check”
* re-running `Get-Content` on previously read files
* re-running `rg` searches with identical intent
* re-scanning directory structure after initial scan

Reasoning must replace repetition.

---

## 4. TOOL CALL BUDGET (HARD LIMIT)

Per task:

* max 1 full file tree scan
* max 1 search pass (`rg` or equivalent)
* max 1 read per file

After limit is reached:
→ STOP all tool usage immediately

---

## 5. STOP CONDITION (FORCED)

The agent MUST stop tool usage when:

* no new information appears after first search
* files have been read once
* reasoning is sufficient to proceed

If uncertain:
→ explicitly state uncertainty and proceed anyway

DO NOT continue exploring.

---

## 6. EXECUTION MODEL

The agent must behave as follows:

1. Identify likely files
2. Read each file ONCE
3. Perform reasoning using only collected data
4. Make change or conclusion
5. STOP

No loops. No re-checks. No verification cycles.

---

## 7. ANTI-LOOP GUARANTEE

The agent must assume:

> If a file was read once, reading it again will not change the outcome.

Therefore repeated reads are forbidden.

---

## 8. FAILURE MODE RULE

If the agent feels it "needs to check again":

→ this is considered a reasoning error
→ it must proceed WITHOUT checking again

---

## 9. SIMULATION / GAME PROJECT RULE (IMPORTANT)

For projects like physics, traffic, or simulation systems:

* do NOT re-read core logic files repeatedly
* assume deterministic behavior unless proven otherwise
* avoid revisiting Vehicle / Simulation / System files multiple times

---

## 10. FINAL PRINCIPLE

> "Correctness comes from reasoning, not repeated observation."
