import os
from flask import Flask, request, session, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)

# Load secrets from environment; never hardcode keys.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # keep server-side only
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
FRONTEND_ORIGIN_PROD = os.getenv("FRONTEND_ORIGIN_PROD", "https://your-frontend.vercel.app")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
	raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

# Secret key for signing Flask sessions; rotate if leaked.
app.secret_key = os.getenv("FLASK_SECRET_KEY") or os.urandom(24)

# Secure session cookie flags
app.config.update(
	SESSION_COOKIE_SECURE=True,      # send only over HTTPS
	SESSION_COOKIE_HTTPONLY=True,    # not accessible to JS
	SESSION_COOKIE_SAMESITE="Lax",  # adjust to "Strict" if it fits UX
)

# Allow your frontend origins and cookies
CORS(
	app,
	supports_credentials=True,
	origins=[FRONTEND_ORIGIN, FRONTEND_ORIGIN_PROD],
)

supabase: Client = create_client(
	supabase_url=SUPABASE_URL,
	supabase_key=SUPABASE_SERVICE_KEY,
)

def current_user():
	user_id = session.get("user_id")
	if not user_id:
		return None
	user = supabase.table("users").select("id,email,display_name").eq("id", user_id).single().execute()
	return user.data if user.data else None

@app.post("/api/auth/login")
def login():
	body = request.get_json() or {}
	email = body.get("email")
	password = body.get("password")
	if not email or not password:
		return jsonify({"error": "Missing credentials"}), 400

	# Example: verify against Supabase auth.users
	auth = supabase.auth.sign_in_with_password({"email": email, "password": password})
	if not auth.user:
		return jsonify({"error": "Invalid credentials"}), 401

	# Persist session server-side; browser gets a session cookie
	session["user_id"] = auth.user.id

	return jsonify({
		"userId": auth.user.id,
		"email": auth.user.email,
		"displayName": auth.user.user_metadata.get("full_name") if auth.user.user_metadata else None,
	})

@app.post("/api/auth/logout")
def logout():
	session.clear()
	return jsonify({"ok": True})

@app.get("/api/auth/session")
def session_route():
	user = current_user()
	if not user:
		return jsonify({"error": "unauthenticated"}), 401
	return jsonify({
		"userId": user.get("id"),
		"email": user.get("email"),
		"displayName": user.get("display_name"),
	})

if __name__ == "__main__":
	app.run(debug=True, port=5000)
