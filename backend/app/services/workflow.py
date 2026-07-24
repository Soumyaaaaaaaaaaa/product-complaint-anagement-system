import json
import re
from typing import Annotated, TypedDict, List, Optional, Any, Dict
from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq
from app.config import settings
from app.schemas.ai_schemas import ExtractionResult, RiskClassification, SummaryResult
from app.services.prompts import EXTRACTION_PROMPT, RISK_PROMPT, SUMMARY_PROMPT, CHAT_PROMPT

class WorkflowState(TypedDict):
    thread_id: str
    extracted_text: str
    parsed_data: Dict[str, Any]
    missing_fields: List[str]
    chat_history: List[Any]
    chat_response: Optional[str]
    user_input: Optional[str]
    summary_data: Dict[str, Any]
    risk_data: Dict[str, Any]
    final_complaint: Dict[str, Any]

def _clean_json(text: str) -> str:
    """Helper to clean markdown formatting from LLM JSON responses."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()

def get_llm():
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set.")
    return ChatGroq(temperature=0, model_name="gemma2-9b-it", groq_api_key=settings.GROQ_API_KEY)

def extract_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    chain = EXTRACTION_PROMPT | llm
    
    # If user provided input to fix missing fields, we should update parsed_data
    if state.get("user_input") and state.get("parsed_data"):
        # We can do a quick LLM call to merge user input into parsed_data
        # But for simplicity, we could just re-run extraction with the user input appended
        # Or better, a specific chain to update. Let's do a quick update chain.
        update_prompt = f"Update this JSON: {json.dumps(state['parsed_data'])} with this new info: {state['user_input']}. Respond ONLY with valid JSON."
        response = llm.invoke(update_prompt)
        try:
            cleaned = _clean_json(response.content)
            data = json.loads(cleaned)
            state["parsed_data"].update(data)
        except Exception:
            pass
        # Clear user input after processing
        state["user_input"] = None
        return state
    
    if not state.get("parsed_data"):
        response = chain.invoke({"text": state["extracted_text"]})
        try:
            cleaned = _clean_json(response.content)
            data = json.loads(cleaned)
            state["parsed_data"] = data
        except Exception as e:
            state["parsed_data"] = {}
    return state

def validate_node(state: WorkflowState) -> WorkflowState:
    data = state.get("parsed_data", {})
    required_fields = ["title", "description", "product_name"]
    missing = []
    for field in required_fields:
        if not data.get(field):
            missing.append(field)
    
    state["missing_fields"] = missing
    return state

def should_chat(state: WorkflowState) -> str:
    if state.get("missing_fields") and len(state["missing_fields"]) > 0:
        return "chat"
    return "summary"

def chat_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    chain = CHAT_PROMPT | llm
    
    response = chain.invoke({
        "missing_fields": ", ".join(state["missing_fields"]),
        "complaint_data": json.dumps(state.get("parsed_data", {}))
    })
    
    state["chat_response"] = response.content
    return state

def summary_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    chain = SUMMARY_PROMPT | llm
    response = chain.invoke({"complaint_data": json.dumps(state.get("parsed_data", {}))})
    
    try:
        cleaned = _clean_json(response.content)
        data = json.loads(cleaned)
        state["summary_data"] = data
    except Exception:
        state["summary_data"] = {"ai_summary": "", "ai_suggested_action": ""}
    return state

def risk_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    chain = RISK_PROMPT | llm
    response = chain.invoke({"complaint_data": json.dumps(state.get("parsed_data", {}))})
    
    try:
        cleaned = _clean_json(response.content)
        data = json.loads(cleaned)
        state["risk_data"] = data
    except Exception:
        state["risk_data"] = {"priority": "medium", "category": "other"}
    return state

def save_node(state: WorkflowState) -> WorkflowState:
    parsed = state.get("parsed_data", {})
    summary = state.get("summary_data", {})
    risk = state.get("risk_data", {})
    
    state["final_complaint"] = {
        "title": parsed.get("title", "Untitled Complaint"),
        "description": parsed.get("description", ""),
        "product_name": parsed.get("product_name"),
        "lot_number": parsed.get("lot_number"),
        "quantity_affected": parsed.get("quantity_affected"),
        "ai_summary": summary.get("ai_summary"),
        "ai_suggested_action": summary.get("ai_suggested_action"),
        "priority": risk.get("priority", "medium"),
        "category": risk.get("category", "other"),
    }
    return state

# Build the Graph
workflow = StateGraph(WorkflowState)

workflow.add_node("extract", extract_node)
workflow.add_node("validate", validate_node)
workflow.add_node("chat", chat_node)
workflow.add_node("summary", summary_node)
workflow.add_node("risk", risk_node)
workflow.add_node("save", save_node)

workflow.set_entry_point("extract")
workflow.add_edge("extract", "validate")
workflow.add_conditional_edges(
    "validate",
    should_chat,
    {
        "chat": "chat",
        "summary": "summary"
    }
)
# Note: From chat, the workflow pauses until user input is provided, then it should go back to extract.
# In LangGraph, we can just end after chat and resume from extract when input is provided.
workflow.add_edge("chat", END)
workflow.add_edge("summary", "risk")
workflow.add_edge("risk", "save")
workflow.add_edge("save", END)

from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()
app_workflow = workflow.compile(checkpointer=memory)
