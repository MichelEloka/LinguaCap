# Synthèse vocale allemande hors ligne (Piper) et encodage MP3 (ffmpeg), pour les sons des contenus LinguaCap.
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir piper-tts==1.3.0
WORKDIR /work
