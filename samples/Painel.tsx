// Componente React com hooks, generics e JSX
import React, { useEffect, useMemo, useState } from "react";
import type { FC, ReactNode } from "react";

export interface Obra {
  readonly codigo: number;
  titulo: string;
  autor?: string;
}

type Ordem = "titulo" | "autor";
enum Situacao { Livre = 1, Emprestado, Extraviado }

const LIMITE = 20;
const ENDERECO_API = `${import.meta.env.VITE_API}/obras`;

/**
 * Lista de obras com filtro.
 * @param props.titulo Texto do cabecalho
 */
export const Painel: FC<{ titulo: string; children?: ReactNode }> = ({ titulo, children }) => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [ordem, setOrdem] = useState<Ordem>("titulo");

  useEffect(() => {
    let ativo = true;
    fetch(ENDERECO_API)
      .then((r) => r.json() as Promise<Obra[]>)
      .then((dados) => ativo && setObras(dados.slice(0, LIMITE)))
      .catch((erro: unknown) => console.error(erro));
    return () => { ativo = false; };
  }, []);

  const ordenados = useMemo(
    () => [...obras].sort((a, b) => (a[ordem] ?? "").localeCompare(b[ordem] ?? "")),
    [obras, ordem],
  );

  return (
    <section className="painel" data-situacao={Situacao.Livre}>
      <h2 style={{ color: "#00d4ff", marginBottom: 8 }}>{titulo}</h2>
      {ordenados.length === 0 ? (
        <p>Nenhuma obra</p>
      ) : (
        <ul>
          {ordenados.map((l) => (
            <li key={l.codigo} onClick={() => setOrdem("autor")}>
              {l.titulo} <small>{l.autor}</small>
            </li>
          ))}
        </ul>
      )}
      {children}
    </section>
  );
};

export default Painel;
