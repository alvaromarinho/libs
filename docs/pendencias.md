# Pendências

Implementações e correções decididas para depois. O Claude relembra esta lista no início de cada sessão; item resolvido sai daqui.

## Foco não volta ao fechar o modal

- **Registrado:** 15/nov/2026
- **Onde:** ng-bs-modal-service (`ng-bs-modal-service.component.ts`, `this.modal?.show()` nas linhas 120 e 153)
- **Tipo:** correção
- **Risco:** o modal abre por `Modal.show()` sem gatilho. Nesse caso o Bootstrap não devolve o foco a quem abriu, e ao fechar o foco cai no `body`. Quem usa teclado ou leitor de tela perde o lugar na página, por exemplo na linha da tabela de onde abriu a edição. Atinge todos os projetos que usam a lib.
- **Correção proposta:** guardar `document.activeElement` no `open()` e, no `hidden.bs.modal`, devolver o foco a ele se ainda estiver no documento. No Safari o botão clicado não recebe foco, então devolver também quando o foco estiver no `body`.
- **Primeiro passo:** confirmar no navegador, pelo `test-libs`: abrir o modal por um botão, fechar com Esc e ver onde o foco fica.

## Seletor de mês/ano sem teclado nem estado

- **Registrado:** 15/nov/2026
- **Onde:** ng-month-year-picker (`ng-month-year-picker.component.html`, botão `.trigger` na linha 1, e `.component.ts`)
- **Tipo:** correção
- **Risco:** o popup fecha só com clique fora. Esc não fecha, o gatilho não tem `aria-expanded` nem `aria-haspopup`, o foco não entra no popup ao abrir e não volta ao gatilho ao fechar. Leitor de tela não anuncia que algo abriu, e quem usa teclado fica preso fora do popup.
- **Correção proposta:** `[attr.aria-expanded]="showPicker"` e `aria-haspopup="dialog"` no gatilho; `@HostListener('document:keydown.escape')` que fecha e devolve o foco ao gatilho; ao abrir, focar o mês selecionado (ou o atual); mês selecionado com `aria-pressed` ou `aria-current`.
- **Primeiro passo:** escrever o comportamento esperado (foco ao abrir, Esc, foco ao fechar) e conferir no `test-libs` antes e depois.

## Botão de fechar do toast em inglês

- **Registrado:** 15/nov/2026
- **Onde:** ng-bs-toast-service (`ng-bs-toast-service.component.html`, linha 18)
- **Tipo:** correção
- **Risco:** o botão de fechar tem `aria-label="Close"`. Leitor de tela anuncia em inglês num sistema em português.
- **Correção proposta:** `aria-label="Fechar notificação"`, ou um input para o texto se a lib precisar servir outro idioma.
- **Primeiro passo:** trocar o texto e publicar junto com a próxima versão da lib.
