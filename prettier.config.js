module.exports = {
    endOfLine: 'lf',
    htmlWhitespaceSensitivity: 'ignore',
    jsxSingleQuote: true,
    printWidth: 160,
    quoteProps: 'consistent',
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    arrowParens: 'avoid',
    proseWrap: 'always',
    overrides: [
        {
            files: ['*.md'],
            options: {
                printWidth: 80,
            },
        },
    ],
};
