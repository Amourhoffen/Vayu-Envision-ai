Remove-Item -Path .git -Recurse -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path . -Exclude ENVISION-AI, setup.ps1 | Remove-Item -Recurse -Force
Move-Item -Path ENVISION-AI\* -Destination . -Force
Remove-Item -Path ENVISION-AI -Force
Add-Content -Path .gitignore -Value "`n.env`nbackend/.env"
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/Amourhoffen/Vayu-Envision-ai.git
git push -u -f origin main
