import re
from functools import lru_cache
from typing import TypedDict

import ollama
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

from app.core.config import settings
from app.core.vector_store import ChromaVectorIndex, chunk_text


@lru_cache
def get_client() -> ollama.Client:
    return ollama.Client(host=settings.OLLAMA_HOST) if settings.OLLAMA_HOST else ollama.Client()


def _embed(texts: list[str]) -> list[list[float]]:
    response = get_client().embed(model=settings.OLLAMA_EMBED_MODEL, input=list(texts))
    return [list(vector) for vector in response["embeddings"]]


@lru_cache
def get_vector_index() -> ChromaVectorIndex:
    return ChromaVectorIndex(embed=_embed, path=settings.CHROMA_DB)


_ROLES = {SystemMessage: "system", HumanMessage: "user", AIMessage: "assistant"}


def _to_ollama_messages(messages: list[BaseMessage]) -> list[dict[str, str]]:
    return [{"role": _ROLES[type(m)], "content": m.content} for m in messages]

BASE_SYSTEM_PROMPT = (
    "You are an upbeat, encouraging learning assistant inside a video-learning app called "
    "AI Learner. How the app works: a student organizes their studying into 'sessions'. Each "
    "session is an isolated knowledge base made ONLY of YouTube videos the student has pasted "
    "a link to â€” nothing else. When they say 'the video' or 'this video', they mean a video "
    "already added to the CURRENT session described below, not something external or from a "
    "different session.\n\n"
    "You will often be given transcript excerpts retrieved for the student's question. How to "
    "use them, in order:\n"
    "1. If the excerpts directly answer the question, answer from them and nothing else needs "
    "to change.\n"
    "2. If the excerpts partially cover it, use what's there and be clear about what's missing.\n"
    "3. If the question asks for code, an example implementation, or syntax for a concept the "
    "excerpts show the video discusses, write clear, correct example code yourself â€” transcripts "
    "are spoken narration and never contain literal code, so this is not guessing.\n"
    "4. If the question is a reasonable opinion, feasibility, advice, or how-to question that is "
    "clearly about the same subject as the video (e.g. 'is this possible to do myself', 'how "
    "hard is this', 'what would I need'), and the excerpts don't spell out an answer, you MAY "
    "answer using your own general knowledge â€” just say plainly that this is your own general "
    "knowledge rather than something the video itself stated.\n"
    "5. If the excerpts genuinely don't cover it and it's a specific fact you'd only know from "
    "the video (e.g. who the creator/channel is, a number or name only the video would state), "
    "say honestly that the video doesn't cover that, in one direct sentence â€” don't pad it with "
    "a generic redirect and don't fabricate an answer.\n"
    "6. If the question is about a subject with NO real connection to the video's topic at all "
    "(a different subject entirely, not just a detail the video omits) â€” say plainly that it's "
    "outside this session's videos, briefly note what they do cover, and STOP THERE. Do not "
    "then go on to answer the unrelated question from your own general knowledge anyway, not "
    "even as a bonus or an aside â€” that defeats the point of telling the student it's out of "
    "scope. This is the one case where you must NOT be maximally helpful: being honest about "
    "scope matters more here than answering everything. (Case 4 is different: that's for "
    "questions still about the video's own subject, just not spelled out in the excerpts.)\n\n"
    "Whichever case applies, respond specifically to what was actually asked â€” never fall back "
    "to a generic canned description of the video when the question deserves a direct answer. "
    "Two different questions should never produce the same answer.\n\n"
    "Excerpts are one-way source material, not something the student said. You may use earlier "
    "turns of this conversation for context â€” including treating follow-ups like 'explain that "
    "one by one' or 'go deeper' as continuations of what you just discussed â€” but never claim to "
    "remember a session or conversation that isn't shown here. For greetings or small talk, "
    "respond warmly and briefly.\n\n"
    "Formatting: write substantive answers in clear, well-structured Markdown, and give the "
    "full answer in one message rather than deferring to 'look it up elsewhere' â€” you have "
    "everything you need in the excerpts and your own knowledge of how to explain concepts. "
    "Use '##'/'###' headings to break up multi-part answers, **bold** for key terms, and "
    "numbered or bulleted lists for steps or multiple examples. Put any diagram, flow, ASCII "
    "architecture sketch, or code in a fenced code block (triple backticks). Use a Markdown "
    "table when comparing multiple items side by side. Keep prose tight â€” prefer structure "
    "over long paragraphs."
)


def _build_system_prompt(video_titles: list[str], scoped_title: str | None) -> str:
    prompt = BASE_SYSTEM_PROMPT
    if scoped_title:
        prompt += f"\n\nThe student has scoped this conversation to one specific video: \"{scoped_title}\"."
    elif len(video_titles) == 1:
        prompt += (
            f"\n\nThis session currently has exactly one video: \"{video_titles[0]}\". "
            "Assume 'the video' refers to it."
        )
    elif len(video_titles) > 1:
        listing = "; ".join(f'"{t}"' for t in video_titles)
        prompt += (
            f"\n\nThis session currently has {len(video_titles)} videos: {listing}. If the "
            "student says 'the video' without specifying which, answer using whichever "
            "excerpts are most relevant, or briefly ask them to clarify only if genuinely "
            "ambiguous."
        )
    else:
        prompt += (
            "\n\nThis session has no videos added yet. If the student asks about 'the video' "
            "or wants a summary, tell them to paste a YouTube link into this session first â€” "
            "don't ask them which video, since none exist yet."
        )
    return prompt


_GREETING_RE = re.compile(
    r"^(hi|hello|hey|yo|sup|howdy|good\s?(morning|afternoon|evening)|thanks|thank\s?you|"
    r"ok|okay|bye|goodbye|see\s?ya)[!.,? ]*$",
    re.IGNORECASE,
)

MAX_HISTORY_TURNS = 6


def _is_small_talk(question: str) -> bool:
    return bool(_GREETING_RE.match(question.strip()))


class RAGState(TypedDict):
    question: str
    history: list[BaseMessage]
    filters: dict
    system_prompt: str
    context: str
    sources: list
    answer: str


def _retrieve_node(state: RAGState) -> RAGState:
    if _is_small_talk(state["question"]):
        return {**state, "context": "", "sources": []}

    results = get_vector_index().retrieve(
        state["question"], top_k=8, filters=state.get("filters") or {}
    )
    context = "\n\n".join(result.content for result in results)
    sources = sorted({result.metadata.get("title") or result.source for result in results if result.source})
    return {**state, "context": context, "sources": sources}


def _generate_node(state: RAGState) -> RAGState:
    if state["context"]:
        human_content = f"Transcript excerpts:\n{state['context']}\n\nQuestion: {state['question']}"
    else:
        human_content = state["question"]

    messages: list[BaseMessage] = [
        SystemMessage(content=state["system_prompt"]),
        *state["history"],
        HumanMessage(content=human_content),
    ]
    response = get_client().chat(
        model=settings.OLLAMA_MODEL, messages=_to_ollama_messages(messages)
    )
    return {**state, "answer": response["message"]["content"] or ""}


@lru_cache
def get_rag_graph():
    graph = StateGraph(RAGState)
    graph.add_node("retrieve", _retrieve_node)
    graph.add_node("generate", _generate_node)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    return graph.compile()


def ingest_transcript(
    *, session_id: int, video_id: str, title: str, text: str, user_id: int
) -> list[str]:
    """Chunk + embed a transcript scoped to one session. Returns the chunk ids created."""
    chunks = chunk_text(
        text,
        source=f"{session_id}:{video_id}",
        metadata={
            "user_id": str(user_id),
            "session_id": str(session_id),
            "video_id": video_id,
            "title": title,
        },
    )
    get_vector_index().add(chunks)
    return [chunk.chunk_id for chunk in chunks]


def delete_chunks(chunk_ids: list[str]) -> None:
    if not chunk_ids:
        return
    get_vector_index().delete(chunk_ids)


def build_history_messages(prior_turns: list[tuple[str, str]]) -> list[BaseMessage]:
    """Convert (question, answer) tuples, oldest first, into chat messages."""
    messages: list[BaseMessage] = []
    for question, answer in prior_turns[-MAX_HISTORY_TURNS:]:
        messages.append(HumanMessage(content=question))
        messages.append(AIMessage(content=answer))
    return messages


def ask(
    *,
    question: str,
    user_id: int,
    session_id: int,
    video_id: str | None = None,
    history: list[BaseMessage] | None = None,
    video_titles: list[str] | None = None,
    scoped_title: str | None = None,
) -> dict:
    filters: dict = {"user_id": str(user_id), "session_id": str(session_id)}
    if video_id:
        filters["video_id"] = video_id

    result = get_rag_graph().invoke(
        {
            "question": question,
            "history": history or [],
            "filters": filters,
            "system_prompt": _build_system_prompt(video_titles or [], scoped_title),
            "context": "",
            "sources": [],
            "answer": "",
        }
    )
    return {"answer": result["answer"], "sources": result["sources"]}
