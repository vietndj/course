@echo off
if "%1"=="--pull" (
    python dong_bo.py --pull
) else if "%1"=="--push" (
    python dong_bo.py --push
) else (
    echo === DONG BO ANTIGRAVITY ^& BAI GIANG VIDEO ===
    echo 1. Keo ve:  dong_bo.bat --pull
    echo 2. Day len: dong_bo.bat --push
)
