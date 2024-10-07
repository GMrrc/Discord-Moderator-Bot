from flask import Flask, request, jsonify
import os
import logging
import re

from youtubesearchpython import VideosSearch
from yt_dlp import YoutubeDL

app = Flask(__name__)

SAVE_PATH = "./save"


def download(link, save_path, key):
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(save_path, f'{key}.opus'),
            'noplaylist': True  # S'assure de ne pas traiter les playlists
        }
        
        with YoutubeDL(ydl_opts) as ydl:
            # Extraire les informations sans télécharger
            info_dict = ydl.extract_info(link, download=False)
            duration = info_dict.get('duration', 0)  # Durée en secondes
            
            # Vérifier si la durée est supérieure à 20 minutes (1200 secondes)
            if duration > 800:
                return None

            # Si la durée est acceptable, télécharger
            ydl.download([link])
            video_title = info_dict.get('title', None)
            
        print("Download is completed successfully")
        return video_title
    except Exception as e:
        logging.error("An error occurred while downloading the audio: %s", e)
        return None

    

def validator_url(url):
    if not url or url.isspace():
        return False
    
    start_pattern = re.compile(r'^(http|https)://')
    if not start_pattern.match(url):
        return False
    
    return True
        

def get_first_youtube_video(search_query):
    try :
        videos_search = VideosSearch(search_query, limit=1)
        results = videos_search.result()
        if results['result']:
            first_video = results['result'][0]
            video_link = first_video['link']
            return video_link
        else:
            return None
    except Exception as e:
        logging.error("An error occurred while searching the video: %s", e)
        return None
        

@app.route('/download_audio', methods=['POST'])
def download_audio_route():
    try:
        data = request.json
        video_url = data.get('video_url')
        guild = data.get('guild')

        if not video_url or not guild:
            return jsonify({'error': 'Missing video url or guild in request'}), 400
        
        key = video_url.replace("/", "")
        
        if not validator_url(video_url):
            video_url = get_first_youtube_video(video_url)
        
        if not validator_url(video_url):
            return jsonify({'error': 'Invalid video url'}), 400

        local_path = os.path.join(SAVE_PATH, guild)
        os.makedirs(local_path, exist_ok=True)

        title = download(video_url, local_path, key)

        if not title:
            return jsonify({'error': 'Video is too long or not found'}), 400

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
