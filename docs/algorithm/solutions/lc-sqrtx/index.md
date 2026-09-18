---
createDate: 2026-09-15
lastUpdateDate: 2026-09-15
---

# x的平方根

## 问题

::: info
该问题为力扣上的[69.x的平方根](https://leetcode.cn/problems/sqrtx/description/)
:::

### 描述

给你一个非负整数`x`，计算并返回`x`的**算术平方根**。

由于返回类型是整数，结果只保留**整数部分**，小数部分将被**舍去**。

**注意**：不允许使用任何内置指数函数和算符，例如`pow(x, 0.5)`或者`x ** 0.5`。

### 输入约束

- `0 <= x <= 2³¹ - 1`

### 示例

#### 示例 1

> **输入：**x = 4
>
> **输出：**2

#### 示例 2

> **输入：**x = 8
>
> **输出：**2
>
> **解释：**8 的算术平方根是 2.82842..., 由于返回类型是整数，小数部分将被舍去。

## 题解

> ***O(log(n^0.5))时间复杂度，优化二分查找。***

官解给出的方法有**二分查找**和**牛顿迭代法**，还有的题解提到了**九章算术开根法**。其中二分查找法即为在0到n这个区间进行二分查找并检查当前查找的值是否为答案。而实际上可以对该方法进行优化。

### 思路

可以通过在进行二分查找之前缩小查找的范围来优化二分查找。一个比较简单的方法为：

对于一个正整数$x$，那么显然存在一个整数$i$，使得$2^i \leq x < 2^{i+1}$，因此$2^{\frac{i}{2}} = \sqrt{2^i} \leq \sqrt{x} < \sqrt{2^{i+1}} = 2^{\frac{i+1}{2}}$，所以只要在$[2^{\frac{i}{2}}, 2^{\frac{i+1}{2}})$中进行查找即可。

那么如何找到$2^{\frac{i}{2}}$和$2^{\frac{i+1}{2}}$呢？我们知道，对于一个非负整数$n$，$2^n$的二进制表示即为$1$后面跟着$n$个$0$，如$2^3$即为$1000_2$。如果我们将二进制数的各位从右（低位）向左（高位）从$0$开始标上索引，那么$2^n$的二进制表示即为将第$n$位置$1$，其它位置$0$。所以：

- 如果$i$为偶数，$\frac{i}{2}$为整数，那么$2^{\frac{i}{2}}$的二进制表示即为第$\frac{i}{2}$位为$1$，其它位为$0$的二进制数。同时，$2^{\frac{i+1}{2}}=2^{\frac{i}{2}+\frac{1}{2}}=2^{\frac{i}{2}} \times 2^{\frac{1}{2}}=\sqrt{2} \times 2^{\frac{i}{2}}$，那么只需要将$2^{\frac{i}{2}}$乘$\sqrt{2}$即可得到$2^{\frac{i+1}{2}}$，这里$\sqrt{2}$是一个常数。
- 如果$i$为奇数，那么$\frac{i}{2}=\lfloor \frac{i}{2} \rfloor + \frac{1}{2}$，因此$2^{\frac{i}{2}}=2^{\lfloor \frac{i}{2} \rfloor + \frac{1}{2}}=\sqrt{2} \times 2^{\lfloor \frac{i}{2} \rfloor}$。同时$\frac{i+1}{2}$为整数，因此$2^{\frac{i+1}{2}}$的二进制表示即为第$\frac{i+1}{2}$位为$1$，其它位为$0$的二进制数。

所以只要确定$i$的值，就能找到$2^{\frac{i}{2}}$和$2^{\frac{i+1}{2}}$。$i$的值即为$x$的二进制表示中最高位的$1$所在的位置的索引值。因为假设$x$的二进制表示中的第$j$位的值为$b_j$，那么$x=\sum_{j=0}^{ \infty }b_j2^j$。假设$x$的二进制表示中最高位的$1$所在的位置的索引值为$i$，那么当$j>i$时，$b_j$为$0$，因此$\sum_{j=i+1}^{\infty}b_j2^j=0$。$x=\sum_{j=0}^{ \infty }b_j2^j=\sum_{j=0}^{i}b_j2^j+\sum_{j=i+1}^{\infty}b_j2^j=\sum_{j=0}^{i}b_j2^j+0=\sum_{j=0}^{i}b_j2^j$。由于$b_j$只能为$0$或$1$，显然有$2^i \leq x < 2^{i+1}$。

不过下面的代码并没有使用$[2^{\frac{i}{2}}, 2^{\frac{i+1}{2}})$这个区间，而是使用了一个更宽泛的范围来进行二分查找。这个更宽泛的范围为$[2^{\lfloor \frac{i}{2} \rfloor}, 2^{\lfloor \frac{i}{2} \rfloor + 1})$。显然有$2^{\lfloor \frac{i}{2} \rfloor} \leq 2^{\frac{i}{2}}$，且$2^{\lfloor \frac{i}{2} \rfloor + 1} \geq 2^{\frac{i+1}{2}}$，即$[2^{\frac{i}{2}}, 2^{\frac{i+1}{2}}) \subseteq [2^{\lfloor \frac{i}{2} \rfloor}, 2^{\lfloor \frac{i}{2} \rfloor + 1})$，因此$\sqrt{x}$必定也在$[2^{\lfloor \frac{i}{2} \rfloor}, 2^{\lfloor \frac{i}{2} \rfloor + 1})$这个区间内。

注意：以上讨论要求$x$为正整数，但是题目中的输入可能为$0$。当$x=0$的时候，直接返回$0$即可。

### 复杂度

- 时间复杂度: $O(log(\sqrt{n}))=O(\frac{1}{2}log(n))$，等价于$O(log(n))$
- 空间复杂度: $O(1)$

### 代码

注意：这里的代码没有使用上面描述的$[2^{\frac{i}{2}}, 2^{\frac{i+1}{2}})$这个区间进行二分查找，而是使用的$[2^{\lfloor \frac{i}{2} \rfloor}, 2^{\lfloor \frac{i}{2} \rfloor + 1})$这个更宽泛的区间进行二分查找。

```java
class Solution {
    public int mySqrt(int x) {
        if (x==0) return 0;
        int leadingZerosCount = Integer.numberOfLeadingZeros(x);
        int firstOneIndex = 31-leadingZerosCount;
        int lowerBound = 1 << (firstOneIndex / 2);
        int upperBound = lowerBound << 1;
        while (lowerBound < upperBound) {
            int m = (lowerBound + upperBound) / 2;
            long mSquare = (long)m * m;
            int mPlus1 = m + 1;
            long mPlus1Square = (long)mPlus1 * mPlus1;
            if (mSquare <= x && mPlus1Square > x) return m;
            if (mSquare > x) upperBound = m;
            else lowerBound = mPlus1;
        }
        return -1;
    }
}
```