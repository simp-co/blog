---
createDate: 2026-09-14
lastUpdateDate: 2026-09-14
---

# Groovy-与Java的区别

## 默认导入

以下为Groovy默认导入的包和类：

- `java.io.*`
- `java.lang.*`
- `java.math.BigDecimal`
- `java.math.BigInteger`
- `java.net.*`
- `java.util.*`
- `groovy.lang.*`
- `groovy.util.*`

## 多方法（Multi-methods）

Groovy会在运行时选择要调用的方法，所以方法是根据运行时的参数类型被选择的。在java中，方法是在编译时根据声明类型被选择的。例如如下代码：

```java
int method(String arg) {
    return 1;
}
int method(Object arg) {
    return 2;
}
Object o = "Object";
int result = method(o);
```

在java中：

```java
assertEquals(2, result);
```

在Groovy中：

```groovy
assertEquals(1, result);
```

## 数组初始化

在java中，数组可以通过如下方式进行初始化：

```java
int[] array = {1, 2, 3}; // Java array initializer shorthand syntax
int[] array2 = new int[] {4, 5, 6}; // Java array initializer long syntax
```

在Groovy中，`{...}`被闭包使用了。所以不能使用这种方式创建数组字面量。可以使用如下方式初始化数组：

```groovy
int[] array = [1, 2, 3]
```

对于Groovy 3+，也可以使用java初始化数组的其中一种方式，如下：

```groovy
def array2 = new int[] {1, 2, 3} // Groovy 3.0+ supports the Java-style array initialization long syntax
```

## 包可见性

在Groovy中，如果如下省略字段的修饰符不会像java一样使其具有package-private的可见性：

```groovy
class Person {
    String name
}
```

上图中的代码在Groovy中会创建一个属性（property），即一个`private`字段，外加对应的getter和setter。

如果要在Groovy中创建一个package-private字段，可以使用`@PackageScope`：

```groovy
class Person {
    @PackageScope String name
}
```

## ARM块

Java 7引入了ARM（Automatic Resource Management）块（也叫try-with-resource），如下：

```java
Path file = Paths.get("/path/to/file");
Charset charset = Charset.forName("UTF-8");
try (BufferedReader reader = Files.newBufferedReader(file, charset)) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }

} catch (IOException e) {
    e.printStackTrace();
}
```

在Groovy 3+中支持这种代码块。但是Groovy中还提供了如下方式：

```groovy
new File('/path/to/file').eachLine('UTF-8') {
    println it
}
```

或者：

```groovy
new File('/path/to/file').withReader('UTF-8') { reader ->
    reader.eachLine {
        println it
    }
}
```

## 内部类

Groovy中匿名内部类和嵌套类的实现跟java很像，但是有一些区别。比如在这些类中访问的局部变量不需要是`final`的。

### 静态内部类

例如：

```groovy
class A {
    static class B {}
}

new A.B()
```

### 匿名内部类

```groovy
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

CountDownLatch called = new CountDownLatch(1)

Timer timer = new Timer()
timer.schedule(new TimerTask() {
    void run() {
        called.countDown()
    }
}, 0)

assert called.await(10, TimeUnit.SECONDS)
```

### 创建非静态内部类的实例

在java中可以如下创建非静态内部类的实例：

```java
public class Y {
    public class X {}
    public X foo() {
        return new X();
    }
    public static X createX(Y y) {
        return y.new X();
    }
}
```

但是在Groovy 3.0.0之前不支持`y.new X()`这种语法，而是需要使用`new X(y)`，如下：

```groovy
public class Y {
    public class X {}
    public X foo() {
        return new X()
    }
    public static X createX(Y y) {
        return new X(y)
    }
}
```

注意：Groovy支持在不提供实参的情况下调用接收一个参数的方法。在这种情况下，该参数为`null`。基本上同样的规则也适用于构造器。一个危险是可能会写成`new X()`而不是`new X(this)`。

Groovy 3.0.0也支持使用java风格的语法创建非静态内部类的实例。

## Lambda表达式和方法引用运算符

Java 8+支持lambda表达式和方法引用运算符（`::`）：

```java
Runnable run = () -> System.out.println("Run"); // Java
list.forEach(System.out::println);
```

Groovy 3+的Parrot解析器中也支持这些。但是在更早期的Groovy版本中需要使用闭包：

```groovy
Runnable run = { println 'run' }
list.each { println it } // or list.each(this.&println)
```

## GStrings

需要注意双引号字符串字面量在Groovy中可能会被解释为`GString`。

## 字符串和字符字面量

在Groovy中，单引号被用来表示`String`，双引号被用来表示`String`或者`GString`。

```groovy
assert 'c'.class == String
assert "c".class == String
assert "c${1}".class in GString
```

只有当将一个单字符的`String`赋值给一个`char`类型的变量时Groovy才会自动将其转换为`char`类型。当调用接收`char`类型参数的方法时，需要显式进行类型转换或者确保参数已经进行了类型转换：

```groovy
char a = 'a'
assert Character.digit(a, 16) == 10: 'But Groovy does boxing'
assert Character.digit((char) 'a', 16) == 10

try {
    assert Character.digit('a', 16) == 10
    assert false: 'Need explicit cast'
} catch(MissingMethodException e) {
}
```

Groovy支持两种类型转换的风格。当将一个多字符的字符串转换为`char`时，这两种风格会有一些区别。Groovy风格的类型转换会取字符串的第一个字符，但是C风格的类型转换会失败并抛出一个异常：

```groovy
// for single char strings, both are the same
assert ((char) "c").class == Character
assert ("c" as char).class == Character

// for multi char strings they are not
try {
    ((char) 'cx') == 'c'
    assert false: 'will fail - not castable'
} catch(GroovyCastException e) {
}
assert ('cx' as char) == 'c'
assert 'cx'.asType(char) == 'c'
```

## ==的行为

在java中，`==`表示基本类型的相等性或者非基本类型的同一性。在Groovy中，对于`Comparable`的非基本类型，`==`会被翻译为`a.compareTo(b)==0`，对于其他非基本类型，`==`会被翻译为`a.equals(b)`。

如果要检查同一性，需要使用`is`方法：`a.is(b)`。自Groovy 3，也可以使用`===`运算符（或者其否定形式）：`a===b`（或者`a!==b`）。

## 基本类型和包装类

在Groovy中，任何基本类型的变量或者字段都可以当作对象对待，并且会在需要的时候自动包装。例如下例中的代码在java中是不能通过编译的：

```java
public class Main { // Java

    public float z1 = 0.0f;

    public static void main(String[] args){
        new Main().z1.equals(1.0f); // DoESN'T COMPILE, error: float cannot be dereferenced
    }
}
```

但是如下代码在Groovy中是可以运行的：

```groovy
class Main {
    float z1 = 0.0f
}
assert !(new Main().z1.equals(1.0f))
```

在java中，扩展是优先于装箱的。但是在Groovy中不同：

```groovy
int i
m(i)

void m(long l) { // 1
    println "in m(long)"
}

void m(Integer i) { // 2
    println "in m(Integer)"
}
```

- 1为在java中会被调用的方法
- 2为在Groovy中会被调用的方法

### 通过@CompileStatic优化数值基本类型

当使用`@CompileStatic`时，只涉及到基本类型的表达式会使用和java相同的字节码。原文如下：

> **11.1. Numeric Primitive Optimisation with `@CompileStatic`**
>
> Since Groovy converts to wrapper classes in more places, you might wonder whether it produces less efficient bytecode for numeric expressions. Groovy has a highly optimised set of classes for doing math computations. When using `@CompileStatic`, expressions involving only primitives uses the same bytecode that Java would use.

### 正/负0

在java中，对于基本类型，正`0`和负`0`相等：

```text
jshell> float f1 = 0.0f
f1 ==> 0.0

jshell> float f2 = -0.0f
f2 ==> -0.0

jshell> f1 == f2
$3 ==> true
```

对于包装类型，通过调用`equals`方法对正`0`和负`0`进行比较，返回的结果为`false`：

```text
jshell> Float f1 = 0.0f
f1 ==> 0.0

jshell> Float f2 = -0.0f
f2 ==> -0.0

jshell> f1.equals(f2)
$3 ==> false
```

由于Groovy相比于java会在更多的地方自动装箱和拆箱，为了避免混淆，建议遵循如下准则：

1. 如果希望区分正`0`和负`0`，那么应该直接使用`equals`方法或者在使用`==`之前将所有的基本类型都转换为其包装类型。
2. 如果希望不区分正`0`和负`0`，那么应该直接使用`equalsIgnoreZeroSign`方法或者在使用`==`之前将所有的非基本类型转换为基本类型。

如下：

```groovy
float f1 = 0.0f
float f2 = -0.0f
Float f3 = 0.0f
Float f4 = -0.0f

assert f1 == f2
assert (Float) f1 != (Float) f2

assert f3 != f4 // 1
assert (float) f3 == (float) f4

assert !f1.equals(f2)
assert !f3.equals(f4)

assert f1.equalsIgnoreZeroSign(f2)
assert f3.equalsIgnoreZeroSign(f4)
```

- 其中1是因为对于非基本类型，`==`会被映射为`.equals()`。

## 转换

Java可以进行自动提升和窄化转换：

| from \ to | boolean | byte | short | char | int | long | float | double |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **boolean** | - | N | N | N | N | N | N | N |
| **byte** | N | - | Y | C | Y | Y | Y | Y |
| **short** | N | C | - | C | Y | Y | Y | Y |
| **char** | N | C | C | - | Y | Y | Y | Y |
| **int** | N | C | C | C | - | Y | T | Y |
| **long** | N | C | C | C | C | - | T | T |
| **float** | N | C | C | C | C | C | - | Y |
| **double** | N | C | C | C | C | C | C | - |

- Y表示java可以进行自动转换
- C表示当显式转换时java可以进行转换
- T表示java可以进行自动转换但是数据会被裁剪（损失精度）
- N表示java不能进行转换

Groovy对其进行了扩展：

| from \ to | boolean | Boolean | byte | Byte | short | Short | char | Character | int | Integer | long | Long | BigInteger | float | Float | double | Double | BigDecimal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **boolean** | - | B | N | N | N | N | N | N | N | N | N | N | N | N | N | N | N | N |
| **Boolean** | B | - | N | N | N | N | N | N | N | N | N | N | N | N | N | N | N | N |
| **byte** | T | T | - | B | Y | Y | Y | D | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **Byte** | T | T | B | - | Y | Y | Y | D | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **short** | T | T | D | D | - | B | Y | D | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **Short** | T | T | D | T | B | - | Y | D | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| **char** | T | T | Y | D | Y | D | - | D | Y | D | Y | D | D | Y | D | Y | D | D |
| **Character** | T | T | D | D | D | D | D | - | D | D | D | D | D | D | D | D | D | D |
| **int** | T | T | D | D | D | D | Y | D | - | B | Y | Y | Y | Y | Y | Y | Y | Y |
| **Integer** | T | T | D | D | D | D | Y | D | B | - | Y | Y | Y | Y | Y | Y | Y | Y |
| **long** | T | T | D | D | D | D | Y | D | D | D | - | B | Y | T | T | T | T | Y |
| **Long** | T | T | D | D | D | T | Y | D | D | T | B | - | Y | T | T | T | T | Y |
| **BigInteger** | T | T | D | D | D | D | D | D | D | D | D | D | - | D | D | D | D | T |
| **float** | T | T | D | D | D | D | T | D | D | D | D | D | D | - | B | Y | Y | Y |
| **Float** | T | T | D | T | D | T | T | D | D | T | D | T | D | B | - | Y | Y | Y |
| **double** | T | T | D | D | D | D | T | D | D | D | D | D | D | D | D | - | B | Y |
| **Double** | T | T | D | T | D | T | T | D | D | T | D | T | D | D | T | B | - | Y |
| **BigDecimal** | T | T | D | D | D | D | D | D | D | D | D | D | D | T | D | T | D | - |

- Y表示Groovy可以进行自动转换
- D表示当动态编译或者使用显式转换时Groovy可以进行转换
- T表示Groovy可以进行转换但是数据会被裁剪（损失精度）
- B表示装箱/拆箱操作
- N表示Groovy无法进行转换

对转换的其他规则原文描述如下：

> The truncation uses Groovy Truth when converting to `boolean`/`Boolean`. Converting from a number to a character casts the `Number.intvalue()` to `char`. Groovy constructs `BigInteger` and `BigDecimal` using `Number.doubleValue()` when converting from a `Float` or `Double`, otherwise it constructs using `tostring()`. Other conversions have their behavior defined by `java.lang.Number`.

## 关键字

Groovy有很多和java相同的关键字。Groovy 3及以上也有java中的`var`。

除此之外，Groovy还有以下关键字：

- `as`
- `def`
- `in`
- `trait`
- `it` // within closures

Groovy没有java那么严格，例如在Groovy中允许这么写：

`var var = [def: 1, as: 2, in: 3, trait: 4]`
