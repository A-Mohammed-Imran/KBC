from flask import Flask, jsonify, render_template, request
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
  # Render the main HTML page.
  return render_template("index.html")


@app.route("/api/questions", methods=["GET"])
def get_questions():
  print("GET /api/questions called")

  # Send questions without answers to the frontend.
  public_questions = []

  for item in questions:
    public_questions.append(
      {
        "id": item["id"],
        "question": item["question"],
        "options": item["options"]
      }
    )

  return jsonify(public_questions)


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
  app.run(debug=True)
