import os

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simple in-memory question list (no database).
questions = [
  {
    "id": 1,
    "question": "What is the capital of India?",
    "options": ["New Delhi", "Mumbai", "Chennai", "Kolkata"],
    "answer": "New Delhi"
  },
  {
    "id": 2,
    "question": "Which planet is known as the Red Planet?",
    "options": ["Earth", "Mars", "Jupiter", "Venus"],
    "answer": "Mars"
  },
  {
    "id": 3,
    "question": "What is 8 x 7?",
    "options": ["54", "56", "64", "48"],
    "answer": "56"
  },
  {
    "id": 4,
    "question": "Which language is used to style web pages?",
    "options": ["HTML", "CSS", "Python", "Java"],
    "answer": "CSS"
  },
  {
    "id": 5,
    "question": "Who wrote the Indian National Anthem?",
    "options": ["Rabindranath Tagore", "Mahatma Gandhi", "Sarojini Naidu", "Bankim Chandra Chattopadhyay"],
    "answer": "Rabindranath Tagore"
  },
  {
    "id": 6,
    "question": "How many continents are there in the world?",
    "options": ["5", "6", "7", "8"],
    "answer": "7"
  }
]


@app.route("/")
def home():
  # Simple health message to confirm backend is running.
  return jsonify({"message": "KBC backend is running"})


@app.route("/api/questions", methods=["GET"])
def get_questions():
  print("GET /api/questions called")

  # Return JSON data for API clients.
  return jsonify(questions)


@app.route("/api/answer", methods=["POST"])
def check_answer():
  data = request.get_json(silent=True) or {}
  print("POST /api/answer payload:", data)

  question_id = data.get("question_id")
  selected_answer = data.get("selected_answer")
  selected_index = data.get("selected_index")

  # Find question by id.
  selected_question = None

  for item in questions:
    if item["id"] == question_id:
      selected_question = item
      break

  if selected_question is None:
    return jsonify({"error": "Invalid question id"}), 400

  # If frontend sends index instead of text, convert index to answer text.
  if selected_answer is None and isinstance(selected_index, int):
    if 0 <= selected_index < len(selected_question["options"]):
      selected_answer = selected_question["options"][selected_index]

  if not isinstance(selected_answer, str):
    return jsonify({"error": "Please send selected_answer"}), 400

  is_correct = selected_answer.strip() == selected_question["answer"]

  return jsonify(
    {
      "correct": is_correct,
      "correct_answer": selected_question["answer"]
    }
  )


if __name__ == "__main__":
  # Render provides the port using environment variable PORT.
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port, debug=False)
