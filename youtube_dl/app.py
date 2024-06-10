from flask import Flask, request, jsonify
import os
import logging
from yt_dlp import YoutubeDL

app = Flask(__name__)

SAVE_PATH = "./save"


def download(link, save_path):
    try:
        key = link.replace("/", "")

        link = playlistToVideo(link)

        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(save_path, f'{key}.opus')
        }
        with YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(link, download=True)
            video_title = info_dict.get('title', None)
        print("Download is completed successfully")

        return video_title
    except Exception as e:
        logging.error("An error occurred while downloading the audio: %s", e)
        return None


def playlistToVideo(url):
    if "?list=" in url:
        playlist_id = url.split("?list=")[0]
        return playlist_id
    else:
        return url
    

def validator_url(url):
    return True


@app.route('/download_audio', methods=['POST'])
def download_audio_route():
    try:
        data = request.json
        video_url = data.get('video_url')
        guild = data.get('guild')

        if not video_url or not guild:
            return jsonify({'error': 'Missing video_url or guild in request'}), 400
        
        if not validator_url(video_url):
            return jsonify({'error': 'Invalid video_url'}), 400

        local_path = os.path.join(SAVE_PATH, guild)
        os.makedirs(local_path, exist_ok=True)

        title = download(video_url, local_path)

        return jsonify({'title': title}), 200
    except Exception as e:
        logging.error("An error occurred while processing the request: %s", e)
        return jsonify({'error': 'Internal server error'}), 500
    


@app.route('/delete', methods=['POST'])
def delete():
    data = request.json
    guild = data.get('guild')
    url = data.get('video_url')

    if not guild:
        return jsonify({'error': 'Missing guild in request'}), 400
    
    if not url:
        return jsonify({'error': 'Missing url in request'}), 400

    local_path = os.path.join(SAVE_PATH, guild)
    key = url.replace("/", "")
    if os.path.exists(os.path.join(local_path, f'{key}.opus')):
        os.remove(os.path.join(local_path, f'{key}.opus'))
        return jsonify({'message': 'File deleted successfully'}), 200
    
    else:
        return jsonify({'error': 'Guild not found'}), 404


if __name__ == '__main__':
    app.run(debug=True, port=5001)
