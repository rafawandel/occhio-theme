-- Pacote de exemplo: emprestimos do acervo
CREATE OR REPLACE PACKAGE BODY pkg_acervo AS

  c_prazo_dias CONSTANT PLS_INTEGER := 14;
  e_sem_exemplar EXCEPTION;
  PRAGMA EXCEPTION_INIT(e_sem_exemplar, -20001);

  TYPE t_obra IS RECORD (
    cod_obra   NUMBER(10),
    titulo      VARCHAR2(100),
    exemplares  NUMBER(5)
  );
  TYPE t_lista IS TABLE OF t_obra INDEX BY PLS_INTEGER;

  /* Calcula o prazo de devolucao */
  FUNCTION fn_prazo(p_media IN NUMBER, p_minimo IN NUMBER DEFAULT 1) RETURN NUMBER IS
    v_prazo NUMBER;
  BEGIN
    v_prazo := GREATEST(ROUND(1 / NULLIF(p_media, 0)), p_minimo);
    RETURN NVL(v_prazo, p_minimo);
  END fn_prazo;

  PROCEDURE pr_gera_avisos(p_cod_sala IN NUMBER, p_data IN DATE) IS
    v_lista t_lista;
    v_total PLS_INTEGER := 0;
  BEGIN
    SELECT l.cod_obra, l.titulo, x.qtd_exemplares
      BULK COLLECT INTO v_lista
      FROM obra l
      JOIN exemplar_sala x ON x.cod_obra = l.cod_obra
     WHERE x.cod_sala = p_cod_sala
       AND x.qtd_exemplares > 0
       AND TRUNC(x.dt_retirada) < TRUNC(p_data) - c_prazo_dias;

    FOR i IN 1 .. v_lista.COUNT LOOP
      IF v_lista(i).exemplares IS NULL THEN
        RAISE e_sem_exemplar;
      ELSIF v_lista(i).exemplares > 100 THEN
        v_total := v_total + 1;
      END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Avisos gerados: ' || TO_CHAR(v_total));
    COMMIT;
  EXCEPTION
    WHEN e_sem_exemplar THEN
      ROLLBACK;
      RAISE_APPLICATION_ERROR(-20001, 'Obra sem exemplar informado');
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END pr_gera_avisos;

END pkg_acervo;
/

CREATE OR REPLACE TRIGGER trg_obra_hist
  BEFORE UPDATE ON obra
  FOR EACH ROW
BEGIN
  :NEW.dt_mudanca := SYSDATE;
  :NEW.usuario_mudanca := USER;
END;
/
