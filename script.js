// Calculator logic with safe evaluation and extra operations (!, ^, %, parentheses)
(() => {
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const grid = document.querySelector('.grid');

    let expression = '';
    let justEvaluated = false;

    function updateDisplay() {
        expressionEl.textContent = expression || '';
        if (!expression) {
            resultEl.textContent = '0';
        }
    }

    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let res = 1;
        for (let i = 2; i <= Math.floor(n); i++) res *= i;
        return res;
    }

    function evaluateExpression(exp) {
        if (!exp || /[a-zA-Z]/.test(exp)) return null;
        // Replace custom operators with JS equivalents
        let s = exp
            .replace(/\u00F7/g, '/') // divide symbol safety
            .replace(/×/g, '*')
            .replace(/−/g, '-')
            .replace(/\^/g, '**');

        // Handle factorial: number! -> factorial(number)
        s = s.replace(/(\d+(?:\.\d+)?)!/g, (_, num) => `factorial(${num})`);

        // Handle percentage: number% -> (number/100)
        s = s.replace(/(\d+(?:\.\d+)?)%/g, (_, num) => `(${num}/100)`);

        try {
            // eslint-disable-next-line no-new-func
            const fn = new Function('factorial', `return (${s})`);
            const val = fn(factorial);
            if (typeof val === 'number' && Number.isFinite(val)) {
                return roundSmart(val);
            }
            return val;
        } catch (e) {
            return null;
        }
    }

    function roundSmart(n) {
        // Avoid floating point artifacts
        const rounded = Math.round((n + Number.EPSILON) * 1e12) / 1e12;
        return Number(rounded.toString());
    }

    function handleInput(value) {
        if (justEvaluated && /[0-9.]/.test(value)) {
            // Start new expression after equals when typing a number
            expression = '';
        }
        justEvaluated = false;

        // Prevent duplicate operators
        const last = expression.slice(-1);
        if (/^[+\-*/^]$/.test(value) && /^[+\-*/^(]$/.test(last)) {
            expression = expression.slice(0, -1) + value.replace('^', '^');
        } else {
            expression += value;
        }
        updateDisplay();
    }

    function doClear() {
        expression = '';
        resultEl.textContent = '0';
        updateDisplay();
    }

    function doDelete() {
        if (expression.length > 0) {
            expression = expression.slice(0, -1);
            updateDisplay();
        }
    }

    // Memory removed per request

    function doEquals() {
        const val = evaluateExpression(expression);
        if (val === null || val === undefined) return;
        resultEl.textContent = String(val);
        expression = String(val);
        justEvaluated = true;
        updateDisplay();
    }

    grid.addEventListener('click', (e) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const action = target.getAttribute('data-action');
        const value = target.getAttribute('data-value');
        if (action === 'clear') return doClear();
        if (action === 'delete') return doDelete();
        if (action === 'equals') return doEquals();
        if (value) return handleInput(value);
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        if ((/^[0-9]$/).test(key)) return handleInput(key);
        if (key === '.') return handleInput('.');
        if (key === '+' || key === '-' || key === '*' || key === '/' ) return handleInput(key);
        if (key === '^') return handleInput('^');
        if (key === '%') return handleInput('%');
        if (key === '!') return handleInput('!');
        if (key === '(' || key === ')') return handleInput(key);
        if (key === 'Backspace') return doDelete();
        if (key === 'Enter' || key === '=') return doEquals();
        if (key.toLowerCase() === 'c') return doClear();
    });

    // Initial state
    updateDisplay();
})();

