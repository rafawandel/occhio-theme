// Componente e servico Angular
import { Component, Injectable, Input, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Obra {
  id: number;
  titulo: string;
  ano: number | null;
}

@Injectable({ providedIn: 'root' })
export class AcervoService {
  private readonly http = inject(HttpClient);
  private static readonly BASE = '/api/obras';

  listar(pagina = 1): Observable<Obra[]> {
    return this.http
      .get<{ itens: Obra[] }>(`${AcervoService.BASE}?pagina=${pagina}`)
      .pipe(map((r) => r.itens));
  }
}

@Component({
  selector: 'app-acervo',
  standalone: true,
  templateUrl: './acervo.component.html',
  styleUrls: ['./acervo.component.scss'],
})
export class AcervoComponent implements OnInit {
  @Input({ required: true }) titulo!: string;
  protected obras = signal<Obra[]>([]);
  private servico = inject(AcervoService);

  ngOnInit(): void {
    this.servico.listar().subscribe({
      next: (lista) => this.obras.set(lista),
      error: (e: Error) => console.warn(e.message),
    });
  }

  abrir(obra: Obra): void {
    if (obra.ano !== null && obra.ano < 1900) {
      alert(`${obra.titulo} e uma obra rara`);
    }
  }
}
