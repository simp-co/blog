---
createDate: 2026-09-14
lastUpdateDate: 2026-09-14
---

# Groovy-语义

## 语句

### 变量赋值

#### 多赋值

可以同时给多个变量赋值：

```groovy
def (a, b, c) = [10, 20, 'foo']
assert a == 10 && b == 20 && c == 'foo'
```

也可以指定变量的类型：

```groovy
def (int i, String j) = [10, 'foo']
assert i == 10 && j == 'foo'
```

也可以在已经声明的变量上应用：

```groovy
def nums = [1, 3, 5]
def a, b, c
(a, b, c) = nums
assert a == 1 && b == 3 && c == 5
```

该语法对数组、列表、返回值为数组或者列表的方法都可用：

```groovy
def (_, month, year) = "18th June 2009".split()
assert "In $month of $year" == 'In June of 2009'
```

#### 上溢和下溢

如果左侧有过多的变量，多出的变量会被赋值为`null`：

```groovy
def (a, b, c) = [1, 2]
assert a == 1 && b == 2 && c == null
```

如果右侧有过多的变量，多出的变量会被忽略：

```groovy
def (a, b) = [1, 2, 3]
assert a == 1 && b == 2
```

#### 通过多赋值解构对象

```groovy
@Immutable
class Coordinates {
    double latitude
    double longitude

    double getAt(int idx) {
        if (idx == 0) latitude
        else if (idx == 1) longitude
        else throw new Exception("Wrong coordinate index, use 0 or 1")
    }
}
```

上图中的`Coordinates`类定义重写了`getAt`方法，即重载了下标运算符，于是可以通过如下方法解构对象：

```groovy
def coordinates = new Coordinates(latitude: 43.23, longitude: 3.67)

def (la, lo) = coordinates

assert la == 43.23
assert lo == 3.67
```

### 控制结构

#### 条件结构

Groovy的switch/case语句除了向后兼容java外，还可以处理任何类型的switch值和不同类型的匹配：

```groovy
def x = 1.23
def result = ""

switch (x) {
    case "foo" :
        result = "found foo"
        // lets fall through
    
    case "bar" :
        result += "bar"

    case [4, 5, 6, 'inList']:
        result = "list"
        break

    case 12..30:
        result = "range"
        break

    case Integer:
        result = "integer"
        break

    case Number:
        result = "number"
        break

    case ~/fo*/: // toString() representation of x matches the pattern?
        result = "foo regex"
        break

    case { it < 0 }: // or { x < 0 }
        result = "negative"
        break

    default:
        result = "default"
}

assert result == "number"
```

Groovy中的`switch`支持如下比较：

1. Class case：如果switch值为该类的实例则匹配
2. 正则表达式case：如果switch值的`toString`表示匹配该正则表达式则匹配
3. Collection case：如果该collection包含switch值则匹配。也包括range
4. Closure case：如果调用该闭包返回真值则匹配
5. 如果不是以上情况则在case值和switch值相等（equals）的时候匹配

当使用closure case值时，默认的`it`参数实际上是switch值。

Groovy也支持switch表达式。

#### 循环结构

Groovy支持在`for`循环中使用多赋值语句。

```groovy
// multi-assignment goes loopy
def baNums = []
for (def (String u, int v) = ['bar', 42]; v < 45; u++, v++) {
    baNums << "$u $v"
}
assert baNums == ['bar 42', 'bas 43', 'bat 44']
```

Groovy也支持`for in`循环。

```groovy
// iterate over a range
def x = 0
for ( i in 0..9 ) {
    x += i
}
assert x == 45

// iterate over a list
x = 0
for ( i in [0, 1, 2, 3, 4] ) {
    x += i
}
assert x == 10

// iterate over an array
def array = (0..4).toArray()
x = 0
for ( i in array ) {
    x += i
}
assert x == 10

// iterate over a map
def map = ['abc':1, 'def':2, 'xyz':3]
x = 0
for ( e in map ) {
    x += e.value
}
assert x == 6

// iterate over values in a map
x = 0
for ( v in map.values() ) {
    x += v
}
assert x == 6

// iterate over the characters in a string
def text = "abc"
def list = []
for (c in text) {
    list.add(c)
}
assert list == ["a", "b", "c"]
```

### Power assertion

不管是否设置了`-ea`，Groovy中的assertion总是会执行。“power asserts”的概念直接关系到Groovy中assert的行为。

一个power assertion分为3部分：

```text
assert [left expression] == [right expression] : (optional message)
```

如果断言为真，那么无事发生。如果断言为假，那么会提供一个被断言的表达式中的每个子表达式的值的一种可视的表示。例如：

```groovy
assert 1+1 == 3
```

会产生：

```text
Caught: Assertion failed:

assert 1+1 == 3
        |  |
        2  false
```

当表达式更复杂时：

```groovy
def x = 2
def y = 7
def z = 5
def calc = { a,b −> a*b+1 }
assert calc(x,y) == [x,z].sum()
```

会产生：

```text
assert calc(x,y) == [x,z].sum()
       |    | |  |   | |  |
       15   2 7  |   2 5  7
                 false
```

如果不想要如上的错误消息，也可以通过设置optional message部分自定义错误消息：

```groovy
def x = 2
def y = 7
def z = 5
def calc = { a,b −> a*b+1 }
assert calc(x,y) == z*z : 'Incorrect computation result'
```

会产生：

```text
Incorrect computation result. Expression: (calc.call(x, y) == (z * z)). Values: z = 5, z = 5
```

## 提升和强转

### 数值类型提升

略。详细信息可以参考官方文档。

### 闭包的类型强转

#### 将闭包赋值到SAM类型上

SAM类型为只定义了一个抽象方法的类型，包括函数式接口：

```groovy
interface Predicate<T> {
    boolean accept(T obj)
}
```

以及只定义了一个抽象方法的抽象类：

```groovy
abstract class Greeter {
    abstract String getName()
    void greet() {
        println "Hello, $name"
    }
}
```

任何闭包都可以使用`as`操作符转换为SAM类型：

```groovy
Predicate filter = { it.contains 'G' } as Predicate
assert filter.accept('Groovy') == true

Greeter greeter = { 'Groovy' } as Greeter
greeter.greet()
```

自Groovy 2.2.0，`as Type`部分可以省略：

```groovy
Predicate filter = { it.contains 'G' }
assert filter.accept('Groovy') == true

Greeter greeter = { 'Groovy' }
greeter.greet()
```

也可以使用方法指针：

```groovy
boolean doFilter(String s) { s.contains('G') }

Predicate filter = this.&doFilter
assert filter.accept('Groovy') == true

Greeter greeter = GroovySystem.&getVersion
greeter.greet()
```

#### 使用闭包调用接收SAM类型的方法

考虑如下方法：

```groovy
public <T> List<T> filter(List<T> source, Predicate<T> predicate) {
    source.findAll { predicate.accept(it) }
}
```

可以如下调用该方法：

```groovy
assert filter(['Java','Groovy'], { it.contains 'G'} as Predicate) == ['Groovy']
```

自Groovy 2.2.0，可以省略显式的强转并如下调用该方法：

```groovy
assert filter(['Java','Groovy']) { it.contains 'G'} == ['Groovy']
```

#### 闭包到任意类型的强转

考虑如下接口：

```groovy
interface FooBar {
    int foo()
    void bar()
}
```

可以使用`as`关键字将闭包强转为该接口：

```groovy
def impl = { println 'ok'; 123 } as FooBar
```

上例产生的类的所有方法都使用该闭包实现：

```groovy
assert impl.foo() == 123
impl.bar()
```

也可以如下将闭包强转为任何类：

```groovy
class FooBar {
    int foo() { 1 }
    void bar() { println 'bar' }
}

def impl = { println 'ok'; 123 } as FooBar

assert impl.foo() == 123
impl.bar()
```

### Map的类型强转

Groovy允许将Map强转为一个接口或者一个类。在这种情况下，map的key会被解释为方法名称，value为方法的实现。例如：

```groovy
def map
map = [
    i: 10,
    hasNext: { map.i > 0 },
    next: { map.i-- },
]
def iter = map as Iterator
```

可以只实现那些实际会被调用的方法。如果调用了`map`中不存在的方法，则会抛出`MissingMethodException`或者`UnsupportedOperationException`异常。例如：

```groovy
interface X {
    void f( )
    void g(int n)
    void h(String s, int n)
}

x = [ f: {println "f called"} ] as X
x.f() // method exists
x.g() // MissingMethodException here
x.g(5) // Unsupported0perationException here
```

### String到enum的强转

Groovy允许`String`或者`GString`到枚举值的强转。例如有如下枚举定义：

```groovy
enum State {
    up,
    down
}
```

那么可以将一个`string`赋值给一个`enum`并且不需要使用显式的`as`强转：

```groovy
State st = 'up'
assert st == State.up
```

也可以使用`GString`：

```groovy
def val = "up"
State st = "${val}"
assert st == State.up
```

也可以在`switch`语句中使用隐式的类型转换：

```groovy
State switchState(State st) {
    switch (st) {
        case 'up' :
            return State.down // explicit constant
        case 'down' :
            return 'up' // implicit coercion for return types
    }
}
```

但是如果使用`String`调用接收`enum`的方法，仍然需要使用显式的`as`强转：

```groovy
assert switchState('up' as State) == State.down
assert switchState(State.down) == State.up
```

### 自定义类型强转

通过实现`asType`方法可以自定义类型转换。自定义的类型转换通过使用`as`操作符调用，并且不能隐式地进行类型转换。例如有如下两个类定义：

```groovy
class Polar {
    double r
    double phi
}
class Cartesian {
    double x
    double y
}
```

并在`Polar`类中定义`asType`方法：

```groovy
def asType(Class target) {
    if (Cartesian==target) {
        return new Cartesian(x: r*cos(phi), y: r*sin(phi))
    }
}
```

此时可以使用`as`操作符：

```groovy
def sigma = 1E-16
def polar = new Polar(r:1.0,phi:PI/2)
def cartesian = polar as Cartesian
assert abs(cartesian.x-sigma) < sigma
```

也可以在`Polar`类之外定义`asType`方法。例如使用`metaclass`：

```groovy
Polar.metaClass.asType = { Class target ->
    if (Cartesian==target) {
        return new Cartesian(x: r*cos(phi), y: r*sin(phi))
    }
}
```

## 可选

### 可选的括号

如果一个方法有至少一个参数，那么在没有歧义的情况下可以省略括号调用：

```groovy
println 'Hello World'
def maximum = Math.max 5, 10
```

### 可选的分号

在Groovy中，如果一行中只有一个语句，那么行尾的分号可以省略。所以如下行：

```groovy
assert true;
```

可以写为：

```groovy
assert true
```

一行中的多条语句需要使用分号分隔：

```groovy
boolean a = true; assert a
```

### 可选的return关键字

在Groovy中，在方法体或者闭包体中的最后求值的表达式会被返回。所以`return`关键字是可选的。

```groovy
int add(int a, int b) {
    return a+b
}
assert add(1, 2) == 3
```

可以写作：

```groovy
int add(int a, int b) {
    a+b
}
assert add(1, 2) == 3
```

### 可选的public关键字

默认情况下，Groovy中的类和方法都是`public`的。所以如下类：

```groovy
public class Server {
    public String toString() { "a server" }
}
```

等价于如下类：

```groovy
class Server {
    String toString() { "a server" }
}
```

## Groovy真值

Groovy通过如下规则决定一个表达式为真还是假。

### 布尔表达式

如果对应的布尔值为真则为真。

```groovy
assert true
assert !false
```

### Collection和数组

非空`Collection`和数组为真。

```groovy
assert [1, 2, 3]
assert ![]
```

### Matchers

如果Matcher有至少一个匹配则为真。

```groovy
assert ('a' =~ /a/)
assert !('a' =~ /b/)
```

### 迭代器和Enumeration

如果迭代器和Enumeration还有元素则为真。

```groovy
assert [0].iterator()
assert ![].iterator()
Vector v = [0] as Vector
Enumeration enumeration = v.elements()
assert enumeration
enumeration.nextElement()
assert !enumeration
```

### Maps

非空Map为真。

```groovy
assert ['one' : 1]
assert ![:]
```

### 字符串

非空`String`、`GString`和`CharSequence`为真。

```groovy
assert 'a'
assert !''
def nonEmpty = 'a'
assert "$nonEmpty"
def empty = ''
assert !"$empty"
```

### 数值

非`0`数值为真。

```groovy
assert 1
assert 3.5
assert !0
```

### 对象引用

非`null`对象引用为真。

```groovy
assert new Object()
assert !null
```

### 通过asBoolean()方法自定义真值

通过实现`asBoolean()`方法可以自定义将对象转换为真或者假的行为。

```groovy
class Color {
    String name

    boolean asBoolean() {
        name == 'green' ? true : false
    }
}
```

Groovy会通过调用该方法将该对象转为布尔值。

```groovy
assert new Color(name: 'green')
assert !new Color(name: 'red')
```
