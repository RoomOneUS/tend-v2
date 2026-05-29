#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-8000}"
PID_FILE="$(dirname "$0")/.serve.pid"
LOG_FILE="$(dirname "$0")/.serve.log"
ROOT="$(cd "$(dirname "$0")" && pwd)"

usage() {
  cat <<EOF
Usage: $(basename "$0") {start|stop|restart|status} [port]

  start    Start the static server (default port: $PORT)
  stop     Stop the running server
  restart  Stop then start
  status   Show whether the server is running

Env:
  PORT     Override default port (current: $PORT)
EOF
}

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  if is_running; then
    echo "Already running (pid $(cat "$PID_FILE")) on port $PORT"
    exit 0
  fi
  echo "Starting server on http://localhost:$PORT (root: $ROOT)"
  (cd "$ROOT" && nohup python3 -m http.server "$PORT" >"$LOG_FILE" 2>&1 &
   echo $! > "$PID_FILE")
  sleep 0.3
  if is_running; then
    echo "Started (pid $(cat "$PID_FILE")). Logs: $LOG_FILE"
  else
    echo "Failed to start. See $LOG_FILE"
    exit 1
  fi
}

stop() {
  if ! is_running; then
    echo "Not running"
    rm -f "$PID_FILE"
    return
  fi
  pid="$(cat "$PID_FILE")"
  echo "Stopping pid $pid"
  kill "$pid" 2>/dev/null || true
  for _ in 1 2 3 4 5; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.2
  done
  kill -9 "$pid" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "Stopped"
}

status() {
  if is_running; then
    echo "Running (pid $(cat "$PID_FILE")) on port $PORT"
  else
    echo "Not running"
  fi
}

cmd="${1:-}"
[[ $# -ge 2 ]] && PORT="$2"

case "$cmd" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; start ;;
  status)  status ;;
  *)       usage; exit 1 ;;
esac
