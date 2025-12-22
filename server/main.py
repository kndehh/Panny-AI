import os
import uuid
import traceback
from datetime import timedelta
from flask import Flask, request, session, jsonify
from supabase import create_client, Client
from dotenv import load_dotenv
import requests
from werkzeug.middleware.proxy_fix import ProxyFix
from gradio_client import Client as GradioClient

basedir = os.path.dirname(__file__)
dotenv_path = os.path.join(basedir, ".env")
load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
FRONTEND_ORIGIN_PROD = os.getenv("FRONTEND_ORIGIN_PROD")  # set: https://panny-ai.vercel.app
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("Missing Supabase env: SUPABASE_URL / SUPABASE_SERVICE_KEY")

# Gradio AoLAI/PannyAI client
gr_client = GradioClient("AoLAI/PannyAI")

app = Flask(__name__)

# IMPORTANT: use stable FLASK_SECRET_KEY in Railway Variables
app.secret_key = os.getenv("FLASK_SECRET_KEY")
if not app.secret_key:
    app.secret_key = os.urandom(24)
    print("[server] WARNING: FLASK_SECRET_KEY missing, using random secret. Sessions will break across restarts.")

# Railway proxy HTTPS correctness
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

is_prod = not FLASK_DEBUG

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    PERMANENT_SESSION_LIFETIME=timedelta(days=30),
    SESSION_COOKIE_SECURE=True if is_prod else False,
    SESSION_COOKIE_SAMESITE="None" if is_prod else "Lax",
)

# Chrome tightening support; Safari may ignore but harmless
if is_prod:
    app.config["SESSION_COOKIE_PARTITIONED"] = True

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

allowed_origins = [o for o in [FRONTEND_ORIGIN, FRONTEND_ORIGIN_PROD] if o]


def _is_allowed_origin(origin: str) -> bool:
    if not origin:
        return False
    if origin in allowed_origins:
        return True
    if origin.endswith(".vercel.app"):
        return True
    return False


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin", "")
        resp = app.make_response(("", 204))
        if _is_allowed_origin(origin):
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Vary"] = "Origin"
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
            req_headers = request.headers.get("Access-Control-Request-Headers")
            resp.headers["Access-Control-Allow-Headers"] = req_headers or "Content-Type, Authorization"
        return resp


@app.after_request
def add_cors_headers(resp):
    origin = request.headers.get("Origin", "")
    if _is_allowed_origin(origin):
        resp.headers["Access-Control-Allow-Origin"] = origin
        resp.headers["Vary"] = "Origin"
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return resp


@app.errorhandler(Exception)
def handle_exception(e):
    tb = traceback.format_exc()
    print(f"[server] unhandled exception: {e}\n{tb}")
    return jsonify({"error": "internal_server_error", "message": str(e)}), 500


def _session_payload(user_id: str, email: str, display_name: str = ""):
    data = {"userId": str(user_id), "email": str(email)}
    if display_name:
        data["displayName"] = display_name
    return data


def _auth_payload(user: dict, access_token: str = None):
    payload = _session_payload(user["id"], user["email"], user.get("display_name", ""))
    if access_token:
        payload["accessToken"] = access_token
        payload["tokenType"] = "bearer"
    return payload


def _get_bearer_token():
    auth = request.headers.get("Authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1].strip()
    return None


def _get_user_from_supabase_access_token(access_token: str):
    if not access_token:
        return None
    apikey = SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY
    if not apikey:
        return None
    try:
        resp = requests.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": apikey, "Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        if resp.status_code != 200:
            return None
        data = resp.json() or {}
        user_id = data.get("id")
        email = data.get("email")
        user_metadata = data.get("user_metadata") or {}
        display_name = ""
        if isinstance(user_metadata, dict):
            display_name = user_metadata.get("display_name", "") or ""
        if not user_id or not email:
            return None
        return {"id": user_id, "email": email, "display_name": display_name}
    except Exception:
        return None


def current_user():
    user_id = session.get("user_id")
    user_email = session.get("user_email")
    display_name = session.get("display_name", "")
    if user_id and user_email:
        return {"id": user_id, "email": user_email, "display_name": display_name}

    token = _get_bearer_token()
    user_from_token = _get_user_from_supabase_access_token(token)
    if user_from_token:
        return user_from_token
    return None


def _unauthenticated_response():
    return jsonify(
        {
            "error": "unauthenticated",
            "message": "Login first or send Authorization: Bearer <supabase_access_token>.",
        }
    ), 401


def _execute_or_raise(res, label: str):
    err = getattr(res, "error", None)
    if err:
        print(f"[server][supabase] {label}: {err}")
        raise RuntimeError(f"{label}: {err}")
    return getattr(res, "data", None)


def _safe_upsert_chat_session(session_id: str, user_id: str, meta=None):
    payload = {"id": session_id, "user_id": user_id}
    if meta is not None:
        payload["meta"] = meta
    res = supabase.table("chat_sessions").upsert(payload).execute()
    _execute_or_raise(res, "upsert chat_sessions failed")
    return True


def _safe_insert_messages(rows):
    res = supabase.table("messages").insert(rows).execute()
    _execute_or_raise(res, "insert messages failed")
    return True


def _call_ai(prompt: str):
    system_prompt = (
        "You are Panny, a mental health companion. "
        "Be warm, empathetic, and supportive. "
        "Ask gentle follow-up questions. "
        "Do not diagnose. "
        "If the user mentions self-harm or suicide, encourage seeking immediate professional help "
        "and provide emergency resources appropriate to their location."
    )
    try:
        res = gr_client.predict(
            message=prompt,
            system_message=system_prompt,
            max_tokens=512,
            temperature=0.7,
            top_p=0.95,
            api_name="/chat",
        )

        # Normalize the response into a reply string
        reply_text = ""
        if isinstance(res, dict):
            # common keys
            for k in ("reply", "message", "output", "result", "text"):
                if k in res and res[k]:
                    reply_text = res[k]
                    break
            if not reply_text and "data" in res:
                d = res["data"]
                if isinstance(d, list) and d:
                    reply_text = d[0]
                else:
                    reply_text = str(d)
        elif isinstance(res, list):
            reply_text = res[0] if res else ""
        else:
            reply_text = str(res)

        reply_text = (reply_text or "").strip()
        if not reply_text:
            reply_text = "Aku dengerin ya. Mau cerita sedikit lagi?"

        return {"reply": reply_text, "model": "AoLAI/PannyAI"}

    except Exception as e:
        print(f"[server][ai] _call_ai failed: {e}\n{traceback.format_exc()}")
        return {"reply": "Aku dengerin ya. Mau cerita sedikit lagi?", "model": "AoLAI/PannyAI"}


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True}), 200


@app.route("/api/auth/session", methods=["GET"])
def auth_session():
    u = current_user()
    if not u:
        return jsonify(None), 200
    return jsonify(_session_payload(u["id"], u["email"], u.get("display_name", ""))), 200


@app.route("/api/auth/logout", methods=["POST"])
def auth_logout():
    session.clear()
    return jsonify({"ok": True}), 200


# Alias GET logout for older frontend calls (avoid 405)
@app.route("/api/auth/logout", methods=["GET"])
def auth_logout_get_alias():
    return auth_logout()


@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""
    display_name = (body.get("displayName") or body.get("display_name") or body.get("name") or "").strip()

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    apikey = SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY
    if not apikey:
        return jsonify({"error": "server_misconfigured", "message": "Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY"}), 500

    payload = {"email": email, "password": password}
    if display_name:
        payload["data"] = {"display_name": display_name}

    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/signup",
        headers={"apikey": apikey, "Content-Type": "application/json"},
        json=payload,
        timeout=20,
    )
    if r.status_code >= 300:
        print("[server][auth_signup] supabase signup failed:", r.status_code, r.text)
        return jsonify({"error": "signup_failed", "message": r.text}), 400

    login_resp = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": apikey, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=20,
    )
    if login_resp.status_code >= 300:
        print("[server][auth_signup] supabase login after signup failed:", login_resp.status_code, login_resp.text)
        return jsonify({"error": "signup_ok_but_login_failed", "message": login_resp.text}), 200

    token_data = login_resp.json() or {}
    access_token = token_data.get("access_token")

    user = _get_user_from_supabase_access_token(access_token)
    if not user:
        return jsonify({"error": "signup_ok_but_user_fetch_failed"}), 200

    session["user_id"] = str(user["id"])
    session["user_email"] = user.get("email")
    session["display_name"] = user.get("display_name", "")
    session.permanent = True

    return jsonify(_auth_payload(user, access_token)), 200


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip()
    password = body.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    apikey = SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY
    if not apikey:
        return jsonify({"error": "server_misconfigured", "message": "Missing SUPABASE_ANON_KEY or SUPABASE_SERVICE_KEY"}), 500

    r = requests.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={"apikey": apikey, "Content-Type": "application/json"},
        json={"email": email, "password": password},
        timeout=20,
    )
    if r.status_code >= 300:
        return jsonify({"error": "login_failed", "message": r.text}), 401

    token_data = r.json() or {}
    access_token = token_data.get("access_token")

    user = _get_user_from_supabase_access_token(access_token)
    if not user:
        return jsonify({"error": "login_failed", "message": "could not fetch user"}), 401

    session["user_id"] = str(user["id"])
    session["user_email"] = user.get("email")
    session["display_name"] = user.get("display_name", "")
    session.permanent = True

    return jsonify(_auth_payload(user, access_token)), 200


@app.route("/api/chat", methods=["POST"])
def chat():
    user = current_user()
    if not user:
        return _unauthenticated_response()

    body = request.get_json() or {}
    prompt = (body.get("prompt") or "").strip()
    session_id = body.get("sessionId") or str(uuid.uuid4())

    if not prompt:
        return jsonify({"error": "prompt required"}), 400

    user_id = str(user.get("id"))
    res = _call_ai(prompt)
    reply_text = (res.get("reply") or "").strip() or "Aku dengerin ya. Mau cerita sedikit lagi?"

    try:
        _safe_upsert_chat_session(session_id, user_id)
        rows = [
            {
                "id": str(uuid.uuid4()),
                "chat_session_id": session_id,
                "user_id": user_id,
                "content": prompt,
                "metadata": {"role": "user"},
            },
            {
                "id": str(uuid.uuid4()),
                "chat_session_id": session_id,
                "user_id": user_id,
                "content": reply_text,
                "metadata": {"role": "assistant", "source": "gradio-aolai"},
            },

        ]
        _safe_insert_messages(rows)
    except Exception as e:
        print(f"[server][db] persist chat failed: {e}")

    return jsonify(
        {
            "reply": reply_text,
            "model": "AoLAI/PannyAI",
            "source": "gradio-aolai",
            "sessionId": session_id,
        }
    ), 200


@app.route("/api/chat/check_login_status", methods=["GET"])
def check_login_status():
    """Call the model's internal `_check_login_status` endpoint via Gradio client and return the result."""
    try:
        res = gr_client.predict(api_name="/_check_login_status")
        return jsonify({"ok": True, "result": res}), 200
    except Exception as e:
        print(f"[server][ai] check_login_status failed: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "check_failed", "message": str(e)}), 500


@app.route("/api/chat/history/get", methods=["GET"])
def get_chat_history():
    user = current_user()
    if not user:
        return _unauthenticated_response()

    session_id = request.args.get("sessionId")
    include_messages = request.args.get("includeMessages", "false").lower() == "true"

    if not session_id:
        result = (
            supabase.table("chat_sessions")
            .select("id,created_at,meta")
            .eq("user_id", str(user["id"]))
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        data = _execute_or_raise(result, "select chat_sessions failed") or []
        return jsonify({"sessions": data}), 200

    result = (
        supabase.table("chat_sessions")
        .select("id,user_id,meta,created_at")
        .eq("user_id", str(user["id"]))
        .eq("id", str(session_id))
        .limit(1)
        .execute()
    )
    rows = _execute_or_raise(result, "select chat_session failed") or []
    sess = rows[0] if rows else None

    if sess and include_messages:
        msgs_res = (
            supabase.table("messages")
            .select("id,chat_session_id,user_id,content,metadata,created_at")
            .eq("chat_session_id", str(session_id))
            .order("created_at", desc=False)
            .execute()
        )
        sess["messages"] = _execute_or_raise(msgs_res, "select messages failed") or []

    return jsonify({"session": sess}), 200


@app.route("/api/chat/history", methods=["POST"])
def save_chat_history():
    user = current_user()
    if not user:
        return _unauthenticated_response()

    body = request.get_json() or {}
    session_id = (body.get("sessionId") or "").strip()
    messages = body.get("messages") or []

    if not session_id:
        return jsonify({"error": "sessionId required"}), 400
    if not isinstance(messages, list):
        return jsonify({"error": "messages must be a list"}), 400

    user_id = str(user.get("id"))

    _safe_upsert_chat_session(session_id, user_id)

    rows = []
    for m in messages:
        if not isinstance(m, dict):
            continue
        content = (m.get("text") or m.get("content") or "").strip()
        role = (m.get("role") or "").strip() or "user"
        if not content:
            continue
        rows.append(
            {
                "id": str(uuid.uuid4()),
                "chat_session_id": session_id,
                "user_id": user_id,
                "content": content,
                "metadata": {"role": role},
            }
        )

    if rows:
        _safe_insert_messages(rows)

    return jsonify({"ok": True}), 200


# Alias GET /api/chat/history for older frontend calls (avoid 405)
@app.route("/api/chat/history", methods=["GET"])
def get_chat_history_alias():
    return get_chat_history()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=FLASK_DEBUG, use_reloader=False)
