# CareerPilot

*By Ashkan Nikfarjam*

**An open-source, multi-agent job search assistant that runs entirely on your own hardware.**

Repository: [github.com/ANikfarjam/CareerPilot](https://github.com/ANikfarjam/CareerPilot)

---

## Introduction

Job hunting in tech involves a lot of repetitive work. You check dozens of company careers pages, read hundreds of job descriptions to see whether you qualify, rewrite your resume for each application and keep track of everything in a spreadsheet. Most of that time goes to jobs you were never a good fit for.

CareerPilot hands that work to a team of AI agents. You give it your resumes, transcripts, project write-ups, papers and awards once. From then on, it:

1. **Learns who you are.** It condenses your documents into a single structured knowledge base that every other agent reads.
2. **Finds jobs.** It visits the careers pages of the companies you track and collects every open position that matches your target roles.
3. **Screens them for you.** It reads each job description, pulls out the technical requirements, checks them against your background and gives each job a match score from 0 to 10, along with the skills you have and the ones you're missing.
4. **Tracks your applications.** Every scored job is saved to a job board where you follow it from *Searched* through *Applied* and the interview stages to an offer or a rejection.
5. **Tailors your resume.** For any saved job, it writes a one-page resume aimed at that posting and suggests side projects that would close your skill gaps. A chat assistant then refines the resume with you.
6. **Analyzes your search.** It charts your application funnel and finds *near-miss* jobs: roles where you have the background but lack a few crucial skills. It then recommends side projects that would turn those near-misses into strong matches.

### Why it runs locally

A job search involves a lot of personal data: your work history, contact details, transcripts and the companies you're talking to. CareerPilot keeps all of it on your machine. The language model is OpenAI's open-weight **[gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)**, served locally by **[Ollama](https://ollama.com)**. The parts of the model that don't fit in GPU memory are offloaded to the CPU, so the whole system runs on a consumer machine with an 8 GB GPU and 16 GB of RAM. Nothing is sent to a hosted AI service.

Building on a 20-billion-parameter local model instead of a frontier cloud model shaped almost every engineering decision in the project. Those trade-offs are covered in [Key design decisions](#key-design-decisions).

### Tech stack

| Layer | Technologies | Role |
| --- | --- | --- |
| Language model | gpt-oss-20b served by Ollama | Reads, reasons and writes for every agent |
| Agent framework | LangGraph and LangChain | Defines each agent as a graph of steps with shared state, loops and branches |
| Code execution | Hardened Docker sandbox (GPU and CPU versions) | Runs the scripts the model writes, isolated from the host |
| Backend | FastAPI, Pydantic, Uvicorn, WebSockets | REST API for the app, plus live streaming for the resume chat |
| Data | PostgreSQL, SQLAlchemy, pandas | Job board, resume drafts and analytics tables |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts | The web app |
| API client | TypeScript SDK generated from the backend's OpenAPI spec | Keeps frontend and backend types in sync |
| Tooling | just, Docker Compose, pnpm | One-command setup and launch |

---

## Architecture

CareerPilot is built in four layers that talk to each other in a straight line:

1. **The web app (Next.js)** is what you use: pages for Search, Analytics, Resume, Knowledge and Docs.
2. **The backend (FastAPI)** receives requests from the web app, starts agents, tracks their progress and stores the results.
3. **The agents (LangGraph)** do the actual work: reading documents, searching portals, scoring jobs, analyzing your search and writing resumes.
4. **The local infrastructure** is what the agents run on: the Ollama model server, a Docker sandbox for running model-written code, a PostgreSQL database, and a folder of Markdown files for long text such as job descriptions and the knowledge base.

A few rules hold the system together:

- **One model, one agent at a time.** Every agent shares the same local model, so the backend allows only one agent to use it at once. If you start a second run while one is going, you get a clear "model busy" message instead of two runs fighting over the GPU and both slowing to a crawl.
- **Long jobs run in the background.** Starting a search or analysis returns immediately with a run ID. The web app then checks that run every couple of seconds for its current stage, live logs and results.
- **Model-written code never touches the host.** Agents that write and run their own scripts (Portal Search and Analytics) do so inside a disposable Docker container. Agents that only turn text into structured answers (Qualification Check, Knowledge Base and Resume Builder) run directly on the host.
- **Short data in the database, long text in files.** PostgreSQL stores the job board and resume drafts. Job descriptions and the knowledge base are saved as Markdown files, which keeps the database small and lets both the agents and you read them directly.

---

## LangGraph: how the agents are built

**LangGraph** is a framework for building AI agents as *graphs*. Each **node** is one step (call the model, run a script, check the output, save to the database), and **edges** decide which step comes next. All nodes read from and write to a shared **state**, a record that travels through the graph and holds everything gathered so far.

Two LangGraph features matter most in CareerPilot:

- **Conditional edges** let the graph branch. For example, if a search finds no new jobs, the graph skips straight to the end instead of loading the model to score an empty list.
- **Loops back to an earlier node** let an agent try, check its own work and try again. This is how a small local model reaches reliable results: it gets concrete feedback about what went wrong and another chance to fix it.

CareerPilot uses LangGraph at two levels. **Parent graphs** chain whole agents together into a workflow (search, then score, then save). Inside them, each agent is its own **subgraph** with its own internal loop. Agents whose steps never loop or branch (Knowledge Base and Resume Builder) are written as simple linear pipelines, because a graph would add nothing.

LangGraph also streams progress. Each node can emit status messages while it runs, which the backend forwards to the web app as live logs, so a run that takes several minutes never looks frozen.

---

## The agents

CareerPilot has five agents.

| Agent | Structure | Runs its own code? | What it produces |
| --- | --- | --- | --- |
| **Knowledge Base** | Linear pipeline | No | Your structured profile, plus suggested search settings |
| **Portal Search** | LangGraph subgraph, write-run-fix loop | Yes, in the sandbox | A list of open positions from each company |
| **Qualification Check** | LangGraph subgraph, validate-and-retry loop | No | A 0–10 score, the job's requirements, and your matched and missing skills |
| **Analytics** | LangGraph subgraph, write-run-fix loop | Yes, in the sandbox | Near-miss jobs, ranked skill gaps, a written report and side-project ideas |
| **Resume Builder** | Linear pipeline plus streaming chat | No | Tailored resume drafts with full version history |

### Knowledge Base agent

Every other agent needs to know who the candidate is. Rather than have each one dig through a pile of resumes and PDFs, the Knowledge Base agent condenses them into one structured Markdown profile.

You drop documents (PDF, Markdown or text) into folders by type: work experience, education, projects, papers and achievements. The agent then builds the profile **one section at a time**: Profile & Contact, Work Experience, Education, Skills, Publications, and Achievements & Awards each get their own model call, and each call sees only the document types relevant to it (the Education section reads transcripts and resumes, not papers). Every project gets its own call as well. The last section is a quick-reference summary of your strongest areas, gaps and experience level, written specifically for the scoring agent.

Writing section by section works around a real limit of the model: gpt-oss shares a 4,096-token output budget between its reasoning and its answer, and a full profile is longer than that.

**The profile is updated, not regenerated.** Each section's call receives the current version of that section and is told to keep its facts unless a new document corrects them. Details you added by hand, or that came from documents you've since removed, are preserved, and the previous version is backed up.

**It also tunes the job search.** After updating your profile, the agent compares it with your search settings (target job titles, excluded titles and tracked companies) and proposes changes. Companies it drops are disabled rather than deleted, so nothing is lost.

### The search graph

The core workflow is a parent LangGraph with three nodes in a row:

**Portal Search → Qualification Check → Database Ingestion**

After Portal Search, a conditional edge checks whether any new positions were found. If not, the run ends right there. Each node records errors in the shared state instead of crashing, so one broken careers page or one malformed posting is logged and skipped while the rest of the run carries on.

#### Node 1: Portal Search

Every company publishes its jobs differently. Some use an applicant tracking system with a public API (Greenhouse, Lever, Ashby), and others only have a plain web page. Writing and maintaining a scraper for each of the 130+ tracked companies isn't practical, so this agent **writes its own scrapers**.

It is a *code-as-action* agent. Instead of choosing from a fixed menu of tools, the model writes a short Python or bash script. The script runs in the sandbox, and its output and any errors come back to the model as its next message. The model reads the result, fixes its script and tries again, much like a developer working in a terminal.

Its subgraph has four nodes that form a loop:

1. **Setup** puts the company's details into the sandbox.
2. **Agent** asks the model for the next script. Its instructions describe the table of jobs it must produce and how to query each type of job board, preferring APIs over scraping web pages.
3. **Execute** runs the script and sends the output back to the Agent node. Long outputs are trimmed (keeping the start and end) so they can't overflow the model's memory. Steps 2 and 3 repeat until the model says it's done or hits its step limit.
4. **Finalize** reads the results file directly from the sandbox and checks it: the right columns, and no jobs missing a title or link. If something is wrong, it sends the model back to step 2 with the exact problem. The model never has to retype hundreds of rows, because the program reads the file itself.

A few details make this reliable with a small model:

- **One sandbox per search.** All companies in a run share one container, so a Greenhouse fetcher the model writes for the first company can be reused for the next forty.
- **Known jobs are skipped.** Jobs already on your board are filtered out both inside the sandbox and again afterward, so every posting is scored only once.
- **Fallback for the model's habits.** gpt-oss was trained with a built-in shell tool and sometimes tries to call it instead of writing a script. The agent catches those calls and runs them anyway.
- **Bounded loops.** Each company gets at most 12 model turns, so a stubborn page can't stall the whole run.
- **Manual positions.** Jobs you found elsewhere, such as a referral or a LinkedIn post, can be pasted into the search page. They join the pipeline after this step and are scored and saved like any other job.

#### Node 2: Qualification Check

This agent screens each posting the way a technical recruiter would. The model gets your full profile and the job description, and returns a structured answer: the job's requirements (each marked required or preferred), which of them you match, which you're missing, a score from 0 to 10, and a one-line explanation.

The standard is strict. A skill only counts as matched if your profile shows evidence for it, and a related skill doesn't count (GCP is not AWS). Scores follow a fixed rubric, from *9–10: meets nearly all requirements and the seniority fits* down to *0–2: a different field*.

Its subgraph is a **validate-and-retry loop** of three nodes: setup, agent and finalize. Finalize checks that the answer is well-formed, the score is a whole number from 0 to 10, and the requirements list isn't empty. If anything fails, the model gets the exact error (for example, "score must be from 0 to 10, got 12") and tries again, up to three times.

#### Node 3: Database Ingestion

The last node is plain code, with no AI involved. It saves the scored jobs to the database:

- **No duplicates.** Each job's ID is derived from its URL, so running a search again updates a saved job instead of adding a copy.
- **Your status is kept.** A rescan never overwrites the status you set. A job you marked *Interview Scheduled* stays that way.
- **No score, no save.** Postings without a description can't be scored, so they're skipped and listed in the run's error log.

### The analytics graph

A second, separate LangGraph analyzes your saved job board. It has two nodes:

**Load Data → Analytics Agent**

If the board is empty, a conditional edge ends the run after the first node.

The work is split by how much it can be trusted:

- **Load Data** builds every chart with ordinary data processing, no AI: status counts, the application funnel, work type, top companies, the score distribution and weekly activity. Because no model is involved, **the charts are always correct and always available**, even if the AI step fails.
- **Analytics Agent** is the exploratory step. Your jobs, their matched and missing skills, and your profile are loaded into a fresh sandbox, and the model works like a data analyst, writing and running Python over several turns. It produces three things:
  - **Near-miss jobs:** postings that score 5–8 but are missing at least one *required* skill.
  - **Skill gaps:** the missing skills across those jobs, with different spellings merged ("k8s" and "Kubernetes"), ranked by how many jobs need them.
  - **A report:** a written analysis, a short conclusion and 3–5 side-project ideas, each with the skills it covers, what to build, why it helps and the effort involved (a weekend, 1–2 weeks, or a month or more).

This agent uses the same write-run-fix loop as Portal Search, and its outputs are validated the same way. If it still fails, the page keeps showing the charts and reports the error.

### Resume Builder and the resume chat

**Building a draft** takes two separate model calls, so neither runs out of output budget:

1. **Write the resume.** The model gets the job posting, your profile and the full write-up of every project. It writes a one-page resume that leads with your most relevant experience and reuses the posting's wording wherever it truthfully describes your work.
2. **Recommend side projects.** It lists the requirements you have no evidence for and proposes 2–3 projects to close those gaps, each with a tech stack, milestones and the resume bullet to add once it's done.

Both steps are forbidden from inventing employers, titles, dates, degrees, skills or numbers. If something is missing, the fix is to add it to your profile.

**The chat** then refines the draft with you:

- **Only the relevant context.** Your background is split into named pieces: the current draft, the job posting, each profile section and each project. Instead of asking the model to fetch what it needs (unreliable for a small model, and an extra call each time), the server picks the pieces that match your message. This follows the resource idea from the Model Context Protocol and keeps every reply to a single model call.
- **Live edits.** The model replies with a short message and, only for the documents it changes, a complete new version. The server separates these while the reply is still streaming, so you watch the resume being rewritten in place while the chat message appears beside it.
- **Version history.** Every change, whether from the chat, a manual edit or a restore, first saves the old version. Any version can be restored, and a restore can itself be undone.

---

## The REST API

The FastAPI backend is the only thing the web app talks to. It exposes a REST API grouped into six areas:

| Area | What you can do |
| --- | --- |
| **Search runs** | Start a search, list past runs, and check a run's stage, live logs and results |
| **Search settings** | View and edit tracked companies and target job titles |
| **Job board** | List jobs with filtering, search, sorting and pages; open a job; change its application status |
| **Analytics** | Get the charts instantly, or start an AI analysis run and check on it |
| **Knowledge base** | Browse your document folders, create missing ones, and start or check a profile update |
| **Resume** | Build a draft for a job, list and edit drafts, and restore an earlier version |

How it behaves:

- **Background runs.** Anything that uses the model takes minutes, so starting it returns right away with a run ID. The web app then checks that run for its stage, logs and results.
- **Clear conflicts.** If the model is busy, the API refuses the new run with an explanation of what's using it.
- **Streaming chat.** The resume chat uses a WebSocket instead of REST, so the reply can be sent piece by piece as it's written. It reports when the model is thinking, when it's writing, and when it's done. If the connection drops, the web app reconnects automatically.
- **Self-documenting.** FastAPI publishes an OpenAPI description of every route, which serves interactive API docs and is used to generate the frontend's API client.

### Data model

The database has two tables:

- **Job board:** one row per job, with company, position, link, work type (onsite, remote or hybrid), match score, application status, requirements, matched and missing skills, the scoring explanation and a pointer to the full description file.
- **Resume drafts:** each tied to a job, holding the resume, the side-project suggestions, the chat history and the saved versions.

---

## Frontend

The web app is built with **Next.js** and **React** in TypeScript, styled with **Tailwind CSS** and **shadcn/ui** components, with charts in **Recharts**. It uses a dark theme with a navy, blue, teal and green gradient, and works on phones as well as desktops.

### A generated, type-safe API client

The frontend never hand-writes request code. A single command exports the backend's OpenAPI description and generates TypeScript types and a function for every route. Whenever a backend data model changes, any mismatch shows up immediately as a compile error in the frontend instead of a bug at runtime.

### Pages

| Page | What it does |
| --- | --- |
| **Knowledge** | Shows your document folders as file trees, flags empty or missing ones, lets you choose which document types to use, runs the Knowledge Base agent, and shows the updated profile along with any changes to your search settings. |
| **Search** | Three tabs. **Overview** manages tracked companies and target titles. **Search** picks companies, queues hand-entered jobs, and shows the run as a three-stage pipeline (Search → Qualify → Save) with live progress and activity logs. **Results** is the job board: search, filter by status, sort by company, score or date, and update each job's status inline. |
| **Analytics** | Headline stats (jobs found, applied, interviews, average match), a **Pipeline** tab (funnel and weekly activity), a **Fit & companies** tab (score distribution with the near-miss range highlighted, work type, top companies) and an **AI insights** tab with the written analysis, near-miss jobs, a skill-gap chart and side-project cards. |
| **Resume** | A three-column workspace with resizable panels: saved jobs and their drafts, the resume and side-project documents (edit, copy, download, view history, restore), and the streaming chat assistant. |
| **Docs** | The built-in user guide, with a sidebar linking to every section. |

### Designed for long-running agents

Local-model runs can take minutes, so the interface is built around them:

- **Runs survive navigation.** Runs live on the server, so when you return to a page it finds the latest run and picks up where it was. Analytics results also come back after a page reload.
- **Graceful recovery.** If the backend restarts mid-run, the page resets cleanly instead of showing an error.
- **It always looks alive.** The pipeline view shows which company is being searched ("Cerebras Systems (12/134)") and how long it's been since the last log line, updating every second.
- **Busy states are explained.** If another agent is using the model, you're told what's running and to try again when it finishes.
- **Streaming chat.** Incoming text flows into the chat bubble or straight into the open document, and a pulsing dot marks the tab being rewritten.

---

## Key design decisions

**Code as action instead of tool calls.** A 20B local model is much less reliable at structured tool calling than a frontier model. Asking it to write a script plays to its strengths, and the script's output is concrete feedback it can act on. Results are passed through files the program validates, not through the model's own text.

**Validate, then send the model back.** Every agent that produces structured output checks it with code. If it's wrong, the graph loops back to the model with the exact error. Step limits keep these loops from running forever.

**Work within the output budget.** Because gpt-oss's reasoning and answer share one output budget, long outputs are split into smaller calls: the profile section by section, and the resume separately from the project ideas.

**Deterministic where possible.** Anything that can be computed exactly (charts, deduplication, IDs, status counts) is plain code. The model only handles judgment: reading postings, scoring fit and writing.

**One model, kept warm.** The model is loaded once and kept in memory, because reloading 13 GB takes about two minutes. All agents share it one at a time, which keeps memory use predictable on a consumer GPU.

**A hardened sandbox.** Model-written code runs in a locked-down container: read-only system files, no administrator rights, no extra Linux privileges, and limits on memory (4 GB), CPU, number of processes and run time per command (60 seconds). Its only writable space is temporary, and the container is deleted when the run ends.

**Facts only.** Every agent that writes about you is restricted to facts in your own documents. When a request isn't supported by those facts, the chat says so instead of making something up.

---

## The full workflow

1. **Add your documents** and generate your profile on the Knowledge page.
2. **Pick companies and target roles** on the Search page.
3. **Run a search.** Jobs are found, scored and saved automatically.
4. **Review the results**, open the promising ones and track your applications.
5. **Build a tailored resume** for any job and refine it with the chat.
6. **Check Analytics** to see your funnel and the skills holding you back.
7. **Build a recommended side project**, add it to your documents, and update your profile.

The last step closes the loop, and it's the point of the whole system. Analytics finds the skills holding you back, you build a project that covers them, and your next profile update includes it. New searches then score you higher for those roles.

---

## Getting started

CareerPilot needs Docker, Python, Node.js and an NVIDIA GPU (a CPU-only sandbox is also available). Setup is handled by a handful of one-line commands that install dependencies, download the model, build the sandbox and start the database, app and web interface. Full instructions are in the [repository](https://github.com/ANikfarjam/CareerPilot), and the in-app Docs page walks through every feature step by step.

---

## Roadmap

- **Interview coach:** an agent that runs mock interviews tailored to the jobs on your board.
