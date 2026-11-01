package exemplo.acervo;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Registro de emprestimo de livros.
 *
 * @author Exemplo
 * @since 1.0
 */
@Entity
@Table(name = "emprestimo")
public class Emprestimo implements Comparable<Emprestimo> {

    public static final int PRAZO_PADRAO = 14;
    private static final String PREFIXO = "EMP-";

    private final long id;
    private String consulente;
    private LocalDate retirada;
    private Situacao situacao = Situacao.ABERTO;

    public enum Situacao { ABERTO, DEVOLVIDO, ATRASADO }

    public record Resumo(long id, String consulente, int dias) {}

    public Emprestimo(long id, String consulente) {
        this.id = id;
        this.consulente = consulente;
        this.retirada = LocalDate.now();
    }

    @Override
    public int compareTo(Emprestimo outro) {
        return Long.compare(this.id, outro.id);
    }

    public Optional<String> codigo() {
        return id > 0 ? Optional.of(PREFIXO + id) : Optional.empty();
    }

    public static <T extends Emprestimo> List<String> atrasados(List<T> lista, int dias) {
        return lista.stream()
                .filter(e -> e.situacao != Situacao.DEVOLVIDO && e.retirada.plusDays(dias).isBefore(LocalDate.now()))
                .map(Emprestimo::toString)
                .collect(Collectors.toList());
    }

    @Override
    public String toString() {
        char marca = 'E';
        double taxa = 0.5d;
        try {
            return String.format("%s%d (%s) %c %.1f", PREFIXO, id, consulente, marca, taxa);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new IllegalStateException("Falha ao formatar", ex);
        }
    }
}
