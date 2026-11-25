import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { FileError, FileWithBase64, NgDdFileComponent } from './ng-dd-file.component';
import { NgDdFileDirective } from './ng-dd-file.directive';

function makeFile(name: string, sizeKb: number, type: string): File {
    return new File([new Uint8Array(sizeKb * 1024)], name, { type });
}

function dragEvent(type: string, files: File[] = []): Event {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'dataTransfer', { value: { files } });
    return event;
}

@Component({
    standalone: true,
    imports: [NgDdFileComponent],
    template: `
        <ng-dd-file [filesList]="filesList()" [maxFiles]="maxFiles()" [maxFileSize]="maxFileSize()" [maxTotalSize]="maxTotalSize()"
            [typeFileAccept]="typeFileAccept()" [multiple]="true" [btnClass]="{ file: 'btn btn-primary', remove: 'btn btn-danger' }"
            (filesAdd)="onAdd($event)" (fileError)="errors.push($event)" (fileRemove)="removed.push($event)">
        </ng-dd-file>
    `
})
class HostComponent {

    readonly filesList = signal<FileWithBase64[] | undefined>(undefined);
    readonly maxFiles = signal<number | undefined>(undefined);
    readonly maxFileSize = signal<number | undefined>(undefined);
    readonly maxTotalSize = signal<number | undefined>(undefined);
    readonly typeFileAccept = signal('*');
    readonly added: FileWithBase64[][] = [];
    readonly errors: FileError[] = [];
    readonly removed: { file: FileWithBase64, index: number }[] = [];

    onAdd(files: FileWithBase64[]): void {
        this.added.push(files);
        this.filesList.update(list => [...(list ?? []), ...files]);
    }

}

describe('NgDdFileComponent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const el = (): HTMLElement => fixture.nativeElement;
    const fileInput = (): HTMLInputElement => el().querySelector('input[type="file"]')!;
    const dropzone = (): HTMLElement => el().querySelector('.dropzone')!;

    const set = async (fn: () => void): Promise<void> => {
        fn();
        await fixture.whenStable();
    };

    const choose = async (files: File[]): Promise<void> => {
        const input = fileInput();
        Object.defineProperty(input, 'files', { value: files, configurable: true });
        const before = host.added.length + host.errors.length;
        input.dispatchEvent(new Event('change'));
        await vi.waitFor(() => expect(host.added.length + host.errors.length).toBeGreaterThan(before));
    };

    const drop = async (files: File[]): Promise<void> => {
        const before = host.added.length + host.errors.length;
        dropzone().dispatchEvent(dragEvent('drop', files));
        await vi.waitFor(() => expect(host.added.length + host.errors.length).toBeGreaterThan(before));
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('renders the dropzone with labels, button class and input attributes', () => {
        expect(dropzone().textContent).toContain('Arraste e solte os arquivos');
        expect(el().querySelector('button')!.className).toBe('btn btn-primary');
        expect(fileInput().multiple).toBe(true);
        expect(fileInput().accept).toBe('*');
    });

    it('opens the file dialog from the button', () => {
        const click = vi.spyOn(fileInput(), 'click');
        el().querySelector<HTMLButtonElement>('.dropzone button')!.click();
        expect(click).toHaveBeenCalled();
    });

    describe('adding files', () => {
        it('emits filesAdd with the chosen files and clears the input', async () => {
            await choose([makeFile('a.pdf', 10, 'application/pdf')]);

            expect(host.added.length).toBe(1);
            expect(host.added[0].map(f => f.name)).toEqual(['a.pdf']);
            expect(fileInput().value).toBe('');
        });

        it('emits filesAdd with dropped files', async () => {
            await drop([makeFile('a.pdf', 1, 'application/pdf'), makeFile('b.pdf', 1, 'application/pdf')]);
            expect(host.added[0].map(f => f.name)).toEqual(['a.pdf', 'b.pdf']);
        });

        it('attaches base64 preview to images only', async () => {
            await choose([makeFile('pic.png', 1, 'image/png'), makeFile('a.pdf', 1, 'application/pdf')]);

            const [img, pdf] = host.added[0];
            expect(img.base64).toMatch(/^data:image\/png;base64,/);
            expect(pdf.base64).toBeUndefined();
        });

        it('rejects the whole batch when maxTotalSize is exceeded (counting filesList)', async () => {
            await set(() => {
                host.maxTotalSize.set(100);
                host.filesList.set([makeFile('old.pdf', 60, 'application/pdf')]);
            });

            await choose([makeFile('new.pdf', 50, 'application/pdf')]);

            expect(host.errors.map(e => e.type)).toEqual(['total']);
            expect(host.added).toEqual([]);
            expect(fileInput().value).toBe('');
        });

        it('skips files above maxFileSize with a size error but keeps the rest', async () => {
            await set(() => host.maxFileSize.set(10));

            await choose([makeFile('big.pdf', 20, 'application/pdf'), makeFile('ok.pdf', 5, 'application/pdf')]);

            expect(host.errors.length).toBe(1);
            expect(host.errors[0].type).toBe('size');
            expect(host.errors[0].file?.name).toBe('big.pdf');
            expect(host.added[0].map(f => f.name)).toEqual(['ok.pdf']);
        });

        it('stops adding after maxFiles', async () => {
            await set(() => host.maxFiles.set(2));

            await choose([1, 2, 3].map(n => makeFile(`${n}.pdf`, 1, 'application/pdf')));

            expect(host.added[0].map(f => f.name)).toEqual(['1.pdf', '2.pdf']);
        });

        it('emits a count error for each file cut by maxFiles', async () => {
            await set(() => host.maxFiles.set(2));

            await choose([1, 2, 3, 4].map(n => makeFile(`${n}.pdf`, 1, 'application/pdf')));

            expect(host.errors.map(e => [e.type, e.file?.name])).toEqual([['count', '3.pdf'], ['count', '4.pdf']]);
        });

        it('reports size and type errors before the count cut', async () => {
            await set(() => {
                host.maxFiles.set(1);
                host.maxFileSize.set(10);
                host.typeFileAccept.set('.pdf');
            });

            await choose([makeFile('ok.pdf', 1, 'application/pdf'), makeFile('big.pdf', 20, 'application/pdf'), makeFile('a.txt', 1, 'text/plain')]);

            expect(host.errors.map(e => [e.type, e.file?.name])).toEqual([['size', 'big.pdf'], ['type', 'a.txt']]);
            expect(host.added[0].map(f => f.name)).toEqual(['ok.pdf']);
        });

        it('counts a batch still reading previews against maxFiles', async () => {
            await set(() => host.maxFiles.set(2));

            // Images wait for FileReader, so the second drop starts before the first one emits.
            dropzone().dispatchEvent(dragEvent('drop', [makeFile('a.png', 1, 'image/png')]));
            dropzone().dispatchEvent(dragEvent('drop', [makeFile('b.png', 1, 'image/png'), makeFile('c.png', 1, 'image/png')]));
            await vi.waitFor(() => expect(host.added.length).toBe(2));

            expect(host.added.flat().map(f => f.name)).toEqual(['a.png', 'b.png']);
            expect(host.errors.map(e => [e.type, e.file?.name])).toEqual([['count', 'c.png']]);
        });

        it('counts a pending batch against maxTotalSize', async () => {
            await set(() => host.maxTotalSize.set(15));

            dropzone().dispatchEvent(dragEvent('drop', [makeFile('a.png', 10, 'image/png')]));
            dropzone().dispatchEvent(dragEvent('drop', [makeFile('b.png', 10, 'image/png')]));
            await vi.waitFor(() => expect(host.added.length + host.errors.length).toBe(2));

            expect(host.added.flat().map(f => f.name)).toEqual(['a.png']);
            expect(host.errors.map(e => e.type)).toEqual(['total']);
        });

        it('counts files already in filesList against maxFiles', async () => {
            await set(() => {
                host.maxFiles.set(3);
                host.filesList.set([makeFile('old.pdf', 1, 'application/pdf'), makeFile('old2.pdf', 1, 'application/pdf')]);
            });

            await choose([1, 2, 3].map(n => makeFile(`${n}.pdf`, 1, 'application/pdf')));

            expect(host.added[0].map(f => f.name)).toEqual(['1.pdf']);
        });
    });

    describe('typeFileAccept', () => {
        const accepts = async (accept: string, file: File): Promise<boolean> => {
            await set(() => host.typeFileAccept.set(accept));
            await choose([file]);
            return host.added.at(-1)?.length === 1 && host.errors.length === 0;
        };

        it('accepts everything with *', async () => {
            expect(await accepts('*', makeFile('x.bin', 1, 'application/octet-stream'))).toBe(true);
        });

        it('matches by extension, case-insensitive', async () => {
            expect(await accepts('.pdf', makeFile('DOC.PDF', 1, 'application/pdf'))).toBe(true);
            expect(fileInput().accept).toBe('.pdf');
        });

        it('matches by MIME wildcard', async () => {
            expect(await accepts('image/*', makeFile('a.png', 1, 'image/png'))).toBe(true);
        });

        it('matches by exact MIME in a comma-separated list', async () => {
            expect(await accepts('.doc, application/pdf', makeFile('a.pdf', 1, 'application/pdf'))).toBe(true);
        });

        it('rejects other types with a type error', async () => {
            await set(() => host.typeFileAccept.set('image/*'));
            await choose([makeFile('a.pdf', 1, 'application/pdf')]);

            expect(host.errors.map(e => e.type)).toEqual(['type']);
            expect(host.added).toEqual([[]]);
        });
    });

    describe('file list', () => {
        it('lists files and emits fileRemove with file and index', async () => {
            const a = Object.assign(makeFile('a.pdf', 1, 'application/pdf'), { url: 'https://x/a.pdf' });
            const b = makeFile('b.pdf', 1, 'application/pdf');
            await set(() => host.filesList.set([a, b]));

            const links = el().querySelectorAll('tbody a');
            expect(Array.from(links).map(l => l.textContent)).toEqual(['a.pdf', 'b.pdf']);
            expect(links[0].getAttribute('href')).toBe('https://x/a.pdf');
            expect(links[1].hasAttribute('href')).toBe(false);

            const remove = el().querySelectorAll<HTMLButtonElement>('tbody button');
            expect(remove[1].className).toBe('btn btn-danger');
            remove[1].click();

            expect(host.removed).toEqual([{ file: b, index: 1 }]);
        });

        it('shows the limit message instead of the dropzone when maxFiles is reached', async () => {
            await set(() => {
                host.maxFiles.set(2);
                host.filesList.set([makeFile('a.pdf', 1, 'application/pdf'), makeFile('b.pdf', 1, 'application/pdf')]);
            });

            expect(fileInput()).toBeNull();
            expect(dropzone().textContent).toContain('LIMITE MÁXIMO DE 2 ARQUIVOS');

            await set(() => host.maxFiles.set(1));
            expect(dropzone().textContent).toContain('LIMITE MÁXIMO DE 1 ARQUIVO');
            expect(dropzone().textContent).not.toContain('ARQUIVOS');
        });
    });
});

@Component({
    standalone: true,
    imports: [NgDdFileDirective],
    template: `<div ddFile (droppedFile)="dropped.push($event)"></div>`
})
class DirectiveHostComponent {

    readonly dropped: FileList[] = [];

}

describe('NgDdFileDirective', () => {
    let fixture: ComponentFixture<DirectiveHostComponent>;
    let zone: HTMLElement;

    beforeEach(async () => {
        fixture = TestBed.createComponent(DirectiveHostComponent);
        await fixture.whenStable();
        zone = fixture.nativeElement.querySelector('div');
    });

    it('adds fileover on dragover and removes it on dragleave', async () => {
        const over = dragEvent('dragover');
        zone.dispatchEvent(over);
        await fixture.whenStable();
        expect(zone.classList).toContain('fileover');
        expect(over.defaultPrevented).toBe(true);

        zone.dispatchEvent(dragEvent('dragleave'));
        await fixture.whenStable();
        expect(zone.classList).not.toContain('fileover');
    });

    it('emits droppedFile and clears fileover on drop', async () => {
        const files = [makeFile('a.pdf', 1, 'application/pdf')];
        zone.dispatchEvent(dragEvent('dragover'));
        await fixture.whenStable();

        const drop = dragEvent('drop', files);
        zone.dispatchEvent(drop);
        await fixture.whenStable();

        expect(fixture.componentInstance.dropped).toEqual([files as unknown as FileList]);
        expect(zone.classList).not.toContain('fileover');
        expect(drop.defaultPrevented).toBe(true);
    });

    it('does not emit when nothing was dropped', async () => {
        zone.dispatchEvent(dragEvent('drop', []));
        await fixture.whenStable();
        expect(fixture.componentInstance.dropped).toEqual([]);
    });
});
