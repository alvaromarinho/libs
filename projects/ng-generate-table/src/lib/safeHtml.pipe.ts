import { Pipe } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe {
    constructor(private sanitizer: DomSanitizer) { }

    transform(string: any, type?: 'url' | 'html') {
        return type && type == 'url' ? this.sanitizer.bypassSecurityTrustResourceUrl(string) : this.sanitizer.bypassSecurityTrustHtml(string);
    }
}