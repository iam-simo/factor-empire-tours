"""Factor Empire Tours & Car Hire - API

Local:       uvicorn main:app --reload --port 8000      (uses SQLite file)
Production:  set DATABASE_URL to a Postgres connection string (e.g. Neon)
             and the same code stores bookings in Postgres instead.
"""
import base64
import hashlib
import hmac
import os
import re
import secrets
import sqlite3
import time
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE = Path(__file__).parent
load_dotenv(BASE / ".env")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "change-me")
SECRET = os.getenv("SECRET_KEY", "dev-secret-change-me").encode()
DB_PATH = BASE / os.getenv("DB_FILE", "factor_empire.db")
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
USE_PG = DATABASE_URL.startswith(("postgres://", "postgresql://"))
ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
STATUSES = {"new", "confirmed", "in_progress", "completed", "cancelled"}
TOKEN_TTL = 8 * 3600

if USE_PG:
    import psycopg
    from psycopg.rows import dict_row

    # Refuse to run in production with missing or placeholder secrets
    _pw, _key = os.getenv("ADMIN_PASSWORD", ""), os.getenv("SECRET_KEY", "")
    if not _pw or not _key or _pw.startswith("change") or _key.startswith("change"):
        raise RuntimeError(
            "Set real ADMIN_PASSWORD and SECRET_KEY environment variables before using DATABASE_URL."
        )

app = FastAPI(title="Factor Empire API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------- database
def now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


class Conn:
    """Thin wrapper so the same SQL (written with ? placeholders) runs on SQLite and Postgres."""

    def __init__(self, raw):
        self.raw = raw

    def execute(self, sql: str, params=()):
        if USE_PG:
            sql = sql.replace("?", "%s")
        return self.raw.execute(sql, params)


_schema_ready = False


def create_schema(conn: Conn):
    pk = "SERIAL PRIMARY KEY" if USE_PG else "INTEGER PRIMARY KEY AUTOINCREMENT"
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS enquiries (
            id {pk},
            reference TEXT UNIQUE NOT NULL,
            kind TEXT NOT NULL,
            item TEXT DEFAULT '',
            pickup TEXT DEFAULT '',
            pick_date TEXT DEFAULT '',
            drop_date TEXT DEFAULT '',
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            status TEXT NOT NULL DEFAULT 'new',
            admin_notes TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )"""
    )


@contextmanager
def db():
    global _schema_ready
    if USE_PG:
        raw = psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=10)
    else:
        raw = sqlite3.connect(DB_PATH)
        raw.row_factory = sqlite3.Row
    conn = Conn(raw)
    try:
        if not _schema_ready:
            create_schema(conn)
            raw.commit()
            _schema_ready = True
        yield conn
        raw.commit()
    finally:
        raw.close()


def digits(s: str) -> str:
    return re.sub(r"\D", "", s or "")


# ---------------------------------------------------------------- auth
def make_token() -> str:
    exp = str(int(time.time()) + TOKEN_TTL)
    sig = hmac.new(SECRET, exp.encode(), hashlib.sha256).hexdigest()
    return base64.urlsafe_b64encode(f"{exp}.{sig}".encode()).decode()


def valid_token(token: str) -> bool:
    try:
        exp, sig = base64.urlsafe_b64decode(token.encode()).decode().split(".")
        good = hmac.new(SECRET, exp.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(sig, good) and int(exp) > time.time()
    except Exception:
        return False


def require_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer ") or not valid_token(authorization[7:]):
        raise HTTPException(status_code=401, detail="Please sign in again.")


# ---------------------------------------------------------------- schemas
class EnquiryIn(BaseModel):
    kind: str = Field(pattern="^(car|tour)$")
    item: str = Field("", max_length=120)
    pickup: str = Field("", max_length=160)
    pick_date: str = Field("", max_length=10)
    drop_date: str = Field("", max_length=10)
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=30)
    email: str = Field("", max_length=160)
    notes: str = Field("", max_length=1000)


class LoginIn(BaseModel):
    password: str


class EnquiryPatch(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = Field(None, max_length=2000)


# ---------------------------------------------------------------- public routes
@app.get("/api/health")
def health():
    return {"ok": True, "database": "postgres" if USE_PG else "sqlite"}


@app.post("/api/enquiries", status_code=201)
def create_enquiry(body: EnquiryIn):
    if len(digits(body.phone)) < 7:
        raise HTTPException(422, "Please enter a valid phone number.")
    if body.pick_date and body.drop_date and body.drop_date < body.pick_date:
        raise HTTPException(422, "Drop-off date must be after the pick-up date.")
    stamp = now_str()
    with db() as c:
        while True:
            ref = "FE-" + "".join(secrets.choice("ABCDEFGHJKLMNPQRSTUVWXYZ23456789") for _ in range(6))
            if not c.execute("SELECT 1 FROM enquiries WHERE reference=?", (ref,)).fetchone():
                break
        c.execute(
            """INSERT INTO enquiries
               (reference, kind, item, pickup, pick_date, drop_date, name, phone, email, notes, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            (ref, body.kind, body.item, body.pickup, body.pick_date, body.drop_date,
             body.name.strip(), body.phone.strip(), body.email.strip(), body.notes.strip(), stamp, stamp),
        )
    return {"reference": ref}


@app.get("/api/track")
def track(ref: str, phone: str):
    with db() as c:
        row = c.execute("SELECT * FROM enquiries WHERE reference=?", (ref.strip().upper(),)).fetchone()
    # Phone must match (last 9 digits) so references can't be guessed by strangers
    if not row or digits(row["phone"])[-9:] != digits(phone)[-9:]:
        raise HTTPException(404, "We couldn't find a booking with those details.")
    keys = ("reference", "kind", "item", "pickup", "pick_date", "drop_date", "name", "status", "created_at", "updated_at")
    return {k: row[k] for k in keys}


# ---------------------------------------------------------------- admin routes
@app.post("/api/admin/login")
def login(body: LoginIn):
    if not hmac.compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        raise HTTPException(401, "Wrong password.")
    return {"token": make_token()}


@app.get("/api/admin/enquiries", dependencies=[Depends(require_admin)])
def list_enquiries():
    with db() as c:
        rows = c.execute("SELECT * FROM enquiries ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


@app.patch("/api/admin/enquiries/{enquiry_id}", dependencies=[Depends(require_admin)])
def update_enquiry(enquiry_id: int, body: EnquiryPatch):
    if body.status is not None and body.status not in STATUSES:
        raise HTTPException(422, "Unknown status.")
    with db() as c:
        row = c.execute("SELECT * FROM enquiries WHERE id=?", (enquiry_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Not found.")
        status = body.status if body.status is not None else row["status"]
        notes = body.admin_notes if body.admin_notes is not None else row["admin_notes"]
        c.execute(
            "UPDATE enquiries SET status=?, admin_notes=?, updated_at=? WHERE id=?",
            (status, notes, now_str(), enquiry_id),
        )
        row = c.execute("SELECT * FROM enquiries WHERE id=?", (enquiry_id,)).fetchone()
    return dict(row)


@app.delete("/api/admin/enquiries/{enquiry_id}", dependencies=[Depends(require_admin)])
def delete_enquiry(enquiry_id: int):
    with db() as c:
        c.execute("DELETE FROM enquiries WHERE id=?", (enquiry_id,))
    return {"deleted": enquiry_id}