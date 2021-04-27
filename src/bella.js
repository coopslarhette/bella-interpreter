function interpret(program) {
  return P(program)
}

function P() {}
function S() {}
const E = (expression) => (memory) => {
  if (typeof expression === "number") {
    return expression
  } else if (typeof expression == "string") {
    const i = expression
    return memory(i) // WAIT THIS MIGHT NOT BE RIGHT
  } else if (expression.constructor === Unary) {
    return -E(expression)(memory)
  } else if (expression.constructor === Binary) {
    const { op, left, right } = condition
    switch (op) {
      case "+":
        return E(left)(memory) + E(right)(memory)
      // Lots more to do
    }
  }
}
const C = (condition) => (memory) => {
  if (condition === true) {
    return true
  } else if (condition === false) {
    return false
  } else if (condition.constructor === Binary) {
    const { op, left, right } = condition
    switch (op) {
      case "==":
        return E(left)(memory) === E(right)(memory)
      case "!=":
        return E(left)(memory) !== E(right)(memory)
      case "<":
        return E(left)(memory) < E(right)(memory)
      case "<=":
        return E(left)(memory) <= E(right)(memory)
      case ">":
        return E(left)(memory) >= E(right)(memory)
      case ">=":
        return E(left)(memory) >= E(right)(memory)
      case "&&":
        return C(left)(memory) && C(right)(memory)
      case "||":
        return C(left)(memory) || C(right)(memory)
    }
  } else if (condition.constructor === Unary) {
    const { op, operand } = condition
    return !C(operand)(memory)
  }
}

class Program {
  constructor(body) {
    this.body = body
  }
}

class VariableDeclaration {
  constructor(variable, initializer) {
    Object.assign(this, { variable, initializer })
  }
}

class PrintStatement {
  constructor(argument) {
    this.argument = argument
  }
}

class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body })
  }
}

class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source })
  }
}

class Binary {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right })
  }
}

class Unary {
  constructor(op, operand) {
    Object.assign(this, { op, operand })
  }
}

const program = (s) => new Program(s)
const vardec = (i, e) => new VariableDeclaration(i, e)
const print = (e) => new PrintStatement(e)
const whileLoop = (c, b) => new WhileStatement(c, b)
const plus = (x, y) => new Binary("+", x, y)
const minus = (x, y) => new Binary("-", x, y)
const times = (x, y) => new Binary("*", x, y)
const remainder = (x, y) => new Binary("%", x, y)
const power = (x, y) => new Binary("**", x, y)
const eq = (x, y) => new Binary("==", x, y)
const noteq = (x, y) => new Binary("!=", x, y)
const less = (x, y) => new Binary("<", x, y)
const lesseq = (x, y) => new Binary("<=", x, y)
const greater = (x, y) => new Binary(">", x, y)
const greatereq = (x, y) => new Binary(">=", x, y)
const and = (x, y) => new Binary("&&", x, y)
const or = (x, y) => new Binary("||", x, y)

console.log(interpret(program([vardec("x", 2), print("x")])))

console.log(
  program([
    vardec("x", 3),
    whileLoop(less("x", 10), [print("x"), assign("x", plus("x", 2))]),
  ])
)
