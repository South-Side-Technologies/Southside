@echo off
REM Helper script to run Prisma commands inside Docker
docker run --rm -it ^
  -v "%CD%:/app" ^
  -w /app ^
  --network=southside_default ^
  -e DATABASE_URL=postgresql://southside:southside_password_change_in_production@postgres:5432/southside ^
  node:20-alpine ^
  sh -c "npm install && npx %*"
