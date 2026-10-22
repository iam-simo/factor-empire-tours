# Factor Empire Tours & Car Hire

One project folder, two parts. Open THIS folder in VS Code and you will see both.

```
Factor-Empire-Tours/
├── frontend/                 THE WEBSITE (what visitors see)  - React + Vite
│   ├── public/
│   │   ├── logo.jpeg
│   │   └── founder.jpeg
│   ├── src/
│   │   ├── main.jsx          starts the app
│   │   ├── App.jsx           home page + page switching (/, /portal, /admin)
│   │   ├── Portal.jsx        /portal  customer tracks a booking
│   │   ├── Admin.jsx         /admin   staff dashboard
│   │   └── App.css           all styling
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── .eslintrc.cjs
│   ├── .env                  phone, WhatsApp, email, address
│   ├── .gitignore
│   └── README.md
├── backend/                  THE SERVER (saves bookings)       - FastAPI + SQLite
│   ├── main.py
│   ├── requirements.txt
│   ├── .env                  admin password + secret key
│   ├── .gitignore
│   └── README.md
├── .gitignore
└── README.md
```

## Run it (two terminals, both at the same time)

Terminal 1 - backend
```
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Terminal 2 - frontend
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173
