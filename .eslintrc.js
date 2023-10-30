module.exports = {
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  plugins: ["prettier", "jest"],
  rules: {
    "prettier/prettier": "error",
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/prefer-to-have-length": "warn",
    "jest/valid-expect": "error",
    "comma-dangle": 0
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
    webextensions: true
  },
  parserOptions: {
    sourceType: "module"
  }
};
