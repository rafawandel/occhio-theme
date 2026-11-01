-- Emprestimos por sala nos ultimos 30 dias
WITH emprestimos AS (
    SELECT e.cod_sala,
           e.cod_obra,
           SUM(e.quantidade)                   AS qtd,
           COUNT(DISTINCT TRUNC(e.dt_retirada)) AS dias_ativos
      FROM emprestimo e
     WHERE e.dt_retirada >= TRUNC(SYSDATE) - 30
       AND e.situacao = 'A'
     GROUP BY e.cod_sala, e.cod_obra
)
SELECT m.cod_sala,
       l.titulo,
       m.qtd,
       ROUND(m.qtd / 30, 2) AS qtd_por_dia,
       CASE WHEN m.dias_ativos = 0 THEN NULL
            ELSE CEIL(60 / m.dias_ativos)
       END AS intervalo,
       MAX(m.qtd) OVER (PARTITION BY m.cod_sala) AS maior_da_sala
  FROM emprestimos m
  JOIN obra l ON l.cod_obra = m.cod_obra
 WHERE m.cod_sala IN (1, 2, 3)
   AND l.titulo LIKE '%POESIA%'
 ORDER BY m.qtd DESC
 FETCH FIRST 50 ROWS ONLY;

CREATE INDEX idx_resumo_tema ON acervo.resumo_obra (cod_tema) ONLINE;
EXEC DBMS_STATS.GATHER_TABLE_STATS('ACERVO', 'RESUMO_OBRA', cascade => TRUE);
