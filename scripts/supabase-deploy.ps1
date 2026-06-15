# Deploy Supabase migrations + edge functions for Rizz My Resume.
# Requires CLI logged into the account that owns the project (see DEPLOY.md).

$ErrorActionPreference = "Stop"
$ProjectRef = "jjvmrfgffordqwzdzznt"

$Functions = @(
  "preview",
  "process-generation",
  "generate",
  "generation-status",
  "preview-pdf",
  "payment",
  "history",
  "download",
  "parse-resume",
  "cleanup-resumes"
)

Write-Host "Checking access to project $ProjectRef..." -ForegroundColor Cyan
$projectsJson = npx supabase projects list -o json 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
  Write-Host $projectsJson
  exit 1
}

$projects = $projectsJson | ConvertFrom-Json
$match = $projects | Where-Object { $_.ref -eq $ProjectRef }
if (-not $match) {
  Write-Host ""
  Write-Host "ERROR: Project $ProjectRef (RizzMyResume) is not in your logged-in Supabase account." -ForegroundColor Red
  Write-Host ""
  Write-Host "Fix:" -ForegroundColor Yellow
  Write-Host "  1. Open https://supabase.com/dashboard/project/$ProjectRef in your browser"
  Write-Host "  2. Note which email/account owns that project"
  Write-Host "  3. Run:  npx supabase login"
  Write-Host "     (sign in with THAT account, not your Sarwagyna org account)"
  Write-Host "  4. Or use a token:  npx supabase login --token YOUR_ACCESS_TOKEN"
  Write-Host "     Create token at: https://supabase.com/dashboard/account/tokens"
  Write-Host "  5. Re-run this script"
  Write-Host ""
  Write-Host "Your current account projects:" -ForegroundColor DarkGray
  $projects | ForEach-Object { Write-Host "  - $($_.name) ($($_.ref))" }
  exit 1
}

Write-Host "Linking to $ProjectRef..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef --yes
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing database migrations..." -ForegroundColor Cyan
echo y | npx supabase db push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Deploying edge functions (no Docker required)..." -ForegroundColor Cyan
foreach ($fn in $Functions) {
  Write-Host "  -> $fn" -ForegroundColor DarkGray
  npx supabase functions deploy $fn --use-api
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ""
Write-Host "Done. Set CRON_SECRET in Dashboard -> Edge Functions -> Secrets," -ForegroundColor Green
Write-Host "then schedule cleanup-resumes: cron 0 * * * *, header Authorization: Bearer <CRON_SECRET>"
