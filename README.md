# Frutinhas em Festa

Um jogo infantil feito com HTML, Canvas e JavaScript. As frutas caem na tela e o jogador controla uma cestinha com o mouse para capturar somente a fruta indicada.

## Funcionalidades

- Controle da cestinha pelo mouse e por toque.
- Pontuação sem limite máximo.
- Cinco vidas em cada rodada.
- Perda de vida ao capturar uma fruta errada.
- Perda de vida quando a fruta correta cai sem ser capturada.
- Três rodadas de até 60 segundos cada.
- A velocidade e a frequência das frutas aumentam após 20 segundos.
- Tema diurno na primeira rodada.
- Tema ensolarado na segunda rodada.
- Tema noturno na terceira rodada.
- Sons de acerto e erro com opção para ativar ou desativar.

## Como executar

### Usando Python

Com o Python instalado, abra o terminal nesta pasta e execute:

```bash
python -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

### Usando Live Server no VS Code

1. Instale a extensão **Live Server**, de Ritwick Dey.
2. Abra a pasta do projeto no VS Code.
3. Abra o arquivo `index.html`.
4. Clique com o botão direito e escolha **Open with Live Server**.

O endereço normalmente será `http://127.0.0.1:5500`.

## Arquivos do projeto

- `index.html`: estrutura da página e interface do jogo.
- `styles.css`: estilos, layout e responsividade.
- `script.js`: regras, rodadas, pontuação, vidas, frutas e Canvas.
- `.gitignore`: arquivos que não devem ser enviados ao Git.
