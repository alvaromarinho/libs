import { TemplateRef } from "@angular/core"

export interface NgBsModalServiceData {
    action: 'open' | 'close' | 'closeAll',
    content?: TemplateRef<any> | NgBsModalServiceContent,
    options?: NgBsModalServiceOptions
}

export interface NgBsModalServiceContent {
    header?: TemplateRef<any> | string,
    body?: TemplateRef<any> | string,
    footer?: TemplateRef<any>
}

export interface NgBsModalServiceOptions {
    disabledBodyScroll?: boolean;
    size?: 'sm' | 'lg' | 'xl',
    staticBackdrop?: boolean,
    withoutClose?: boolean,
    popoverTo?: HTMLElement,
    carousel?: {
        index: number,
        images: { url: string, fileName: string }[]
    },
    customClass?: {
        modal?: string;
        modalHeader?: string,
        modalBody?: string;
        modalFooter?: string,
    }
}
