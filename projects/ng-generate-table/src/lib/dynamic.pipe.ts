import { Injector, Pipe, PipeTransform, Type } from '@angular/core';

@Pipe({
    name: 'dynamicPipe',
    standalone: true,
    pure: true
})
export class DynamicPipe implements PipeTransform {

    constructor(private injector: Injector) {}

    transform(value: any, pipeToken?: Type<PipeTransform>, pipeArgs?: any[]): any {

        if (!pipeToken) return value;

        try {
            const childInjector = Injector.create({
                name: 'DynamicPipeInjector',
                parent: this.injector,
                providers: [{ provide: pipeToken }]
            });

            const pipeInstance = childInjector.get(pipeToken) as PipeTransform;
            const args = pipeArgs || [];
            return pipeInstance.transform(value, ...args);
        } catch (error) {
            console.error('[DynamicPipe] Erro ao aplicar pipe:', error);
            return value;
        }
    }
}