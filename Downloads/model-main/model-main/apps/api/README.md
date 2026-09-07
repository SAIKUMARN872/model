# AI Platform

Production-ready AI Platform built with FastAPI.

## Features

- FastAPI
- PostgreSQL
- Redis
- JWT Authentication
- OpenAI
- Google Gemini
- Groq
- Docker
- Logging
- Monitoring

## Installation

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux

```bash
source venv/bin/activate
```

Install packages

```bash
pip install -r requirements.txt
```

Run

```bash
uvicorn main:app --reload
```

Open

```
http://localhost:8000/docs
```