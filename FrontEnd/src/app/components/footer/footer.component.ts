import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <div class="container">
        <div class="footer-content">
          <div class="brand">
            <h3>FARAH COUTURE</h3>
            <p>L'élégance dans chaque point.</p>
          </div>
          <div class="links">
            <h4>Boutique</h4>
            <a href="#">Robes de Soirée</a>
            <a href="#">Robes Mariage</a>
            <a href="#">Robes Casual</a>
          </div>
          <div class="contact">
            <h4>Contact</h4>
            <p>faracontact111@gmail.com</p>
            <p>+123 456 7890</p>
          </div>
        </div>
        <div class="copyright">
          &copy; 2026 Farah Couture. Tous droits réservés.
        </div>
      </div>
    </footer>
  `,
  styles: [`
    footer {
      background-color: #1a1a1a;
      color: #f5f0e6;
      padding: 4rem 0 1rem;
      margin-top: auto;
    }
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }
    h3, h4 {
      font-family: 'Playfair Display', serif;
      margin-bottom: 1rem;
    }
    a {
        display: block;
        color: #aaa;
        text-decoration: none;
        margin-bottom: 0.5rem;
        &:hover { color: #fff; }
    }
    .copyright {
        text-align: center;
        border-top: 1px solid #333;
        padding-top: 1rem;
        font-size: 0.8rem;
        color: #666;
    }
  `]
})
export class FooterComponent { }
