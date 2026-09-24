---
createDate: 2026-09-12
lastUpdateDate: 2026-09-12
---
# Groovy-数据类型

## 字符串

groovy有两种字符串类型，一种是`java.lang.String`，一种是`groovy.lang.GString`。`GString`类似于一种模板字符串，`GString`中可以包含一些表达式（`${...}`），并在转换为`String`时对这些表达式进行求值和替换。

同时groovy有六种字符串字面量表示法：

1. 单引号：解释为普通的`java.lang.String`；
2. 双引号：如果字符串中包含替换表达式，则为`GString`类型，否则为`String`类型；
3. 三单引号：类似于单引号，但是可以换行；
4. 三双引号：类似于双引号，但是可以换行；
5. 斜杠（`/.../`）：类似于原始字符串，字符串中的内容不会被转义（除了斜杠本身需要用反斜杠转义），同时支持替换表达式，而且可以换行；
6. 美元符号斜杠（`$/.../$`）：类似于斜杠，但是转义字符换为了`$`而不是反斜杠`\`。

如果一个方法需要`java.lang.String`类型，但是传入的是`groovy.lang.GString`类型的时候，`GString`的`toString()`方法会自动被调用。

当替换表达式`${...}`中有`->`时，如`${-> expr}`或者`${w -> expr}`，这个替换表达式实际上为一个闭包表达式。这个嵌入的闭包表达式只能接收0个或1个参数，否则会在运行时产生异常。当这个嵌入的闭包表达式接收1个参数时，该参数为`java.io.StringWriter`类型，并且可以使用`<<`操作符追加内容，如`"1 + 2 = ${w -> w << 3}"`为`'1 + 2 = 3'`。（注：应该类似于C++中的cout）

当替换表达式为闭包表达式时，其行为会有一些区别，具体体现为闭包表达式会表现出类似于惰性求值的行为。如：

```groovy
def number = 1
def eagerGString = "value == ${number}"
def lazyGString = "value == ${ -> number }"

assert eagerGString == "value == 1"
assert lazyGString == "value == 1"

number = 2
assert eagerGString == "value == 1"
assert lazyGString == "value == 2"
```

小结：

| String name | String syntax | Interpolated | Multiline | Escape character |
| --- | --- | --- | --- | --- |
| Single-quoted | `'-'` | | | `\` |
| Triple-single-quoted | `'''-'''` | | ✔ | `\` |
| Double-quoted | `"-"` | ✔ | | `\` |
| Triple-double-quoted | `"""-"""` | ✔ | ✔ | `\` |
| Slashy | `/.../` | ✔ | ✔ | `\` |
| Dollar slashy | `$/.../$` | ✔ | ✔ | `$` |

## 字符

groovy没有明确的字符字面量，但是可以将字符串明确转换为一个实质上的字符：

```groovy
char c1 = 'A'
assert c1 instanceof Character

def c2 = 'B' as char
assert c2 instanceof Character

def c3 = (char)'C'
assert c3 instanceof Character
```

## 数值

### 整型

- `byte`
- `char`
- `short`
- `int`
- `long`
- `java.math.BigInteger`

### 浮点型

- `float`
- `double`
- `java.math.BigDecimal`

### 后缀

| Type | Suffix |
| --- | --- |
| BigInteger | `G` or `g` |
| Long | `L` or `l` |
| Integer | `I` or `i` |
| BigDecimal | `G` or `g` |
| Double | `D` or `d` |
| Float | `F` or `f` |

## 列表

groovy使用如下方式定义列表，其类型为`java.util.List`。列表默认使用的实现为`java.util.ArrayList`，也可以指定别的实现。

```groovy
def numbers = [1, 2, 3]

assert numbers instanceof List
assert numbers.size() == 3
```

可以通过以下方式指定列表的具体实现：

```groovy
def arrayList = [1, 2, 3]
assert arrayList instanceof java.util.ArrayList

def linkedList = [2, 3, 4] as LinkedList
assert linkedList instanceof java.util.LinkedList

LinkedList otherLinked = [3, 4, 5]
assert otherLinked instanceof java.util.LinkedList
```

通过使用`[]`访问列表中的元素。`[]`中除了可以指定一个正数，也可以指定负数，也可以指定范围等。`<<`操作符可以用来向列表中追加元素。

```groovy
def letters = ['a', 'b', 'c', 'd']

assert letters[0] == 'a'
assert letters[1] == 'b'

assert letters[-1] == 'd'
assert letters[-2] == 'c'

letters[2] = 'C'
assert letters[2] == 'C'

letters << 'e'
assert letters[ 4] == 'e'
assert letters[-1] == 'e'

assert letters[1, 3] == ['b', 'd']
assert letters[2..4] == ['C', 'd', 'e']
```

## 数组

groovy重用了列表字面量作为数组的字面量。但是要创建一个数组需要明确指定数组的类型。

```groovy
String[] arrStr = ['Ananas', 'Banana', 'Kiwi']

assert arrStr instanceof String[]
assert !(arrStr instanceof List)

def numArr = [1, 2, 3] as int[]

assert numArr instanceof int[]
assert numArr.size() == 3
```

创建多维数组：

```groovy
def matrix3 = new Integer[3][3]
assert matrix3.size() == 3

Integer[][] matrix2
matrix2 = [[1, 2], [3, 4]]
assert matrix2 instanceof Integer[][]
```

访问数组元素的方式与列表相同：

```groovy
String[] names = ['Cédric', 'Guillaume', 'Jochen', 'Paul']
assert names[0] == 'Cédric'

names[2] = 'Blackdrag'
assert names[2] == 'Blackdrag'
```

Groovy 3及以上的版本支持java风格的一种数组初始化方式：

```groovy
def primes = new int[] {2, 3, 5, 7, 11}
assert primes.size() == 5 && primes.sum() == 28
assert primes.class.name == '[I'

def pets = new String[] {'cat', 'dog'}
assert pets.size() == 2 && pets.sum() == 'catdog'
assert pets.class.name == '[Ljava.lang.String;'

// traditional Groovy alternative still supported
String[] groovyBooks = [ 'Groovy in Action', 'Making Java Groovy' ]
assert groovyBooks.every{ it.contains('Groovy') }
```

## Map

groovy通过如下方式定义Map：

```groovy
def colors = [red: '#FF0000', green: '#00FF00', blue: '#0000FF']

assert colors['red'] == '#FF0000'
assert colors.green == '#00FF00'

colors['pink'] = '#FF00FF'
colors.yellow = '#FFFF00'

assert colors.pink == '#FF00FF'
assert colors['yellow'] == '#FFFF00'

assert colors instanceof java.util.LinkedHashMap
```

当使用名称作为key的时候，实际上定义的是string类型的key。

groovy创建的map实际上是`java.util.LinkedHashMap`的实例。

如果试图访问Map中不存在的key将得到`null`。

```groovy
assert colors.unknown == null

def emptyMap = [:]
assert emptyMap.anyKey == null
```

也可以使用数字作为key：

```groovy
def numbers = [1: 'one', 2: 'two']

assert numbers[1] == 'one'
```

注意：如果直接使用一个变量的名称作为key，该名称仍然会被解释为字符

```groovy
def key = 'name'
def person = [key: 'Guillaume']

assert !person.containsKey('name')
assert person.containsKey('key')
```

在上例中，`person`中没有`"name"`这个key，但是有`"key"`这个key。

也可以给key加上引号，如`["name": "Guillaume"]`。当指定的key不是一个合法的标识符时，必须给key加引号，如`["street-name": "Main street"]`，在这个例子中，因为`"street-name"`中有`"-"`，所以其不是一个合法的标识符，因此必须加上引号。

如果要用一个变量作为key，需要给作为key的变量加上括号：

```groovy
person = [(key): 'Guillaume']

assert person.containsKey('name')
assert !person.containsKey('key')
```

在这个例子中，map将`(key)`作为变量看待，而不是作为字符串看待。
