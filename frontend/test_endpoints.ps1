# PowerShell: prueba funciones y una imagen pública de Supabase
# Uso: .\test_endpoints.ps1 -Base https://<tu-proyecto>.supabase.co -Bucket <bucket> -ImageName "mi.jpg"
param(
  [Parameter(Mandatory=$true)][string]$Base,
  [Parameter(Mandatory=$true)][string]$Bucket,
  [Parameter(Mandatory=$true)][string]$ImageName
)

Write-Output "GET $Base/functions/v1/raffles"
try {
  Invoke-RestMethod -Uri "$Base/functions/v1/raffles" -Method GET -ErrorAction Stop | ConvertTo-Json -Depth 4
} catch {
  Write-Error "Error llamando a /raffles: $_"
}

Write-Output "\nHEAD image public URL"
try {
  $resp = Invoke-WebRequest -Uri "$Base/storage/v1/object/public/$Bucket/$ImageName" -Method Head -ErrorAction Stop
  Write-Output "Status: $($resp.StatusCode)"
} catch {
  Write-Error "Error HEAD imagen: $_"
}
