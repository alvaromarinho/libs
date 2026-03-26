# Angular Libs by Alvaro Marinho

A collection of Angular libraries for common UI needs, compatible with **Angular 14–21**.

## Libraries

### Angular only

| Library | npm | Description |
|---------|-----|-------------|
| [ng-generate-table](https://github.com/alvaromarinho/libs/tree/master/projects/ng-generate-table) | [![npm](https://badge.fury.io/js/ng-generate-table.svg)](https://www.npmjs.com/package/ng-generate-table) | Dynamic table generator with pipes, templates, sort and mobile card view |
| [ng-collapse](https://github.com/alvaromarinho/libs/tree/master/projects/ng-collapse) | [![npm](https://badge.fury.io/js/ng-collapse.svg)](https://www.npmjs.com/package/ng-collapse) | Smooth collapse/expand component with configurable transition duration |
| [ng-dd-file](https://github.com/alvaromarinho/libs/tree/master/projects/ng-dd-file) | [![npm](https://badge.fury.io/js/ng-dd-file.svg)](https://www.npmjs.com/package/ng-dd-file) | Drag and drop file upload with validation and image preview |

### Angular + Bootstrap 5

| Library | npm | Description |
|---------|-----|-------------|
| [ng-bs-calendar](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-calendar) | [![npm](https://badge.fury.io/js/ng-bs-calendar.svg)](https://www.npmjs.com/package/ng-bs-calendar) | Weekly calendar with scheduling, event colors and Luxon |
| [ng-bs-modal-service](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-modal-service) | [![npm](https://badge.fury.io/js/ng-bs-modal-service.svg)](https://www.npmjs.com/package/ng-bs-modal-service) | Modal service with queue, carousel and popover positioning |
| [ng-bs-toast-service](https://github.com/alvaromarinho/libs/tree/master/projects/ng-bs-toast-service) | [![npm](https://badge.fury.io/js/ng-bs-toast-service.svg)](https://www.npmjs.com/package/ng-bs-toast-service) | Toast notification service with Bootstrap Icons |

## Compatibility

All libraries support **Angular 14–21** and are available as **standalone components** or **NgModules**.

## Development

### Build all libraries
```bash
ng build ng-bs-calendar && ng build ng-bs-modal-service && ng build ng-bs-toast-service && ng build ng-collapse && ng build ng-dd-file && ng build ng-generate-table
```

### Build individually
```bash
ng build ng-bs-calendar
ng build ng-bs-modal-service
ng build ng-bs-toast-service
ng build ng-collapse
ng build ng-dd-file
ng build ng-generate-table
```

### Watch mode

```bash
ng build ng-bs-calendar --watch
ng build ng-bs-modal-service --watch
ng build ng-bs-toast-service --watch
ng build ng-collapse --watch
ng build ng-dd-file --watch
ng build ng-generate-table --watch
```

### Run demo app
```bash
cd projects/test-libs && ng serve
```

## License

MIT © [Alvaro Marinho](https://github.com/alvaromarinho)