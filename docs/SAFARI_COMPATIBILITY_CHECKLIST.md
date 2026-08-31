# Checklist de compatibilidade do Safari

Este documento define o critério de lançamento para a v1 do PopPiP. O objetivo é separar cenários realmente suportados de casos limitados ou bloqueados por Safari, player ou permissão do site.

## Regra de lançamento

- Nenhuma campanha pública, App Store ou marketing deve prometer suporte para sites que não tenham sido validados em Safari 17.x e 18.x.
- A app deve ser validada com build assinada da App Store antes do lançamento.
- Qualquer site classificado como "limitado" precisa entrar em notas de compatibilidade e não pode aparecer como "suportado" em materiais públicos.
- Se um site exigir permissão específica no Safari ou bloquear `iframe`, isso deve ser documentado como limite funcional.

## Status

- Suportado: PiP inicia e fecha corretamente conforme esperado no fluxo do app.
- Limitado: funciona em alguns casos, mas depende de player, iframe ou permissões do Safari.
- Bloqueado: Safari ou o player não permitem PiP de forma confiável para esse cenário.

## Matriz de compatibilidade por site e Safari

| Site / player | Safari 17.x | Safari 18.x | Status | Observações |
| --- | --- | --- | --- | --- |
| YouTube (player principal) | ✅ | ✅ | Suportado | Validar com vídeo em aba normal, troca de aba e troca de app. |
| YouTube embed em iframe | ✅ | ✅ | Suportado | Requer `all_frames: true` no manifest e validação do popup de diagnóstico. |
| Vimeo | ✅ | ✅ | Suportado | Validar player nativo e embeds em iframe. |
| Vimeo em iframe | ✅ | ✅ | Limitado | Dependente do site e da configuração de permissão no Safari. |
| Twitch | ✅ | ✅ | Suportado | Validar player principal e troca de contexto. |
| HTML5 local / web standards | ✅ | ✅ | Suportado | Casos base com `<video>` real fora de player proprietário. |
| Netflix | ⚠️ | ⚠️ | Limitado | Pode ser bloqueado por DRM / política de player; validar explicitamente antes de prometer suporte. |
| Disney+ | ⚠️ | ⚠️ | Limitado | Likely DRM/player restrictions; não prometer suporte genérico. |
| Qualquer player com `requestPictureInPicture` ausente | ✅ | ✅ | Bloqueado | Diagnóstico do popup deve indicar "PiP indisponível neste player". |
| Site sem permissão do Safari | ✅ | ✅ | Bloqueado | O popup deve mostrar "site sem permissão no Safari". |

## Checklist de validação por cenário

### 1. Reprodutibilidade por player

- [ ] Reproduzir vídeo em página normal.
- [ ] Reproduzir vídeo em iframe incorporado.
- [ ] Validar player com múltiplos vídeos na mesma página.
- [ ] Confirmar que o popup identifica player sem vídeo vs player sem PiP.

### 2. Fluxo do PiP

- [ ] Troca de aba dispara PiP quando habilitado.
- [ ] Troca de aplicativo dispara PiP quando habilitado.
- [ ] Fechar PiP manualmente não deixa estado inconsistente.
- [ ] Alternância rápida entre estados não trava o app.
- [ ] Retornar da tela de configurações do Safari atualiza o estado do app.

### 3. Permissões e site access

- [ ] Site sem acesso do Safari mostra diagnóstico correto.
- [ ] Permissão concedida ativa o comportamento esperado.
- [ ] Denylist vence sobre allowlist e todas as permissões.
- [ ] `enableAllSites` funciona apenas para páginas permitidas pelo Safari.

### 4. Diagnóstico no popup

- [ ] Nenhum vídeo reproduzindo
- [ ] Site sem permissão no Safari
- [ ] PiP indisponível neste player
- [ ] Player em iframe reconhecido corretamente

### 5. Compatibilidade mínima para release

- [ ] Safari 17.x: cenários principais validados
- [ ] Safari 18.x: cenários principais validados
- [ ] YouTube e Vimeo: validados em página normal e iframe
- [ ] Twitch: validado
- [ ] HTML5: validado via página local e site de teste
- [ ] DRM/proprietary players: listados como limitados ou bloqueados

## Casos que exigem nota de compatibilidade

- Sites com DRM ou player não padrão
- Players em iframe que dependem de políticas específicas do domínio
- Sites que exigem interação do usuário antes de permitir PiP
- Qualquer cenário que dependa de permissão do Safari entre "allow" e "deny"

## Decisão de release

A v1 pode ser publicada quando:

- todos os cenários de suporte principal estiverem validados em Safari 17.x e 18.x;
- o popup de diagnóstico refletir corretamente as falhas mais comuns;
- a lista de limitações for registrada e não contradita a mensagem pública;
- a build da App Store tiver aprovação final de QA e release.

## Progresso da validação

| Item | Status | Responsável | Data |
| --- | --- | --- | --- |
| YouTube principal | Pendente | QA | - |
| YouTube iframe | Pendente | QA | - |
| Vimeo principal | Pendente | QA | - |
| Vimeo iframe | Pendente | QA | - |
| Twitch | Pendente | QA | - |
| HTML5 padrão | Pendente | QA | - |
| Netflix/Disney+ | Pendente | QA | - |
| Release gate final | Pendente | QA + release | - |
