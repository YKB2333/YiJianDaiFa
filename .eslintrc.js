module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  globals: {
    uni: true,
    wx: true,
    plus: true,
    getCurrentPages: true,
    window: true
  },
  rules: {
    // 末尾不加分号，只有在有可能语法错误时才会加分号
    semi: 0,
    // 箭头函数需要有括号 (a) => {}
    'arrow-parens': 0,
    // 两个空格缩进， switch 语句中的 case 为 1 个空格
    indent: [
      'error',
      2,
      {
        SwitchCase: 1
      }
    ],
    // 关闭不允许回调未定义的变量
    'standard/no-callback-literal': 0,
    // 关闭副作用的 new
    'no-new': 'off',
    // 关闭每行最大长度小于 80
    'max-len': 0,
    // 函数括号前面不加空格
    'space-before-function-paren': ['error', 'never'],
    // 关闭要求 require() 出现在顶层模块作用域中
    'global-require': 0,
    // 关闭关闭类方法中必须使用this
    'class-methods-use-this': 0,
    // 关闭禁止对原生对象或只读的全局对象进行赋值
    'no-global-assign': 0,
    // 关闭禁止对关系运算符的左操作数使用否定操作符
    'no-unsafe-negation': 0,
    // 关闭禁止使用 console
    'no-console': 0,
    // 关闭禁止末尾空行
    'eol-last': 0,
    // 关闭强制在注释中 // 或 /* 使用一致的空格
    'spaced-comment': 0,
    // 关闭禁止对 function 的参数进行重新赋值
    'no-param-reassign': 0,
    // 强制使用一致的换行符风格 (linebreak-style)
    'linebreak-style': ['off', 'unix'],
    // 关闭全等 === 校验
    eqeqeq: 'off',
    // 禁止使用拖尾逗号
    'comma-dangle': ['error', 'never'],
    // 关闭强制使用骆驼拼写法命名约定
    camelcase: 0,
    // reject时必须new Error返回错误信息
    'prefer-promise-reject-errors': 'off',
    'no-async-promise-executor': 'off',
    'node/handle-callback-err': 'off',
  }
}
