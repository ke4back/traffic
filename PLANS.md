# ExecPlan (Minimal & Non-Iterative)

## Purpose

ExecPlans are used ONLY for multi-file or multi-step features.

They are NOT used for exploration.

---

## When to use

Use only if:

* modifying 3+ files
* introducing new simulation logic (e.g. pedestrians, traffic system)
* changing architecture

Otherwise: DO NOT use plans.

---

## Structure

A valid plan contains:

### 1. Goal

What will change in user-visible behavior.

### 2. Files

List ONLY files that are known or highly likely to be modified.

No exploration allowed here.

---

### 3. Steps (max 5)

Steps must be linear:

1. Read required files (once)
2. Implement core logic
3. Connect integration points
4. Update UI if needed
5. Verify manually

NO branching, NO repeated investigation loops.

---

### 4. Execution Rule (IMPORTANT)

During implementation:

* Never re-read a file unless it has changed in this task
* Never repeat a search already performed
* If unsure → make a reasonable assumption and proceed

---

### 5. Stop Condition

Stop searching immediately when:

* files are read once
* or required info is missing

Then proceed with best guess implementation or explicitly state:

> "Insufficient evidence in codebase"

---

## Core Principle

> "A working solution is better than a fully explored one"

---

## Forbidden behavior

* recursive planning
* repeated grep cycles
* repeated repository scans
* “just to be sure” re-reading

---

## Outcome rule

Every plan must lead to:

* code changes OR
* explicit conclusion of absence

Never endless investigation
