import { OnlyNumbersDirective } from './only-numbers.directive';
import { UpperCaseInputDirective } from './uppercase-input.directive';

export * from './only-numbers.directive';
export * from './uppercase-input.directive';

export const SHARED_DIRECTIVES = [
    OnlyNumbersDirective,
    UpperCaseInputDirective
] as const;
