import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        files: ['src/**/*.{js,mjs,cjs,jsx}'], // Применение конфигурации только к этому файлу
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                ...globals.browser,
                ...globals.node
            },
        },
        rules: {
            // Неиспользуемые переменные
            "no-unused-vars": ["error"],

            // Использование сокращенного синтаксиса для определения объектов
            "object-shorthand": ["error", "always"],

            // Использование фигурных скобок для if, else и т.д.
            "curly": ["error", "all"],

            // Переопределение переменных
            "no-redeclare": ["error"],

            // Использование одинарных кавычек для строк
            "quotes": ["error", "single"],

            // Пробелы после ключевых слов (например, if, else, for и т.д.)
            "keyword-spacing": ["error", { before: true, after: true }],

            // Использование === вместо ==
            "eqeqeq": ["error", "always"],

            // Недостижимый код
            "no-unreachable": ["error"],
        },
    },
];