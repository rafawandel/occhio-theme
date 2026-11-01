# language: pt
@acervo @regressao
Funcionalidade: Emprestimo de obras
  Como consulente
  Quero retirar uma obra
  Para ler em casa

  Contexto:
    Dado que existe a obra "Poemas" com 2 exemplares

  Cenario: Retirada com sucesso
    Quando eu retiro a obra "Poemas"
    Entao restam 1 exemplares
    E recebo um aviso com prazo de 14 dias

  Esquema do Cenario: Retirada com limite
    Dado que tenho <emprestimos> obras retiradas
    Quando eu retiro a obra "<titulo>"
    Entao vejo a mensagem "<mensagem>"

    Exemplos:
      | emprestimos | titulo   | mensagem          |
      | 0           | Poemas   | Retirada efetuada |
      | 3           | Contos   | Limite atingido   |

  Cenario: Dados em bloco
    Dado o corpo:
      """
      {"obra": 1}
      """
