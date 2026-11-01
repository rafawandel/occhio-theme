using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

#nullable enable
#region Modelos

namespace Exemplo.Acervo
{
    public enum SituacaoSolicitacao { Aberta, Atendida, Cancelada }

    public record Solicitacao(int CodObra, string Titulo, decimal Multa);

    /// <summary>Servico de solicitacoes do acervo.</summary>
    [Serializable]
    public sealed class ServicoSolicitacao : IDisposable
    {
        private const int TamanhoLote = 50;
        private readonly List<Solicitacao> _na_espera = new();
        public event EventHandler<int>? LoteAtendido;

        public string Balcao { get; init; } = "BALCAO-01";
        public static int Total { get; private set; }

        public async Task<int> AtenderAsync(IEnumerable<Solicitacao> solicitacoes, bool forcar = false)
        {
            var lote = solicitacoes.Where(r => r.Multa > 0m).Take(TamanhoLote).ToList();
            foreach (var solicitacao in lote)
            {
                if (solicitacao is null) continue;
                var aviso = $"Solicitacao {solicitacao.CodObra}: {solicitacao.Titulo}";
                await Task.Delay(10);
                Total++;
            }
            LoteAtendido?.Invoke(this, lote.Count);
            return lote.Count;
        }

        public void Dispose() => _na_espera.Clear();
    }
}
#endregion
