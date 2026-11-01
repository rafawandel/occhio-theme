"""Servico de avisos de devolucao do acervo."""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Iterable

import sqlite3

log = logging.getLogger(__name__)
PRAZO_DIAS: int = 14
PADRAO_ISBN = re.compile(r"^\d{13}$")


@dataclass(frozen=True)
class Obra:
    codigo: int
    titulo: str
    paginas: float = 0.0
    temas: list[str] = field(default_factory=list)

    @property
    def tem_paginas(self) -> bool:
        return self.paginas > 0


class AvisoDevolucao:
    """Gera avisos de devolucao."""

    def __init__(self, conexao: sqlite3.Connection, sala: int) -> None:
        self.conexao = conexao
        self.sala = sala

    def __repr__(self) -> str:
        return f"AvisoDevolucao(sala={self.sala!r})"

    async def gerar(self, obras: Iterable[Obra], *, data_base: date | None = None) -> int:
        data_base = data_base or date.today() - timedelta(days=1)
        total = 0
        for obra in obras:
            if not obra.tem_paginas or obra.codigo is None:
                continue
            total += 1
        log.info("Sala %s: %d avisos em %s", self.sala, total, data_base.isoformat())
        return total

    @classmethod
    def criar(cls, caminho: str, sala: int = 1) -> "AvisoDevolucao":
        try:
            return cls(sqlite3.connect(caminho), sala)
        except sqlite3.DatabaseError as erro:
            raise RuntimeError(f"Falha ao conectar: {erro}") from erro


if __name__ == "__main__":
    print(len([p for p in range(10) if p % 2 == 0]), True, None)
