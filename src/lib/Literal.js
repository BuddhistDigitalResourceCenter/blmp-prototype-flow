
const languageTypes = [
    "http://www.w3.org/2001/XMLSchema#string",
    "http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral"
];

const dateTypes = [
    "http://www.w3.org/2001/XMLSchema#dateTime"
];

export default class Literal {
    _type: string;
    _language: string;
    _value: string;

    constructor(type: string, value: string, language: ?string) {
        this._type = type;
        this._value = value;
        this._language = language;
    }

    get hasLanguage(): boolean {
        return (languageTypes.indexOf(this.type) !== -1);
    }

    get isDate(): boolean {
        return (dateTypes.indexOf(this.type) !== -1);
    }
    
    get type(): string {
        return this._type;
    }

    get value(): string {
        return this._value;
    }

    set value(newValue: string) {
        this._value = newValue;
    }

    get language(): string {
        return this._language;
    }

    set language(newLanguage: string) {
        this._language = newLanguage;
    }
}