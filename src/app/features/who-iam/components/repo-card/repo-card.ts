import { Component, Input , OnInit} from '@angular/core';
import { LANGUAGE_COLORS } from '../../../../utils/language-colors'; 

@Component({
  selector: 'app-repoc-card',
  imports: [],
  templateUrl: './repo-card.html',
})
export class RepoCard implements OnInit {
  @Input() repos: any;

  ngOnInit(): void {
    this.repos.color = this.getLanguageColor(this.repos.language);
  }
  getLanguageColor(lang: string): string {
    return LANGUAGE_COLORS[lang] || '#8b949e'; // fallback gris
  }
}

 