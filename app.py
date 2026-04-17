from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Keep data simple in memory (student-level, no database).
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
    "question": "What is 5 + 7?",
    "options": ["10", "11", "12", "13"],
    "answer": "12"
  },
  {
    "id": 4,
    "question": "Who is the father of computers?",
    "options": ["Charles Babbage", "Einstein", "Newton", "Tesla"],
    "answer": "Charles Babbage"
  },
  {
    "id": 5,
    "question": "Which language is used for web styling?",
    "options": ["HTML", "CSS", "Python", "Java"],
    "answer": "CSS"
  },
  {
    "id": 6,
    "question": "Which is the largest ocean?",
    "options": ["Atlantic", "Indian", "Pacific", "Arctic"],
    "answer": "Pacific"
  },
  {
    "id": 7,
    "question": "Which country invented cricket?",
    "options": ["India", "England", "Australia", "South Africa"],
    "answer": "England"
  },
  {
    "id": 8,
    "question": "What is the boiling point of water?",
    "options": ["90°C", "100°C", "80°C", "120°C"],
    "answer": "100°C"
  },
  {
    "id": 9,
    "question": "Which gas do plants use for photosynthesis?",
    "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    "answer": "Carbon Dioxide"
  },
  {
    "id": 10,
    "question": "Which is the fastest land animal?",
    "options": ["Lion", "Tiger", "Cheetah", "Horse"],
    "answer": "Cheetah"
  }
]


@app.route("/")
def home():
  # Health route: returns JSON, never HTML.
  return jsonify({"message": "API running"})


@app.route("/api/questions")
def get_questions():
  # Main API route for quiz data.
  return jsonify(questions)


@app.route("/api/answer", methods=["POST"])
def answer():
  # Read selected answer from request body.
  data = request.get_json(silent=True) or {}
  question_id = data.get("question_id")
  selected_answer = data.get("selected_answer")

  # Find the selected question by id.
  selected_question = None

  for item in questions:
    if item["id"] == question_id:
      selected_question = item
      break

  if selected_question is None:
    return jsonify({"error": "Invalid question id"}), 400

  return jsonify(
    {
      "correct": selected_answer == selected_question["answer"],
      "correct_answer": selected_question["answer"]
    }
  )


if __name__ == "__main__":
  # Use Render port in production, 5000 locally.
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port)
