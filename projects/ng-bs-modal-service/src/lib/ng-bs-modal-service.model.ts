import { TemplateRef } from "@angular/core"

export interface NgBsModalServiceOptions {
    disabledBodyScroll?: boolean;
    size?: 'sm' | 'lg' | 'xl',
    staticBackdrop?: boolean,
    withoutClose?: boolean,
    customClass?: {
        modal?: string;
        modalHeader?: string,
        modalBody?: string;
        modalFooter?: string,
    }
}

export interface NgBsModalServiceContent {
    header?: TemplateRef<any> | string,
    body: TemplateRef<any> | string,
    footer?: TemplateRef<any>
}

export interface NgBsModalServiceData {
    open: boolean,
    content?: TemplateRef<any> | NgBsModalServiceContent,
    options?: NgBsModalServiceOptions
}