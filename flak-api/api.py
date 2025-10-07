from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers.json import JsonOutputParser
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.embeddings import HuggingFaceEmbeddings


load_dotenv(override=True)
print(os.getenv("GROQ_API_KEY"))


backend = PyPDFLoader("pdfs/backend-engineer.pdf")
# frontend = PyPDFLoader("pdfs/frontend-engineer.pdf")
# aiEngineer = PyPDFLoader("pdfs/Ai_Engineer.pdf")

docs = backend.load() 

splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=15)
chunks = splitter.split_documents(docs)
print("before embeddings")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
   # instead of CPU
)
print("after embeddings")
vectorstore = FAISS.from_documents(chunks, embeddings)

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 3})
parser = JsonOutputParser(pydantic_object=None)
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    max_tokens=None,
    timeout=None,
    api_key=os.getenv("GROQ_API_KEY"),
)

app = Flask(__name__)
CORS(app)


"""{
   
  "history": [
    {"role": "user", "content": "Tell me about yourself."},
    {"role": "assistant", "content": "I am an AI interview bot. I will ask you some questions."},
    {"role": "user", "content": "Okay, I'm ready."}
  ],
  "query": "What’s the next question?"
}
"""
parser = JsonOutputParser()

# Prompt
prompt = PromptTemplate(
    template="""
You are an AI interview evaluator. 
 Be critical and conservative when evaluating.  
- Do not inflate scores. Short, vague, or incomplete answers should receive low ratings.  
- Penalize irrelevant, shallow, or incorrect responses.  
- Award high scores only if answers are detailed, precise, and well-structured.  
- Keep string values short and professional (e.g., "Clear", "Vague", "Partially correct").Analyze the following interview conversation on various aspects includeding the amount of content and the time of the interview  and return ONLY a JSON object.
Treat a very short conversation as poor performance.
Conversation History:
{history}

Required JSON schema:
{{
  "Content & Knowledge Metrics": {{
    "Relevance": "string",
    "Correctness": "string",
    "Completeness": "string",
    "Problem-solving": "string",
    "Domain Knowledge Depth": "Beginner/Intermediate/Expert"
  }},
  "Communication & Language Metrics": {{
    "Clarity": "string",
    "Conciseness": "string",
    "Vocabulary": "string",
    "Grammar & Fluency": "string"
  }},
  "Overall Summary": "string",
  "score": "integer"
}}

{format_instructions}
""",
    input_variables=["history"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# Chain
chain = LLMChain(
    llm=llm,
    prompt=prompt,
    
    output_parser=parser
)

def get_report(history):
    return chain.run(history=history)

@app.route('/api/interview/get_report', methods=['POST'])
def get_report_route():
    data = request.json
    history = data.get("history", "")
    report = get_report(history)
    return jsonify(report)


def get_response(history, query):

    context = retriever.get_relevant_documents(query)
    system_prompt = """
You are a professional job interviewer conducting a structured mock interview for a candidate. Your role is to evaluate the candidate's communication, technical knowledge, and reasoning ability.

You must behave like a human interviewer: ask one question at a time, wait for the candidate's response, and then follow up based on what they say. Be natural, professional, and adaptive and do not compliment the user  and also donot summarize what he said previously just ask questions follwing his response

- Ask a mix of behavioral, situational, and technical questions based on the candidate's background and prior answers.
- If the candidate gives a generic or shallow response, ask for more detail or real examples.
- Encourage the candidate but don't give away answers.
- Maintain a neutral and professional tone — don't be overly friendly or robotic.
- After 5–8 questions, you can provide high-level feedback or suggest areas for improvement (if asked).

You are not a chatbot, you are an intelligent human interviewer. Stay in character.

use this context for asking questions and also maintain the flow do'nt jump to other topics {context}

"""
    # Convert JSON history to LangChain messages
    messages = [SystemMessage(content=system_prompt)]
    for msg in history:
        
        role = msg.get("role")
        content = msg.get("content")
        if msg == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    # Add current user query
    messages.append(HumanMessage(content=query))

    try:
        # Generate AI response from Groq
        response = llm.invoke(messages)
        return jsonify({"response": response.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/interview/get_respone', methods=['POST'])
def get_response_route():
    data = request.json
    history = data.get("history", {})
    query = data.get("query", "")

    response = get_response(history, query)
    return response


"""
making a RAG + Agent pipeline for ai Coach
"""
class AgentState(TypedDict):
    question: str
    context: str
    enhanced_prompt: str
    answer: str

def prompt_node(state: AgentState):
    # Just forwards the user question
    return {"question": state["question"]}

agent = ChatGroq(model="llama-3.3-70b-versatile", temperature=0, api_key=os.getenv("GROQ_API_KEY"))

enhancer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a prompt enhancer. Given a question and context, rewrite it as a clearer, richer prompt for tool use."),
    ("user", "Question: {question}\nContext: {context}")
])

def prompt_enhancer_node(state: AgentState):
    context = state.get("context", "")  # Get context if available, otherwise an empty string
    messages = enhancer_prompt.format_prompt(
        question=state["question"], context=context
    ).to_messages()
    response = agent.invoke(messages)
    return {"enhanced_prompt": response.content}
tools = {
    "web_search": DuckDuckGoSearchRun()
}

tool_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a smart agent. Use only english and the given prompt to decide whether to answer directly or call a tool. If the prompt is about summarizing or answering questions based on the provided context, answer directly. Only use english language and the web search tool if the prompt explicitly asks for external information or current events."),
    ("user", "{enhanced_prompt}")
])

def toolcalling_node(state: AgentState):
    messages = tool_prompt.format_prompt(enhanced_prompt=state["enhanced_prompt"]).to_messages()
    response = agent.invoke(messages)

    # Naive routing: check keywords
    if "search" in response.content.lower() and "web_search" in tools:
        results = tools["web_search"].invoke(state["question"])
        tool_result = results
        return {"answer": tool_result}
    else:
        # Return the model's direct response if no search is indicated or tool is not available
        return {"answer": response.content}



@app.route('/api/coach/get_advice', methods=['POST'])
def get_advice_route():

    graph = StateGraph(AgentState)

    graph.add_node("prompt", prompt_node)
    graph.add_node("enhancer", prompt_enhancer_node)
    graph.add_node("toolcaller", toolcalling_node)

    graph.set_entry_point("prompt")

    graph.add_edge("prompt", "enhancer")
    graph.add_edge("enhancer", "toolcaller")
    graph.add_edge("toolcaller", END)

    app = graph.compile()
    data = request.json
    question = data.get("question", "")
    context = data.get("history", "")

    initial_state: AgentState = {
        "question": question,
        "context": context,
        "enhanced_prompt": "",
        "answer": ""
    }

    final_state = app.invoke(initial_state)
    return jsonify({"advice": final_state["answer"]})
if __name__ == '__main__':
    app.run(debug=True)