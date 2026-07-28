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

import logging
logger = logging.getLogger(__name__)

def get_llm():
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY in ["your_groq_api_key_here", ""]:
        logger.warning("GROQ_API_KEY is not configured. AI features operating in fallback mode.")
        return None
    try:
        return ChatGroq(temperature=0, model_name="gemma2-9b-it", groq_api_key=settings.GROQ_API_KEY)
    except Exception as e:
        logger.warning(f"Could not initialize ChatGroq: {e}")
        return None

def parse_complaint_text(text: str) -> dict:
    """Robust heuristic & regex parser for full complaint extraction."""
    text_clean = text.strip() if text else ""
    parsed = {
        "title": None,
        "customer_name": None,
        "company": None,
        "product_name": None,
        "product_code": None,
        "batch_number": None,
        "manufacturing_date": None,
        "expiry_date": None,
        "complaint_date": None,
        "category": "product_quality",
        "description": text_clean,
        "severity": "medium",
        "risk_level": "medium",
        "root_cause": "Pending quality investigation.",
        "capa_recommendation": "Investigate manufacturing records, inspect packaging line, collect samples, perform CAPA if required.",
        "investigation_notes": "Automated document intake generated.",
        "priority": "medium",
        "quantity_affected": 1
    }
    
    patterns = {
        "title": r"(?:Complaint\s*Title|Title|Subject)\s*[:\-]\s*(.+)",
        "customer_name": r"(?:Customer\s*Name|Customer|Reporter)\s*[:\-]\s*(.+)",
        "company": r"(?:Company|Medical\s*Store|Hospital|Facility)\s*[:\-]\s*(.+)",
        "product_name": r"(?:Product\s*Name|Product|Drug)\s*[:\-]\s*(.+)",
        "product_code": r"(?:Product\s*Code|SKU|Item\s*Code)\s*[:\-]\s*(.+)",
        "batch_number": r"(?:Batch\s*Number|Batch\s*#|Batch|Lot\s*Number|Lot\s*#|Lot)\s*[:\-]\s*([A-Za-z0-9\-_]+)",
        "manufacturing_date": r"(?:Manufacturing\s*Date|Mfg\s*Date|Mfg)\s*[:\-]\s*(.+)",
        "expiry_date": r"(?:Expiry\s*Date|Expiry|Exp\s*Date|Exp)\s*[:\-]\s*(.+)",
        "complaint_date": r"(?:Complaint\s*Date|Date\s*Reported|Date)\s*[:\-]\s*(.+)",
        "description": r"(?:Complaint\s*Description|Complaint|Issue\s*Details|Details)\s*[:\-]\s*(.+)",
        "risk_level": r"(?:Risk\s*Level|Risk)\s*[:\-]\s*(.+)",
        "severity": r"(?:Severity)\s*[:\-]\s*(.+)",
        "capa_recommendation": r"(?:Recommendation|CAPA\s*Recommendation|CAPA)\s*[:\-]\s*(.+)",
        "root_cause": r"(?:Root\s*Cause)\s*[:\-]\s*(.+)"
    }
    
    for key, pattern in patterns.items():
        m = re.search(pattern, text_clean, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if val:
                parsed[key] = val

    if not parsed["product_name"]:
        m = re.search(r"([A-Za-z0-9\s]+(?:Tablets|Capsules|Syrup|Injection|500\s*mg|250\s*mg))", text_clean, re.IGNORECASE)
        if m:
            parsed["product_name"] = m.group(1).strip()

    if not parsed["batch_number"]:
        m = re.search(r"\b([A-Z]{2,4}\d{4,8})\b", text_clean)
        if m:
            parsed["batch_number"] = m.group(1).strip()

    if not parsed["title"]:
        if parsed["product_name"]:
            parsed["title"] = f"Quality Complaint - {parsed['product_name']}"
        else:
            lines = [l.strip() for l in text_clean.split("\n") if l.strip()]
            parsed["title"] = lines[0][:100] if lines else "Product Complaint Intake"

    if parsed["risk_level"]:
        r_lower = str(parsed["risk_level"]).lower()
        if "high" in r_lower or "critical" in r_lower:
            parsed["priority"] = "high"
            parsed["severity"] = "high"
        elif "low" in r_lower:
            parsed["priority"] = "low"
            parsed["severity"] = "low"

    return parsed


def extract_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    extracted_text = state.get("extracted_text", "")
    
    # Run heuristic parsing as baseline
    heuristic_data = parse_complaint_text(extracted_text)
    
    # If user provided input to fix missing fields, update parsed_data
    if state.get("user_input") and state.get("parsed_data"):
        if llm:
            try:
                update_prompt = f"Update this JSON: {json.dumps(state['parsed_data'])} with this new info: {state['user_input']}. Respond ONLY with valid JSON."
                response = llm.invoke(update_prompt)
                cleaned = _clean_json(response.content)
                data = json.loads(cleaned)
                state["parsed_data"].update(data)
            except Exception:
                pass
        else:
            state["parsed_data"]["description"] = (state["parsed_data"].get("description", "") + " " + state["user_input"]).strip()
        state["user_input"] = None
        return state
    
    if not state.get("parsed_data"):
        ai_data = {}
        if llm:
            try:
                chain = EXTRACTION_PROMPT | llm
                response = chain.invoke({"text": extracted_text})
                cleaned = _clean_json(response.content)
                ai_data = json.loads(cleaned)
            except Exception as e:
                logger.error(f"LLM extraction error: {e}")
        
        # Merge heuristic baseline with AI data (AI takes precedence where provided)
        final_data = {**heuristic_data}
        if isinstance(ai_data, dict):
            for k, v in ai_data.items():
                if v and str(v).strip():
                    final_data[k] = v
        state["parsed_data"] = final_data

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
    missing_str = ", ".join(state["missing_fields"])
    if llm:
        try:
            chain = CHAT_PROMPT | llm
            response = chain.invoke({
                "missing_fields": missing_str,
                "complaint_data": json.dumps(state.get("parsed_data", {}))
            })
            state["chat_response"] = response.content
            return state
        except Exception as e:
            logger.error(f"LLM chat node error: {e}")
    
    state["chat_response"] = f"Please provide the following missing details to process your complaint: {missing_str}."
    return state

def summary_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    if llm:
        try:
            chain = SUMMARY_PROMPT | llm
            response = chain.invoke({"complaint_data": json.dumps(state.get("parsed_data", {}))})
            cleaned = _clean_json(response.content)
            data = json.loads(cleaned)
            state["summary_data"] = data
            return state
        except Exception as e:
            logger.error(f"LLM summary error: {e}")
    
    desc = state.get("parsed_data", {}).get("description", "")
    state["summary_data"] = {
        "ai_summary": f"Summary: {desc[:200]}..." if desc else "Automated complaint summary generated.",
        "ai_suggested_action": "Perform quality inspection and notify QA manager."
    }
    return state

def risk_node(state: WorkflowState) -> WorkflowState:
    llm = get_llm()
    if llm:
        try:
            chain = RISK_PROMPT | llm
            response = chain.invoke({"complaint_data": json.dumps(state.get("parsed_data", {}))})
            cleaned = _clean_json(response.content)
            data = json.loads(cleaned)
            state["risk_data"] = data
            return state
        except Exception as e:
            logger.error(f"LLM risk error: {e}")
    
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
