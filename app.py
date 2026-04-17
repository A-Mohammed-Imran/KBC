from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Keep data simple in memory (student-level, no database).
questions = [
  {
    "id": 1,
    "question": "Capital of India?",
    "options": ["Delhi", "Mumbai", "Chennai", "Kolkata"],
    "answer": "Delhi"
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
  q = questions[0]

  return jsonify(
    {
      "correct": data.get("selected_answer") == q["answer"],
      "correct_answer": q["answer"]
    }
  )


if __name__ == "__main__":
  # Use Render port in production, 5000 locally.
  port = int(os.environ.get("PORT", 5000))
  app.run(host="0.0.0.0", port=port)
