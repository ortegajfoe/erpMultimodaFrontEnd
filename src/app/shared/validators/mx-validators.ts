import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class MxValidators {

    static rfc(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) {
            return null;
        }

        const valueUpper = value.toString().toUpperCase();

        const rfcPattern = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;

        if (!rfcPattern.test(valueUpper)) {
            return { invalidRfc: true };
        }

        return null;
    }

    static curp(control: AbstractControl): ValidationErrors | null {
        const value = control.value;
        if (!value) {
            return null;
        }

        const valueUpper = value.toString().toUpperCase();

        const curpPattern = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;

        if (!curpPattern.test(valueUpper)) {
            return { invalidCurp: true };
        }

        return null;
    }
}
