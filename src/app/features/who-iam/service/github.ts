import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//ahora importo el servicio http que pedí
import { GitHubUser } from '../models/github-user';
import { GitHubRepo } from '../models/github-repo';

@Injectable({
  providedIn: 'root'
})
export class GithubService {

  private http = inject(HttpClient);
  private apiUrl = 'https://api.github.com/users/Alejo-Chavez';
  private apiReposUrl = 'https://api.github.com/users/Alejo-Chavez/repos';

  // estado reactivo
  user = signal<GitHubUser | null>(null);
  repos = signal<any[] | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  loadUser(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<GitHubUser>(this.apiUrl).subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar usuario de GitHub');
        this.loading.set(false);
      }
    });

    this.http.get<GitHubRepo[]>(this.apiReposUrl).subscribe({
      next: (data) => {
        this.repos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar Repositorios de github');
        this.loading.set(false);
      }
    });

  }
}