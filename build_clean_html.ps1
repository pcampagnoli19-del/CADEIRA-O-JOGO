param(
  [switch]$Force,
  [switch]$Legacy
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

# =============================================================================
# CADEIRA — build / sincronização
#
# IMPORTANTE (a partir de 21/10/2026):
#   O HTML COMPILADO passou a ser a FONTE DE VERDADE. O Cursor e o mantenedor
#   editam index.html / CADEIRA_O_Jogo_25.html diretamente.
#
#   A base antiga (CADEIRA_O_Jogo_25.html.bak_abc) ficou ~9.200 linhas defasada:
#   falta o tema escuro (House of Cards), as fontes, a apuração no mapa e as
#   fases do legislativo. Rodar o pipeline antigo APAGA essas mudanças.
#
#   Por isso o modo PADRÃO deste script NÃO reconstrói nada: ele apenas garante
#   que os dois HTML sejam idênticos. Se divergirem, ABORTA para não destruir
#   trabalho.
#
#   Uso:
#     .\build_clean_html.ps1            -> modo seguro (sincroniza / verifica)
#     .\build_clean_html.ps1 -Force     -> adota o arquivo MAIS RECENTE como
#                                          fonte e sobrescreve o outro
#     .\build_clean_html.ps1 -Legacy -Force
#                                        -> roda o pipeline antigo (base + módulos).
#                                           PERIGOSO e defasado. Só para referência.
# =============================================================================

$OUT1 = 'index.html'
$OUT2 = 'CADEIRA_O_Jogo_25.html'

function Get-HashOf([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { return $null }
  return (Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash
}

# --------------------------- MODO SEGURO (padrão) ---------------------------
if (-not $Legacy) {
  Write-Host "CADEIRA — modo seguro (sincronização dos HTML compilados)"

  $e1 = Test-Path -LiteralPath $OUT1
  $e2 = Test-Path -LiteralPath $OUT2

  if (-not $e1 -and -not $e2) {
    Write-Host "ERRO: nenhum dos dois HTML existe ($OUT1 / $OUT2)." -ForegroundColor Red
    exit 1
  }

  if ($e1 -and -not $e2) {
    Copy-Item -LiteralPath $OUT1 -Destination $OUT2 -Force
    Write-Host "Criado $OUT2 a partir de $OUT1."
    exit 0
  }
  if ($e2 -and -not $e1) {
    Copy-Item -LiteralPath $OUT2 -Destination $OUT1 -Force
    Write-Host "Criado $OUT1 a partir de $OUT2."
    exit 0
  }

  $h1 = Get-HashOf $OUT1
  $h2 = Get-HashOf $OUT2

  if ($h1 -eq $h2) {
    Write-Host ("OK: os dois HTML já são idênticos (hash {0}...). Nada a fazer." -f $h1.Substring(0,16))
    exit 0
  }

  $i1 = Get-Item -LiteralPath $OUT1
  $i2 = Get-Item -LiteralPath $OUT2
  Write-Host "DIVERGÊNCIA DETECTADA:" -ForegroundColor Yellow
  Write-Host ("  {0}: {1:N0} bytes  {2}  hash={3}" -f $OUT1, $i1.Length, $i1.LastWriteTime, $h1.Substring(0,16))
  Write-Host ("  {0}: {1:N0} bytes  {2}  hash={3}" -f $OUT2, $i2.Length, $i2.LastWriteTime, $h2.Substring(0,16))

  if (-not $Force) {
    Write-Host ""
    Write-Host "ABORTADO para não destruir trabalho." -ForegroundColor Yellow
    Write-Host "O HTML compilado é a fonte de verdade. Escolha uma opção:"
    Write-Host "  1) Adotar o mais recente como fonte:  .\build_clean_html.ps1 -Force"
    Write-Host "  2) Reconstruir pelo pipeline antigo:  .\build_clean_html.ps1 -Legacy -Force"
    Write-Host "     (atenção: a base .bak_abc está defasada e isso perde mudanças recentes)"
    exit 2
  }

  if ($i1.LastWriteTimeUtc -ge $i2.LastWriteTimeUtc) { $novo = $OUT1 } else { $novo = $OUT2 }
  if ($novo -eq $OUT1) { $velho = $OUT2 } else { $velho = $OUT1 }
  Copy-Item -LiteralPath $novo -Destination $velho -Force
  Write-Host "Sincronizado: $velho recebeu o conteúdo de $novo (mais recente)."
  exit 0
}

# ----------------------------- PIPELINE ANTIGO ------------------------------
Write-Host "AVISO: modo -Legacy. A base .bak_abc está defasada." -ForegroundColor Yellow
Write-Host "       O resultado pode perder tema, fontes, apuração no mapa e" -ForegroundColor Yellow
Write-Host "       as fases do legislativo. Use apenas se souber o que está fazendo." -ForegroundColor Yellow
if (-not $Force) {
  Write-Host "Para confirmar, rode novamente com: -Legacy -Force" -ForegroundColor Yellow
  exit 2
}

Write-Host "Iniciando compilação limpa de CADEIRA_O_Jogo_25.html..."
Write-Host "Nota: cadeira-theme.css deve permanecer ao lado do HTML (ou embutido no head)."

# 1. Ler os dois arquivos JS em UTF-8 puro
$geoData = [System.IO.File]::ReadAllText("geo_abc_data.js", [System.Text.Encoding]::UTF8)
$logicData = [System.IO.File]::ReadAllText("modulo_abc_logic.js", [System.Text.Encoding]::UTF8)

# Modulo de Empresarios & Conglomerados (aditivo). Opcional: se ausente, o build segue normal.
$empData = ""
if (Test-Path "modulo_empresarios.js") {
  $empData = [System.IO.File]::ReadAllText("modulo_empresarios.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_empresarios.js ausente - build sem o modulo de empresarios."
}

# Modulo de Diplomacia (aditivo). Opcional.
$dipData = ""
if (Test-Path "modulo_diplomacia.js") {
  $dipData = [System.IO.File]::ReadAllText("modulo_diplomacia.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_diplomacia.js ausente - build sem o modulo de diplomacia."
}

# Modulo Nucleo de Influenciadores (aditivo). Opcional.
$infData = ""
if (Test-Path "modulo_influenciadores.js") {
  $infData = [System.IO.File]::ReadAllText("modulo_influenciadores.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_influenciadores.js ausente - build sem nucleo de influenciadores."
}

# Modulo Imprensa e Feed (aditivo). Opcional.
$impfData = ""
if (Test-Path "modulo_imprensa_feed.js") {
  $impfData = [System.IO.File]::ReadAllText("modulo_imprensa_feed.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_imprensa_feed.js ausente - build sem imprensa/feed v2."
}

# Fix legislativo + catalogo Excel (aditivo). Opcional.
$legfData = ""
if (Test-Path "modulo_legislativo_fix.js") {
  $legfData = [System.IO.File]::ReadAllText("modulo_legislativo_fix.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_legislativo_fix.js ausente - build sem fix legislativo."
}

# Fix sessao plenário / PL lista / feed figuras (aditivo). Opcional.
$sesfData = ""
if (Test-Path "modulo_sessao_pl_feed.js") {
  $sesfData = [System.IO.File]::ReadAllText("modulo_sessao_pl_feed.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_sessao_pl_feed.js ausente - build sem fix sessao/PL/feed."
}

# Cheats executivos + sessão (scroll/velocidade/líderes) + voo DIP (aditivo). Opcional.
$exfData = ""
if (Test-Path "modulo_fix_exec_sessao.js") {
  $exfData = [System.IO.File]::ReadAllText("modulo_fix_exec_sessao.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_fix_exec_sessao.js ausente - build sem cheats exec/sessao/viagem."
}

# Navegação agrupada House of Cards (aditivo).
$navhData = ""
if (Test-Path "modulo_nav_hoc.js") {
  $navhData = [System.IO.File]::ReadAllText("modulo_nav_hoc.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_nav_hoc.js ausente - build sem hubs de menu."
}

# Áudio procedural (aditivo).
$audData = ""
if (Test-Path "modulo_audio_hoc.js") {
  $audData = [System.IO.File]::ReadAllText("modulo_audio_hoc.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_audio_hoc.js ausente - build sem áudio."
}

# Modulo Obras e Programas do Executivo (aditivo).
$obrasData = ""
if (Test-Path "modulo_obras_programas.js") {
  $obrasData = [System.IO.File]::ReadAllText("modulo_obras_programas.js", [System.Text.Encoding]::UTF8)
} else {
  Write-Host "AVISO: modulo_obras_programas.js ausente - build sem obras/programas."
}

# Combinar módulo final
$finalModule = $geoData + "`r`n`r`n" + $logicData + "`r`n`r`n" + $empData + "`r`n`r`n" + $dipData + "`r`n`r`n" + $infData + "`r`n`r`n" + $impfData + "`r`n`r`n" + $legfData + "`r`n`r`n" + $sesfData + "`r`n`r`n" + $exfData + "`r`n`r`n" + $navhData + "`r`n`r`n" + $audData + "`r`n`r`n" + $obrasData

# 2. Ler base HTML limpa CADEIRA_O_Jogo_25.html.bak_abc
$baseHtml = [System.IO.File]::ReadAllText("CADEIRA_O_Jogo_25.html.bak_abc", [System.Text.Encoding]::UTF8)

# 3. Patch 3: const INST = window.INST || (window.INST = [ ... ]);
$p3Idx = $baseHtml.IndexOf('PATCH 3')
if ($p3Idx -gt 0) {
    $instIdx = $baseHtml.IndexOf('const INST=[', $p3Idx)
    if ($instIdx -gt 0) {
        $instEnd = $baseHtml.IndexOf('];', $instIdx) + 2
        $origBlock = $baseHtml.Substring($instIdx, $instEnd - $instIdx)
        $arrayBody = $origBlock.Substring(11).TrimEnd(';').TrimEnd(']') + ']'
        $newBlock = 'const INST = window.INST || (window.INST = ' + $arrayBody + ');'
        $baseHtml = $baseHtml.Substring(0, $instIdx) + $newBlock + $baseHtml.Substring($instEnd)
        Write-Host "Patch 3: const INST configurado com sucesso!"
    }
}

# 4. Patch instAtual: quando S.cong.inst for null/vazio, retorna null exibindo a tela das 4 Casas Legislativas
$oldInstAtual = 'const instAtual=()=>INST.find(i=>i.k===S.cong.inst)||null;'
$newInstAtual = 'const instAtual=()=> (!S.cong||!S.cong.inst)?null:((window.INST||INST).find(i=>i.k===S.cong.inst)||(window.INST||INST).find(i=>i.cod==="M"&&(/c.*mara/i.test(S.cong.inst||"")))||null);'
$baseHtml = $baseHtml.Replace($oldInstAtual, $newInstAtual)
Write-Host "Patch instAtual configurado com sucesso!"

# 5. Injetar módulo final antes de </script>
$targetClose = '</script>' + "`r`n" + '</body>' + "`r`n" + '</html>'
if (-not $baseHtml.Contains($targetClose)) {
    $targetClose = '</script>' + "`n" + '</body>' + "`n" + '</html>'
}

if ($baseHtml.Contains($targetClose)) {
    $baseHtml = $baseHtml.Replace($targetClose, "`r`n`r`n" + $finalModule + "`r`n" + $targetClose)
    Write-Host "Módulo ABC injetado com sucesso antes de </script>!"
} else {
    Write-Host "ERRO: Fechamento </script> não encontrado."
    exit 1
}

# 6. Salvar CADEIRA_O_Jogo_25.html e index.html para GitHub Pages
[System.IO.File]::WriteAllText("CADEIRA_O_Jogo_25.html", $baseHtml, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("index.html", $baseHtml, [System.Text.Encoding]::UTF8)
Write-Host "CADEIRA_O_Jogo_25.html e index.html salvos com sucesso! Tamanho: $($baseHtml.Length) caracteres."

