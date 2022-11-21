module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true
    },
    extends: ["plugin:react/recommended", "airbnb", "plugin:prettier/recommended"],
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest"
    },
    plugins: ["react"],
    rules: {
        "no-console": "off",
        "react/react-in-jsx-scope": "off",
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto"
            }
        ],
        "react/jsx-props-no-spreading": 0
    }
};
