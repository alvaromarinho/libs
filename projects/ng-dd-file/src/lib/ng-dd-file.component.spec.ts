import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgDdFileComponent } from './ng-dd-file.component';
import { NgDdFileDirective } from './ng-dd-file.directive';

function makeFile(name: string, sizeKb: number, type: string): File {
  return new File([new Uint8Array(sizeKb * 1024)], name, { type });
}

describe('NgDdFileComponent', () => {
  let component: NgDdFileComponent;
  let fixture: ComponentFixture<NgDdFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ NgDdFileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgDdFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fileBrowseHandler', () => {
    it('emits filesAdd with the accepted files', async () => {
      let added: File[] = [];
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([makeFile('a.pdf', 10, 'application/pdf')]);

      expect(added.length).toBe(1);
      expect(added[0].name).toBe('a.pdf');
    });

    it('attaches base64 preview to images', async () => {
      let added: any[] = [];
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([makeFile('img.png', 1, 'image/png')]);

      expect(added[0].base64).toMatch(/^data:image\/png;base64,/);
    });

    it('does not attach base64 to non-images', async () => {
      let added: any[] = [];
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([makeFile('a.pdf', 1, 'application/pdf')]);

      expect(added[0].base64).toBeUndefined();
    });

    it('rejects the whole batch when maxTotalSize is exceeded (counting existing filesList)', async () => {
      component.maxTotalSize = 100; // KB
      component.filesList = [makeFile('old.pdf', 60, 'application/pdf')];
      let error: any = null;
      let added: File[] | null = null;
      component.fileError.subscribe(e => error = e);
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([makeFile('new.pdf', 50, 'application/pdf')]);

      expect(error?.type).toBe('total');
      expect(added).toBeNull(); // aborta sem emitir filesAdd
    });

    it('skips files above maxFileSize with a size error but keeps the rest', async () => {
      component.maxFileSize = 10; // KB
      let errors: any[] = [];
      let added: File[] = [];
      component.fileError.subscribe(e => errors.push(e));
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([
        makeFile('big.pdf', 20, 'application/pdf'),
        makeFile('ok.pdf', 5, 'application/pdf'),
      ]);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe('size');
      expect(errors[0].file.name).toBe('big.pdf');
      expect(added.map(f => f.name)).toEqual(['ok.pdf']);
    });

    it('stops adding after maxFiles', async () => {
      component.maxFiles = 2;
      let added: File[] = [];
      component.filesAdd.subscribe(f => added = f);

      await component.fileBrowseHandler([
        makeFile('1.pdf', 1, 'application/pdf'),
        makeFile('2.pdf', 1, 'application/pdf'),
        makeFile('3.pdf', 1, 'application/pdf'),
      ]);

      expect(added.length).toBe(2);
    });

    it('accepts a change-event-like object and clears the input value', async () => {
      let added: File[] = [];
      component.filesAdd.subscribe(f => added = f);
      const target = { files: [makeFile('a.pdf', 1, 'application/pdf')], value: 'C:\\fake\\a.pdf' };

      await component.fileBrowseHandler({ target });

      expect(added.length).toBe(1);
      expect(target.value).toBe('');
    });
  });

  describe('typeFileAccept validation', () => {
    async function accepted(file: File, accept: string): Promise<boolean> {
      component.typeFileAccept = accept;
      let added: File[] = [];
      let error: any = null;
      const s1 = component.filesAdd.subscribe(f => added = f);
      const s2 = component.fileError.subscribe(e => error = e);
      await component.fileBrowseHandler([file]);
      s1.unsubscribe();
      s2.unsubscribe();
      if (error) expect(error.type).toBe('type');
      return added.length === 1;
    }

    it('accepts everything with *', async () => {
      expect(await accepted(makeFile('a.bin', 1, 'application/octet-stream'), '*')).toBe(true);
    });

    it('matches by extension', async () => {
      expect(await accepted(makeFile('doc.PDF', 1, ''), '.pdf')).toBe(true);
      expect(await accepted(makeFile('doc.txt', 1, ''), '.pdf')).toBe(false);
    });

    it('matches by MIME wildcard', async () => {
      expect(await accepted(makeFile('img.png', 1, 'image/png'), 'image/*')).toBe(true);
      expect(await accepted(makeFile('a.pdf', 1, 'application/pdf'), 'image/*')).toBe(false);
    });

    it('matches by exact MIME and accepts comma-separated lists', async () => {
      expect(await accepted(makeFile('a.pdf', 1, 'application/pdf'), 'image/*, application/pdf')).toBe(true);
    });
  });

  describe('removeFile', () => {
    it('emits fileRemove with file and index', () => {
      const file = makeFile('a.pdf', 1, 'application/pdf');
      let event: any = null;
      component.fileRemove.subscribe(e => event = e);

      component.removeFile(file, 3);

      expect(event.file).toBe(file);
      expect(event.index).toBe(3);
    });
  });
});

describe('NgDdFileDirective', () => {
  function makeEvent(files: File[] = []): any {
    return {
      preventDefault: () => {},
      stopPropagation: () => {},
      dataTransfer: { files },
    };
  }

  it('sets fileOver on dragover and clears on dragleave', () => {
    const directive = new NgDdFileDirective();

    directive.onDragOver(makeEvent());
    expect(directive.fileOver).toBe(true);

    directive.onDragLeave(makeEvent());
    expect(directive.fileOver).toBe(false);
  });

  it('emits droppedFile with the dropped files', () => {
    const directive = new NgDdFileDirective();
    const files = [makeFile('a.pdf', 1, 'application/pdf')];
    let dropped: any = null;
    directive.droppedFile.subscribe(f => dropped = f);

    directive.ondrop(makeEvent(files));

    expect(dropped).toBe(files);
    expect(directive.fileOver).toBe(false);
  });

  it('does not emit when nothing was dropped', () => {
    const directive = new NgDdFileDirective();
    let count = 0;
    directive.droppedFile.subscribe(() => count++);

    directive.ondrop(makeEvent([]));

    expect(count).toBe(0);
  });
});
