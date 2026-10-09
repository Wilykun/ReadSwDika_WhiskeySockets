// ESLint flat config — hanya untuk menangkap ReferenceError (variabel tak terdefinisi)
// seperti bug `pfx` dan `commands` yang lolos node --check tapi crash saat runtime.
import globals from 'globals';

export default [
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node,
                ...globals.es2024,
            },
        },
        rules: {
            'no-undef': 'error',
        },
    },
];
