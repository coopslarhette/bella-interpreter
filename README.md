# Bella Semantics and Interpreter

Bella is a simple programming language designed in a Programming Language Semantics class.

## Example

```
let x = 3;
while x < 10 {
  print x;
  x = x + 2;
}
```

This program outputs 3 5 7 9

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

S [[let i e]] (m,o) = ______________
S [[fun i i* e]] (m,o) = ______________
S [[i = e]] (m,o) = ______________
S [[print e]] (m,o) = (m, o + E [[e]] m)
S [[while c do s*]] (m,o) = ______________

E [[n]] m = n
E [[i]] m = m i
E [[e1 + e2]] m = E [[e1]] m + E [[e2]] m
E [[e1 - e2]] m = E [[e1]] m - E [[e2]] m
E [[e1 * e2]] m = E [[e1]] m * E [[e2]] m
E [[e1 / e2]] m = E [[e1]] m / E [[e2]] m
E [[e1 % e2]] m = E [[e1]] m % E [[e2]] m
E [[e1 ** e2]] m = E [[e1]] m ** E [[e2]] m
E [[- e]] m = - E [[e]] m
E [[i e*]] m = ______________
E [[c ? e1 : e2]] m = ______________

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
