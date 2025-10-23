import { drawCalligraphyDiamond } from './alphabet/diamond';
import { drawCalligraphyHorizontalHook } from './alphabet/h-hook';
import { drawCalligraphyHook } from './alphabet/v-hook';
import { drawCalligraphyLStroke } from './alphabet/l-stroke';
import { drawSolidRing } from './alphabet/solid-ring';
export const strokeNames = {
    d: 'Calligraphy Diamond',
    h: 'Calligraphy Horizontal Hook',
    l: 'Calligraphy L-Stroke',
    v: 'Calligraphy Hook',
    '-': 'Solid Ring',
    solid: 'Solid Ring',
};
export const alphabet = {
    d: drawCalligraphyDiamond,
    h: drawCalligraphyHorizontalHook,
    l: drawCalligraphyLStroke,
    v: drawCalligraphyHook,
    solid: drawSolidRing,
};
export function parseGrammar(grammarString) {
    const sequence = [];
    let i = 0;
    while (i < grammarString.length) {
        const raw = grammarString[i];
        let numStr = '';
        let j = i + 1;
        while (j < grammarString.length && !Number.isNaN(Number(grammarString[j])) && grammarString[j] !== ' ') {
            numStr += grammarString[j];
            j++;
        }
        const isUpper = raw === raw.toUpperCase() && raw !== raw.toLowerCase();
        const baseChar = raw.toLowerCase();
        if ('dhlvx'.includes(baseChar)) {
            const repeat = numStr === '' ? 1 : parseInt(numStr, 10);
            for (let k = 0; k < repeat; k++)
                sequence.push({ char: baseChar, rotated: isUpper });
            i = j;
        }
        else if (baseChar === 'x') {
            const repeat = numStr === '' ? 1 : parseInt(numStr, 10);
            for (let k = 0; k < repeat; k++)
                sequence.push({ char: 'x', rotated: false });
            i = j;
        }
        else {
            i++;
        }
    }
    return sequence;
}
