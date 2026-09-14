---
createDate: 2026-09-13
lastUpdateDate: 2026-09-13
---

# 程序结构

## 导入

### 默认导入

Groovy中默认导入如下包：

```groovy
import java.lang.*
import java.util.*
import java.io.*
import java.net.*
import groovy.lang.*
import groovy.util.*
import java.math.BigInteger
import java.math.BigDecimal
```

### static导入

类似于java，但是groovy中可以定义和static导入的方法同名的方法，只要他们的类型不同就行：

```groovy
import static java.lang.String.format

class SomeClass {

    String format(Integer i) { 
        i.toString()
    }

    static void main(String[] args) {
        assert format('String') == 'String'
        assert new SomeClass().format(Integer.valueof(1)) == '1'
    }
}
```

（注：官方文档里这么写的，但是这玩意有点邪门，如果在上例中把在`SomeClass`中定义的`format`声明为`static`的话，仍然会把导入的`String.format`隐藏掉。官方文档中的原文见下图，对应的url为https://www.groovy-lang.org/structure.html ，截图时间为2025-02-08 17:03（北京时间））

::: info
**2026-09-13（北京时间）注：**

本篇文章原文用的是截图，搬运到博客上使用markdown/HTML的引用（块/元素）和代码（块/元素）呈现。
:::

> **2.4. Static import**
>
> Groovy’s static import capability allows you to reference imported classes as if they were static methods in your own class:
>
> ```groovy
> import static Boolean.FALSE
>
> assert !FALSE //use directly, without Boolean prefix!
> ```
>
> This is similar to Java’s static import capability but is a more dynamic than Java in that it allows you to define methods with the same name as an imported method as long as you have different types:
>
> ```groovy
> import static java.lang.String.format // 1
>
> class SomeClass {
>
>     String format(Integer i) { // 2
>         i.toString()
>     }
>
>     static void main(String[] args) {
>         assert format('String') == 'String' // 3
>         assert new SomeClass().format(Integer.valueof(1)) == '1'
>     }
> }
> ```
>
> 1. static import of method
> 2. declaration of method with same name as method statically imported above, but with a different parameter type
> 3. compile error in java, but is valid groovy code
>
> <span style="border: 1px solid red">If you have the same types, the imported class takes precedence.</span>

（注：上图中的红框标记的内容声明：如果定义的方法和static导入的方法的类型也相同，那么导入的类有更高的优先级。该描述与我在测试时将`SomeClass`中的`format`方法声明为`static`的情况不符。我测试使用的JDK为：corretto-17 (Amazon Corretto 17.0.13)，Groovy版本为：groovy-4.0.14。）

### static导入别名

```groovy
import static Calendar.getInstance as now

assert now().class == Calendar.getInstance().class
```

### 导入别名

```groovy
import java.util.Date
import java.sql.Date as SQLDate

Date utilDate = new Date(1000L)
SQLDate sqlDate = new SQLDate(1000L)

assert utilDate instanceof java.util.Date
assert sqlDate instanceof java.sql.Date
```

## Scripts VS Classes

### public static void main VS script

groovy支持script和class。例如：

::: code-group

```groovy [Main.groovy]
class Main {
    static void main(String... args) {
        println 'Groovy world!'
    }
}
```

:::

在groovy中，上图中的代码与下图中的代码等价：

::: code-group

```groovy [Main.groovy]
println 'Groovy world!'
```

:::

### Script类

一个`groovy.lang.Script`总是会被编译成一个class。脚本内容会被复制到一个“`run`”方法中。例如上例会被编译成像下图中的样子：

::: code-group

```groovy [Main.groovy]
import org.codehaus.groovy.runtime.InvokerHelper
class Main extends Script {
    def run() {
        println 'Groovy world!'
    }
    static void main(String[] args) {
        InvokerHelper.runScript(Main, args)
    }
}
```

:::

如果脚本在一个文件中，那么这个文件的base name会被用来确定生成的script class的名字。在上例中，脚本所在的文件名为Main.groovy，因此生成的script class为Main。

### 方法

脚本中也可以定义方法，例如：

```groovy
int fib(int n) {
    n < 2 ? 1 : fib(n-1) + fib(n-2)
}
assert fib(10)==89
```

也可以混合使用方法和其他代码。生成的script class会将所有的方法放到script class中，并且把所有script bodies放到`run`方法中。（注：官方文档中的原文如下，对应的url为https://www.groovy-lang.org/structure.html ，截图时间为2025-02-08 18:00）

::: info
**2026-09-13（北京时间）注：**

本篇文章原文用的是截图，搬运到博客上使用markdown/HTML的引用（块/元素）和代码（块/元素）呈现。
:::

> You can also mix methods and code. The generated script class will carry all methods into the script class, and assemble all script bodies into the `run` method:
>
> ```groovy
> println 'Hello'
>
> int power(int n) { 2**n }
>
> println "2^6==${power(6)}"
> ```

上图中的代码会在内部转换为：

```groovy
import org.codehaus.groovy.runtime.InvokerHelper
class Main extends Script {
    int power(int n) { 2** n}
    def run() {
        println 'Hello'
        println "2^6==${power(6)}"
    }
    static void main(String[] args) {
        InvokerHelper.runScript(Main, args)
    }
}
```

Groovy将script转换为class的行为对用户是透明的。script会被编译成字节码，并且行号会被保留，所以如果在script中抛出了一个异常，stack trace会显示相应的原始脚本中的行号，而不是生成的代码中的行号。

### 变量

script中的变量不需要类型定义，所以下图中的脚本：

```groovy
int x = 1
int y = 2
assert x+y == 3
```

和下图中的脚本的行为相同：

```groovy
x = 1
y = 2
assert x+y == 3
```

但是这两个脚本的语义不同：

如果变量按照第一个例子中的方法声明（有类型定义），那么该变量为本地变量（局部变量，local variable）。这个变量会在编译器生成的`run`方法中声明，并且该变量在脚本的主体之外是不可见的。尤其是该变量在脚本的其他方法中也是不可见的。

如果变量没有被声明（无类型定义），该变量会到`groovy.lang.Script#getBinding()`中。在使用一个script和一个application交互或者需要在script和application之间共享数据时，这个binding尤其重要。

另一个使变量对所有方法可见的方式为使用`@Field`注解。使用该注解的变量会成为生成的script class中的一个字段（field），并且该变量不会涉及到script Binding。如果有和binding变量名称相同的本地变量或者脚本字段（script field），可以使用`binding.varName`访问binding变量。
