#!/bin/bash
cd "$(dirname "$0")"
cd ../youtube_dl/

. venv/bin/activate

python app.py > output.log 2>&1 &

echo "Server started"
