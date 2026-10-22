# Backend (FastAPI + SQLite)

Run from this folder:

```
py -m venv .venv
.venv\Scripts\activate          (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Edit `.env` first: set `ADMIN_PASSWORD` and `SECRET_KEY`.
Bookings are saved in `factor_empire.db`, created automatically on first run.
