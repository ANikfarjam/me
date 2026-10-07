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
3. **Screens them for you.** It reads each job description, pulls out the technical requirements, checks them against your background and gives each job a match score from 0 to 10, along with which skills you have and which you're missing.
4. **Tracks your applications.** Every scored job is saved to a job board where you track its status, from *Searched* through *Applied* and the interview stages to an offer or a rejection.
5. **Tailors your resume.** For any saved job, it writes a one-page resume aimed at that posting and suggests side projects that would close your skill gaps. A chat assistant then refines the resume with you.
6. **Analyzes your search.** It charts your application funnel and finds *near-miss* jobs: roles where you have the background but lack a few crucial skills. It then recommends side projects that would turn those near-misses into strong matches.

### Why it runs locally

A job search involves a lot of personal data: your work history, contact details, transcripts and the companies you're talking to. CareerPilot keeps all of it on your machine. The language model is **OpenAI's open-weight [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)**, served locally by **[Ollama](https://ollama.com)**. Its mixture-of-experts layers that don't fit in VRAM are offloaded to the CPU, so the whole system runs on a consumer machine with an 8 GB GPU and 16 GB of RAM. Nothing is sent to a hosted AI API.

Running on a 20B local model instead of a frontier API model shaped most of the engineering decisions in the project. Those are explained in [Key design decisions](#key-design-decisions).

### Tech stack

| Layer | Technologies |
| --- | --- |
| LLM | gpt-oss-20b via Ollama (`langchain-ollama`), with reasoning output kept separate from the answer |
| Agents | LangGraph 1.2, LangChain Core |
| Code execution | Hardened Docker sandbox (CUDA and CPU variants) |
| Backend | FastAPI, Pydantic 2, Uvicorn, WebSockets |
| Data | PostgreSQL 17, SQLAlchemy 2.1, pandas |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui on Base UI, Recharts |
| API client | TypeScript SDK generated from FastAPI's OpenAPI spec with `@hey-api/openapi-ts` |
| Tooling | `just` command runner, Docker Compose, pnpm |

---

## Architecture

CareerPilot has four layers: a Next.js web app, a FastAPI backend, a set of LangGraph agents, and the local infrastructure they run on (the Ollama server, a Docker sandbox, PostgreSQL and the file system).

```mermaid
flowchart LR
    subgraph FE["Frontend · Next.js"]
        UI["Search · Analytics · Resume<br/>Knowledge · Docs"]
    end

    subgraph BE["Backend · FastAPI"]
        API["REST routes<br/>/agents · /jobs"]
        WS["WebSocket<br/>resume chat"]
        LOCK["RUN_LOCK<br/>one agent at a time"]
    end

    subgraph AG["Agents · LangGraph"]
        KB["Knowledge Base"]
        SG["Search graph<br/>portal_search → qualification_check → db_ingestion"]
        AN["Analytics graph<br/>load_data → analytics_agent"]
        RB["Resume Builder + Chat"]
    end

    subgraph INF["Local infrastructure"]
        LLM["Ollama<br/>gpt-oss-20b"]
        SBX["Docker sandbox"]
        PG[("PostgreSQL")]
        FS["Docs/<br/>knowledge base,<br/>job descriptions"]
    end

    UI -- "typed SDK (HTTP)" --> API
    UI -- "ws://" --> WS
    API --> LOCK --> AG
    WS --> LOCK
    AG --> LLM
    SG --> SBX
    AN --> SBX
    AG --> PG
    AG --> FS
```

**How the pieces connect:**

- The **frontend** calls the backend through a TypeScript SDK generated from the backend's OpenAPI schema, so request and response types always match the Python models. The resume chat runs over a WebSocket so its replies can stream in token by token.
- The **backend** starts long-running agents as background tasks and returns a run ID straight away (`202 Accepted`). The frontend polls that run for its stage, live logs and results.
- All agents share **one local model**, so a single process-wide lock (`RUN_LOCK`) lets only one agent run at a time. A second request gets a `409 Conflict` with a clear message instead of slowing both runs down.
- Agents that run **model-written code** (portal search and analytics) do it inside a throwaway Docker container. Agents that only turn text into structured output (qualification check, knowledge base and resume builder) run on the host.
- **PostgreSQL** stores the job board and resume drafts. Long text, such as job descriptions and the knowledge base, is stored as Markdown files under `Docs/`. That keeps the database small and lets the agents and the user read the files directly.

### Project layout

```
careerAI/
├── agents/
│   ├── graph/               # parent LangGraphs: search pipeline and analytics
│   ├── knowledge_base/      # builds Docs/user_docs/user_knowledge.md, tunes portals.yml
│   ├── portal_search/       # code-as-action scraping agent
│   ├── qualification_check/ # requirement extraction + 0–10 scoring
│   ├── analytics/           # chart tables + code-as-action analysis agent
│   ├── resume_builder/      # resume generation, chat, MCP-style context
│   ├── sandbox/             # Docker sandbox session + image
│   └── utils/               # LLM config, DB ingestion, progress streaming, portals.yml
├── apis/                    # FastAPI app, routes and Pydantic schemas
├── db/                      # SQLAlchemy models, queries, description files
├── fronts/careerpilot/      # Next.js frontend
├── docker-compose.yml       # sandbox services
└── Justfile                 # setup and run commands
```

---

## The agents

CareerPilot has five agents. Three of them run inside LangGraph graphs. The other two (Knowledge Base and Resume Builder) are linear pipelines, because their steps never loop or branch, so a graph would add nothing.

| Agent | Kind | Runs code? | Reads | Writes |
| --- | --- | --- | --- | --- |
| **Knowledge Base** | Linear pipeline | No | Your documents in `Docs/user_docs/` | `user_knowledge.md`, `portals.yml` |
| **Portal Search** | LangGraph subgraph, code-as-action loop | Yes, in the sandbox | `portals.yml`, known job links | Positions table |
| **Qualification Check** | LangGraph subgraph, validate-and-retry loop | No | Knowledge base, job descriptions | Scores, requirements, matched/missing skills |
| **Analytics** | LangGraph subgraph, code-as-action loop | Yes, in the sandbox | Job board, knowledge base, projects | Near-miss jobs, skill gaps, report, project ideas |
| **Resume Builder** | Linear pipeline + streaming chat | No | Knowledge base, projects, one job | Resume drafts and their version history |

### Knowledge Base agent

Every other agent depends on knowing who the candidate is. Rather than have each one dig through a pile of resumes and PDFs, the Knowledge Base agent condenses them into one structured Markdown file, `Docs/user_docs/user_knowledge.md`.

The user drops documents (`.pdf`, `.md` or `.txt`) into folders by type: `workexperience/`, `education/`, `projects/<name>/`, `papers/` and `achievements/`. PDFs are converted with `pdftotext -layout`, which keeps multi-column resumes readable.

The agent then rebuilds the knowledge base **one section at a time**:

1. **Profile & Contact**, **Work Experience**, **Education**, **Skills**, **Publications** and **Achievements & Awards** each take one LLM call. Each call gets only the document types that section is written from, so the Education call reads transcripts and resumes, not papers.
2. **Projects** gets one call per project folder, plus one for projects that only the resumes mention.
3. A **Quick Reference for Qualification Matching** summarizes the result (strongest areas, gaps and experience level) for the scoring agent.

Writing section by section is a deliberate fix for a constraint of the model. gpt-oss shares its 4,096-token output budget between its reasoning and its answer, and a full knowledge base is longer than that.

**The knowledge base is updated, not regenerated.** Each section's call is given the current version of that section and told to keep its facts unless a document corrects them. Facts the user typed in by hand, or that came from documents since deleted, are kept. The previous file is backed up as `user_knowledge.prev.md`.

**It also tunes the job search.** The agent compares the new knowledge base with `portals.yml` (target job titles, excluded titles and tracked companies) and proposes changes as JSON. A small line-based editor applies them so the file's extensive comments survive, which `yaml.safe_dump` would discard. Companies it drops are set to `enabled: false` rather than deleted, so nothing is lost.

### The search graph

The core workflow is a parent LangGraph that chains three nodes. Its state carries pandas DataFrames from node to node.

```mermaid
flowchart LR
    S((START)) --> PS[portal_search]
    PS -- "positions found" --> QC[qualification_check]
    PS -- "nothing new" --> E((END))
    QC --> DB[db_ingestion]
    DB --> E
```

```python
class CareerState(TypedDict, total=False):
    portals: list[dict]           # input: companies to search (default: all enabled)
    manual_positions: list[dict]  # input: postings the user pasted in by hand
    positions: pd.DataFrame       # portal_search output
    portal_errors: list[dict]
    skipped_known: int            # postings already on the job board, never re-scored
    scored_positions: pd.DataFrame
    qualification_errors: list[dict]
    ingested: int
    ingestion_errors: list[dict]
```

A conditional edge after `portal_search` ends the run early when no new postings were found, so the model is never loaded just to score an empty table. Each node collects errors in the state rather than raising: one broken careers page or one malformed posting is logged and skipped, and the rest of the run carries on.

#### Node 1: Portal Search (a code-as-action agent)

Every company publishes its jobs differently. Some use an applicant tracking system (ATS) with a JSON API (Greenhouse, Lever, Ashby), and others only have an HTML page. Writing and maintaining a scraper for each of the 130+ tracked companies isn't practical, so the agent **writes its own scrapers**.

It is a *code-as-action* agent. Instead of calling predefined tools, the model replies with a bash or Python script. The script runs in the sandbox, and its stdout, stderr and exit code come back as the model's next message. The model reads the result, fixes its script and tries again, much like a developer working in a terminal.

```mermaid
flowchart LR
    S((START)) --> setup
    setup --> agent
    agent -- "reply has a code block" --> execute
    execute -- "stdout · stderr · exit code" --> agent
    agent -- "replies DONE<br/>or hits MAX_STEPS" --> finalize
    finalize -- "CSV invalid:<br/>ask the model to fix it" --> agent
    finalize -- "CSV valid" --> E((END))
```

- **`setup`** writes the portal's config into the sandbox and lists the files already there.
- **`agent`** calls the model. The system prompt describes the CSV to produce (`company, position, description, post_id, link, jobType`) and how to query each ATS API, preferring the API over HTML.
- **`execute`** runs the script with `docker exec`. Output is cut down to 4,000 characters (the start and end are kept) so a large response can't overflow the model's context.
- **`finalize`** reads the CSV straight from the sandbox and validates it: the right columns, and no rows without a title or link. If something is wrong, a LangGraph `Command(goto="agent")` sends the model back with the exact problem. The model never has to re-type hundreds of rows into its reply, because the program reads the file itself.

A few details make this reliable with a small model:

- **One container per sweep.** All portals in a run share one sandbox, so a Greenhouse fetcher the model writes for the first company can be reused for the next forty.
- **Known jobs are skipped twice.** Links already on the job board are written to `known_links.txt` in the sandbox so the scripts can skip them, and are removed again from the results in case a script ignored the file. Each posting is therefore scored only once, which saves an LLM call per repeat posting.
- **Tool-call fallback.** gpt-oss was trained with a built-in shell tool and sometimes calls it instead of writing a code block. The agent detects those calls and runs the command as if it had been a code block.
- **Bounded loops.** Each portal gets at most 12 model turns, and the graph's recursion limit is set to match.
- **Manual positions.** Jobs the user found elsewhere (a referral or a LinkedIn post) can be pasted into the search page. They join the same pipeline after the scraping step and are scored and saved like any other job.

#### Node 2: Qualification Check

This agent screens each posting the way a technical recruiter would. It sends the full knowledge base as the system prompt and the job description (cut to 8,000 characters) as the task. The model replies with one JSON object:

```json
{
  "requirements": [{"skill": "Kubernetes", "level": "required"},
                   {"skill": "Ray", "level": "preferred"}],
  "matched": ["Kubernetes"],
  "missing": ["Ray"],
  "score": 7,
  "reasoning": "Meets most core requirements; Ray is a quick gap to close."
}
```

The prompt sets a strict standard. A skill only counts as matched if the knowledge base shows evidence for it, and a related skill doesn't count (GCP is not AWS). Scores follow a fixed rubric, from *9–10: meets nearly all requirements and the seniority fits* down to *0–2: a different field*.

Its subgraph is a **validate-and-retry loop**: `setup → agent → finalize`. `finalize` parses the JSON and checks that the score is an integer from 0 to 10 and that the requirements list isn't empty. If parsing fails, it sends the model the exact error ("`score` must be from 0 to 10, got 12") and asks again, up to three attempts. This step runs on the host, not in the sandbox, because it never executes model-written code.

#### Node 3: Database ingestion

The last node is plain Python, with no LLM. It upserts the scored jobs into PostgreSQL:

- **Idempotent IDs.** Each job's primary key is a UUIDv5 of its URL. Running the search again updates the score and description of a saved job instead of duplicating it.
- **Your status is kept.** The upsert never overwrites the application status you set. A job you marked *Interview Scheduled* stays that way after a rescan.
- **Descriptions go to files.** Each description is written to `Docs/job_descriptions/<id>.md`, and the table stores only its path.
- **No score, no save.** Postings without a description can't be scored, so they're skipped and listed in the run's error log.

### The analytics graph

A second, separate LangGraph analyzes the saved job board. It only reads what the search pipeline saved.

```mermaid
flowchart LR
    S((START)) --> LD["load_data<br/>(host · pandas)"]
    LD -- "jobs saved" --> AA["analytics_agent<br/>(sandbox · code-as-action)"]
    LD -- "no jobs" --> E((END))
    AA --> E
```

The work is split by how much it can be trusted:

- **`load_data`** builds the chart tables on the host with plain pandas: status counts, the application funnel, work type, top companies, the score histogram and weekly activity. These need no LLM, so **the charts are always correct and always available**, even if the AI step fails.
- **`analytics_agent`** is the exploratory step. The jobs (with descriptions and each job's matched and missing skills), the chart tables and the candidate's background are written into a fresh sandbox. The model then works like a data analyst, writing and running Python over several turns to produce three files:
  - `near_miss_jobs.csv`: jobs scoring 5–8 that are missing at least one **required** skill.
  - `skill_gaps.csv`: the missing skills across those jobs, with different spellings merged ("k8s" and "Kubernetes"), ranked by how many jobs require them.
  - `report.json`: a written analysis, a short conclusion and 3–5 side-project ideas, each listing the skills it covers, what to build, why it helps and the effort (a weekend, 1–2 weeks or a month or more).

This agent uses the same loop as Portal Search: a code block runs, its output comes back, and `finalize` validates the files against Pydantic schemas. If a file is invalid, the model gets the validation error and fixes it. If the agent still fails, the node returns only the error, and the page keeps showing the charts.

### Resume Builder and the resume chat

**Building a draft** takes two LLM calls, kept separate so neither runs out of output budget:

1. **Write the resume.** The model gets the job posting, the knowledge base and the **full** write-up of every project (the knowledge base only summarizes them). It writes a one-page Markdown resume that leads with the most relevant experience and reuses the posting's wording where it truthfully describes the candidate's work.
2. **Recommend side projects.** It lists the requirements the candidate has no evidence for and proposes 2–3 projects to close those gaps, each with a stack, milestones and the resume bullet to add once it's done.

Both prompts forbid inventing employers, titles, dates, degrees, skills or numbers. If something is missing, the fix is to add it to the knowledge base.

**The chat** then refines a draft. Three details matter:

- **MCP-style context selection.** The candidate's background is exposed as resources with URIs, following the Model Context Protocol's resource model: `draft://resume`, `job://posting`, `kb://section/<slug>` and `project://<name>`. A local model can't reliably request resources through tool calls, and each request would cost an extra generation. So the server picks them instead, by matching the user's message against each resource's name and text. The prompt carries only the background the message is about, not the whole ~40 KB knowledge base, and every message needs only one LLM call.
- **Streaming edits.** The model replies with a short message and, only for the documents it changes, a full replacement inside a ` ```resume ` or ` ```side_projects ` block. Full replacements proved more reliable than patches. The server parses these fences while the reply streams in and sends each token over the WebSocket tagged with its target (`chat`, `resume` or `side_projects`), so the user watches the resume being rewritten in place. While the model is still reasoning, the client sees a "thinking" status. The reasoning text itself is never shown.
- **Version history.** Every change (a chat edit, a manual edit or a restore) first saves the old content as a version, with a note on what replaced it. Any version can be restored, and a restore can itself be undone.

---

## Key design decisions

**Code as action instead of tool calls.** A 20B local model is much less reliable at structured tool calling than a frontier model. Asking it for a script instead uses what it's good at, writing Python and bash, and the script's output is concrete feedback it can act on. Results go through files that the program validates, not through the model's own text.

**Validate, then send the model back.** Every agent that produces structured output (CSV files, JSON or report files) checks it with code. If it's wrong, the agent returns to the model with the exact error. LangGraph's `Command(goto=...)` makes this a clean edge in the graph, and step limits keep the loops bounded.

**Work within the output budget.** gpt-oss's reasoning and its answer share one output budget. Long outputs are therefore split into smaller calls: the knowledge base section by section, and the resume separately from the project ideas.

**Deterministic where possible.** Anything that can be computed exactly (chart tables, deduplication, ID generation, status counting) is plain Python. The LLM only handles judgment: reading postings, scoring fit and writing prose.

**One model, one lock.** The Ollama model is loaded once and kept in memory (`keep_alive=-1`, since reloading 13 GB takes about two minutes). All agents share it behind one lock, which keeps memory use predictable on a consumer GPU.

**A hardened sandbox.** Model-written code runs in a container with a read-only root file system, a non-root user, all Linux capabilities dropped, `no-new-privileges`, and limits on memory (4 GB), CPU, process count and per-command run time (60 s). Its only writable space is a temporary in-memory `/workspace`, and the container is deleted when the run ends. Containers left behind by a crash are labeled so they can be found and removed.

**Facts only.** Every prompt that writes about the candidate (knowledge base, resume, chat, project ideas) restricts the model to facts in the candidate's own documents. When a request isn't supported by those facts, the chat says so instead of making something up.

**Live progress from inside the graph.** Each node writes progress lines to LangGraph's custom stream (`stream_mode="custom"`). The backend collects them into the run record, and the frontend shows them as two live logs: progress ("Searching Anthropic (3/120)") and agent activity (each model step, the command it ran and its exit code). Long local-model runs never look frozen.

---

## Workflows

### End-to-end user journey

```mermaid
flowchart TD
    A["Drop documents in Docs/user_docs/"] --> B["Knowledge page:<br/>generate knowledge base"]
    B --> C["Search page:<br/>pick portals and target roles"]
    C --> D["Run search:<br/>Search → Qualify → Ingest"]
    D --> E["Results tab:<br/>review scores, track status"]
    E --> F["Resume page:<br/>build a tailored draft"]
    F --> G["Refine with the chat,<br/>export Markdown"]
    E --> H["Analytics page:<br/>charts + AI insights"]
    H -- "near-miss skills<br/>→ side projects" --> I["Build projects,<br/>add them to Docs/user_docs/projects/"]
    I --> B
```

The loop at the end is the point of the whole system. Analytics finds the skills holding you back, you build a project that covers them, and the next knowledge base update includes it. New searches then score you higher for those roles.

### Anatomy of a search run

```mermaid
sequenceDiagram
    participant UI as Search page
    participant API as FastAPI
    participant G as Search graph
    participant SBX as Sandbox
    participant LLM as gpt-oss-20b
    participant DB as PostgreSQL

    UI->>API: POST /agents/runs {portals, manual_positions}
    API-->>UI: 202 Accepted {run_id, status: queued}
    API->>G: background task: graph.stream(...)
    loop each portal
        G->>LLM: task + previous output
        LLM-->>G: bash/python script
        G->>SBX: docker exec
        SBX-->>G: stdout / stderr / exit code
    end
    loop each new posting
        G->>LLM: knowledge base + job description
        LLM-->>G: JSON (requirements, matched, missing, score)
    end
    G->>DB: upsert scored jobs (status kept)
    loop every 2 seconds
        UI->>API: GET /agents/runs/{run_id}
        API-->>UI: stage, live logs, summary
    end
```

### Resume chat over WebSocket

1. The client opens `ws://…/agents/resume/drafts/{draft_id}/chat` and sends `{"type": "message", "content": "Emphasize my MLOps work"}`.
2. The server selects the relevant context, takes the model lock and streams the reply:
   `status: thinking` → `status: writing` → many `token` events tagged `chat`, `resume` or `side_projects`.
3. Once the reply finishes, the edits and both chat messages are saved, the old content becomes a version, and the server sends `{"type": "done", "draft": …}`.
4. If another agent holds the model, the server sends an `error` event ("model busy") and keeps the socket open. If the connection drops, the client reconnects with exponential backoff, up to 15 s between attempts.

### API surface

| Area | Endpoints |
| --- | --- |
| Search runs | `POST /agents/runs`, `GET /agents/runs`, `GET /agents/runs/{id}` |
| Search config | `GET/POST /agents/portals`, `DELETE /agents/portals/{name}`, `GET/POST /agents/portals/positions`, `DELETE /agents/portals/positions/{keyword}` |
| Job board | `GET /jobs` (filter, search, sort, paginate), `GET /jobs/{id}`, `PATCH /jobs/{id}/action` |
| Analytics | `GET /agents/analytics` (charts, fast), `POST /agents/analytics/runs`, `GET /agents/analytics/runs/{id}` |
| Knowledge base | `GET /agents/knowledge/documents`, `POST /agents/knowledge/folders`, `POST/GET /agents/knowledge/runs`, `GET /agents/knowledge/runs/{id}` |
| Resume | `POST /agents/resume/{job_id}`, `GET /agents/resume/drafts`, `GET/PUT /agents/resume/drafts/{id}`, `POST /agents/resume/drafts/{id}/revert/{version}`, `WS /agents/resume/drafts/{id}/chat` |

Interactive OpenAPI docs are served at `http://localhost:8000/docs`.

### Data model

```mermaid
erDiagram
    job_board_table ||--o{ resume_drafts : "tailored to"
    job_board_table {
        uuid id PK "uuid5 of link"
        string company_name
        string position
        string link
        string description_path "Docs/job_descriptions/<id>.md"
        enum job_type "onsite | remote | hybrid | unknown"
        int compatibility "0-10"
        enum action "searched → applied → interview_* | denied | drop"
        json requirements
        json matched
        json missing
        string reasoning
        timestamp update_at
    }
    resume_drafts {
        uuid id PK
        uuid job_id FK
        string resume "Markdown"
        string side_projects "Markdown"
        json messages "chat history"
        json versions "snapshots before each edit"
        timestamp update_at
    }
```

---

## Frontend

The web app is built with **Next.js 16** and **React 19** in TypeScript, styled with **Tailwind CSS 4** and **shadcn/ui** components on Base UI, with charts in **Recharts**. It uses a dark theme with a navy, blue, teal and green brand gradient, and works on phones as well as desktops.

### A generated, type-safe API client

The frontend never hand-writes request code. `just gen-api` exports FastAPI's OpenAPI spec and runs `@hey-api/openapi-ts` to generate TypeScript types and an SDK function for every route. FastAPI is configured to use each route's function name as its operation ID, so the generated functions get clean names like `listJobs` and `startRun`. A thin wrapper (`lib/api`) turns failed responses into a typed `ApiError` carrying FastAPI's error message. Any change to a backend schema then shows up as a TypeScript compile error in the frontend.

### Pages

| Page | What it does |
| --- | --- |
| **Knowledge** | Shows the `Docs/user_docs/` folders as file trees, flags empty or missing folders (and can create them), lets you choose which document types to use, runs the Knowledge Base agent, and shows the new knowledge base along with any changes to `portals.yml`. |
| **Search** | Three tabs. **Overview** manages tracked companies and target job titles. **Search** picks portals, queues hand-entered positions in a side drawer, and shows the run as a three-stage pipeline (Search → Qualify → Ingest) with live progress and activity logs. **Results** is the job board: search, filter by status, sort by company, score or date, and change each job's application status inline. |
| **Analytics** | Stat tiles (jobs found, applied, interviews, average match), a **Pipeline** tab (funnel and weekly activity), a **Fit & companies** tab (score histogram with the near-miss band shaded, work type, top companies), and an **AI insights** tab with the written analysis, the near-miss job table, a skill-gap chart and side-project cards. |
| **Resume** | A three-column workspace with resizable panels: saved jobs and their drafts, the resume and side-project documents (edit, copy, download, view history, restore), and the streaming chat assistant. |
| **Docs** | The in-app user guide. It reads Markdown files from `public/Documentation/` at build time, builds a sidebar with links to each section, and renders the pages with GitHub-flavored Markdown. |

### Handling long-running agents in the UI

Local-model runs can take minutes, so the interface is built around them:

- **Runs survive navigation.** Search, analytics and knowledge runs live on the server. When you return to a page, it finds the latest run and picks up its progress. The browser also remembers the latest analytics run, so its results come back after a page reload.
- **Polling with recovery.** Pages poll their run every 2–3 seconds. If the API restarts and the run is gone (`404`), the page resets cleanly instead of showing an error.
- **It always looks alive.** The pipeline view shows which portal is being searched ("Cerebras Systems (12/134)") and how long it has been since the last log line, counting every second. The resume page shows how long a build has been running.
- **Conflicts are explained.** If another agent is using the model, the `409` message tells the user what's busy and to try again when it finishes.
- **Streaming chat.** A `useResumeChat` hook manages the WebSocket connection, reconnects with backoff, and writes incoming tokens into the chat bubble or straight into the open document. A pulsing dot marks the tab being rewritten.

---

## Getting started

**Requirements:** Docker, [`just`](https://github.com/casey/just), Python 3.12+, Node.js 20+ with pnpm, and an NVIDIA GPU with the NVIDIA Container Toolkit. A CPU-only sandbox image is also available.

```bash
git clone https://github.com/ANikfarjam/careerAI
cd careerAI
just install_libraries          # Python deps into .myenv + frontend packages
just install_ollama             # Ollama into ./.ollama (no sudo)
just download_model             # gpt-oss-20b (~13 GB) into ./llmModel
just build_sandbox              # or: just build_sandbox_cpu
just create_postgressDB         # Postgres 17 container
echo 'DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres' > .env

just start_llm                  # Ollama server
just start_app                  # API at http://localhost:8000
just run_gui                    # web app at http://localhost:3000
```

Then open the **Knowledge** page, add your documents and generate your knowledge base. The in-app **Docs** page walks through every feature step by step.

---

## Roadmap

- **Interview coach**: an agent that runs mock interviews tailored to the jobs on your board.
