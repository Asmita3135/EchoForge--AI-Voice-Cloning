import json

# Risk score for each suspicious category
SCORES = {
    "credential_request": 30,
    "financial": 20,
    "urgency": 15,
    "authority": 15,
    "suspicious_action": 20
}

# Explanation for each category
REASONS = {
    "credential_request": "Credential request detected",
    "financial": "Financial/Bank-related content detected",
    "urgency": "Urgency language detected",
    "authority": "Authority/official identity reference detected",
    "suspicious_action": "Suspicious action requested"
}

def load_keywords():
    with open("keywords.json", "r", encoding="utf-8") as file:
        return json.load(file)

def get_risk_level(score):

    if score >= 60:
        return "HIGH"

    elif score >= 30:
        return "MEDIUM"

    else:
        return "LOW"

def analyze_context(transcript):

    keywords = load_keywords()

    text = transcript.lower()

    detected = {}

    # Check every category and keyword
    for category, words in keywords.items():

        matches = []

        for word in words:

            if word.lower() in text:
                matches.append(word)

        if matches:
            detected[category] = matches

    # Calculate score
    score = 0

    for category in detected:
        score += SCORES.get(category, 0)

    score = min(score, 100)

    # Generate explanations
    reasons = []

    for category in detected:
        if category in REASONS:
            reasons.append(REASONS[category])

    # Return complete analysis
    return {
        "context_score": score,
        "risk_level": get_risk_level(score),
        "detected": detected,
        "reasons": reasons
    }