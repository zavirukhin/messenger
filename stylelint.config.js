export default {
    rules: {
        // Запрещает использование именованных цветов (black, white и т.д.)
        "color-named": "never",

        // Запрещает одинаковые селекторы
        "no-duplicate-selectors": true,

        //Запрещает пустые строки в блоках
        "declaration-empty-line-before":"never",

        // Запрещает селекторы с меньшей специфичностью после селекторов с большей специфичностью
        "no-descending-specificity": true,

        // Требует пустую строку между объявлениями селекторов
        "rule-empty-line-before": [
            "always",
            {
                except: ["first-nested"],
                ignore: ["after-comment"],
            },
        ],
    },
};