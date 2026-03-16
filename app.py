from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

# ── HOME ROUTE ──
@app.route("/")
def index():
    return render_template("index.html")


# ── ANALYZE ROUTE (AI Mentorship) ──
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        subjects = data.get("subjects", [])
        cgpa = data.get("cgpa", 0)

        if not subjects:
            return jsonify({"error": "No subjects provided"}), 400

        # Build subject list string
        subject_list = ""
        for s in subjects:
            subject_list += f"- {s['name']}: Grade {s['grade']} ({s['credits']} credits)\n"

        prompt = f"""
You are a warm, honest and experienced academic mentor for Indian university students.
The student has shared their semester grades below.

Subjects and Grades:
{subject_list}
Calculated CGPA: {cgpa}

IMPORTANT LANGUAGE RULE:
- First write the COMPLETE analysis in ENGLISH only
- Then write a divider line: ────────────────────
- Then write the COMPLETE analysis again in HINDI only
- Do NOT mix languages in the same paragraph

Write in exactly this structure:

═══ ENGLISH ANALYSIS ═══

📉 WEAK AREAS
[Full English analysis of weak subjects]

🎯 FOCUS NEXT SEMESTER
[Full English focus advice]

🗺️ IMPROVEMENT ROADMAP
[Full English 2-semester roadmap]

💬 MENTOR'S MESSAGE
[One powerful motivational line in English]

────────────────────────────────────

═══ हिंदी विश्लेषण ═══

📉 कमज़ोर क्षेत्र
[Same weak areas analysis in Hindi]

🎯 अगले सेमेस्टर पर ध्यान दें
[Same focus advice in Hindi]

🗺️ सुधार का रोडमैप
[Same roadmap in Hindi]

💬 गुरु का संदेश
[Same motivational line in Hindi]
"""

        response = model.generate_content(prompt)
        return jsonify({"result": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── BACKLOG RESCUE ROUTE ──
@app.route("/backlog", methods=["POST"])
def backlog():
    try:
        data = request.get_json()
        backlogs = data.get("backlogs", [])

        if not backlogs:
            return jsonify({"error": "No backlog subjects provided"}), 400

        # Build backlog list string
        backlog_list = ""
        for b in backlogs:
            backlog_list += f"- {b['name']} (Difficulty: {b['difficulty']})\n"

        prompt = f"""
You are an expert academic rescue planner for Indian university students.
The student has the following backlog subjects they need to clear:

{backlog_list}

IMPORTANT LANGUAGE RULE:
- First write the COMPLETE plan in ENGLISH only
- Then write a divider line: ────────────────────
- Then write the COMPLETE plan again in HINDI only
- Do NOT mix languages in the same paragraph

═══ ENGLISH PLAN ═══

🆘 BACKLOG PRIORITY ORDER
[List subjects in order of which to clear first and why]

📅 WEEK-BY-WEEK STUDY PLAN
[Clear week by week plan with specific topics each week]

⏰ HOURS PER SUBJECT
[Exact hours per week for each subject]

💪 RESCUE MESSAGE
[One powerful closing message for a struggling student]

────────────────────────────────────

═══ हिंदी योजना ═══

🆘 प्राथमिकता क्रम
[Same priority order in Hindi]

📅 साप्ताहिक अध्ययन योजना
[Same week by week plan in Hindi]

⏰ प्रति विषय घंटे
[Same hours per subject in Hindi]

💪 हौसला बढ़ाने वाला संदेश
[Same rescue message in Hindi]
"""

        response = model.generate_content(prompt)
        return jsonify({"result": response.text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── RUN ──
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
