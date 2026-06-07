#!/usr/bin/env python3
"""
Download BIG CAT sounds from multiple sources:
- Wikimedia Commons API
- Internet Archive
- YouTube (via yt-dlp)
"""
import json
import os
import requests
import subprocess
import time
from pathlib import Path
from urllib.parse import quote_plus

# Configuration
SOUNDS_DIR = Path("/home/ewaldt/Documents/VS/GAMES/Wild-animals/audio/sounds")
MANIFEST_PATH = SOUNDS_DIR / "sounds_manifest.json"

# Target sounds per species
TARGET_SOUNDS = {
    "lion": ["roar", "growl", "grunt"],
    "tiger": ["roar", "chuff", "growl"],
    "leopard": ["roar", "sawing", "growl"],
    "cheetah": ["chirp", "purr", "growl"],
    "jaguar": ["roar", "sawing"],
    "cougar": ["scream", "growl", "purr"],
}

# Load existing manifest
def load_manifest():
    if MANIFEST_PATH.exists():
        with open(MANIFEST_PATH) as f:
            return json.load(f)
    return {}

def save_manifest(manifest):
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)

def convert_to_wav(input_path, output_path):
    """Convert audio to WAV 44.1kHz 16-bit using ffmpeg"""
    try:
        result = subprocess.run([
            "ffmpeg", "-y", "-i", str(input_path),
            "-ar", "44100", "-ac", "1", "-sample_fmt", "s16",
            str(output_path)
        ], capture_output=True, text=True, timeout=60)
        return result.returncode == 0
    except Exception as e:
        print(f"  Conversion error: {e}")
        return False

def download_file(url, output_path):
    """Download a file from URL"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Wild Animals Game Audio Downloader)'}
        response = requests.get(url, headers=headers, timeout=30, stream=True)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
    except Exception as e:
        print(f"  Download error: {e}")
    return False

def search_wikimedia_commons(species, sound_type):
    """Search Wikimedia Commons for audio files"""
    query = f"{species} {sound_type} sound"
    url = "https://commons.wikimedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srnamespace": 6,  # File namespace
        "srlimit": 5,
        "format": "json"
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        data = response.json()
        results = []
        for item in data.get("query", {}).get("search", []):
            title = item["title"]
            if title.endswith(('.ogg', '.oga', '.mp3', '.wav', '.flac')):
                # Get file info
                file_params = {
                    "action": "query",
                    "titles": title,
                    "prop": "imageinfo",
                    "iiprop": "url|mime|extmetadata",
                    "format": "json"
                }
                file_resp = requests.get(url, params=file_params, timeout=15)
                file_data = file_resp.json()
                pages = file_data.get("query", {}).get("pages", {})
                for page in pages.values():
                    if "imageinfo" in page:
                        for info in page["imageinfo"]:
                            if info.get("mime", "").startswith("audio/"):
                                results.append({
                                    "url": info["url"],
                                    "title": title,
                                    "mime": info["mime"]
                                })
        return results
    except Exception as e:
        print(f"  Wikimedia search error: {e}")
    return []

def search_internet_archive(species, sound_type):
    """Search Internet Archive for audio"""
    query = f"{species} {sound_type} sound"
    url = "https://archive.org/advancedsearch.php"
    params = {
        "q": query,
        "fl": "identifier,title,mediatype",
        "rows": 10,
        "page": 1,
        "output": "json"
    }
    try:
        response = requests.get(url, params=params, timeout=15)
        data = response.json()
        results = []
        for doc in data.get("response", {}).get("docs", []):
            if doc.get("mediatype") == "audio":
                identifier = doc["identifier"]
                # Get file list
                file_url = f"https://archive.org/metadata/{identifier}"
                file_resp = requests.get(file_url, timeout=15)
                file_data = file_resp.json()
                for f in file_data.get("files", []):
                    name = f.get("name", "")
                    if name.endswith(('.mp3', '.ogg', '.wav', '.flac', '.m4a')):
                        results.append({
                            "url": f"https://archive.org/download/{identifier}/{quote_plus(name)}",
                            "title": f"{doc.get('title', identifier)} - {name}",
                            "identifier": identifier
                        })
        return results
    except Exception as e:
        print(f"  Internet Archive search error: {e}")
    return []

def search_youtube(species, sound_type):
    """Search YouTube via yt-dlp for audio"""
    query = f"{species} {sound_type} sound"
    try:
        # Use yt-dlp to search and get direct URL
        result = subprocess.run([
            "yt-dlp", "--flat-playlist", "--print-json",
            "--skip-download", f"ytsearch3:{query}"
        ], capture_output=True, text=True, timeout=30)
        
        results = []
        for line in result.stdout.strip().split('\n'):
            if line.strip():
                try:
                    data = json.loads(line)
                    results.append({
                        "url": data.get("url"),
                        "title": data.get("title"),
                        "id": data.get("id")
                    })
                except:
                    pass
        return results
    except Exception as e:
        print(f"  YouTube search error: {e}")
    return []

def download_youtube_audio(video_url, output_path):
    """Download audio from YouTube video"""
    try:
        result = subprocess.run([
            "yt-dlp", "-x", "--audio-format", "wav",
            "--audio-quality", "0",
            "-o", str(output_path.with_suffix('.%(ext)s')),
            video_url
        ], capture_output=True, text=True, timeout=120)
        return result.returncode == 0
    except Exception as e:
        print(f"  YouTube download error: {e}")
    return False

def main():
    manifest = load_manifest()
    downloaded = []
    
    for species, sound_types in TARGET_SOUNDS.items():
        print(f"\n=== {species.upper()} ===")
        for sound_type in sound_types:
            target_file = f"{species}_{sound_type}.wav"
            target_path = SOUNDS_DIR / target_file
            
            # Skip if already exists
            if target_path.exists():
                print(f"  {sound_type}: Already exists, skipping")
                continue
            
            print(f"  Searching for {sound_type}...")
            found = False
            
            # Try Wikimedia Commons first
            print(f"    Trying Wikimedia Commons...")
            wm_results = search_wikimedia_commons(species, sound_type)
            for result in wm_results:
                temp_path = SOUNDS_DIR / f"temp_{species}_{sound_type}"
                if download_file(result["url"], temp_path):
                    if convert_to_wav(temp_path, target_path):
                        manifest[sound_type] = {
                            "target_file": target_file,
                            "source_url": result["url"],
                            "license": "Wikimedia Commons (check file page for license)",
                            "matched_species": species,
                            "notes": f"Downloaded from Wikimedia Commons: {result['title']}"
                        }
                        downloaded.append(f"{species}_{sound_type}")
                        print(f"    ✓ Downloaded from Wikimedia: {result['title']}")
                        found = True
                        temp_path.unlink(missing_ok=True)
                        break
                temp_path.unlink(missing_ok=True)
            if found:
                continue
            
            # Try Internet Archive
            print(f"    Trying Internet Archive...")
            ia_results = search_internet_archive(species, sound_type)
            for result in ia_results:
                temp_path = SOUNDS_DIR / f"temp_{species}_{sound_type}"
                if download_file(result["url"], temp_path):
                    if convert_to_wav(temp_path, target_path):
                        manifest[sound_type] = {
                            "target_file": target_file,
                            "source_url": result["url"],
                            "license": "Internet Archive (check item page for license)",
                            "matched_species": species,
                            "notes": f"Downloaded from Internet Archive: {result['title']}"
                        }
                        downloaded.append(f"{species}_{sound_type}")
                        print(f"    ✓ Downloaded from Internet Archive: {result['title']}")
                        found = True
                        temp_path.unlink(missing_ok=True)
                        break
                temp_path.unlink(missing_ok=True)
            if found:
                continue
            
            # Try YouTube
            print(f"    Trying YouTube...")
            yt_results = search_youtube(species, sound_type)
            for result in yt_results:
                temp_wav = SOUNDS_DIR / f"temp_{species}_{sound_type}.wav"
                if download_youtube_audio(result["url"], temp_wav):
                    # yt-dlp outputs directly to wav, just need to rename/move
                    output_wav = SOUNDS_DIR / f"temp_{species}_{sound_type}.wav"
                    if output_wav.exists():
                        # Convert to ensure correct format
                        if convert_to_wav(output_wav, target_path):
                            manifest[sound_type] = {
                                "target_file": target_file,
                                "source_url": result["url"],
                                "license": "YouTube (check video for license)",
                                "matched_species": species,
                                "notes": f"Downloaded from YouTube: {result['title']}"
                            }
                            downloaded.append(f"{species}_{sound_type}")
                            print(f"    ✓ Downloaded from YouTube: {result['title']}")
                            found = True
                            output_wav.unlink(missing_ok=True)
                            break
                temp_wav.unlink(missing_ok=True)
            if found:
                continue
            
            print(f"    ✗ Failed to find {species} {sound_type}")
    
    # Save updated manifest
    save_manifest(manifest)
    
    print(f"\n=== SUMMARY ===")
    print(f"Downloaded: {len(downloaded)} files")
    for f in downloaded:
        print(f"  - {f}")
    print(f"Manifest updated: {MANIFEST_PATH}")

if __name__ == "__main__":
    main()
