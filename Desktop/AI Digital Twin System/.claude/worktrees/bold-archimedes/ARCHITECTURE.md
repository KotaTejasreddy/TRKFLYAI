# AI Digital Twin System - Architecture

## 1. High-Level Architecture

    CLIENT LAYER (Web App / Mobile / API Consumers / CLI)
        | HTTP/WebSocket
        v
    API GATEWAY (FastAPI)
      Auth & Users | Twin Profiles | Conversation | Memory Query | Admin & Health
        |
        v
    ORCHESTRATION LAYER
      SUPERVISOR AGENT
        |--- Conversation Agent
        |--- Memory Recall Agent
        |--- Personality Agent
        |--- Knowledge Agent
        |--- Task Execution Agent
        |
        v
    CORE SYSTEMS
      Personality Engine    Memory System       LLM Gateway
      (traits, style,      (working, short,    (Claude, OpenAI,
       rules)               long, episodic)     failover chain)
        |
        v
    DATA LAYER
      PostgreSQL          ChromaDB/Qdrant       Redis
      (profiles,          (vector               (cache,
       sessions)           embeddings)           sessions)

## 2. Specialist Agents
| Agent | Responsibility |
|---|---|
| Conversation Agent | Generates natural dialogue, manages turn-taking |
| Memory Recall Agent | Searches vector DB for relevant memories |
| Personality Agent | Validates tone/style, rewrites if drift detected |
| Knowledge Agent | Retrieves factual knowledge |
| Task Execution Agent | Handles structured tasks |

## 3. Memory System
| Type | Storage | TTL | Purpose |
|---|---|---|---|
| Working | Redis | Session | Current conversation context |
| Short-term | Redis+Postgres | 24h | Recent interactions |
| Long-term | Vector DB+Postgres | Permanent | Core memories |
| Episodic | Vector DB | Permanent | Event recollections |
| Semantic | Vector DB | Permanent | General knowledge |

## 4. Tech Stack
| Layer | Technology |
|---|---|
| API | FastAPI |
| LLM | Claude (primary), OpenAI (fallback) |
| Vector DB | ChromaDB (dev) / Qdrant (prod) |
| Relational DB | PostgreSQL |
| Cache | Redis |
| Embeddings | text-embedding-3-small |
| Queue | Celery + Redis |
| Auth | JWT + API Keys |
| Deploy | Docker + Docker Compose |
| Test | pytest + pytest-asyncio |
| Observability | Structlog + OpenTelemetry |

## 5. Key Design Decisions
1. Supervisor pattern over flat agents
2. Layered memory with consolidation
3. Provider-agnostic LLM layer
4. Personality as a first-class system
5. Async everywhere
