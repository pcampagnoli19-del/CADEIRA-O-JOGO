[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Iniciando compilação limpa de CADEIRA_O_Jogo_25.html..."

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

# Combinar módulo final
$finalModule = $geoData + "`r`n`r`n" + $logicData + "`r`n`r`n" + $empData + "`r`n`r`n" + $dipData + "`r`n`r`n" + $infData + "`r`n`r`n" + $impfData + "`r`n`r`n" + $legfData

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

