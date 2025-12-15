@echo off
REM Script to guide audio file setup for Windows users
REM Creates necessary directories and explains how to add audio files

echo Creating audio directory structure...
if not exist "audio\sounds" (
    mkdir audio\sounds
    echo ✓ Created audio\sounds directory
) else (
    echo ✓ audio\sounds directory already exists
)

echo.
echo ========================================
echo Audio Implementation Guide
echo ========================================
echo.
echo The application is ready to play human voice animal sounds!
echo.
echo REQUIRED AUDIO FILES:
echo Place MP3 files in: audio\sounds\
echo.
echo Files needed:
echo   - roar.mp3 (human voice saying "roar")
echo   - waddle-waddle.mp3 (human voice saying "waddle-waddle")
echo   - trumpet.mp3
echo   - ooh-ooh-ah-ah.mp3
echo   - howl.mp3
echo   - growl.mp3
echo   - click-click.mp3
echo   - ribbit.mp3
echo   - screech.mp3
echo   - hum.mp3
echo   - neigh.mp3
echo   - snort.mp3
echo   - yip-yip.mp3
echo   - grunt.mp3
echo   - snore.mp3
echo   - hoo-hoo.mp3
echo   - splash.mp3
echo   - whoosh.mp3
echo.
echo HOW TO CREATE AUDIO FILES:
echo.
echo Option 1: Google Translate (Free)
echo   1. Go to translate.google.com
echo   2. Enter the sound text (e.g., "roar")
echo   3. Click the speaker icon to hear pronunciation
echo   4. Right-click the speaker and "Save audio as..."
echo   5. Save as MP3 to audio\sounds\
echo.
echo Option 2: Natural Reader (https://www.naturalreader.com)
echo   1. Paste text (e.g., "roar")
echo   2. Select a voice
echo   3. Download as MP3
echo   4. Save to audio\sounds\
echo.
echo Option 3: Record Yourself
echo   1. Use Audacity (free: https://www.audacityproject.org)
echo   2. Record yourself saying each sound
echo   3. Export as MP3
echo   4. Save to audio\sounds\
echo.
echo TESTING:
echo   1. Start server: python -m http.server 8080
echo   2. Open: http://localhost:8080/
echo   3. Click an animal to hear the sound
echo   4. If no MP3 file found, falls back to text-to-speech
echo.
echo ========================================
echo.
pause
