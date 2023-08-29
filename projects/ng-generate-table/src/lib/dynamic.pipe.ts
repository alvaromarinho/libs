import { Injector, Pipe, PipeTransform, Type } from '@angular/core';

@Pipe({ name: 'dynamicPipe' })
export class DynamicPipe implements PipeTransform {

    constructor(private injector: Injector) { }

    transform(value: any, requiredPipe?: Type<any>, pipeArgs?: any[]): any {

        if (!requiredPipe)
            return value

        const injector = Injector.create({
            name: 'DynamicPipe',
            parent: this.injector,
            providers: [
                { provide: requiredPipe }
            ]
        })
        const pipe = injector.get(requiredPipe)
        const arg = pipeArgs || []
        return pipe.transform(value, ...arg);
    }

}