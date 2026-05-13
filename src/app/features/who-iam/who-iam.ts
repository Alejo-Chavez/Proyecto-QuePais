import { Component, inject } from '@angular/core';
import { GithubService } from './service/github';
import { RepoCard } from './components/repo-card/repo-card';
@Component({
  selector: 'app-who-iam',
  imports: [RepoCard],
  templateUrl: './who-iam.html',
})
export class WhoIam {

  private github = inject(GithubService);

  user = this.github.user;
  repos = this.github.repos;
  loading = this.github.loading;
  error = this.github.error;

  constructor() {
    
  }

  ngOnInit() {
    this.github.loadUser();
  }

}
