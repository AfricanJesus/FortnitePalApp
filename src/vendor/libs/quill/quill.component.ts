// See source https://github.com/KillerCodeMonkey/ngx-quill/blob/develop/src/quill-editor.component.ts
// Docs: https://github.com/KillerCodeMonkey/ngx-quill

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';

import {
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  Validator
} from '@angular/forms';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Try to load quill library, will fail in IE10
let Quill: any;
try {
  Quill = require('quill');
} catch {}

export interface CustomOption {
  import: string;
  whitelist: Array<any>;
}

@Component({
  selector: 'quill-editor', // tslint:disable-line
  template: `
  <ng-content select="[quill-editor-toolbar]"></ng-content>
`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => QuillEditorComponent),
      multi: true
    }
  ],
  encapsulation: ViewEncapsulation.None
})
export class QuillEditorComponent
  implements AfterViewInit, ControlValueAccessor, OnChanges, Validator {
  @HostBinding('class.d-block') private hostClass = true;

  quillEditor: any;
  editorElem: HTMLElement;
  emptyArray: any[] = [];
  content: any;
  defaultModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction
      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [
        { color: this.emptyArray.slice() },
        { background: this.emptyArray.slice() }
      ], // dropdown with defaults from theme
      [{ font: this.emptyArray.slice() }],
      [{ align: this.emptyArray.slice() }],

      ['clean'], // remove formatting button
      ['link', 'image', 'video'] // link and image, video
    ]
  };

  @Input() theme: string;
  @Input() modules: { [index: string]: Object };
  @Input() readOnly: boolean;
  @Input() placeholder: string;
  @Input() maxLength: number;
  @Input() minLength: number;
  @Input() required: boolean;
  @Input() formats: string[];
  @Input() style: any = {};
  @Input() strict = true;
  @Input() scrollingContainer: HTMLElement | string;
  @Input() bounds: HTMLElement | string;
  @Input() customOptions: CustomOption[] = [];

  @Output() onEditorCreated: EventEmitter<any> = new EventEmitter(); // tslint:disable-line
  @Output() onContentChanged: EventEmitter<any> = new EventEmitter(); // tslint:disable-line
  @Output() onSelectionChanged: EventEmitter<any> = new EventEmitter(); // tslint:disable-line
  @Input()
  valueGetter = (quillEditor: any, editorElement: HTMLElement): any => {
    let html: string | null = editorElement.children[0].innerHTML;
    if (html === '<p><br></p>' || html === '<div><br><div>') {
      html = null;
    }
    return html;
  }
  @Input()
  valueSetter = (quillEditor: any, value: any): any => {
    return quillEditor.clipboard.convert(value);
  }

  onModelChange: Function = () => {};
  onModelTouched: Function = () => {};

  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private doc: any,
    private renderer: Renderer2,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    // Skip initialization if Quill plugin is not loaded
    if (!Quill) { return; }

    const toolbarElem = this.elementRef.nativeElement.querySelector(
      '[quill-editor-toolbar]'
    );
    const modules: any = this.modules || this.defaultModules;
    let placeholder = 'Insert text here ...';

    if (this.placeholder !== null && this.placeholder !== undefined) {
      placeholder = this.placeholder.trim();
    }

    if (toolbarElem) {
      modules['toolbar'] = toolbarElem;
    }
    this.elementRef.nativeElement.insertAdjacentHTML(
      'beforeend',
      '<div quill-editor-element></div>'
    );
    this.editorElem = this.elementRef.nativeElement.querySelector(
      '[quill-editor-element]'
    );

    if (this.style) {
      Object.keys(this.style).forEach((key: string) => {
        this.renderer.setStyle(this.editorElem, key, this.style[key]);
      });
    }

    this.customOptions.forEach(customOption => {
      const newCustomOption = Quill.import(customOption.import);
      newCustomOption.whitelist = customOption.whitelist;
      Quill.register(newCustomOption, true);
    });

    this.quillEditor = new Quill(this.editorElem, {
      modules: modules,
      placeholder: placeholder,
      readOnly: this.readOnly || false,
      theme: this.theme || 'snow',
      formats: this.formats,
      bounds: this.bounds ? (this.bounds === 'self' ? this.editorElem : this.bounds) : this.doc.body,
      strict: this.strict,
      scrollingContainer: this.scrollingContainer
    });

    if (this.content) {
      const contents = this.quillEditor.clipboard.convert(this.content);
      this.quillEditor.setContents(contents);
      this.quillEditor.history.clear();
    }

    this.onEditorCreated.emit(this.quillEditor);

    // mark model as touched if editor lost focus
    this.quillEditor.on(
      'selection-change',
      (range: any, oldRange: any, source: string) => {
        this.zone.run(() => {
          this.onSelectionChanged.emit({
            editor: this.quillEditor,
            range: range,
            oldRange: oldRange,
            source: source
          });

          if (!range) {
            this.onModelTouched();
          }
        });
      }
    );

    // update model if text changes
    this.quillEditor.on(
      'text-change',
      (delta: any, oldDelta: any, source: string) => {

        const text = this.quillEditor.getText();

        let html: string | null = this.editorElem.children[0].innerHTML;
        if (html === '<p><br></p>' || html === '<div><br><div>') {
          html = null;
        }

        this.zone.run(() => {
          this.onModelChange(
            this.valueGetter(this.quillEditor, this.editorElem)
          );

          this.onContentChanged.emit({
            editor: this.quillEditor,
            html: html,
            text: text,
            delta: delta,
            oldDelta: oldDelta,
            source: source
          });
        });
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.quillEditor) {
      return null;
    }
    if (changes['readOnly']) {
      this.quillEditor.enable(!changes['readOnly'].currentValue);
    }
    if (changes['placeholder']) {
      this.quillEditor.root.dataset.placeholder =
        changes['placeholder'].currentValue;
    }
  }

  writeValue(currentValue: any) {
    this.content = currentValue;

    if (this.quillEditor) {
      if (currentValue) {
        this.quillEditor.setContents(
          this.valueSetter(this.quillEditor, this.content)
        );
        return;
      }
      this.quillEditor.setText('');
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  validate() {
    if (!this.quillEditor) {
      return null;
    }

    const err: {
      minLengthError?: { given: number; minLength: number };
      maxLengthError?: { given: number; maxLength: number };
      requiredError?: { empty: boolean };
    } = {};
    let valid = true;

    const textLength = this.quillEditor.getText().trim().length;

    if (this.minLength && textLength && textLength < this.minLength) {
      err.minLengthError = {
        given: textLength,
        minLength: this.minLength
      };

      valid = false;
    }

    if (this.maxLength && textLength > this.maxLength) {
      err.maxLengthError = {
        given: textLength,
        maxLength: this.maxLength
      };

      valid = false;
    }

    if (this.required && !textLength) {
      err.requiredError = {
        empty: true
      };

      valid = false;
    }

    return valid ? null : err;
  }
}
