---
createDate: 2026-09-12
lastUpdateDate: 2026-09-12
---

# 操作符

## 算数运算符

### `/` {#division-operator}

groovy中没有提供整除的操作符。`/`操作符的返回值为`double`或者`BigDecimal`。如果要进行整除运算，需要使用`intdiv()`函数。

### `**` {#power-operator}

使用`**`进行幂运算。

## 算数赋值运算符

### `**=` {#power-assignment-operator}

进行幂运算并赋值。

## 关系运算符

### `===`（自Groovy 3.0.0）

与调用`is()`方法相同。

### `!==`（自Groovy 3.0.0）

`===`的否定。

```groovy
import groovy.transform.EqualsAndHashCode

@EqualsAndHashCode
class Creature { String type }

def cat = new Creature(type: 'cat')
def copyCat = cat
def lion = new Creature(type: 'cat')

assert cat.equals(lion) // Java logical equality
assert cat == lion // Groovy shorthand operator

assert cat.is(copyCat) // Groovy identity
assert cat === copyCat // operator shorthand
assert cat !== lion // negated operator shorthand
```

## 条件运算符

### 猫王运算符（Elvis operator）

猫王运算符（`?:`）为三目运算符的一种简写，例如：

```groovy
displayName = user.name ? user.name : 'Anonymous' // 1
displayName = user.name ?: 'Anonymous' // 2
```

其中2使用了猫王运算符，其在`user.name`为真（或者等价为真）时的值为`user.name`，否则为`'Anonymous'`。

### 猫王赋值运算符（自Groovy 3.0.0）

猫王赋值运算符（`?=`）可以进一步简写猫王运算符，例如：

```groovy
import groovy.transform.ToString

@ToString(includePackage = false)
class Element {
  String name
  int atomicNumber
}

def he = new Element(name: 'Helium')
he.with {
  name = name ?: 'Hydrogen' // existing Elvis operator
  atomicNumber ?= 2 // new Elvis assignment shorthand
}
assert he.toString() == 'Element(Helium, 2)'
```

## 对象操作符

### 安全导航符（Safe navigation operator）

安全导航符用来避免`NullPointerException`异常，例如：

```groovy
def person = Person.find { it.id == 123 } // 1
def name = person?.name // 2
assert name == null // 3
```

其中2使用了安全导航符，其将在`person`为`null`的时候为`null`，而不是抛出一个异常。

### 直接属性访问运算符（Direct field access operator）

一般在groovy中，如果编写了如下代码：

```groovy
class User {
  public final String name // 1
  User(String name) { this.name = name}
  String getName() { "Name: $name" } // 2
}
def user = new User('Bob')
assert user.name == 'Name: Bob' // 3
```

其中3中的`user.name`实际上调用了`name`的getter方法。如果想要直接访问`name`字段，可以使用直接属性访问运算符（`.@`），如下：

```groovy
assert user.@name == 'Bob'
```

### 方法指针运算符（Method pointer operator）

方法指针运算符（`.&`）可以引用一个方法，例如：

```groovy
def str = 'example of method reference' // 1
def fun = str.&toUpperCase // 2
def upper = fun() // 3
assert upper == str.toUpperCase() // 4
```

这个方法指针的类型为`groovy.lang.Closure`。另外，方法指针是通过方法名称绑定的，在运行时才解析参数，因此如果有多个同名方法，会在运行时才确定具体使用的方法：

```groovy
def doSomething(String str) { str.toUpperCase() }
def doSomething(Integer x) { 2*x }
def reference = this.&doSomething
assert reference('foo') == 'F00'
assert reference(123) == 246
```

在Groovy 3及以上，可以使用new获得构造器方法引用：

```groovy
def foo = BigInteger.&new
def fortyTwo = foo('42')
assert fortyTwo == 42G
```

在Groovy 3及以上，可以通过类获取实例方法，并在调用该方法时通过将实例作为一个额外的参数传入该方法以指定该方法要在哪个实例上调用：

```groovy
def instanceMethod = String.&toUpperCase
assert instanceMethod('foo') == 'F00'
```

### 方法引用操作符（Method reference operator）

Groovy 3+ 的Parrot parser支持方法引用操作符（`::`）。该操作符可以在需要函数接口的时候引用方法。在动态Groovy中，方法引用操作符和方法指针运算符一样。在静态Groovy中，方法引用操作符生成的字节码类似于java在相同情况下生成的字节码。

```groovy
import groovy.transform.CompileStatic
import static java.util.stream.Collectors.toList

@CompileStatic
void methodRefs() {
  assert 6G == [1G, 2G, 3G].stream().reduce(0G, BigInteger::add)
  assert [4G, 5G, 6G] == [1G, 2G, 3G].stream().map(3G::add).collect(toList())
  assert [1G, 2G, 3G] == [1L, 2L, 3L].stream().map(BigInteger::value0f).collect(toList())
  assert [1G, 2G, 3G] == [1L, 2L, 3L].stream().map(3G::value0f).collect(toList())
}

methodRefs()
```

```groovy
@CompileStatic
void constructorRefs() {
  assert [1, 2, 3] == ['1', '2', '3'].stream().map(Integer::value0f).collect(toList())
  def result = [1, 2, 3].stream().toArray(Integer[]::new)
  assert result instanceof Integer[]
  assert result.toString() == '[1, 2, 3]'
}

constructorRefs()
```

## 正则表达式操作符

### 模式操作符（Pattern operator）

模式操作符（`~`）提供了一个简单的方法创建`java.util.regex.Pattern`实例：

```groovy
def p = ~/foo/
assert p instanceof Pattern
```

虽然模式操作符一般和斜杠字符串（`/.../`）一起用，但实际上模式操作符可以和Groovy中任何种类的字符串一起用：

```groovy
p = ~ ' foo'
p = ~"foo"
p = ∼$/dollar/slashy $ string/$
p = ~"${pattern}"
```

### 查找操作符（Find operator）

除了创建一个pattern，也可以直接通过使用查找操作符（`=~`）创建一个`java.util.regex.Matcher`实例：

```groovy
def text = "some text to match"
def m = text =~ /match/ // 1
assert m instanceof Matcher // 2
if (!m) { // 3
  throw new RuntimeException("Oops, text not found!")
}
```

其中3等价于`if (!m.find(0))`。

### 匹配操作符（Match operator）

匹配操作符（`==~`）会对输入进行严格匹配并返回一个布尔值：

```groovy
m = text ==~ /match/
assert m instanceof Boolean
if (m) {
  throw new RuntimeException("Should not reach that point!")
}
```

## 其他操作符

### 展开运算符（Spread operator）

展开-点运算符（`*.`）通常简称为展开运算符，其可以用来对一个聚合对象（如列表等）中的所有元素执行一个操作。其等价于对每个元素执行一个操作，并将结果收集为一个列表：

```groovy
class Car {
  String make
  String model
}
def cars = [
  new Car(make: 'Peugeot', model: '508'),
  new Car(make: 'Renault', model: 'Clio')]
def makes = cars*.make
assert makes == ['Peugeot','Renault']
```

`cars*.make`等价于`cars.collect{ it.make }`。

当所访问的属性不是一个聚合对象的属性时，groovy会自动将其展开。例如上例可以简写为`cars.make`，因为`make`不是`cars`的属性，所以groovy会自动将其展开，但是通常建议仍然明确使用展开-点操作符（`*.`）。

展开操作符是“null安全”（null-safe）的，所以如果一个聚合对象中的某个元素为`null`，其会返回`null`而不是抛出`NullPointerException`：

```groovy
cars = [
  new Car(make: 'Peugeot', model: '508'),
  null,
  new Car(make: 'Renault', model: 'Clio')]
assert cars*.make == ['Peugeot', null, 'Renault']
assert null*.make == null
```

展开运算符可以用于任何实现了`Iterable`接口的类：

```groovy
class Component {
  Integer id
  String name
}
class CompositeObject implements Iterable<Component> {
  def components = [
    new Component(id: 1, name: 'Foo'),
    new Component(id: 2, name: 'Bar')]

  @0verride
  Iterator<Component> iterator() {
    components.iterator()
  }
}
def composite = new CompositeObject()
assert composite*.id == [1,2]
assert composite*.name == ['Foo','Bar']
```

对于嵌套的聚合对象，可以使用多个展开-点运算符，如下例中使用的`cars*.models*.name`：

```groovy
class Make {
  String name
  List<Model> models
}

@Canonical
class Model {
  String name
}

def cars = [
  new Make(name: 'Peugeot', models: [new Model('408'), new Model('508')]),
  new Make(name: 'Renault', models: [new Model('Clio'), new Model('Captur')])
]

def makes = cars*.name
assert makes == ['Peugeot', 'Renault']

def models = cars*.models*.name
assert models == [['408', '508'], ['Clio', 'Captur']]
assert models.sum() == ['408', '508', 'Clio', 'Captur'] // flatten one level
assert models.flatten() == ['408', '508', 'Clio', 'Captur'] // flatten all levels (one in this case)
```

对于嵌套collection，可以考虑使用`collectNested`（DGM（Default Groovy Methods）方法）而不是使用展开-点运算符：

```groovy
class Car {
  String make
  String model
}
def cars = [
  [
    new Car(make: 'Peugeot', model: '408'),
    new Car(make: 'Peugeot', model: '508')
  ], [
    new Car(make: 'Renault', model: 'Clio'),
    new Car(make: 'Renault', model: 'Captur')
  ]
]
def models = cars.collectNested{ it.model }
assert models == [['408', '508'], ['Clio', 'Captur']]
```

注：DGM方法：

> DGM，也就是DefaultGroovyMethods，是利用Groovy的元编程能力注入到普通类中的方法。
> 
> ——https://blog.csdn.net/hiarcs/article/details/6418225

#### 展开方法参数

可以将列表展开作为方法的参数，例如有如下方法签名：

```groovy
int function(int x, int y, int z) {
  x*y+z
}
```

且有如下list：

```groovy
def args = [4,5,6]
```

可以直接如下调用方法：

```groovy
assert function(*args) == 26
```

也可以混合使用普通的参数和展开的参数：

```groovy
args = [4]
assert function(*args,5,6) == 26
```

#### 展开列表元素

可以在列表字面量中使用展开运算符：

```groovy
def items = [4,5]
def list = [1,2,3,*items,6]
assert list == [1,2,3,4,5,6]
```

#### 展开map元素

可以在map字面量中使用展开运算符：

```groovy
def m1 = [c:3, d:4] // 1
def map = [a:1, b:2, *:m1] // 2
assert map == [a:1, b:2, c:3, d:4] // 3
```

其中2使用`*:m1`将`m1`中的内容展开到`map`中。

展开map操作符所在的位置是有影响的，如：

```groovy
def m1 = [c:3, d:4]
def map = [a:1, b:2, *:m1, d: 8]
assert map == [a:1, b:2, c:3, d:8]
```

即便在`m1`中定义的`d`的值为`4`，但是在`map`中`d`被重定义为`8`。

### 范围操作符（Range operator）

可以使用范围操作符（`..`）创建对象的范围：

```groovy
def range = 0..5 // 1
assert (0..5).collect() == [0, 1, 2, 3, 4, 5] // 2
assert (0..<5).collect() == [0, 1, 2, 3, 4] // 3
assert (0<..5).collect() == [1, 2, 3, 4, 5] // 4
assert (0<..<5).collect() == [1, 2, 3, 4] // 5
assert (0..5) instanceof List // 6
assert (0..5).size() == 6 // 7
```

1. 创建了一个简单的整数范围，并储存在了一个变量中
2. 一个`IntRange`，包含边界
3. 一个`IntRange`，不包含上界
4. 一个`IntRange`，不包含下界
5. 一个`IntRange`，不包含边界
6. `groovy.lang.Range`实现了`List`接口

`Range`的实现是轻量的，只有上下界信息被储存。可以创建任何有`next()`（确定其下一个元素）和`previous()`（确定其上一个元素）方法的`Comparable`对象的范围。例如：

```groovy
assert ('a'..'d').collect() == ['a', 'b', 'c', 'd']
```

### 太空船运算符/三路比较运算符（Spaceship operator）

太空船运算符（`<=>`）委托`compareTo`方法：

```groovy
assert (1 <=> 1) == 0
assert (1 <=> 2) == -1
assert (2 <=> 1) == 1
assert ('a' <=> 'z') == -1
```

### 下标运算符（Subscript operator）

下标运算符（`[]`）是`getAt()`或者`putAt()`方法的简写。

```groovy
def list = [0,1,2,3,4]
assert list[2] == 2 // 1
list[2] = 4 // 2
assert list[0..2] == [0,1,4] // 3
list[0..2] = [6,6,6] // 4
assert list == [6,6,6,3,4] // 5
```

1. 也可以使用`getAt(2)`而不是`[2]`
2. 如果在一个赋值表达式的左侧，则调用`putAt`
3. `getAt`也支持`Range`
4. `putAt`也支持`Range`

也可以自定义`getAt`和`putAt`方法：

```groovy
class User {
  Long id
  String name
  def getAt(int i) {
    switch (i) {
      case 0: return id
      case 1: return name
    }
    throw new IllegalArgumentException("No such element $i")
  }
  void putAt(int i, def value) {
    switch (i) {
      case 0: id = value; return
      case 1: name = value; return
    }
    throw new IllegalArgumentException("No such element $i")
  }
}
def user = new User(id: 1, name: 'Alex')
assert user[0] == 1
assert user[1] == 'Alex'
user[1] = 'Bob'
assert user.name == 'Bob'
```

### 安全索引运算符（Safe index operator，自Groovy 3.0.0）

安全索引运算符（`?[]`）类似于`?.`：

```groovy
String[] array = ['a', 'b']
assert 'b' == array?[1] // get using normal array index
array?[1] = 'c' // set using normal array index
assert 'c' == array?[1]

array = null
assert null == array?[1] // return null for all index values
array?[1] = 'c' // quietly ignore attempt to set value
assert null == array?[1]

def personInfo = [name: 'Daniel.Sun', location: 'Shanghai']
assert 'Daniel.Sun' == personInfo?['name'] // get using normal map index
personInfo?['name'] = 'sunlan' // set using normal map index
assert 'sunlan' == personInfo?['name']

personInfo = null
assert null == personInfo?['name'] // return null for all map values
personInfo?['name'] = 'sunlan' // quietly ignore attempt to set value
assert null == personInfo?['name']
```

### 成员运算符（Membership operator）

成员运算符（`in`）等价于调用`isCase`方法。在`List`的情况下，其等价于调用`contains`方法。如下：

```groovy
def list = ['Grace','Rob','Emmy']
assert ('Emmy' in list) // 1
assert ('Alex' !in list) // 2
```

1. 等价于调用`list.contains('Emmy')`或`list.isCase('Emmy')`
2. 等价于调用`!list.contains('Alex')`或`!list.isCase('Alex')`

### 恒等运算符（Identity operator，自Groovy 3.0.0）

在groovy中，使用`==`判断相等调用的是`equals`方法。如果要判断引用是否相等，应该使用`is`方法或者恒等运算符（`===`），如下：

```groovy
def list1 = ['Groovy 1.8','Groovy 2.0','Groovy 2.3'] // 1
def list2 = ['Groovy 1.8','Groovy 2.0','Groovy 2.3'] // 2
assert list1 == list2 // 3
assert !list1.is(list2) // 4
assert list1 !== list2 // 5
```

1. 略
2. 略
3. 等价于list1.equals(list2)
4. 使用is()方法

### 强制运算符（Coercion operator）

强制运算符（`as`）是类型转换的一个变体。强制运算符可以将一个对象的类型转换为另一个类型而不考虑类型在赋值时是否兼容。例如：

```groovy
String input = '42'
Integer num = (Integer) input
```

`String`无法赋值为`Integer`，因此上例在运行时会产生`ClassCastException`异常。

但是可以使用强制运算符将其强转为`Integer`：

```groovy
String input = '42'
Integer num = input as Integer
```

当强转对象时，除非目标类型和源类型相同，否则将返回一个新对象。强转规则根据源类型和目标类型的不同而不同。如果找不到强转规则，强转会失败。可以通过`asType`方法自定义强转规则：

```groovy
class Identifiable {
  String name
}
class User {
  Long id
  String name
  def asType(Class target) {
    if (target == Identifiable) {
      return new Identifiable(name: name)
    }
    throw new ClassCastException("User cannot be coerced into $target")
  }
}
def u = new User(name: 'Xavier')
def p = u as Identifiable
assert p instanceof Identifiable
assert !(p instanceof User)
```

### 钻石操作符（Diamond operator）

Groovy中的钻石操作符（`<>`）是为了支持与java的兼容性。在动态groovy中，该运算符没用。在静态类型检查的groovy中，该运算符也是可选的，因为不管用不用该运算符，groovy都会进行类型推断。

### 调用运算符（Call operator）

调用运算符（`()`）用来隐式调用一个叫做”`call`”的方法。对于任何定义了”`call`”方法的对象，都可以使用调用运算符而不是显式调用”`call`”方法：

```groovy
class MyCallable {
  int call(int x) {
    2*x
  }
}

def mc = new MyCallable()
assert mc.call(2) == 4
assert mc(2) == 4
```

注意`MyCallable`并不需要实现`java.util.concurrent.Callable`方法。

## 运算符优先级

| Level | Operator(s) | Name(s) |
| --- | --- | --- |
| 1 | `new` `()` | object creation, explicit parentheses |
| | `()` `{}` `[]` | method call, closure, literal list/map |
| | `.` `.&` `.@` | member access, method closure, field/attribute access |
| | `?.` `*` `*.` `*:` | safe dereferencing, spread, spread-dot, spread-map |
| | `~` `!` `(type)` | bitwise negate/pattern, not, typecast |
| | `[]` `?[]` `++` `--` | list/map/array (safe) index, post inc/decrement |
| 2 | `**` | power |
| 3 | `++` `--` `-` | pre inc/decrement, unary plus, unary minus |
| 4 | `*` `/` `%` | multiply, div, remainder |
| 5 | `+` `-` | addition, subtraction |
| 6 | `<<` `>>` `>>>` `..` `..<` `<..<` `<..` | left/right (unsigned) shift, inclusive/exclusive ranges |
| 7 | `<` `<=` `>` `>=` `in` `!in` `instanceof` `!instanceof` `as` | less/greater than/or equal, in, not in, instanceof, not instanceof, type coercion |
| 8 | `==` `!=` `<=>` `===` `!==` | equals, not equals, compare to, identical to, not identical to |
| | `=~` `==~` | regex find, regex match |
| 9 | `&` | binary/bitwise and |
| 10 | `^` | binary/bitwise xor |
| 11 | `\|` | binary/bitwise or |
| 12 | `&&` | logical and |
| 13 | `\|\|` | logical or |
| 14 | `? :` | ternary conditional |
| | `?:` | elvis operator |
| 15 | `=` `**=` `*=` `/=` `%=` `+=` `-=` `<<=` `>>=` `>>>=` `&=` `^=` `\|=` `?=` | various assignments |

## 运算符重载

Groovy中可以通过实现以下方法重载运算符，需要注意实现的方法需要为`public`的：

| Operator | Method | Operator | Method |
| --- | --- | --- | --- |
| `+` | `a.plus(b)` | `a[b]` | `a.getAt(b)` |
| `-` | `a.minus(b)` | `a[b] = c` | `a.putAt(b, c)` |
| `*` | `a.multiply(b)` | `a in b` | `b.isCase(a)` |
| `/` | `a.div(b)` | `<<` | `a.leftShift(b)` |
| `%` | `a.mod(b)` | `>>` | `a.rightShift(b)` |
| `**` | `a.power(b)` | `>>>` | `a.rightShiftUnsigned(b)` |
| `\|` | `a.or(b)` | `++` | `a.next()` |
| `&` | `a.and(b)` | `--` | `a.previous()` |
| `^` | `a.xor(b)` | `+a` | `a.positive()` |
| `as` | `a.asType(b)` | `-a` | `a.negative()` |
| `a()` | `a.call()` | `~a` | `a.bitwiseNegate()` |
