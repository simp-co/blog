---
createDate: 2026-09-14
lastUpdateDate: 2026-09-14
---

# 闭包

## 语法

### 定义闭包

可以如下定义一个闭包：

```groovy
{ [closureParameters -> ] statements }
```

其中`[closureParameters -> ]`为可选的以逗号分隔的参数列表。`statements`为0或更多个Groovy语句。

如果指定了参数列表，那么“`->`”是必须的。

下面中都是合法的闭包定义：

```groovy
{ item++ } // 1

{ −> item++ } // 2

{ println it } // 3

{ it -> println it } // 4

{ name -> println name } // 5

{ String x, int y -> // 6
    println "hey ${x} the value is ${y}"
}

{ reader -> // 7
    def line = reader.readLine()
    line.trim()
}
```

- 1该闭包引用了一个名为`item`的变量
- 2可以通过使用箭头（`->`）将闭包地参数和代码明确地分隔开
- 3闭包可以使用一个隐式的参数（`it`）
- 4也可以将`it`声明为一个显式的参数
- 5没有声明类型的参数
- 6声明了类型的参数
- 7闭包可以包含多条语句

### 闭包作为一个对象

一个闭包是一个`groovy.lang.Closure`类的实例。闭包可以像其他变量那样赋值给一个变量或字段：

```groovy
def listener = { e -> println "Clicked on $e.source" } // 1
assert listener instanceof Closure
Closure callback = { println 'Done!' } // 2
Closure<Boolean> isTextFile = {
    File it -> it.name.endsWith('.txt') // 3
}
```

- 1可以将一个闭包赋值给一个变量
- 2如果不使用`def`或者`var`，可以使用`groovy.lang.Closure`作为其类型
- 3可以指定闭包的返回类型

### 调用闭包

闭包可以像其他方法一样被调用。如果定义了一个没有指定参数列表的闭包：

```groovy
def code = { 123 }
```

那么闭包中的代码只有在调用该闭包的时候才会执行。可以像调用普通方法一样调用闭包：

```groovy
assert code() == 123
```

也可以显式调用`call`方法：

```groovy
assert code.call() == 123
```

如果闭包接收参数也一样：

```groovy
def is0dd = { int i -> i%2 != 0 } // 1
assert is0dd(3) == true // 2
assert is0dd.call(2) == false // 3

def isEven = { it%2 == 0 } // 4
assert isEven(3) == false // 5
assert isEven.call(2) == true // 6
```

其中4使用了一个隐式的参数（`it`）。

## 参数

### 普通参数

闭包的参数和普通方法的参数遵循同样的原则：

1. 一个可选的类型
2. 一个名称
3. 一个可选的默认值

```groovy
def closureWithOneArg = { str -> str.toUpperCase() }
assert closureWithOneArg('groovy') == 'GROOVY'

def closureWithOneArgAndExplicitType = { String str -> str.toUpperCase() }
assert closureWith0neArgAndExplicitType('groovy') == 'GROOVY'

def closureWithTwoArgs = { a,b -> a+b }
assert closureWithTwoArgs(1,2) == 3

def closureWithTwoArgsAndExplicitTypes = { int a, int b -> a+b }
assert closureWithTwoArgsAndExplicitTypes(1,2) == 3

def closureWithTwoArgsAndOptionalTypes = { a, int b -> a+b }
assert closureWithTwoArgsAnd0ptionalTypes(1,2) == 3

def closureWithTwoArgAndDefaultValue = { int a, int b=2 -> a+b }
assert closureWithTwoArgAndDefaultValue(1) == 3
```

### 隐式参数

当没有给闭包显式定义参数列表时，闭包会定义一个名为`it`隐式的参数。所以如下代码：

```groovy
def greeting = { "Hello, $it!" }
assert greeting('Patrick') == 'Hello, Patrick!'
```

等价于如下代码：

```groovy
def greeting = { it -> "Hello, $it!" }
assert greeting('Patrick') == 'Hello, Patrick!'
```

如果要声明一个不接收任何参数的闭包，必须在声明闭包时显式指定一个空的参数列表：

```groovy
def magicNumber = { -> 42 }

// this call will fail because the closure doesn't accept any argument
magicNumber(11)
```

### 变长参数

也可以像其他方法一样给闭包声明变长参数。

```groovy
def concat1 = { String... args -> args.join('') }
assert concat1('abc','def') == 'abcdef'
def concat2 = { String[] args -> args.join('') }
assert concat2('abc','def') == 'abcdef'

def multiConcat = { int n, String... args ->
args.join('')*n
}
assert multiConcat(2,'abc','def') == 'abcdefabcdef'
```

## 委派策略

### Groovy闭包VS.lambda表达式

Groovy将闭包定义为`Closure`类的实例。闭包与java 8中的lambda表达式不同。“委派”（delegation）是Groovy闭包中的一个关键的概念。

### Owner、delegate和this

一个闭包实际上定义了3个不同的东西：

1. `this`：相当于定义闭包所在的类
2. `owner`：相当于定义闭包所在的对象，该对象可能是一个类或一个闭包
3. `delegate`：相当于一个可以被指定的对象。当方法调用或者属性访问的接收者没有指定的时候，将使用该对象

#### this的含义

在一个闭包中，调用`getThisObject`方法会返回定义闭包所在的类（注：准确的说应该是类的实例）。该方法的返回值等价于显式使用`this`：

```groovy
class Enclosing {
    void run() {
        def whatIsThis0bject = { getThisObject() } // 1
        assert whatIsThis0bject() == this // 2
        def whatIsThis = { this } // 3
        assert whatIsThis() == this // 4
    }
}
class EnclosedInInnerClass {
    class Inner {
        Closure cl = { this } // 5
    }
    void run() {
        def inner = new Inner()
        assert inner.cl() == inner // 6
    }
}
class Nestedclosures {
    void run() {
        def nestedclosures = {
            def cl = { this } // 7
            cl()
        }
        assert nestedclosures() == this // 8
    }
}
```

- 1定义在`Enclosing`类中的闭包，该闭包返回`getThisObject`
- 2调用该闭包会返回`Enclosing`的实例
- 3通常可以直接使用`this`
- 5定义在一个内部类中的闭包
- 6该闭包中的`this`会返回内部类
- 7在嵌套闭包的情况下，例如`cl`定义在`nestedClosures`中
- 8`this`相当于离该闭包最近的类，而不是定义该闭包所在的闭包

于是可以如下调用定义闭包所在的类中的方法：

```groovy
class Person {
    String name
    int age
    String toString() { "$name is $age years old" }

    String dump() {
        def cl = {
            String msg = this.toString() // 1
            println msg
            msg
        }
        cl()
    }
}
def p = new Person(name:'Janice', age:74)
assert p.dump() == 'Janice is 74 years old'
```

- 1该闭包在`this`上调用`toString`方法，该调用实际上会调用定义闭包所在的类的`toString`方法，即`Person`实例的`toString`方法。

#### 闭包中的owner

`owner`会返回定义闭包所在的对象，该对象可能是一个类也可能是一个闭包：

```groovy
class Enclosing {
    void run() {
        def whatIsOwnerMethod = { getOwner() } // 1
        assert whatIsOwnerMethod() == this // 2
        def whatIsOwner = { owner } // 3
        assert whatIsOwner() == this // 4
    }
}
class EnclosedInInnerClass {
    class Inner {
        Closure cl = { owner } // 5
    }
    void run() {
        def inner = new Inner()
        assert inner.cl() == inner // 6
    }
}
class Nestedclosures {
    void run() {
        def nestedClosures = {
            def cl = { owner } // 7
            cl()
        }
        assert nestedClosures() == nestedClosures // 8
    }
}
```

- 8展示了`owner`相当于定义该闭包所在的闭包

#### 闭包中的delegate

闭包中的`delegate`可以通过`delegate`属性或者调用`getDelegate`方法访问。可以指定`delegate`所表示的对象。默认情况下，`delegate`被设置为`owner`：

```groovy
class Enclosing {
    void run() {
        def cl = { getDelegate() } // 1
        def cl2 = { delegate } // 2
        assert cl() == cl2() // 3
        assert cl() == this // 4
        def enclosed = {
            { -> delegate }.call() // 5
        }
        assert enclosed() == enclosed // 6
    }
}
```

- 1可以通过调用`getDelegate`方法获取一个闭包的`delegate`
- 2也可以使用`delegate`属性
- 4默认情况下`delegate`被设置为`owner`（注：这里应该用`owner`而不是`this`，但是在该情况下`this`和`owner`引用的对象相同，所以可以使用`this`）
- 6在嵌套的闭包的情况下，`delegate`和`owner`引用的对象相同

闭包的`delegate`可以被设置为任何对象。考虑如下类定义：

```groovy
class Person {
    String name
}
class Thing {
    String name
}

def p = new Person(name: 'Norman')
def t = new Thing(name: 'Teapot')
```

然后定义如下闭包：

```groovy
def upperCasedName = { delegate.name.toUpperCase() }
```

可以改变闭包的`delegate`：

```groovy
upperCasedName.delegate = p
assert upperCasedName() == 'NORMAN'
upperCasedName.delegate = t
assert upperCasedName() == 'TEAPOT'
```

#### 委派策略

当在一个闭包中访问属性时，如果没有明确指定接收对象，那么就会涉及到委派策略：

```groovy
class Person {
    String name
}
def p = new Person(name:'Igor')
def cl = { name.toUpperCase() } // 1
cl.delegate = p // 2
assert cl() == 'IGOR' // 3
```

- 1`name`引用的不是闭包的静态作用域中的变量
- 2将该闭包的`delegate`设置为`p`
- 3方法被成功调用

上例中对`name`的访问被自动解析到`delegate`上。在闭包中，不需要显式指定`delegate.`，例如在上例中对`name`的访问不需要写成`delegate.name`，属性和方法调用会根据委派策略进行解析。闭包定义了多个解析策略：

1. `Closure.OWNER_FIRST`：该策略为默认策略。如果一个属性/方法在`owner`中存在，则使用`owner`中的属性/方法。否则，使用`delegate`。
2. `Closure.DELEGATE_FIRST`：优先使用`delegate`，其次使用`owner`。
3. `Closure.OWNER_ONLY`：只使用`owner`解析属性/方法，不考虑`delegate`。
4. `Closure.DELEGATE_ONLY`：只使用`delegate`解析属性/方法，不考虑`owner`。
5. `Closure.TO_SELF`：只会在闭包类本身上进行解析，不会使用`owner`和`delegate`。

下例展示了默认的owner first策略：

```groovy
class Person {
    String name
    def pretty = { "My name is $name" } // 1
    String toString() {
        pretty()
    }
}
class Thing {
    String name // 2
}

def p = new Person(name: 'Sarah')
def t = new Thing(name: 'Teapot')

assert p.toString() == 'My name is Sarah' // 3
p.pretty.delegate = t // 4
assert p.toString() == 'My name is Sarah' // 5
```

- 1定义了一个闭包，该闭包引用了`name`
- 5展示了即便设置了`delegate`，仍然会优先使用`owner`进行解析

可以改变闭包的解析策略：

```groovy
p.pretty.resolveStrategy = Closure.DELEGATE_FIRST
assert p.toString() == 'My name is Teapot'
```

#### 元编程中的委派策略

实际上，在委派策略中，只要一个对象（`owner`/`delegate`）可以处理属性/方法，就会使用该对象处理属性/方法。例如对于`Closure.OWNER_FIRST`策略来说，如果`owner`中存在对应的属性/方法，或者`owner`中有`propertyMissing`/`methodMissing`定义，那么就会使用`owner`处理对属性/方法的访问。例如：

```groovy
class Person {
    String name
    int age
    def fetchAge = { age }
}
class Thing {
    String name
    def propertyMissing(String name) { -1 }
}

def p = new Person(name:'Jessica', age:42)
def t = new Thing(name:'Printer')
def cl = p.fetchAge
cl.resolveStrategy = Closure.DELEGATE_FIRST
cl.delegate = p
assert cl() == 42
cl.delegate = t
assert cl() == -1
```

## GString中的闭包

```groovy
def x = 1
def gs = "x = ${x}"
assert gs == 'x = 1'
```

上图中的代码可以正常运行，但是如果：

```groovy
x = 2
assert gs == 'x = 2'
```

上图中的`assert`断言将会失败。原因为虽然`GString`会对值的`toString`表示惰性求值，但是因为`GString`中的`${x}`语法代表一个`$x`的表达式而不是闭包，因此其会在`GString`被创建时求值。

在上例中，`GString`是使用一个引用`x`的表达式创建的。当该`GString`被创建时，`x`的值是`1`，所以该`GString`使用`1`这个值创建。当执行断言时，会对`GString`进行求值，同时`1`会使用`toString`转换为`String`。当将`x`赋值为`2`时，实际上是使`x`引用一个不同的对象，但是`GString`仍然引用的是之前的对象。

通过使用`${-> x}`这种语法可以在`GString`中使用闭包并且可以对变量进行惰性求值：

```groovy
def x = 1
def gs = "x = ${−> x}"
assert gs == 'x = 1'
x = 2
assert gs == 'x = 2'
```

## 闭包类型强转

闭包可以被转换为`interface`或者single-abstract method类型。

## 函数式编程

### 柯里化

#### 左柯里化

```groovy
def nCopies = { int n, String str -> str*n } // 1
def twice = nCopies.curry(2) // 2
assert twice('bla') == 'blabla' // 3
assert twice('bla') == nCopies(2, 'bla') // 4
```

- 2使用`curry`将第一个参数设置为`2`，并返回一个接收一个`String`参数的新闭包（函数）

#### 右柯里化

```groovy
def nCopies = { int n, String str -> str*n } // 1
def blah = nCopies.rcurry('bla') // 2
assert blah(2) == 'blabla' // 3
assert blah(2) == nCopies(2, 'bla') // 4
```

- 2使用`rcurry`将最后一个参数设置为`bla`，并返回一个接收一个`int`参数的新闭包（函数）

#### 基于index的柯里化

```groovy
def volume = { double l, double w, double h -> l*w*h } // 1
def fixedwidthVolume = volume.ncurry(1, 2d) // 2
assert volume(3d, 2d, 4d) == fixedwidthVolume(3d, 4d) // 3
def fixedWidthAndHeight = volume.ncurry(1, 2d, 4d) // 4
assert volume(3d, 2d, 4d) == fixedWidthAndHeight(3d) // 5
```

- 2使用`ncurry`将第二个参数（index = 1）设置为`2d`，并返回一个接收`length`和`height`参数的新`volume`函数
- 4展示了可以使用`ncurry`设置多个从指定的index开始的参数

### 记忆化（Memoization）

通过使用记忆化可以缓存闭包调用的结果。例如：

```groovy
def fib
fib = { long n −> n<2?n:fib(n-1)+fib(n-2) }
assert fib(15) == 610 // slow!
```

上例中会经常使用相同的参数调用`fib`。例如计算`fib(15)`需要计算`fib(14)`和`fib(13)`的结果，计算`fib(14)`又需要计算`fib(13)`和`fib(12)`的结果，这里`fib(13)`被计算了两次。可以如下缓存闭包调用的结果：

```groovy
fib = { long n −> n<2?n:fib(n-1)+fib(n-2) }.memoize()
assert fib(25) == 75025 // fast!
```

也可以使用其他的方法：

1. `memoizeAtMost`：生成一个最多缓存n个值的新闭包
2. `memoizeAtLeast`：生成一个最少缓存n个值的新闭包
3. `memoizeBetween`：生成一个最少缓存n个值最多缓存m个值的新闭包

所有memoize变体使用的缓存都是LRU（Least Recently Used）缓存。

### 组合

闭包组合相当于函数组合的概念。

```groovy
def plus2 = { it + 2 }
def times3 = { it * 3 }

def times3plus2 = plus2 << times3
assert times3plus2(3) == 11
assert times3plus2(4) == plus2(times3(4))

def plus2times3 = times3 << plus2
assert plus2times3(3) == 15
assert plus2times3(5) == times3(plus2(5))

// reverse composition
assert times3plus2(3) == (times3 >> plus2) (3)
```

### 蹦床（Trampoline）

递归算法通常会受栈的最大高度限制。通过使用闭包的`trampoline`可以解决这个问题。

通过使用`trampoline`可以将闭包包装到一个`TrampolineClosure`中。在调用时，使用`trampoline`的闭包会调用原始闭包，如果结果也为一个`TrampolineClosure`的实例，那么该闭包会被再次调用。这个过程会一直重复到返回值不为一个使用`trampoline`的闭包为止。该返回值会作为`trampoline`的最终结果。例如：

```groovy
def factorial
factorial = { int n, def accu = 1G ->
    if (n < 2) return accu
    factorial.trampoline(n - 1, n * accu)
}
factorial = factorial.trampoline()

assert factorial(1) == 1
assert factorial(3) == 1 * 2 * 3
assert factorial(1000) // == 402387260.. plus another 2560 digits
```

### 方法指针（Method pointers）

可以通过方法指针从一个方法获取一个闭包。
