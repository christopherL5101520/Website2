from flask import Flask, jsonify
from flask_cors import CORS
import os
import time

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})

# --- tracking storage ---
active_users = set()
known_users = set()
peak_active_users = 0
total_users = 0
total_visits = 0

# we track "last seen" so we can expire inactive users
last_seen = {}
TIMEOUT = 30  # seconds before a user is considered inactive


@app.route("/")
def health_check():
    return jsonify({"status": "ok", "service": "study-ai-tracker"})


def cleanup_inactive_users():
    """Remove users who haven't pinged recently."""
    global active_users

    now = time.time()
    to_remove = []

    for user_id in active_users:
        if now - last_seen.get(user_id, 0) > TIMEOUT:
            to_remove.append(user_id)

    for user_id in to_remove:
        active_users.remove(user_id)


@app.route("/ping/<user_id>")
def ping(user_id):
    global total_users, peak_active_users

    # Count a browser as a total user only once, even if it goes inactive and returns.
    if user_id not in known_users:
        known_users.add(user_id)
        total_users += 1

    active_users.add(user_id)

    # update last seen
    last_seen[user_id] = time.time()

    # update peak correctly
    if len(active_users) > peak_active_users:
        peak_active_users = len(active_users)

    return "ok"

@app.route("/visit/<user_id>")
def visit(user_id):
    global total_visits
    total_visits += 1
    return jsonify({"visits": total_visits})


@app.route("/stats")
def stats():
    cleanup_inactive_users()

    return jsonify({
        "activeUsers": len(active_users),
        "peakActiveUsers": peak_active_users,
        "totalUsers": total_users,
        "visits": total_visits
    })


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() in {"1", "true", "yes", "on"}
    app.run(host=host, port=port, debug=debug)
