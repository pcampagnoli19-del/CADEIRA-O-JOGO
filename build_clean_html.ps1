[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Iniciando compilação limpa de CADEIRA_O_Jogo_25.html..."

# 1. Ler os dois arquivos JS em UTF-8 puro
$geoData = [System.IO.File]::ReadAllText("geo_abc_data.js", [System.Text.Encoding]::UTF8)
$logicData = [System.IO.File]::ReadAllText("modulo_abc_logic.js", [System.Text.Encoding]::UTF8)

# Combinar módulo final
$finalModule = $geoData + "`r`n`r`n" + $logicData

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

# 6. Salvar CADEIRA_O_Jogo_25.html
[System.IO.File]::WriteAllText("CADEIRA_O_Jogo_25.html", $baseHtml, [System.Text.Encoding]::UTF8)
Write-Host "CADEIRA_O_Jogo_25.html salvo com sucesso! Tamanho: $($baseHtml.Length) caracteres."
