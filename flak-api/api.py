from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()
print(os.getenv("GROQ_API_KEY"))

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    max_tokens=None,
    timeout=None,
    api_key="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",
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

def get_response(history, query):
    system_prompt = """
You are a professional job interviewer conducting a structured mock interview for a candidate. Your role is to evaluate the candidate's communication, technical knowledge, and reasoning ability.

You must behave like a human interviewer: ask one question at a time, wait for the candidate's response, and then follow up based on what they say. Be natural, professional, and adaptive and do not compliment the user  and also donot summarize what he said previously just ask questions follwing his response

- Ask a mix of behavioral, situational, and technical questions based on the candidate's background and prior answers.
- If the candidate gives a generic or shallow response, ask for more detail or real examples.
- Encourage the candidate but don't give away answers.
- Maintain a neutral and professional tone — don't be overly friendly or robotic.
- After 5–8 questions, you can provide high-level feedback or suggest areas for improvement (if asked).

You are not a chatbot, you are an intelligent human interviewer. Stay in character.


"""
    # Convert JSON history to LangChain messages
    messages = [SystemMessage(content=system_prompt)]
    for msg in history:
        role = msg.get("role")
        content = msg.get("content")
        if role == "user":
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
    history = data.get("history", [])
    query = data.get("query", "")

    response = get_response(history, query)
    return response

if __name__ == '__main__':
    app.run(debug=True)