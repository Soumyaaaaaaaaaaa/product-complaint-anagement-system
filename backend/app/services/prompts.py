from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

EXTRACTION_SYSTEM_PROMPT = """You are an expert at extracting structured information from product complaints.
Extract the following information from the provided text. For each field, provide the extracted 'value' and a 'confidence' score between 0.0 and 1.0.
Fields to extract:
- title
- description
- lot_number
- quantity_affected
- product_name

Respond only with a valid JSON object matching the requested schema, where each key is the field name and its value is an object with 'value' and 'confidence'.
Example: {"title": {"value": "Broken vial", "confidence": 0.95}, ...}
Do not include markdown formatting or additional text.
"""

EXTRACTION_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(EXTRACTION_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Document text:\n{text}")
])


SUMMARY_SYSTEM_PROMPT = """You are an expert at summarizing product complaints.
Given the complaint details, provide a concise summary and a suggested next action.
Respond only with a valid JSON object matching the requested schema. Do not include markdown formatting or additional text.
"""

SUMMARY_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(SUMMARY_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Complaint Data:\n{complaint_data}")
])


RISK_SYSTEM_PROMPT = """You are an expert at risk classification for product complaints.
Classify the priority (low, medium, high, critical) and category of the complaint based on its details.
Categories include: product_quality, packaging, labeling, adverse_reaction, contamination, efficacy, delivery, other.
Respond only with a valid JSON object matching the requested schema. Do not include markdown formatting or additional text.
"""

RISK_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(RISK_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Complaint Data:\n{complaint_data}")
])


CHAT_SYSTEM_PROMPT = """You are a helpful AI assistant for a product complaint management system.
Your task is to ask the user to provide missing information for their complaint.
The user has provided some information, but the following fields are still missing: {missing_fields}.

Ask a polite, concise question to gather this missing information.
Do not ask for anything that has already been provided.
"""

CHAT_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(CHAT_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Current data: {complaint_data}\n\nAsk the user for the missing fields.")
])


ROOT_CAUSE_SYSTEM_PROMPT = """You are an expert quality assurance analyst.
Analyze the provided product complaint and determine the most likely root cause.
Respond only with a valid JSON object containing:
- root_cause: A concise string stating the root cause.
- confidence_score: A float between 0.0 and 1.0.
- reasoning: A brief explanation of why this root cause was selected.
Do not include markdown formatting or additional text.
"""

ROOT_CAUSE_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(ROOT_CAUSE_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Complaint Data:\n{complaint_data}")
])


CAPA_SYSTEM_PROMPT = """You are an expert quality assurance analyst.
Based on the product complaint, recommend Corrective and Preventive Actions (CAPA).
Respond only with a valid JSON object containing:
- corrective_actions: An array of strings (immediate actions).
- preventive_actions: An array of strings (long-term actions to prevent recurrence).
Do not include markdown formatting or additional text.
"""

CAPA_PROMPT = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(CAPA_SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template("Complaint Data:\n{complaint_data}")
])

