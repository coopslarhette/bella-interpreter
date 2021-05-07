const body2State = (body) => ([memory, output]) =>
  body.reduce(([m, o], s) => S(s)([m, o]), [memory, output])

export function interpret(program) {
  return P(program)
}

const P = (program) => {
  return body2State(program.body)([{}, []])[1]
}

const S = (statement) => ([memory, output]) => {
  if (statement.constructor === VariableDeclaration) {
    let { variable, initializer } = statement
    return [{ ...memory, [variable]: E(initializer)(memory) }, output]
  } else if (statement.constructor === PrintStatement) {
    let { argument } = statement
    return [memory, [...output, E(argument)(memory)]]
  } else if (statement.constructor === Assignment) {
    let { target, source } = statement
    return [{ ...memory, [target]: E(source)(memory) }, output]
  } else if (statement.constructor === WhileStatement) {
    let { test, body } = statement
    return C(test)(memory)
      ? S(statement)(body2State(body)([memory, output]))
      : [memory, output]
  } else if (statement.constructor === FunctionDeclaration) {
    let { name, parameters, body } = statement
    return [{ ...memory, [name]: [parameters, body] }, output]
  }
}

const E = (expression) => (memory) => {
  if (typeof expression === 'number') {
    return expression
  } else if (typeof expression == 'string') {
    const i = expression
    return memory[i]
  } else if (expression.constructor === Unary) {
    return -E(expression)(memory)
  } else if (expression.constructor === Binary) {
    const { op, left, right } = expression
    switch (op) {
      case '+':
        return E(left)(memory) + E(right)(memory)
      case '-':
        return E(left)(memory) - E(right)(memory)
      case '*':
        return E(left)(memory) * E(right)(memory)
      case '/':
        return E(left)(memory) / E(right)(memory)
      case '%':
        return E(left)(memory) % E(right)(memory)
      case '**':
        return E(left)(memory) ** E(right)(memory)
    }
  } else if (expression.constructor === Conditional) {
    const { test, first, second } = expression
    return C(test)(memory) ? E(first)(memory) : E(second)(memory)
  } else if (expression.constructor === Call) {
    const { name, args } = expression
    const [parameters, body] = E(name)(memory)
    const functionScopedMemory = parameters.reduce(
      (m, parameterName, index) => ({
        ...m,
        [parameterName]: args[index],
      }),
      memory
    )
    return E(body)(functionScopedMemory)
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
      case '==':
        return E(left)(memory) === E(right)(memory)
      case '!=':
        return E(left)(memory) !== E(right)(memory)
      case '<':
        return E(left)(memory) < E(right)(memory)
      case '<=':
        return E(left)(memory) <= E(right)(memory)
      case '>':
        return E(left)(memory) >= E(right)(memory)
      case '>=':
        return E(left)(memory) >= E(right)(memory)
      case '&&':
        return C(left)(memory) && C(right)(memory)
      case '||':
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

class FunctionDeclaration {
  constructor(name, parameters, body) {
    Object.assign(this, { name, parameters, body })
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

class Conditional {
  constructor(test, first, second) {
    Object.assign(this, { test, first, second })
  }
}

class Call {
  constructor(name, args) {
    Object.assign(this, { name, args })
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

export const program = (s) => new Program(s)
export const vardec = (i, e) => new VariableDeclaration(i, e)
export const print = (e) => new PrintStatement(e)
export const whileLoop = (c, b) => new WhileStatement(c, b)
export const funcdec = (n, p, b) => new FunctionDeclaration(n, p, b)
export const conditional = (c, f, s) => new Conditional(c, f, s)
export const assign = (t, s) => new Assignment(t, s)
export const call = (n, a) => new Call(n, a)
export const plus = (x, y) => new Binary('+', x, y)
export const minus = (x, y) => new Binary('-', x, y)
export const times = (x, y) => new Binary('*', x, y)
export const remainder = (x, y) => new Binary('%', x, y)
export const power = (x, y) => new Binary('**', x, y)
export const eq = (x, y) => new Binary('==', x, y)
export const noteq = (x, y) => new Binary('!=', x, y)
export const less = (x, y) => new Binary('<', x, y)
export const lesseq = (x, y) => new Binary('<=', x, y)
export const greater = (x, y) => new Binary('>', x, y)
export const greatereq = (x, y) => new Binary('>=', x, y)
export const and = (x, y) => new Binary('&&', x, y)
export const or = (x, y) => new Binary('||', x, y)

// prints [ 2 ]
console.log(
  interpret(
    program([
      funcdec('difference', ['x', 'y'], minus('x', 'y')),
      print(call('difference', [3, 1])),
    ])
  )
)

// prints [ 2 ]
console.log(interpret(program([vardec('x', 2), print('x')])))

// prints six 2's
console.log(
  interpret(
    program([
      vardec('x', 2),
      print(conditional(noteq(-3, 1), 'x', 1)),
      print(conditional(lesseq(-3, 1), 'x', 1)),
      print(conditional(greater(1, -3), 'x', 1)),
      print(conditional(greatereq(1, -3), 'x', 1)),
      print(conditional(and(greatereq(1, -3), greater(1, -3)), 'x', 1)),
      print(conditional(or(greatereq(1, -3), greater(1, -3)), 'x', 1)),
    ])
  )
)

// [ 3, 10, 1, 25 ]
console.log(
  interpret(
    program([
      vardec('x', 2),
      print(minus(5, 2)),
      print(times(5, 2)),
      print(remainder(5, 2)),
      print(power(5, 2)),
    ])
  )
)

console.log(
  interpret(
    program([
      vardec('x', 3),
      whileLoop(less('x', 4), [print('x'), assign('x', plus('x', 1))]),
    ])
  )
)

console.log(
  interpret(
    program([
      vardec('x', 3),
      whileLoop(less('x', 5), [print('x'), assign('x', plus('x', 1))]),
    ])
  )
)

console.log(
  interpret(
    program([
      vardec('x', 3),
      vardec('y', plus('x', 10)),
      print('x'),
      print('y'),
      vardec('z', conditional(eq(1, 1), 'x', 'y')),
      print('z'),
    ])
  )
)

console.log(
  interpret(
    program([
      vardec('x', 3),
      vardec('y', plus('x', 10)),
      print('x'),
      print('y'),
    ])
  )
)
