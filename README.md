# Angular Libs by Alvaro Marinho

A collection of Angular libraries for common UI needs, compatible with **Angular 14–21**.

## Libraries

### Angular only

| Library | npm | Description |
|---------|-----|-------------|
| [ng-generate-table](https://github.com/alvaromarinho/libs/tree/master/projects/ng-generate-table) | [![npm](https://badge.fury.io/js/ng-generate-table.svg)](https://www.npmjs.com/package/ng-generate-table) | Dynamic table generator with pipes, templates, sort and mobile card view |
| [ng-collapse](https://github.com/alvaromarinho/libs/tree/master/projects/ng-collapse) | [![npm](https://badge.fury.io/js/ng-collapse.svg)](https://www.npmjs.com/package/ng-collapse) | Smooth collapse/expand component with configurable transition duration |
| [ng-dd-file](https://github.com/alvaromarinho/libs/tree/master/projects/ng-dd-file) | [![npm](https://badge.fury.io/js/ng-dd-file.svg)](https://www.npmjs.com/package/ng-dd-file) | Drag and drop file upload with validation and image preview |
| [ng-month-year-picker](https://github.com/alvaromarinho/libs/tree/master/projects/ng-month-year-picker) | [![npm](https://badge.fury.io/js/ng-month-year-picker.svg)](https://www.npmjs.com/package/ng-month-year-picker) | Month/year picker dropdown, themeable via CSS custom properties |

### Angular + Bootstrap 5

| Library | npm | Description |
|---------|-----|-------------|
| [ng-bs-calendar](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-calendar) | [![npm](https://badge.fury.io/js/ng-bs-calendar.svg)](https://www.npmjs.com/package/ng-bs-calendar) | Weekly calendar with scheduling, event colors and Luxon |
| [ng-bs-modal-service](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-modal-service) | [![npm](https://badge.fury.io/js/ng-bs-modal-service.svg)](https://www.npmjs.com/package/ng-bs-modal-service) | Modal service with queue, carousel and popover positioning |
| [ng-bs-pagination](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-pagination) | [![npm](https://badge.fury.io/js/ng-bs-pagination.svg)](https://www.npmjs.com/package/ng-bs-pagination) | Configurable pagination component with split/center/stacked layouts |
| [ng-bs-toast-service](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-toast-service) | [![npm](https://badge.fury.io/js/ng-bs-toast-service.svg)](https://www.npmjs.com/package/ng-bs-toast-service) | Toast notification service with Bootstrap Icons |

## Compatibility

All libraries support **Angular 14–21** and are available as **standalone components** or **NgModules**.

## Development

### Run demo app
```bash
npm start
```
Serves the `test-libs` playground app (with examples for every library) on `http://localhost:4200`.

### Build all libraries
```bash
npm run build:all
```
Runs `scripts/build-all.sh`, building every library below (in order) plus `test-libs`:
- ng-bs-calendar
- ng-bs-modal-service
- ng-bs-pagination
- ng-bs-toast-service
- ng-collapse
- ng-dd-file
- ng-generate-table
- ng-month-year-picker

### Build individually
```bash
ng build <library-name>
```

### Watch mode

```bash
npm run watch -- <library-name>
```

### Run all unit tests
```bash
npm run test:all
```
Runs `scripts/test-all.sh`, running `ng test <library> --watch=false` for every library above.

## Publishing to npm

### Before publishing
- Update version in `package.json`
- Build the library: `ng build <library-name>`

### Publish a single library
```bash
cd dist/<library-name>
npm publish
```

### Publish all libraries
```bash
npm run publish:all
```
Runs `scripts/publish-all.sh`, building and publishing every library above.

## License

MIT © [Alvaro Marinho](https://github.com/alvaromarinho)