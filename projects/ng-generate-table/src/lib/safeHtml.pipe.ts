import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml',
    standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
    
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: any, type: 'html' | 'url' = 'html', bypassSecurity = false): SafeHtml | SafeResourceUrl | string {
        if (!value) return '';

        if (typeof value !== 'string') {
            console.warn('[SafeHtmlPipe] Valor fornecido não é uma string:', value);
            return '';
        }

        if (bypassSecurity) {
            return type === 'url' 
                ? this.sanitizer.bypassSecurityTrustResourceUrl(value)
                : this.sanitizer.bypassSecurityTrustHtml(value);
        }

        if (type === 'url') {
            const sanitized = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, value);
            return sanitized || '';
        }

        const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, value);
        return sanitized || '';
    }
}