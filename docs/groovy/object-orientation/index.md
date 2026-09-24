---
createDate: 2026-09-14
lastUpdateDate: 2026-09-14
---

# Groovy-面向对象

## 基本类型

Groovy也会自动包装基本类型。在groovy中，大多数情况下，可以直接将基本类型当作其对应的包装类看待。例如，可以对基本类型调用`toString()`方法。

```groovy
class Foo {
    static int i
}

assert Foo.class.getDeclaredField('i').type == int.class // 1
assert Foo.i.class != int.class && Foo.i.class == Integer.class // 2
```

- 1在字节码中使用的是int基本类型。
- 2在运行时该基本类型被自动包装

在一个基本类型引用上使用算数运算符时，groovy不会将其拆箱再重新装箱，而是会直接将运算符编译成其对应的方法。另外，groovy会在调用一个接收基本类型参数的java方法时对变量自动拆箱，并将java基本类型方法的返回值自动装箱。

## 类

与java的不同点：

1. 没有可见性修饰符的类或方法默认为`public`。
2. 没有可见性修饰符的字段（Fields）会自动转换为属性（Properties）。这样可以减少冗余代码，因为不需要显式的getter和setter方法。
3. 类名不需要与源文件名一样。
4. 如果一个文件中包含了不在类中的代码，这个文件会被看作一个script。Script是一个类名与其源文件名相同的类，所以不能在script中包含其他类名与其源文件名相同的类定义。

### 接口

groovy可以通过使用`as`关键字将一个没有显式声明实现某接口的类强转为该接口的对象：

```groovy
interface Greeter {
    protected void greet(String name)
}
```

```groovy
greeter = new DefaultGreeter()
coerced = greeter as Greeter
assert coerced instanceof Greeter
```

上例中实际上有两个对象。一个为没有实现接口的原始对象，另一个为`Greeter`接口的对象。

groovy中的接口不支持默认实现（default implementation）。

## 类成员

### 构造器

groovy支持两种构造器的调用方式：

1. 位置参数：类似于java。
2. 命名参数：允许在调用构造器时明确参数名。

#### 位置参数

通常一旦至少声明了一个构造器，那么这个类就只能通过调用其中一个构造器实例化。

groovy有三种使用声明的构造器的方法：

```groovy
class PersonConstructor {
    String name
    Integer age

    PersonConstructor(name, age) { // 1
        this.name = name
        this.age = age
    }
}

def person1 = new PersonConstructor('Marie', 1) // 2
def person2 = ['Marie', 2] as PersonConstructor // 3
PersonConstructor person3 = ['Marie', 3] // 4
```

其中2使用了`new`关键字。3和4将`List`强转为需要的类型。

#### 命名参数

如果没有声明构造器，或者声明了一个无参数构造器，则可以通过map的形式传递参数创建对象。通过声明一个使用一个`Map`类型作为第一个参数的构造器也可以实现该机制：

```groovy
class PersonwoConstructor { // 1
    String name
    Integer age
}

def person4 = new PersonwoConstructor() // 2
def person5 = new PersonwoConstructor(name: 'Marie') // 3
def person6 = new PersonwoConstructor(age: 1) // 4
def person7 = new PersonwoConstructor(name: 'Marie', age: 2) // 5
```

注意：

- 虽然上例中通过不声明构造器的方法实现该机制，但是也可以通过明确定义一个无参数构造器或者一个使用一个`Map`类型作为第一个参数的构造器实现该机制。
- 当没有声明构造器或者声明一个无参数构造器时，上例中通过命名参数创建对象的过程实际上是Groovy将命名构造器的调用替换为了先调用无参数构造器，然后再对每个命名参数调用对应的的setter方法实现的。
- 当第一个参数是`Map`时，Groovy会将所有的命名参数放到一个`Map`中，并将这个`Map`作为第一个参数传递给构造器。这个方法也可以在字段为`final`时使用，因为在这种情况下，这些字段会在构造器中进行设置，而不是在之后调用一系列的setter方法。

### 方法

#### 方法定义

可以通过明确指定方法的返回类型或者使用`def`关键字定义方法。可以不明确声明方法参数的类型。可以正常使用Java的修饰符，如果没有使用可见性修饰符，那么方法的可见性为`public`。

Groovy中的方法永远有返回值。如果没有使用`return`语句，最后一行的值会被返回。例如，下例中的方法都没有使用`return`语句：

```groovy
def someMethod() { 'method called' }
String anotherMethod() { 'another method called' }
def thirdMethod(param1) { "$param1 passed" }
static String fourthMethod(String param1) { "$param1 passed" }
```

#### 命名参数

普通方法也可以通过命名参数调用。如果一个方法的第一个参数为`Map`，则可以使用命名参数。在方法体中，可以通过这个`Map`获取参数值。如果一个方法只有一个`Map`参数，所有实参必须被命名：

```groovy
def foo(Map args) { "${args.name}: ${args.age}" }
foo(name: 'Marie', age: 1)
```

##### 混合使用命名参数和位置参数

可以通过将`Map`作为方法的第一个参数，并在其后使用其他参数混合使用命名参数和位置参数。在调用时必须按顺序给出方法的位置参数。命名参数可以在任何位置。命名参数会被放在一个`Map`中并自动作为方法的第一个参数传递。

```groovy
def foo(Map args, Integer number) { "${args.name}: ${args.age}, and the number is ${number}" }
foo(name: 'Marie', age: 1, 23)
foo(23, name: 'Marie', age: 1)
```

如果`Map`不是第一个参数，那么就不能使用命名参数，而要用一个`Map`作为该参数的实参。

#### 默认参数

默认参数使对应的参数变为可选的。如果没有提供对应的实参，方法将使用默认值。

```groovy
def foo(String par1, Integer par2 = 1) { [name: par1, age: par2] }
assert foo('Marie').age == 1
```

可选参数会从右侧开始舍弃：

```groovy
def baz(a = 'a', int b, c = 'c', boolean d, e = 'e') { "$a $b $c $d $e" }

assert baz(42, true) == 'a 42 c true e'
assert baz('A', 42, true) == 'A 42 c true e'
assert baz('A', 42, 'C', true) == 'A 42 C true e'
assert baz('A', 42, 'C', true, 'E') == 'A 42 C true E'
```

#### 变长参数

除了通过如下方法声明变长参数：

```groovy
def foo(0bject... args) { args.length }
assert foo() == 0
assert foo(1) == 1
assert foo(1, 2) == 2
```

Groovy还支持将一个数组类型作为最后一个参数实现变长参数：

```groovy
def foo(0bject[] args) { args.length }
assert foo() == 0
assert foo(1) == 1
assert foo(1, 2) == 2
```

如果在调用一个变长参数的方法时使用`null`作为变长参数，那么变长参数将为`null`而不是一个只有一个`null`元素且长度为1的数组：

```groovy
def foo(0bject... args) { args }
assert foo(null) == null
```

如果在调用一个变长参数的方法时使用一个数组作为变长参数，那么变长参数将为这个数组而不是一个有一个数组作为元素且长度为1的数组：

```groovy
def foo(0bject... args) { args }
Integer[] ints = [1, 2]
assert foo(ints)_== [1, 2]
```

如果一个变长参数的方法被重载了，那么Groovy会选择最具体的方法：

```groovy
def foo(0bject... args) { 1 }
def foo(0bject x) { 2 }
assert foo() == 1
assert foo(1) == 2
assert foo(1, 2) == 1
```

#### 方法选择算法

动态Groovy支持多分派（multiple dispatch）。当调用一个方法时，具体调用的方法是由运行时的方法参数类型动态确定的。首先会考虑方法的名称和参数的数量，然后会考虑每个参数的类型。例如如下方法定义：

```groovy
def method(0bject o1, Object o2) { 'o/o' }
def method(Integer i, String s) { 'i/s' }
def method(String s, Integer i) { 's/i' }
```

可能预期中当如下使用`String`和`Integer`参数调用方法时，会调用上例中的第三个方法：

```groovy
assert method('foo', 42) == 's/i'
```

有趣的是当在编译时类型是未知的时候。可能实参被声明为`Object`类型。如果实参被声明为`Object`类型，java可能会选择`method(Object, Object)`方法（除非使用了类型转换）。但是从下例中可以看到，Groovy使用运行时的类型选择调用的方法，并且把定义的三个方法全都调用了一遍：

```groovy
List<List<0bject>> pairs = [['foo', 1], [2, 'bar'], [3, 4]]
assert pairs.collect { a, b -> method(a, b) } == ['s/i', 'i/s', 'o/o']
```

对于第三个方法调用，没有`method(Integer, Integer)`的方法，但是`method(Object, Object)`方法仍然可以使用。

方法选择也关于从所有合法的方法中选择一个最合适的方法。所以，虽然`method(Object, Object)`对于前两个调用也是合法的，但是不是最匹配的。为了确定最合适的方法，在运行时有一个从形参类型到实参类型的距离的概念，并且试图将所有参数的总距离最小化。

下面展示了一些会影响距离计算的因素：

##### 直接实现的接口比间接实现的接口更匹配

> Given these interface and method definitions:
>
> ```groovy
> interface I1 {}
> interface I2 extends I1 {}
> interface I3 {}
> class Clazz implements I3, I2 {}
>
> def method(I1 i1) { 'I1' }
> def method(I3 i3) { 'I3' }
> ```
>
> The directly implemented interface will match:
>
> ```groovy
> assert method(new Clazz()) == 'I3'
> ```

##### 一个Object数组比一个Object对象更匹配

> ```groovy
> def method(Object[] arg) { 'array' }
> def method(Object arg) { 'object' }
> assert method([] as Object[]) == 'array'
> ```

##### 非变长参数比变长参数更匹配

> ```groovy
> def method(String s, Object... vargs) { 'vararg' }
> def method(String s) { 'non-vararg' }
> assert method('foo') == 'non-vararg'
> ```

##### 两个变长参数方法中，使用变长参数最小的方法更匹配

> ```groovy
> def method(String s, Object... vargs) { 'two vargs' }
> def method(String s, Integer i, Object... vargs) { 'one varg' }
>
> assert method('foo', 35, new Date()) == 'one varg'
> ```

##### 接口比继承的类更匹配

> ```groovy
> interface I {}
> class Base {}
> class Child extends Base implements I {}
>
> def method(Base b) { 'superclass' }
> def method(I i) { 'interface' }
>
> assert method(new Child()) == 'interface'
> ```

##### 对于基本数据类型的实参，相同的形参类型或稍微比较大的形参类型更匹配

> ```groovy
> def method(Long l) { 'Long' }
> def method(Short s) { 'Short' }
> def method(BigInteger bi) { 'BigInteger' }
>
> assert method(35) == 'Long'
> ```

如果两个方法有相同的距离，那么将会被视为有歧义并且将引发一个运行时的异常。

```groovy
def method(Date d, Object o) { 'd/o' }
def method(Object o, String s) { 'o/s' }

def ex = shouldFail {
    println method(new Date(), 'baz')
}

assert ex.message.contains('Ambiguous method overloading')
```

可以通过使用类型转换选择方法。

```groovy
assert method(new Date(), (0bject)'baz') == 'd/o'
assert method((Object)new Date(), 'baz') == 'o/s'
```

#### 异常声明

Groovy自动允许像非受检异常似的对待受检异常。不需要声明一个方法可能抛出的受检异常，如下例中的方法可能抛出一个`FileNotFoundException`异常：

```groovy
def badRead() {
    new File('doesNotExist.txt').text
}

shouldFail(FileNotFoundException) {
    badRead()
}
```

在上例中也不需要在调用`badRead()`方法的时候将其放到try/catch块中。

也可以声明代码可能抛出的异常。添加异常不会改变其他Groovy代码如何使用这些代码。这些异常会在字节码中成为方法声明的一部分，所以如果代码可能会被java调用，添加这些异常可能比较有用。下例中显式声明了受检异常：

```groovy
def badRead() throws FileNotFoundException {
    new File('doesNotExist.txt').text
}

shouldFail(FileNotFoundException) {
    badRead()
}
```

### 字段（Fields）和属性（Properties）

#### 字段（Fields）

一个字段是一个类、接口、特性（或者翻译为特征，trait）的一个储存数据的成员。在Groovy源文件中定义的字段有：

1. 一个访问修饰符（`public`、`protected`、`private`）（必须）
2. 一个或多个修饰符（`static`、`final`、`synchronized`）（可选）
3. 一个类型（可选）
4. 一个名称（必须）

```groovy
class Data {
    private int id
    protected String description
    public static final boolean DEBUG = false
}
```

可以忽略类型声明，但是通常建议显式声明类型：

```groovy
class BadPractice {
    private mapping
}
class GoodPractice {
    private Map<String,String> mapping
}
```

#### 属性（Properties）

一个属性是一个类的一个外部可见的特征（feature，不知道咋翻译，翻译成“特征”好像跟trait有点冲突）。在java中一个典型的方式是结合一个`private`字段和getter/setter方法表示一个属性（Property），而不是使用一个`public`字段。Groovy也使用这种方式，但是Groovy提供了一个更简单的方法定义属性。可以通过以下定义一个属性：

1. 没有访问修饰符（没有`public`、`protected`、`private`）
2. 一个或多个修饰符（`static`、`final`、`synchronized`）（可选）
3. 一个类型（可选）
4. 一个名称（必须）

Groovy会适当地生成getters/setters。例如：

```groovy
class Person {
    String name // 1
    int age // 2
}
```

- 1创建一个`private String name`字段，以及一个`getName`和`setName`方法
- 2创建一个`private int age`字段，以及一个`getAge`和`setAge`方法

如果使用`final`声明一个属性，则不会生成setter方法：

```groovy
class Person {
    final String name // 1
    final int age // 2
    Person(String name, int age) {
        this.name = name // 3
        this.age = age // 4
    }
}
```

- 1定义一个只读`String`类型属性
- 2定义一个只读`int`类型属性

可以通过名称访问属性。除非在定义该属性的类中，否则getter和setter会自动被调用。

```groovy
class Person {
    String name
    void name(String name) {
        this.name = "Wonder $name" // 1
    }
    String title() {
        this.name // 2
    }
}
def p = new Person()
p.name = 'Diana' // 3
assert p.name == 'Diana' // 4
p.name('Woman') // 5
assert p.title() == 'Wonder Woman' // 6
```

- 1因为`name`这个属性是在定义它的类中访问的，所以`this.name`会直接访问该字段。
- 2直接访问`name`字段。
- 3因为是在`Person`类的外部访问并且是写操作，所以会自动隐式地调用`setName`方法。
- 4因为是在`Person`类的外部访问并且是读操作，所以会自动隐式地调用`getName`方法。
- 5调用`Person`类的`name(String)`方法。
- 6调用`Person`类的`title()`方法。

通过一个实例的properties元字段可以列出一个类的属性：

```groovy
class Person {
    String name
    int age
}
def p = new Person()
assert p.properties.keySet().containsAll(['name','age'])
```

如果有getter/setter方法，即便没有实际的字段，Groovy也可以识别这个属性：

```groovy
class PseudoProperties {
    // a pseudo property "name"
    void setName(String name) {}
    String getName() {}

    // a pseudo read-only property "age"
    int getAge() { 42 }

    // a pseudo write-only property "groovy"
    void setGroovy(boolean groovy) { }
}
def p = new PseudoProperties()
p.name = 'Foo' // 1
assert p.age == 42 // 2
p.groovy = true // 3
```

- 1因为有`name`这个“假属性”，所以可以通过`p.name`进行写操作。
- 2因为有`age`这个“假只读属性”，所以可以通过`p.age`进行读操作。
- 3因为有“`groovy`”这个“假只写属性”，所以可以通过`p.groovy`进行写操作。

##### 属性命名约定

见“3.3.2 Properties”的“property naming conventions”部分。该部分介绍了getter/setter方法名的生成规则。（https://www.groovy-lang.org/objectorientation.html ）

##### 属性的修饰符

属性可以通过省略访问修饰符定义。通常任何其他的修饰符都会直接被复制到生成的字段上，但是有两个例外：

- `final`：除了复制到生成的字段上，还不会生成setter方法。
- `static`：除了复制到生成的字段上，生成的getter/setter方法也是`static`的。

##### 属性上的注解

属性上的注解会被复制到生成的字段上。

##### 将属性和字段分别定义

可以通过定义同名且同类型的属性和字段将属性和字段的定义分开。在这种情况下，只有属性和字段中的其中一个可以有初始值。

使用这种方法时，字段上的注解会保留在字段上，属性上的注解会被复制到getter/setter方法上。

如果当标准的属性定义不满足需求时，可以使用该机制。例如下例中希望将字段声明为`protected`而不是`private`：

```groovy
class HasPropertyWithProtectedField {
    protected String name
    String name
}
```

或者希望将字段的可见性设置为包可见：

```groovy
class HasPropertyWithPackagePrivateField {
    String name
    @PackageScope String name
}
```

或者希望getter/setter是`synchronized`的：

```groovy
class HasPropertyWithSynchronizedAccessorMethods {
    private String name
    @Synchronized String name
}
```

##### 显式定义getter/setter方法

如果类中有显式定义的getter/setter方法，那么就不会自动生成getter/setter方法。通常情况下，被继承的getter/setter不会被考虑，但是如果被继承的getter/setter方法是`final`的，那么也不会自动生成getter/setter方法。

## 注解

> Groovy does not support the java.lang.annotation.ElementType#TYPE PARAMETER and java.lang.annotation.ElementType#TYPE PARAMETER element types which were introduced in Java 8.

### 注解定义

#### 闭包注解参数

在Groovy中可以使用闭包作为一个注解值。例如下例中希望基于JDK版本或者操作系统的限制执行某些方法：

```groovy
class Tasks {
    Set result = []
    void alwaysExecuted() {
        result << 1
    }
    @0nlyIf({ jdk>=6 })
    void supportedOnlyInJDK6() {
        result << 'JDK 6'
    }
    @0nlyIf({ jdk>=7 && windows })
    void requiresJDK7Andwindows() {
        result << 'JDK 7 Windows'
    }
}
```

要让`@OnlyIf`注解接收一个闭包作为参数，只需要将`value`声明为`Class`：

```groovy
@Retention(RetentionPolicy.RUNTIME)
@interface OnlyIf {
    Class value()
}
```

下例展示了如何使用这个注解信息：

```groovy
class Runner {
    static <T> T run(Class<T> taskClass) {
        def tasks = taskClass.newInstance()
        def params = [jdk: 6, windows: false]
        tasks.class.declaredMethods.each { m ->
            if (Modifier.isPublic(m.modifiers) && m.parameterTypes.length == 0) {
                def onlyIf = m.getAnnotation(OnlyIf)
                if (onlyIf) {
                    Closure cl = onlyIf.value().newInstance(tasks,tasks)
                    cl.delegate = params
                    if (cl()) {
                        m.invoke(tasks)
                    }
                } else {
                    m.invoke(tasks)
                }
            }
        }
        tasks
    }
}
```

### 元注解（Meta-annotaions）

#### 声明元注解

Groovy中的元注解和java中的元注解的概念不太一样。Groovy中的元注解会在编译时被替换为其他的注解（可以被替换为一个或多个注解），所以一个元注解是一个或多个注解的别名。元注解可以用来减少代码量。

例如现在想给一个类上放两个注解，`@Service`和`@Transactional`：

```groovy
@Service
@Transactional
class MyTransactionalService {}
```

使用元注解可以将这两个注解简化为一个注解，例如可以如下定义元注解：

```groovy
import groovy.transform.AnnotationCollector

@Service
@Transactional
@AnnotationCollector
@interface TransactionalService {
}
```

如上，元注解的声明和普通的注解一样，只是需要在元注解上加上`@AnnotationCollector`注解以及一系列需要被组合在一起的注解。定义该元注解之后，上面的代码就可以简化为：

```groovy
@TransactionalService
class MyTransactionalService {}
```

#### 元注解的行为

Groovy支持precompiled和source form元注解。（这句话没理解。）

注意：只有Groovy有元注解这个特性。不能在java类上使用元注解并指望它和在Groovy中一样。同样，也不能在Java中写一个元注解。元注解的定义和使用都要是Groovy代码。但是可以将Java的注解和Groovy的注解组合成元注解。

当Groovy编译器遇到一个被元注解注解的类时，它会把元注解替换为其所组合的注解。所以在上面的例子中，Groovy编译器会用`@Service`和`@Transactional`替换`@TransactionalService`。

```groovy
def annotations = MyTransactionalService.annotations*.annotationType()
assert (Service in annotations)
assert (Transactional in annotations)
```

将元注解转换为其所组合的注解的过程是在语义分析（semantic analysis）编译阶段进行的。

#### 元注解参数

元注解可以组合有参数的注解。例如下例中的两个注解都有一个参数：

```groovy
@Timeout(after=3600)
@Dangerous(type='explosive')
```

定义一个元注解`@Explosive`：

```groovy
@Timeout(after=3600)
@Dangerous(type='explosive')
@AnnotationCollector
public @interface Explosive {}
```

在默认情况下，当该元注解被替换时，会使用在定义元注解时所使用的注解参数（例如在上例中`@Timeout`注解的`after`参数是`3600`）。元注解也支持覆盖某个参数值：

```groovy
@Explosive(after=0)
class Bomb {}
```

在上例中，`after`作为`@Explosive`注解的参数覆盖了`@Timeout`注解中定义的参数。

如果两个注解定义了同名参数，默认会将该注解值复制到所有接收这个参数的注解中：

```groovy
@Retention(RetentionPolicy.RUNTIME)
public @interface Foo {
    String value()
}
@Retention(RetentionPolicy.RUNTIME)
public @interface Bar {
    String value()
}

@Foo
@Bar
@AnnotationCollector
public @interface FooBar {}

@Foo('a')
@Bar('b')
class Bob {}

assert Bob.getAnnotation(Foo).value() == 'a'
println Bob.getAnnotation(Bar).value() == 'b'

@FooBar(' a')
class Joe {}
assert Joe.getAnnotation(Foo).value() == 'a'
println Joe.getAnnotation(Bar).value() == 'a'
```

注意：如果元注解组合的注解中定义了类型不兼容的同名参数，那么会导致一个编译错误。例如如果在上例中的`@Foo`注解中定义的`value`参数的类型为`String`但是`@Bar`注解中定义的`value`参数的类型为`int`。

#### 处理重复注解

考虑如下情况，假如一个类上已经有了一个`@ToString`注解，同时一个元注解中也组合了`@ToString`注解，此时如果将该元注解也加到该类上，那么该类就会有重复的`@ToString`注解。`@AnnotationCollector`注解有一个`mode`参数可以用来设置如何处理这种情况。该参数的行为由`AnnotationCollectorMode`枚举值确定。不同枚举值和对应的描述见下表：

| Mode | 描述 |
| --- | --- |
| DUPLICATE | 元注解中组合的注解总是会被保留。在所有的转化都结束之后，如果有多个重复注解（除了retention为SOURCE的注解），将会引发一个错误。 |
| PREFER_COLLECTOR | 元注解中的注解会被保留，已有的同名注解会被删除。 |
| PREFER_COLLECTOR_MERGED | 元注解中的注解会被保留，已有的同名注解会被删除，但是如果已有的同名注解中有新的参数，将会被合并到元注解中的注解中。 |
| PREFER_EXPLICIT | 元注解中的同名注解会被忽略。 |
| PREFER_EXPLICIT_MERGED | 元注解中的同名注解会被忽略，但是如果元注解中的同名注解中有新的参数，将会被合并到已有的注解中。 |

#### 自定义元注解处理器

自定义元注解处理器可以决定如何展开一个元注解。在这种情况下，元注解的行为完全是自定义的。为了实现自定义元注解处理器，必须：

1. 创建一个继承`org.codehaus.groovy.transform.AnnotationCollectorTransform`的元注解处理器。
2. 在元注解声明中声明要使用的处理器。

以`@CompileDynamic`元注解为例。`@CompileDynamic`是一个展开为`@CompileStatic(TypeCheckingMode.SKIP)`的元注解。问题是默认的元注解处理器不支持枚举，但是`TypeCheckingMode.SKIP`是一个枚举值。所以无法通过下图中的代码实现：

```groovy
@CompileStatic(TypeCheckingMode.SKIP)
@AnnotationCollector
public @interface CompileDynamic {}
```

可以如下定义：

```groovy
@AnnotationCollector(processor = "org.codehaus.groovy.transform.CompileDynamicProcessor")
public @interface CompileDynamic {
}
```

在上图中`@CompileDynamic`注解上没有`@CompileStatic`注解。原因是自定义元注解处理器可以生成注解。

自定义元注解处理器定义如下：

```groovy
@CompileStatic // 1
class CompileDynamicProcessor extends AnnotationCollectorTransform { // 2
    private static final ClassNode CS_NoDE = ClassHelper.make(CompileStatic) // 3
    private static final ClassNode TC_NoDE = ClassHelper.make(TypeCheckingMode) // 4

    List<AnnotationNode> visit(AnnotationNode collector, // 5
                                AnnotationNode aliasAnnotationUsage, // 6
                                AnnotatedNode aliasAnnotated, // 7
                                SourceUnit source) { // 8
        def node = new AnnotationNode(CS_NODE) // 9
        def enumRef = new PropertyExpression(
            new ClassExpression(TC_NODE), "SKIP") // 10
        node.addMember("value", enumRef) // 11
        Collections.singletonList(node) // 12
    }
}
```

- 1该自定义元注解处理器是使用Groovy编写的。为了更好的编译表现，使用静态编译（static compilation）。
- 2自定义元注解处理器需要继承`org.codehaus.groovy.transform.AnnotationCollectorTransform`
- 3创建一个class node表示`@CompileStatic`注解类型
- 4创建一个class node表示`TypeCheckingMode`枚举类型
- 5`collector`是在元注解中找到的`@AnnotationCollector`节点。通常不使用。
- 6`aliasAnnotationUsage`是要被展开的元注解。此处是`@CompileDynamic`。
- 7`aliasAnnotated`是被元注解注解的节点。
- 8`sourceUnit`是要被编译的`SourceUnit`。
- 9给`@CompileStatic`创建一个新的注解节点。
- 10创建一个等价于`TypeCheckingMode.SKIP`的表达式。
- 11将表达式添加到注解节点。现在这个注解是`@CompileStatic(TypeCheckingMode.SKIP)`。
- 12返回生成的注解。

## 特性（特征，Traits）

特性可以被看作一个有默认实现和状态的接口。使用`trait`关键字定义trait。

```groovy
trait FlyingAbility {
    String fly() { "I'm flying!" }
}
```

可以像普通的接口一样使用`implements`关键字使用trait。

```groovy
class Bird implements FlyingAbility {}
def b = new Bird()
assert b.fly() == "I'm flying!"
```

### 方法

#### public方法

```groovy
trait FlyingAbility {
    String fly() { "I'm flying!" }
}
```

#### 抽象方法

```groovy
trait Greetable {
    abstract String name()
    String greeting() { "Hello, ${name()}!" }
}
```

#### private方法

```groovy
trait Greeter {
    private String greetingMessage() {
        'Hello from a private method!'
    }
    String greet() {
        def m = greetingMessage()
        println m
        m
    }
}
class GreetingMachine implements Greeter {}
def g = new GreetingMachine()
assert g-greet() == "Hello from a private method!"
try {
    assert g-greetingMessage()
} catch (MissingMethodException e) {
    println "greetingMessage is private in trait"
}
```

注意：trait只支持`public`和`private`方法，不支持`protected`和package private。

#### final方法

如果一个类实现了一个trait，这个trait会被直接织入这个类中，所以这个类和这个trait不是继承的关系。一个方法上的`final`修饰符只表示这个被织入的方法的修饰符会是什么。

### this

`this`表示实现该trait的实例。

> `this` represents the implementing instance. Think of a trait as a superclass. This means that when you write:
>
> ```groovy
> trait Introspector {
>   def whoAmI() { this }
> }
> class Foo implements Introspector {}
> def foo = new Foo()
> ```
>
> then calling:
>
> ```groovy
> foo.whoAmI()
> ```
>
> will return the same instance:
>
> ```groovy
> assert foo.whoAmI().is(foo)
> ```

### 接口

trait可以实现接口。

```groovy
interface Named {
    String name()
}
trait Greetable implements Named {
    String greeting() { "Hello, ${name()}!" }
}
class Person implements Greetable {
    String name() { 'Bob' }
}

def p = new Person()
assert p.greeting() == 'Hello, Bob!'
assert p instanceof Named
assert p instanceof Greetable
```

### 属性（Properties）

trait可以定义属性。

```groovy
trait Named {
    String name
}
class Person implements Named {}
def p = new Person(name: 'Bob')
assert p.name == 'Bob'
assert p.getName() == 'Bob'
```

### 字段（Fields）

#### private字段

```groovy
trait Counter {
    private int count = 0
    int count() { count += 1; count }
}
class Foo implements Counter {}
def f = new Foo()
assert f.count() == 1
assert f.count() == 2
```

#### public字段

`public`字段和`private`字段的工作方式相同，但是为了避免钻石问题（diamond problem），字段名称会在实现类中重新映射：

```groovy
trait Named {
    public String name // 1
}
class Person implements Named {} // 2
def p = new Person() // 3
p.Named__name = 'Bob' // 4
```

其中4可以使用`public`字段，但是该字段被重新命名了。

字段名称取决于trait的全限定名。所有包中的点（`.`）会被替换为下划线（`_`），并且最后的名称会有两个下划线。因此如果字段的类型为`String`，包名为`my.package`，trait名称为`Foo`，字段名称为`bar`，那么在实现类中该`public`字段为：

```groovy
String my_package_Foo__bar
```

### 继承trait

#### 简单继承

trait可以使用`extends`关键字继承其他的trait。

```groovy
trait Named {
    String name
}
trait Polite extends Named {
    String introduce() { "Hello, I am $name" }
}
class Person implements Polite {}
def p = new Person(name: 'Alice')
assert p.introduce() == 'Hello, I am Alice'
```

#### 多继承

一个trait可以继承多个trait。在这种情况下，所有的super trait必须在implements子句中声明。

```groovy
trait WithId {
    Long id
}
trait WithName {
    String name
}
trait Identified implements WithId, WithName {}
```

### 鸭子类型（duck typing）和trait

#### 动态代码

trait可以像普通的Groovy类一样调用任何动态代码。所以在方法体中可以调用应该在实现类中存在的方法，而不需要在接口中显式声明。所以trait和鸭子类型完全兼容。

```groovy
trait SpeakingDuck {
    String speak() { quack() } // 1
}
class Duck implements SpeakingDuck {
    String methodMissing(String name, args) {
        "${name.capitalize()}!" // 2
    }
}
def d = new Duck()
assert d.speak() == 'Quack!' // 3
```

- 1SpeakingDuck需要定义quack方法
- 2Duck类通过使用methodMissing实现了方法
- 3调用speak方法触发调用quack方法最后被methodMissing处理

#### trait中的动态方法

trait也可以实现MOP（MetaObject Protocol）方法，如`methodMissing`或者`propertyMissing`。实现类会从trait继承这些行为：

```groovy
trait DynamicObject {
    private Map props = [:]
    def methodMissing(String name, args) {
        name.toUpperCase()
    }
    def propertyMissing(String name) {
        props. get(name)
    }
    void setProperty(String name, Object value) {
        props.put(name, value)
    }
}

class Dynamic implements DynamicObject {
    String existingProperty = 'ok'
    String existingMethod() { 'ok' }
}
def d = new Dynamic()
assert d.existingProperty == 'ok'
assert d.foo == null
d.foo = 'bar'
assert d.foo == 'bar'
assert d.existingMethod() == 'ok'
assert d.someMethod() == 'SOMEMETHOD'
```

### 多继承冲突

#### 默认冲突处理

一个类可以实现多个trait。如果某些trait定义了签名相同的方法，就会造成冲突：

```groovy
trait A {
    String exec() { 'A' }
}
trait B {
    String exec() { 'B' }
}
class C implements A,B {}
```

默认行为是在implements子句中最后声明的trait中的方法会被使用。在上例中因为`B`比`A`后声明，所以会使用`B`中的方法：

```groovy
def c = new C()
assert c.exec() == 'B'
```

#### 用户冲突处理

也可以使用`Trait.super.foo`这种语法显式指定方法。

```groovy
class C implements A,B {
    String exec() { A.super.exec() }
}
def c = new C()
assert c.exec() == 'A'
```

### 运行时实现trait

#### 在运行时实现一个trait

Groovy也支持在运行时动态实现trait。例如有如下类和trait：

```groovy
trait Extra {
    String extra() { "I'm an extra method" }
}
class Something {
    String doSomething() { 'Something' }
}
```

这时如果编写如下代码：

```groovy
def s = new Something()
s.extra()
```

对`extra`方法的调用会失败，因为`Something`没有实现`Extra`。但是可以通过如下语法在运行时实现：

```groovy
def s = new Something() as Extra // 1
s.extra() // 2
s.doSomething() // 3
```

- 1使用`as`关键字在运行时将一个对象强转为一个trait。
- 2然后`extra`方法就可以在这个对象被调用了。
- 3`doSomething`方法也可以被调用。

注意：当将一个对象强转为一个trait时，转换后的产物和原对象不是一个实例。可以保证的是转换后的对象会实现原对象实现的trait和接口，但是转换后的对象不是原类的实例。

#### 一次性实现多个trait

可以使用`withTraits`方法而不是`as`关键字一次性实现多个trait。

```groovy
trait A { void methodFromA() {} }
trait B { void methodFromB() {} }

class C {}

def c = new C()
c.methodFromA()
c.methodFromB()
def d = c.withTraits A, B
d.methodFromA()
d.methodFromB()
```

注意：当将一个对象强转为多个trait时，转换后的产物和原对象不是一个实例。可以保证的是转换后的对象会实现原对象实现的trait和接口，但是转换后的对象不是原类的实例。

### 链接行为

Groovy支持可堆叠的trait的概念。这个概念指的是如果当前的trait无法处理消息，则将其委托给其他的trait。考虑如下消息处理接口：

```groovy
interface MessageHandler {
    void on(String message, Map payload)
}
```

然后以trait的形式定义一个default handler：

```groovy
trait DefaultHandler implements MessageHandler {
    void on(String message, Map payload) {
        println "Received $message with payload $payload"
    }
}
```

任何类都可以通过实现该trait继承default handler的行为：

```groovy
class SimpleHandler implements DefaultHandler {}
```

现在如果想再把所有的消息都记录到日志中，可以定义另一个trait：

```groovy
trait LoggingHandler implements MessageHandler { // 1
    void on(String message, Map payload) {
        println "Seeing $message with payload $payload" // 2
        super.on(message, payload) // 3
    }
}
```

3中的`super`关键字使其将调用委托给链上的下一个trait。

然后类可以按如下的方式重写：

```groovy
class HandlerWithLogger implements DefaultHandler, LoggingHandler {}
def loggingHandler = new HandlerWithLogger()
loggingHandler.on('test logging', [:])
```

上例会打印如下信息：

```text
Seeing test logging with payload [:]
Received test logging with payload [:]
```

因为`LoggingHandler`在最后声明，所以会使用`LoggingHandler`实现的`on`方法。该方法中调用了`super`（链中的下一个trait）的方法。在该例中，下一个trait是`DefaultHandler`，所以两个trait的方法都会被调用。

可以再添加第三个handler：

```groovy
trait SayHandler implements MessageHandler {
    void on(String message, Map payload) {
        if (message.startswith("say")) {
            println "I say ${message - 'say'}!"
        } else {
            super.on(message, payload)
        }
    }
}
```

然后编写如下代码：

```groovy
class Handler implements DefaultHandler, SayHandler, LoggingHandler {}
def h = new Handler()
h.on('foo', [:])
h.on('sayHello', [:])
```

1. 消息首先会经过`LoggingHandler`
2. `LoggingHandler`调用了`super`，所以会委托下一个handler（`SayHandler`）
3. 如果消息以say开始，该handler会消耗掉该消息
4. 否则`SayHandler`会委托下一个handler

#### trait中super的语义

如果一个类实现了多个trait，并且找到了一个没有限定的super的调用，那么：

1. 如果该类实现了另一个trait，则该调用委托给链上的下一个trait
2. 如果链的左侧没有trait，super指的是实现类的super类

原文如下：

> **5.12.1. Semantics of super inside a trait**
>
> If a class implements multiple traits and a call to an unqualified `super` is found, then:
>
> 1. if the class implements another trait, the call delegates to the next trait in the chain
> 2. if there isn't any trait left in the chain, `super` refers to the super class of the implementing class (*this*)

（注：经测试，如果一个类同时继承了一个类并实现了一个trait，那么在实现类中如果使用没有限定的super，将会优先调用被继承的类中的方法，如下）

```groovy
trait Trait1{
    void p() {
        println("this is the trait 1")
        super.p()
    }
}

class SuperClass {
    protected void p() {
        println("this is the super class")
    }
}

class NormalClass extends SuperClass implements Trait1{
    void test() {
        println("this is the normal class")
        super.p()
    }
}

NormalClass normalClass = new NormalClass()
normalClass.test()
```

输出如下：

```text
this is the normal class
this is the super class
```

但是如果在实现类中限定`super`为`Trait1.super`，则可以同时调用`Trait1`和`SuperClass`中的方法：

```groovy
trait Trait1{
    void p() {
        println("this is the trait 1")
        super.p()
    }
}

class SuperClass {
    protected void p() {
        println("this is the super class")
    }
}

class NormalClass extends SuperClass implements Trait1{
    void test() {
        println("this is the normal class")
        Trait1.super.p()
    }
}

NormalClass normalClass = new NormalClass()
normalClass.test()
```

输出如下：

```text
this is the normal class
this is the trait 1
this is the super class
```

以下继续该节的讨论。

例如，可以通过如下方式装饰一个`final`类：

```groovy
trait Filtering { // 1
    StringBuilder append(String str) { // 2
        def subst = str.replace('o','') // 3
        super.append(subst) // 4
    }
    String toString() { super.toString() } // 5
}
def sb = new StringBuilder().withTraits Filtering // 6
sb.append('Groovy')
assert sb.toString() == 'Grvy' // 7
```

- 1定义一个trait，该trait会在运行时应用到`StringBuilder`上
- 2重新定义`append`方法
- 3移除字符串中的所有`o`
- 4委托给`super`
- 5在`toString`被调用时，委托给`super.toString`
- 6`StringBuilder`实例在运行时实现该trait
- 7追加的字符串中没有`o`

在该例中，当遇到`super.append`时，目标对象没有实现的其他trait，所以该方法调用的是原始的`append`方法，即`StringBuilder`中的方法。`toString`也用了同样的方法，所以生成的代理对象的字符串表示委托给了`StringBuilder`实例的`toString`方法。

以下为原文：

> In this example, when `super.append` is encountered, there is no other trait implemented by the target object, so the method which is called is the original `append` method, that is to say the one from `StringBuilder`. The same trick is used for `toString`, so that the string representation of the proxy object which is generated delegates to the `toString` of the `StringBuilder` instance.

（注：注意当将一个对象强转为trait时，转换后的对象的类型不是原对象的类型。目前不清楚具体转换过程的细节，但是经测试，确实可以按如上描述的“装饰”一个类型，如下。）

```groovy
trait Trait1{
    void p() {
        println("this is the trait 1")
        super.p()
    }
}

class NormalClass {
    void p() {
        println("this is the normal class")
    }
}

Trait1 trait1 = new NormalClass() as Trait1
trait1.p()
println(trait1 instanceof NormalClass) // false
println(trait1.class) // class NormalClass1_groovyProxy
```

输出为：

```text
this is the trait 1
this is the normal class
false
class NormalClass1_groovyProxy
```

所以`NormalClass`应该也不是转换后的对象的类型的父类，目前不清楚具体这个`super`的逻辑是什么样的。

### 高级特性（Advanced features）

#### SAM类型强转

如果一个trait只定义了一个抽象方法，那么它可以进行SAM(Single Abstract Method）类型强转。例如有如下trait：

```groovy
trait Greeter {
    String greet() { "Hello $name" }
    abstract String getName()
}
```

因为`getName`是`Greeter`中的单抽象方法（single abstract method），因此可以编写如下代码：

```groovy
Greeter greeter = { 'Alice' }
```

上图中的闭包“成为”`getName`这个单抽象方法的实现。

也可以编写如下代码：

```groovy
void greet(Greeter g) { println g.greet() } // 1
greet { 'Alice' } // 2
```

- 1greet方法接收Greeter（SAM类型）作为参数
- 2使用闭包直接调用该方法

#### 与java 8默认方法的区别

在java 8中，接口可以有默认方法。trait与接口的默认方法的主要区别为：如果一个trait在一个类的接口列表中被声明了，那么trait的实现总是会被使用，即使该类的super类也提供了实现。

这个特性（feature）可以用来覆盖一个已经实现的方法。

例如有如下类定义：

```groovy
import groovy.test.GroovyTestCase
import groovy.transform.CompileStatic
import org.codehaus.groovy.control.CompilerConfiguration
import org.codehaus.groovy.control.customizers.ASTTransformationCustomizer
import org.codehaus.groovy.control.customizers.ImportCustomizer

class SomeTest extends GroovyTestCase {
    def config
    def shell

    void setup() {
        config = new CompilerConfiguration()
        shell = new GroovyShell(config)
    }
    void testSomething() {
        assert shell.evaluate('1+1') == 2
    }
    void otherTest() { /* ... */ }
}
```

在上例中创建了一个简单的测试类，该类使用两个属性（`config`和`shell`）并且在很多测试方法中都使用了这两个属性。此时如果想使用不同的编译器配置进行测试，可以定义如下trait。

```groovy
trait MyTestSupport {
    void setup() {
        config = new CompilerConfiguration()
        config.addCompilationCustomizers( new ASTTransformationCustomizer(CompileStatic) )
        shell = new GroovyShell(config)
    }
}
```

然后可以将该trait用到子类中：

```groovy
class AnotherTest extends SomeTest implements MyTestSupport {}
class YetAnotherTest extends SomeTest2 implements MyTestSupport {}
...
```

### 静态方法、属性和字段

在写这部分的时候（2025-02-19），静态成员的支持还处于实验阶段。官方文档中该节（5.15 Static methods, properties and fields，https://www.groovy-lang.org/objectorientation.html#meta-ann-processor ）中的信息只适用于4.0.12，因此暂时不写相关内容。原文如下：

> **5.15. Static methods,properties and fields**
>
> The following instructions are subject to caution. Static member support is work in progress and stil experimental. The information below is valid for 4.0.12 only.

### 状态的继承的陷阱

trait中可以定义属性和字段，但是当一个类实现一个trait时，这些属性/字段是基于每个trait的。例如考虑如下trait：

```groovy
trait IntCouple {
    int x = 1
    int y = 2
    int sum() { x+y }
}
```

然后创建一个实现该trait的类：

```groovy
class BaseElem implements IntCouple {
    int f() { sum() }
}
def base = new BaseElem()
assert base.f() == 3
```

因为`f`方法委托trait中的`sum`方法，所以该调用的结果是`3`。但是如果编写如下代码：

```groovy
class Elem implements IntCouple {
    int x = 3
    int y = 4
    int f() { sum() }
}
def elem = new Elem()
```

如果调用`elem.f()`方法，其结果仍然会是`3`：

```groovy
assert elem.f() == 3
```

这是因为`sum`方法访问的是trait中的字段，即它用的是trait中定义的`x`和`y`的值。如果想在实现类中使用trait中定义的值，则应该通过使用getter和setter间接引用这些字段：

```groovy
trait IntCouple {
    int x = 1
    int y = 2
    int sum() { getX( )+getY() }
}

class Elem implements IntCouple {
    int x = 3
    int y = 4
    int f() { sum() }
}
def elem = new Elem()
assert elem.f() == 7
```

### 自身类型（Self types）

#### trait的类型限制

考虑下例：

```groovy
class CommunicationService {
    static void sendMessage(String from, String to, String message) {
        println "$from sent [$message] to $to"
    }
}

class Device { String id }

trait Communicating {
    void sendMessage(Device to, String message) {
        CommunicationService.sendMessage(id, to.id, message)
    }
}

class MyDevice extends Device implements Communicating {}

def bob = new MyDevice(id:'Bob')
def alice = new MyDevice(id:'Alice')
bob.sendMessage(alice,'secret')
```

显然`Communicating`只能应用于`Device`，但是没有显式明确这一限制。因为trait方法中的`id`会被动态解析，所以上例中的代码可以编译并运行。但是该trait也可能应用于不是`Device`的类。如果实现该trait的类有`id`，那么也可能正常运行。如果实现该trait的类没有`id`，那么会产生一个运行时的错误。

当开启类型检查或者在trait上使用`@CompileStatic`注解时。这个问题会变得更复杂。因为这个trait不知道它自己会成为一个“`Device`”，所以类型检查会报没有找到`id`。

可以给trait显式添加一个`getId`方法，但是这个方法不能解决所有问题。如果一个方法要求一个`Device`类型的参数，并且需要将`this`作为参数传入该方法，例如下图中的方法：

```groovy
class SecurityService {
    static void check(Device d) { if (d.id==null) throw new SecurityException() }
}
```

如果需要使用`this`作为参数在trait中调用这个方法，那么需要将`this`显式转换为`Device`。然后可能代码中到处都需要这种转换。

#### @SelfType注解

为了显式指定这个限制，并且让类型检查也意识到这一点，Groovy提供了一个`@SelfType`注解，该注解可以：

1. 声明实现该trait的类必须继承或实现的类型
2. 如果没有满足类型限制，则抛出一个编译时错误

所以在之前的例子中，可以使用`@groovy.transform.SelfType`注解解决上述问题：

```groovy
@SelfType(Device)
@CompileStatic
trait Communicating {
    void sendMessage(Device to, String message) {
        SecurityService.check(this)
        CommunicationService.sendMessage(id, to.id, message)
    }
}
```

现在如果要让一个不是`Device`的类实现该trait，则会引发一个编译期错误：

```groovy
class MyDevice implements Communicating {} // forgot to extend Device
```

错误为：

```text
class 'MyDevice' implements trait 'Communicating' but does not extend self type class 'Devi...
```

#### 与Sealed注解的区别

`@Sealed`和`@SelfType`注解都可以限制能使用一个trait的类，但是它们使用的方式是正交的（注：原文是orthogonal ways，应该是从不同维度限制的意思）。例如：

```groovy
interface HasHeight { double getHeight() }
interface HasArea { double getArea() }

@SelfType([HasHeight, HasArea]) // 1
@Sealed(permittedSubclasses=[UnitCylinder,UnitCube]) // 2
trait HasVolume {
    double getVolume() { height * area }
}

final class UnitCube implements HasVolume, HasHeight, HasArea {
    // for the purposes of this example: h=1, w=1, l=1
    double height = 1d
    double area = 1d
}

final class UnitCylinder implements HasVolume, HasHeight, HasArea {
    // for the purposes of this example: h=1, diameter=1
    // radius=diameter/2, area=PI * r^2
    double height = 1d
    double area = Math.PI * 0.5d**2
}

assert new UnitCube().volume == 1d
assert new UnitCylinder().volume == 0.7853981633974483d
```

- 1限制所有使用`HasVolume`的类都要同时实现或继承`HasHeight`和`HasArea`
- 2限制只有`UnitCube`或者`UnitCylinder`可以使用该trait

### 限制

#### 与AST转换的兼容性

Trait没有和AST转换正式兼容。例如`@CompileStatic`会作用在trait本身上（不作用在实现类上），其它的会同时作用在实现类和trait上。无法保证一个AST转换会像在普通类上那样作用在trait上。

#### 前缀和后缀操作

在trait中，不允许更新trait中的字段的前缀和后缀操作。

```groovy
trait Counting {
    int x
    void inc() {
        x++ // 1
    }
    void dec() {
        --x // 2
    }
}
class Counter implements Counting {}
def c = new Counter()
c.inc()
```

由于`x`是在trait中定义的，所以1和2的操作都不允许。但是可以使用`+=`运算符。

## record类

### Groovy增强

#### 默认参数

Groovy支持给构造器参数提供默认值。

```groovy
record ColoredPoint(int x, int y = 0, String color = 'white') {}
```

命名参数也可以使用：

```groovy
assert new ColoredPoint(x: 5).toString() == 'ColoredPoint[x=5, y=0, color=white]'
assert new ColoredPoint(x: 0, y: 5).toString() == 'ColoredPoint[x=0, y=5, color=white]'
```

也可以关闭默认参数处理：

```groovy
@TupleConstructor(defaultsMode=DefaultsMode.OFF)
record ColoredPoint2(int x, int y, String color) {}
assert new ColoredPoint2(4, 5, 'red').toString() == 'ColoredPoint2[x=4, y=5, color=red]'
```

也可以强制所有属性都有默认值：

```groovy
@TupleConstructor(defaultsMode=DefaultsMode.ON)
record ColoredPoint3(int x, int y = 0, String color = 'white') {}
assert new ColoredPoint3(y: 5).toString() == 'ColoredPoint3[x=0, y=5, color=white]'
```

没有显式指定初始值的属性/字段会使用参数类型的默认值（`null`/`0`/`false`）。

Groovy在处理record类型时会有一个中间阶段。在该阶段Groovy会将`record`关键字替换为`class`关键字并加上`@RecordType`注解。

```groovy
@RecordType
class Message {
    String from
    String to
    String body
}
```

`@RecordType`实际上是一个元注解。该元注解中有`@TupleConstructor`、`@POJO`、`@RecordBase`等注解。

#### 声明式的自定义toString

在Groovy中，可以使用Groovy的`@ToString`转换覆盖默认的record的`toString`。例如：

```groovy
package threed

import groovy.transform.ToString

@ToString(ignoreNulls=true, cache=true, includeNames=true,
        leftDelimiter='[', rightDelimiter=']', nameValueSeparator='=')
record Point(Integer x, Integer y, Integer z=null) { }

assert new Point(10, 20).toString() == 'threed.Point[x=10, y=20]'
```

#### 获取record的component值的列表

```groovy
record Point(int x, int y, String color) { }

def p = new Point(100, 200, 'green')
def (x, y, c) = p.toList()
assert x == 100
assert y == 200
assert c == 'green'
```

可以通过`@RecordOptions(toList=false)`关闭这个特性（feature）。

#### 获取record的component值的map

```groovy
record Point(int x, int y, String color) { }

def p = new Point(100, 200, 'green')
assert p.toMap() == [x: 100, y: 200, color: 'green']
```

可以通过`@RecordOptions(toMap=false)`关闭这个特性（feature）。

#### 获取record中component的数量

```groovy
record Point(int x, int y, String color) { }

def p = new Point(100, 200, 'green')
assert p.size() == 3
```

可以通过`@RecordOptions(size=false)`关闭这个特性（feature）。

#### 获取record的第n个component

```groovy
record Point(int x, int y, String color) { }

def p = new Point(100, 200, 'green')
assert p[1] == 200
```

可以通过`@RecordOptions(getAt=false)`关闭这个特性（feature）。

### 可选的Groovy特性（其他Groovy特性，Optional Groovy features）

#### 复制

Groovy中的record有个`copyWith`方法，该方法接收命名参数。record的component会被设置为提供的参数。对于没有提到的参数，会使用原record的component的一个（浅）拷贝。例如：

```groovy
@RecordOptions(copyWith=true)
record Fruit(String name, double price) {}
def apple = new Fruit('Apple', 11.6)
assert 'Apple' == apple.name()
assert 11.6 == apple.price()

def orange = apple.copyWith(name: 'Orange')
assert orange.toString() == 'Fruit[name=Orange, price=11.6]'
```

可以通过将`RecordOptions#copyWith`注解属性设置为`false`关闭该功能。

#### 深度不可变性（Deep immutability）

默认情况下record提供浅度不可变性（shallow immutability）。可以使用Groovy的`@Immutable`转换为一系列可变的数据类型提供防御性拷贝（defensive copying）。record可以利用该防御性拷贝获取深度不可变性：

```groovy
@ImmutableProperties
record Shopping(List items) {}

def items = ['bread', 'milk']
def shop = new Shopping(items)
items << 'chocolate'
assert shop.items() == ['bread', 'milk']
```

#### 以typed tuple的形式获取record的component

```groovy
import groovy.transform.*

@Recordoptions(components=true)
record Point(int x, int y, String color) { }

@CompileStatic
def method() {
    def p1 = new Point(100, 200, 'green')
    def (int x1, int y1, String c1) = p1.components()
    assert x1 == 100
    assert y1 == 200
    assert c1 == 'green'

    def p2 = new Point(10, 20, 'blue')
    def (x2, y2, c2) = p2.components()
    assert x2 * 10 == 100
    assert y2 ** 2 == 400
    assert c2.toUpperCase() == 'BLUE'

    def p3 = new Point(1, 2, 'red')
    assert p3.components() instanceof Tuple3
}

method()
```

Groovy只有有限的TupleN类。如果record中有很多component，可能无法使用该特性（feature）。

### 与java的其他区别

Groovy支持创建“类record”类。“类record”类不继承Java的Record类，并且“类record”类不会被java看作record。

`@RecordOpentions`注解（`@RecordType`的一部分）有一个`mode`注解属性，该属性可以为以下三个值中的一个（默认为`AUTO`）：

- NATIVE：以跟Java相似的方式创建一个类。如果以早于JDK16的JDK编译会产生一个错误。
- EMULATE：创建一个“类record”类。这种方式对所有的JDK版本都可用。
- AUTO：如果JDK的版本为JDK16+，那么就以NATIVE的方式创建record，否则以EMULATE的方式创建record。

## Sealed层级结构（Sealed hierarchies）

### 与Java的区别

Groovy中如果一个类为`non-sealed`，则可以省略`non-sealed`关键字。即在这种情况下，Groovy默认类为`non-sealed`，但是仍然可以继续使用`non-sealed`/`@NonSealed`。

Groovy支持将一个类注解为`sealed`。

`@SealedOptions`注解有一个`mode`注解属性，该属性可以为以下三个值中的一个（默认为`AUTO`）：

- NATIVE：以跟Java相似的方式创建一个类。如果以早于JDK17的JDK编译会产生一个错误。
- EMULATE：表明类是通过使用@Sealed注解密封的。该机制可以在JDK8+的Groovy编译器上使用，但是不会被java编译器识别。
- AUTO：如果JDK的版本为JDK17+，那么就以NATIVE的方式创建密封类，否则就以EMULATE的方式创建密封类。
