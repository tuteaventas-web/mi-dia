$ErrorActionPreference = 'Stop'
try {
    $projectFolder = $PSScriptRoot
    $appUrl = 'http://127.0.0.1:4173/'
    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    $nodePath = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
    if (-not (Test-Path -LiteralPath $nodePath)) { throw 'No se encontró Node.js. Instala Node.js 20 o posterior y vuelve a abrir iniciar.cmd.' }
    function Test-Jornada {
        try {
            $response = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
            return $response.StatusCode -eq 200 -and $response.Content.Contains('Mi día')
        } catch { return $false }
    }
    if (-not (Test-Jornada)) {
        Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $projectFolder -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectFolder 'servidor.log') -RedirectStandardError (Join-Path $projectFolder 'servidor-error.log') | Out-Null
        $ready = $false
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            if (Test-Jornada) { $ready = $true; break }
            Start-Sleep -Milliseconds 300
        }
        if (-not $ready) { throw 'El servidor no responde. Revisa servidor-error.log en la carpeta de la aplicación.' }
    }
    Start-Process $appUrl
    Write-Host "Mi día listo: $appUrl"
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
