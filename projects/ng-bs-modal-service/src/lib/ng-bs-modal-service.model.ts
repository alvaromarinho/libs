import { TemplateRef } from "@angular/core"
import { Subject } from "rxjs"

export interface NgBsModalServiceData {
    action: 'open' | 'close' | 'closeAll',
    content?: TemplateRef<any> | NgBsModalServiceContent,
    options?: NgBsModalServiceOptions,
    open?: boolean,
    closed?: Subject<void>
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
        images: { url: string, name: string }[]
    },
    customClass?: {
        modal?: string;
        modalHeader?: string,
        modalBody?: string;
        modalFooter?: string,
    }
}