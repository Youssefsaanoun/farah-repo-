import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  private getBaseUrl(): string {
    // Remove '/api' from the environment URL for images
    return environment.apiUrl.replace('/api', '');
  }

  transform(value: string | undefined | null): string | null {
    if (!value) return null;

    // Handle Data URLs (Base64) - pass through
    if (value.startsWith('data:image')) {
      return value;
    }

    // Handle relative paths (e.g. /images/foo.jpg or \images\foo.jpg)
    // Normalize slashes first
    const normalizedValue = value.replace(/\\/g, '/');
    if (normalizedValue.startsWith('/images/')) {
      return `${this.getBaseUrl()}${normalizedValue}`;
    }

    // If it's a full URL already (http/https), pass through
    if (value.startsWith('http')) {
      return value;
    }

    // Fallback: If it looks like a filename, prepend full path
    // For now, if it starts with '/', prepend backend 
    if (value.startsWith('/')) {
      return `${this.getBaseUrl()}${value}`;
    }

    return value;
  }
}
