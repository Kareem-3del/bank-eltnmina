FROM python:3.12-alpine

# git + rsync are all the deploy needs; hook.py is stdlib-only.
RUN apk add --no-cache git rsync

WORKDIR /app
COPY hook.py /app/hook.py

EXPOSE 9000
CMD ["python3", "/app/hook.py"]
