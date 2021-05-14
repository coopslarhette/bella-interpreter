# Bella Semantics and Interpreter

Bella is a simple programming language designed in a Programming Language Semantics class.

## Examples

```
let x = 3;
while x < 10 {
  print x;
  x = x + 2;
}
```
This program outputs 3 5 7 9

```
fun subtract x, y = x - y
let g = subtract 3, 2
print g
```
This program outputs 1

```
fun squared base = base ** 2
let c = 1 > 2 && ~(3 != 1)
let g = c ? squared 5 : 5
print g
```
This program outputs 5

## Abstract Syntax

```
p: Prog
c: Cond
e: Exp
s: Stmt
i: Ide
n: Numeral

Prog ::= s*
Exp  ::= n | i | e + e | e - e | e * e | e / e
      |  e ** e | - e | i e* | c ? e1 : e2
Cond ::= true | false | ~ c | c && c | c || c
      |  e == e | e != e | e < e | e <= e
      |  e > e | e >= e
Stmt ::= let i e | i = e | while c s* | print e
      |  fun i i* e
```

## Denotational Semantics

```
type File = Num*
type Memory = Ide -> Num  (in JS, a Map; in Python a dict)
type State = Memory x File

P: Prog -> File
E: Exp -> Memory -> Num
S: Stmt -> State -> State
C: Cond -> Memory -> Bool

P [[s*]] = S*[[s*]]({}, [])

S [[let i e]] (m,o) = (m[E [[e]] m / i], o)
S [[fun i i* e]] (m,o) = (m[(i*,e) / i], o)
S [[i = e]] (m,o) = (m[E [[e]] m / i], o)
S [[print e]] (m,o) = (m, o + E [[e]] m)
S [[while c do s*]] (m,o) = if C [[c]] m = F then (m,o) else (S [[while c do s*]]) (S* [[s*]] (m,o))

E [[n]] m = n
E [[i]] m = m i
E [[e1 + e2]] m = E [[e1]] m + E [[e2]] m
E [[e1 - e2]] m = E [[e1]] m - E [[e2]] m
E [[e1 * e2]] m = E [[e1]] m * E [[e2]] m
E [[e1 / e2]] m = E [[e1]] m / E [[e2]] m
E [[e1 % e2]] m = E [[e1]] m % E [[e2]] m
E [[e1 ** e2]] m = E [[e1]] m ** E [[e2]] m
E [[- e]] m = - E [[e]] m
E [[i e*]] m = let (i*, e) = E [[i] m in E [[e]] m [e* / i*]
E [[c ? e1 : e2]] m = if C [[c]] m = T then E [[e1]] m else E [[e2]] m

C [[true]] m = T
C [[false]] m = F
C [[e1 == e2]] m = E [[e1]] m = E [[e2]] m
C [[e1 != e2]] m = not (E [[e1]] m = E [[e2]] m)
C [[e1 < e2]] m = E [[e1]] m < E [[e2]] m
C [[e1 <= e2]] m = E [[e1]] m <= E [[e2]] m
C [[e1 > e2]] m = E [[e1]] m > E [[e2]] m
C [[e1 >= e2]] m = E [[e1]] m >= E [[e2]] m
C [[~c]] m = not (C [[c]] m)
C [[c1 && c2]] m = if C [[c1]] m then C [[c2]] m else F
C [[c1 || c2]] m = if C [[c1]] m then T else C [[c2]] m
```

## Using the Interpreter

This interpreter for Bella is currently quite simple it only takes AST nodes into the `interpret` function. For example, for the following program:

```bella
let x = 3;
while x < 4 {
  print x;
  x = x + 1;
}
```

would translate into the following AST nodes in the interpreter:

```javascript
console.log(
  interpret(
    program([
      vardec('x', 3),
      whileLoop(less('x', 5), [print('x'), assign('x', plus('x', 1))]),
    ])
  )
)
```

[bella.js](src/bella.js) currently exports the following functions to import and use within other .js files:

```javascript
// interprets AST nodes
function interpret(program) {
  return P(program)
}

// AST nodes
const program = (s) => new Program(s)
const vardec = (i, e) => new VariableDeclaration(i, e)
const print = (e) => new PrintStatement(e)
const whileLoop = (c, b) => new WhileStatement(c, b)
const funcdec = (n, p, b) => new FunctionDeclaration(n, p, b)
const conditional = (c, f, s) => new Conditional(c, f, s)
const assign = (t, s) => new Assignment(t, s)
const call = (n, a) => new Call(n, a)
const plus = (x, y) => new Binary('+', x, y)
const minus = (x, y) => new Binary('-', x, y)
const times = (x, y) => new Binary('*', x, y)
const remainder = (x, y) => new Binary('%', x, y)
const power = (x, y) => new Binary('**', x, y)
const eq = (x, y) => new Binary('==', x, y)
const noteq = (x, y) => new Binary('!=', x, y)
const less = (x, y) => new Binary('<', x, y)
const lesseq = (x, y) => new Binary('<=', x, y)
const greater = (x, y) => new Binary('>', x, y)
const greatereq = (x, y) => new Binary('>=', x, y)
const and = (x, y) => new Binary('&&', x, y)
const or = (x, y) => new Binary('||', x, y)
```

Some examples use of the interpreter (more examples/tests in [bella.js](src/bella.js)):

```javascript
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
```
