import { TemplateRef } from "@angular/core"

export interface NgBsModalOptions {
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

export interface NgBsModalContent {
    header?: TemplateRef<any> | string,
    body: TemplateRef<any> | string,
    footer?: TemplateRef<any>
}

export interface NgBsModalData {
    open: boolean,
    content?: TemplateRef<any> | NgBsModalContent,
    options?: NgBsModalOptions
}