import { GetText } from './totext';
export interface Language {
    dayNames: string[];
    monthNames: string[];
    tokens: {
        [k: string]: RegExp;
    };
    getText?: GetText;
    dictionary?: {
        [k: string]: string;
    };
}
declare const ENGLISH: Language;
export default ENGLISH;
//# sourceMappingURL=i18n.d.ts.map