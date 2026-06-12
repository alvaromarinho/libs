export type PaginationLayoutType = 'split' | 'center' | 'stacked';
export type PaginationInfoPosition = 'start' | 'end';
export type PaginationNavMode = 'icon' | 'text';

export interface PaginationLayout {
    /** `split` = info e botões em lados opostos; `center` = ambos centralizados; `stacked` = um acima do outro. */
    type?: PaginationLayoutType;
    /** Posição da info: lado (split/center) ou topo/base (stacked). */
    infoPosition?: PaginationInfoPosition;
    /** Exibe o bloco de informação ("Mostrando X-Y de Z"). */
    showInfo?: boolean;
}

export interface PaginationPrevNext {
    /** `icon` = setas nativas (‹ ›); `text` = labels customizados. */
    mode?: PaginationNavMode;
    labels?: { prev?: string; next?: string };
}

export interface PaginationFirstLast {
    /** Exibe os botões de primeira/última página. */
    show?: boolean;
    /** `icon` = setas duplas nativas (« »); `text` = labels customizados. */
    mode?: PaginationNavMode;
    labels?: { first?: string; last?: string };
}

export interface PaginationInfoContext {
    start: number;
    end: number;
    total: number;
    current: number;
    totalPages: number;
}

export const DEFAULT_LAYOUT: Required<PaginationLayout> = {
    type: 'stacked',
    infoPosition: 'start',
    showInfo: true,
};

export const DEFAULT_PREV_NEXT: Required<PaginationPrevNext> = {
    mode: 'icon',
    labels: { prev: '‹', next: '›' },
};

export const DEFAULT_FIRST_LAST: Required<PaginationFirstLast> = {
    show: true,
    mode: 'icon',
    labels: { first: '«', last: '»' },
};
