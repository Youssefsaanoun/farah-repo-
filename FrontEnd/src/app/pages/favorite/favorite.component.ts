import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUrlPipe } from '../../pipes/image-url-pipe';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../../services/favorite.service';
import { Product } from '../../models/models';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-favorite',
    standalone: true,
    imports: [CommonModule, RouterLink, ImageUrlPipe],
    templateUrl: './favorite.component.html',
    styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
    favoriteItems$!: Observable<Product[]>;

    constructor(
        public favoriteService: FavoriteService
    ) { }

    ngOnInit() {
        this.favoriteItems$ = this.favoriteService.favoriteItems$;
    }

    removeFavorite(id: number) {
        this.favoriteService.removeFavorite(id);
    }
}
