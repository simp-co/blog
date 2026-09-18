---
createDate: 2026-09-16
lastUpdateDate: 2026-09-16
---

# 加油站

## 问题

::: info
该问题为力扣上的[134.加油站](https://leetcode.cn/problems/gas-station/description/)
:::

### 描述

在一条环路上有`n`个加油站，其中第`i`个加油站有汽油`gas[i]`升。

你有一辆油箱容量无限的的汽车，从第`i`个加油站开往第`i+1`个加油站需要消耗汽油`cost[i]`升。你从其中的一个加油站出发，开始时油箱为空。

给定两个整数数组`gas`和`cost`，如果你可以按顺序绕环路行驶一周，则返回出发时加油站的编号，否则返回`-1`。如果存在解，则**保证**它是**唯一**的。

### 输入约束

- `n == gas.length == cost.length`
- `1 <= n <= 10⁵`
- `0 <= gas[i], cost[i] <= 10⁴`
- 输入保证答案唯一。

### 示例

#### 示例 1

> **输入:** gas = [1,2,3,4,5], cost = [3,4,5,1,2]
>
> **输出:** 3
>
> **解释:**
>
> 从 3 号加油站(索引为 3 处)出发，可获得 4 升汽油。此时油箱有 = 0 + 4 = 4 升汽油
>
> 开往 4 号加油站，此时油箱有 4 - 1 + 5 = 8 升汽油
>
> 开往 0 号加油站，此时油箱有 8 - 2 + 1 = 7 升汽油
>
> 开往 1 号加油站，此时油箱有 7 - 3 + 2 = 6 升汽油
>
> 开往 2 号加油站，此时油箱有 6 - 4 + 3 = 5 升汽油
>
> 开往 3 号加油站，你需要消耗 5 升汽油，正好足够你返回到 3 号加油站。
>
> 因此，3 可为起始索引

#### 示例 2

> **输入:** gas = [2,3,4], cost = [3,4,3]
>
> **输出:** -1
>
> **解释:**
>
> 你不能从 0 号或 1 号加油站出发，因为没有足够的汽油可以让你行驶到下一个加油站。
>
> 我们从 2 号加油站出发，可以获得 4 升汽油。 此时油箱有 = 0 + 4 = 4 升汽油
>
> 开往 0 号加油站，此时油箱有 4 - 3 + 2 = 3 升汽油
>
> 开往 1 号加油站，此时油箱有 3 - 3 + 3 = 3 升汽油
>
> 你无法返回 2 号加油站，因为返程需要消耗 4 升汽油，但是你的油箱只有 3 升汽油。
>
> 因此，无论怎样，你都不可能绕环路行驶一周。

## 题解

> ***O(N)时间复杂度，剩余油量分析、优化及拓展。***

写完之后发现有的题解也使用了类似的思想，但是还是记录一下吧。

### 思路

题目要求找出一个加油站，使得从该加油站出发，可以顺时针走一圈再回到这个加油站。那么换句话说，就是从该加油站出发，顺时针走一圈再回到这个加油站的过程中车的剩余油量不能为负数（当然现实中剩余油量不可能为负数，但是这里我们假设允许剩余油量为负数，即当车的剩余油量为$0$时再继续走会使车的剩余油量为负数，表示当前车倒欠油箱多少油）。下面先描述算法，再给出这个算法的解释和简单证明。

### 算法

为了找出这个加油站，我们可以使用如下算法：

1. 首先从任意一个加油站出发，不妨就从第$0$个加油站出发，顺时针走一圈并记录到每一个加油站时的剩余油量。
2. 由于题目说明了出发之前车的油箱是空的，所以当顺时针走一圈之后回到第$0$个加油站时车的剩余油量就相当于这一路上所有加的油的总量减去所有消耗的油的总量，即$\sum gas_i - \sum cost_i$，如果这个值小于$0$，即$\sum gas_i - \sum cost_i < 0$，那么说明无论从哪个加油站出发，都无法顺时针走一圈再回到这个加油站，因为出发之前车的油箱是空的，且整条路上所有能加的油比走这一圈要消耗的油少，把所有加油站的油全加上也走不完这一圈。此时返回$-1$。（实际上即使题目没有说明出发之前车的油箱是空的，如果走完一圈回到出发的加油站时的剩余油量小于$0$的话，此规则也适用。）
3. 通过了步骤$2$的判断之后，即回到出发的加油站时的剩余油量大于或等于$0$，那么只需要找到在整个过程中到达时剩余油量最低的那个加油站就是要找的加油站。例如如果发现整个过程中到达第$i$个加油站时的剩余油量最低，那么如果从第$i$个加油站出发，顺时针走一圈再回到第$i$个加油站的整个过程中，剩余油量都不会为负数。此时返回$i$即可。（题目说明了只存在唯一解，所以只会有一个最小值。实际上即使有多个最小值该算法也能处理。当存在多个最小值的时候，从任意一个最小值处出发都可以顺时针走一圈。但是注意：当存在多个解时，所有最小值处并不代表所有解。例如如果剩余油量是单调递增的，那么从任意一个加油站出发都能顺时针走一圈，但是在这种情况下的最小值只有一个。换句话说，“到达该加油站时的剩余油量最小”是“从该加油站出发可以顺时针走一圈”的充分不必要条件。）

那么如何记录到达每个加油站时的剩余油量呢？我们可以用$gasLevel_i$表示到达第$i$个加油站时的剩余油量，其中$0 \leq i \leq n$，当$i=n$时表示顺时针走了一圈之后回到了第$0$个加油站时的剩余油量。

1. 令$gasLevel_0=0$，表示在没出发之前在第$0$个加油站时油箱是空的。
2. $gasLevel_i = gasLevel_{i-1} + gas_{i-1} - cost_{i-1}$。

### 解释

这里基于折线图进行解释，可能可以帮助建立直觉上的理解。我们以题目给出的示例输入为例，即gas=[1,2,3,4,5]，cost=[3,4,5,1,2]。我们可以计算出gasLevel=[0,-2,-4,-6,-3,0]，然后绘制到达每个加油站时的剩余油量的折线图。这里我就先不画折线图了（搜了一下好像力扣没有可以直接绘制图表的插件，懒得搞了。），读者可以自己画一下，横轴为$0$到$5$，表示各个加油站，纵轴为$gasLevel$，表示到达各个加油站时的剩余油量。

这里最小值为$-6$，表示到达第$3$个加油站时的剩余油量。那么如果我们一开始就从第$3$个加油站出发，并绘制表示到达各个加油站时的剩余油量的折线图，就会发现此时到达各个加油站时的剩余油量都不为负数了。在这个例子中，折线图上所有加油站对应的点都被抬升了$6$个单位。但是对于一般的例子，假设$gasLevel_i$为最小值，那么当从第$i$个加油站出发并重新绘制折线图时，我们用$gasLevel \prime$表示重新计算的到达各个加油站时的剩余油量，即$gasLevel_j^{\prime}$表示新的到达第$j$个加油站时的剩余油量，而$gasLevel_j$表示旧的到达第$j$个加油站时的剩余油量，有：

$$
gasLevel_j^\prime= \left\{\begin{matrix}gasLevel_j-gasLevel_i&\text{if }j\geq i\\gasLevel_n^\prime &\text{if }j=0\\gasLevel_j + gasLevel_0^\prime&\text{if }0 < j < i\end{matrix}\right.
$$

- 当$j \geq i$时，$gasLevel_j^\prime = gasLevel_j - gasLevel_i$。由于$gasLevel_i$是最小值，因此$gasLevel_j \geq gasLevel_i$，因此$gasLevel_j^\prime = gasLevel_j - gasLevel_i \geq 0$。
- 当$j=0$时，$gasLevel_j^\prime = gasLevel_n^\prime = gasLevel_n - gasLevel_i$。由于$gasLevel_i$是最小值，因此$gasLevel_n \geq gasLevel_i$，因此$gasLevel_j^\prime \geq 0$。
- 当$0 < j < i$时，

  $$
  \begin{aligned}
  gasLevel_j^\prime &= gasLevel_j + gasLevel_0^\prime \\
  &= gasLevel_j + gasLevel_n^\prime \\
  &= gasLevel_j + gasLevel_n - gasLevel_i
  \end{aligned}
  $$

  。由于$gasLevel_i$是最小值，$gasLevel_j-gasLevel_i \geq 0$。由于$gasLevel_n \geq 0$（见上面“**算法**”部分中的第$2$步），$gasLevel_j-gasLevel_i+gasLevel_n \geq 0$，即$gasLevel_j^\prime \geq 0$。

因此对于任意$0 \geq j \geq n$，$gasLevel_j^\prime \geq 0$。

这里有个小问题，即$j=0$和$j=n$指的都是第$0$个加油站，这是由于我们在使用新的加油站起点重新绘制折线图时使用的仍然是旧的折线图的横轴。当以第$0$个加油站为起点时这没有问题，$gasLevel_0$表示从第$0$个加油站出发前的剩余油量，$gasLevel_n$表示走完一圈又回到第$0$个加油站时的剩余油量。但是当从第$i$（$i \neq 0$）个加油站出发时，却没有一个$gasLevel_j^\prime$表示走完一圈又回到第$i$个加油站时的剩余油量。不过由于从任意一个加油站出发走完一圈又回到这个加油站时的剩余油量都是一样的，都是$\sum gas - \sum cost$，同时在“**算法**”部分的第$2$步中已经判断了$\sum gas - \sum cost \geq 0$，因此从第$i$个加油站出发转一圈再回到第$i$个加油站时的剩余油量也不为负数。

顺便一提，在折线图中的从第$i$个加油站对应的点到第$i+1$个加油站对应的点的连线的斜率即为$gas_i - cost_i$。

### 证明

在“**解释**”部分的最后已经给出了一种证明，只是缺少了对

$$
gasLevel_j^\prime= \left\{\begin{matrix}gasLevel_j-gasLevel_i&\text{if }j\geq i\\gasLevel_n^\prime &\text{if }j=0\\gasLevel_j + gasLevel_0^\prime&\text{if }0 < j < i\end{matrix}\right. 
$$

这个公式的推导。读者可以自行推导一下。这个证明特定于在“**算法**”部分描述的第$1$步中选择从加油站$0$出发的情况，但是“**算法**”部分描述的第$1$步指出可以从任意一个加油站出发，所以下面给出更具一般性的证明。

#### 证明过程

为了使证明更具一般性，我们定义$gasLevel^k_i$（$0 \leq i \leq n$）表示从第$k$个加油站出发顺时针转一圈的过程中到达从第$k$个加油站往后数的第$i$个加油站时的剩余油量，换句话说，$gasLevel^k_i$表示从第$k$个加油站出发到加油站$(k+i) \mod n$时的剩余油量。$gasLevel^k_n$即表示从加油站$k$出发转一圈之后又回到加油站$k$时的剩余油量。

同时为了简化下面讨论中的公式，我们定义$diff_i=gas_i-cost_i$。

那么，

- 当$i=0$时，$gasLevel^k_0=0$，表示出发之前剩余油量为$0$。
- 当$0 < i \leq n$时，
  - 递归形式：

    $$
    \begin{aligned}
    gasLevel^k_i&=gasLevel^k_{i-1} + gas_{(k+i-1) \mod n} - cost_{(k+i-1) \mod n} \\
    &=gasLevel^k_{i-1} + diff_{(k+i-1) \mod n}
    \end{aligned}
    $$
  
  - 非递归的形式：

    $$
    \begin{aligned}
    gasLevel^k_i &= gasLevel^k_0 +  \sum_{j=0}^{i-1} diff_{(k+j) \mod n} \\
    &= gasLevel^k_0 +  \sum_{j=k}^{k+i-1}diff_{j \mod n}
    \end{aligned}
    $$

假设一开始从加油站$a$出发，并记录了到达各个加油站时的剩余油量$gasLevel^a$，然后最小值为$gasLevel^a_b$。那么这个最小值对应的加油站就是第$(a+b) \mod n$个加油站，从加油站$(a+b) \mod n$出发到达各个加油站时的剩余油量$gasLevel^{(a+b) \mod n}_i$就为：

- 当$i=0$时，$gasLevel^{(a+b) \mod n}_i=0$。
- 当$0 < i \leq n$时，

  $$
  \begin{aligned}
  &gasLevel^{(a+b) \mod n}_i \\
  &=gasLevel^{(a+b) \mod n}_0 + \sum_{j=0}^{i-1}diff_{(((a+b) \mod n)+j) \mod n} \\
  &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=0}^{i-1}diff_{(a+b+j) \mod n} \\
  &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=a+b}^{a+b+i-1}diff_{j \mod n} \\
  &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=a}^{a+b+i-1}diff_{j \mod n} - \sum_{j=a}^{a+b-1}diff_{j \mod n} \\
  &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=a}^{a+b+i-1}diff_{j \mod n} - (gasLevel^a_b - gasLevel^a_0)
  \end{aligned}
  $$

  - 当$b+i \leq n$时，

    $$
    \begin{aligned}
    &gasLevel^{(a+b) \mod n}_i \\
    &= gasLevel^{(a+b) \mod n}_0 + (gasLevel^a_{b+i} - gasLevel^a_0) - (gasLevel^a_b - gasLevel^a_0) \\
    &= gasLevel^{(a+b) \mod n}_0 + gasLevel^a_{b+i} - gasLevel^a_0 - gasLevel^a_b + gasLevel^a_0 \\
    &= gasLevel^{(a+b) \mod n}_0 + gasLevel^a_{b+i} - gasLevel^a_b
    \end{aligned}
    $$

  - 当$b+i>n$时，

    $$
    \begin{aligned}
    &gasLevel^{(a+b) \mod n}_i \\
    &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=a}^{a+b+i-1}diff_{j \mod n} - (gasLevel^a_b - gasLevel^a_0) \\
    &= gasLevel^{(a+b) \mod n}_0 + \sum_{j=a}^{a+n-1}diff_{j \mod n} + \sum_{j=a+n}^{a+b+i-1}diff_{j \mod n} - (gasLevel^a_b - gasLevel^a_0) \\
    &= gasLevel^{(a+b) \mod n}_0 + (gasLevel^a_n - gasLevel^a_0) + \sum_{j=a+n}^{a+b+i-1}diff_{j \mod n} - (gasLevel^a_b - gasLevel^a_0) \\
    &= gasLevel^{(a+b) \mod n}_0 + gasLevel^a_n - gasLevel^a_b + \sum_{j=a+n}^{a+b+i-1}diff_{j \mod n}
    \end{aligned}
    $$

    - 这里有两种方法处理$\sum_{j=a+n}^{a+b+i-1}diff_{j \mod n}$
      1. **方法一：**由于$\sum_{j=x}^{y}diff_{j \mod n}=\sum_{j=x+mn}^{y+mn}diff_{j \mod n}$（因为$diff$的下标是$j \mod n$），这里$m$为整数。因此

         $$
         \begin{aligned}
         \sum_{j=a+n}^{a+b+i-1}diff_{j \mod n}&=\sum_{j=a+n-n}^{a+b+i-1-n}diff_{j \mod n} \\
         &=\sum_{j=a}^{a+b+i-n-1}diff_{j \mod n} \\
         &=gasLevel^a_{b+i-n} - gasLevel^a_0
         \end{aligned}
         $$

      2. **方法二：**

         $$
         \begin{aligned}
         \sum_{j=a+n}^{a+b+i-1}diff_{j \mod n}&=\sum_{j=a+n}^{a+n-n+b+i-1}diff_{j \mod n} \\
         &= gasLevel^{(a+n) \mod n}_{-n+b+i} - gasLevel^{(a+n) \mod n}_0 \\
         &= gasLevel^{a}_{-n+b+i} - gasLevel^{a}_0
         \end{aligned}
         $$
      3. 总之，$\sum_{j=a+n}^{a+b+i-1}diff_{j \mod n}=gasLevel^a_{b+i-n} - gasLevel^a_0$。

    - 因此，

      $$
      \begin{aligned}
      &gasLevel^{(a+b) \mod n}_i \\
      &= gasLevel^{(a+b) \mod n}_0 + gasLevel^a_n - gasLevel^a_b + gasLevel^a_{b+i-n} - gasLevel^a_0
      \end{aligned}
      $$

    - 由于$gasLevel^{(a+b) \mod n}_0=gasLevel^a_0$（因为出发之前的初始剩余油量都是一样的），$gasLevel^{(a+b) \mod n}_i=gasLevel^a_n - gasLevel^a_b + gasLevel^a_{b+i-n}$。

- 总之，

  $$
  \begin{aligned}
  &gasLevel^{(a+b) \mod n}_i = \\
  &\begin{cases}
  0, &\text{if }i=0 \\
  gasLevel^{(a+b) \mod n}_0 + gasLevel^a_{b+i} - gasLevel^a_b, &\text{if }0 < i \leq n-b \\
  gasLevel^a_{b+i-n} - gasLevel^a_b + gasLevel^a_n, &\text{if }n-b < i \leq n
  \end{cases}
  \end{aligned}
  $$

接下来证明对于任意整数$i$（$0 \leq i \leq n$），$gasLevel^{(a+b) \mod n}_i \geq 0$。

- 当$i=0$时，$gasLevel^{(a+b) \mod n}_i = 0 \geq 0$。
- 当$0 < i \leq n-b$时，
  
  $$
  gasLevel^{(a+b) \mod n}_i = gasLevel^{(a+b) \mod n}_0 + gasLevel^a_{b+i} - gasLevel^a_b
  $$

  ，由于$gasLevel^a_b$为$gasLevel^a$中的最小值，$gasLevel^a_{b+i}\geq gasLevel^a_b$，因此$gasLevel^a_{b+i} - gasLevel^a_b \geq 0$。同时$gasLevel^{(a+b) \mod n}_0 = 0 \geq 0$，因此

  $$
  gasLevel^{(a+b) \mod n}_i = gasLevel^{(a+b) \mod n}_0 + gasLevel^a_{b+i} - gasLevel^a_b \geq 0
  $$

- 当$n-b<i\leq n$时， 同样由于$gasLevel^a_b$为$gasLevel^a$中的最小值，$gasLevel^a_{b+i-n} \geq gasLevel^a_b$，因此$gasLevel^a_{b+i-n} - gasLevel^a_b \geq 0$。同时因为$gasLevel^a_n \geq 0$（“**算法**”部分中描述的第$2$步的判断），
  
  $$
  gasLevel^{(a+b) \mod n}_i=gasLevel^a_{b+i-n} - gasLevel^a_b + gasLevel^a_n \geq 0
  $$

- 因此对于任意整数$i$（$0 \leq i \leq n$），$gasLevel^{(a+b) \mod n}_i \geq 0$。

得证。

#### 另一种证明思路

另一种证明思路是将$gasLevel$的长度扩大到$2n$，即令$gasLevel_i$的$i$的取值范围从$0 \leq i \leq n$改为$0 \leq i \leq 2n - 1$。此时$gasLevel_i$表示到达第$i \mod n$个加油站时的剩余油量。直观的理解就是记录走两圈的过程中到达每个加油站时的剩余油量。其中当$0 \leq i \leq n-1$时，$gasLevel_i$表示第一次到达第$i$个加油站时的剩余油量；当$n \leq i \leq 2n-1$时，$gasLevel_i$表示第二次到达第$i \mod n$个加油站时的剩余油量。当想计算从第$j$个加油站出发走一圈再回到第$j$个加油站的过程中到达每个加油站时的剩余油量时，只需要关注当$j \leq i \leq j+n$时的$gasLevel_i$即可。

### 代码

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        int[] gasLevel = new int[n + 1];
        gasLevel[0] = 0;
        for (int i = 1; i <= n; i++) {
            gasLevel[i] = gasLevel[i-1] + gas[i-1] - cost[i-1];
        }
        if (gasLevel[n] < 0) return -1;
        int minGasLevel = 0;
        int minIndex = 0;
        for (int i = 1; i <= n; i++) {
            if (gasLevel[i] < minGasLevel) {
                minGasLevel = gasLevel[i];
                minIndex = i;
            }
        }
        return minIndex % n;
    }
}
```

#### 复杂度

- 时间复杂度：$O(N)$
- 空间复杂度：$O(N)$

### 优化

在上面的代码中，`gasLevel`数组存在的意义只是为了找出最小值并记录对应的索引，还有判断一下`gasLevel[n]`是否小于`0`。而实际上，不需要使用这个数组也可以完成这些工作。只需要动态维护当前最小值和对应的索引，并记录$\sum gas - \sum cost$即可。

```java
class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int n = gas.length;
        int minGasLevel = 0;
        int minIndex = 0;
        int currentGasLevel = 0;
        for (int i = 1; i <= n; i++) {
            currentGasLevel = currentGasLevel + gas[i-1] - cost[i-1];
            if (currentGasLevel < minGasLevel) {
                minGasLevel = currentGasLevel;
                minIndex = i;
            }
        }
        if (currentGasLevel < 0) return -1;
        return minIndex % n;
    }
}
```

#### 复杂度

- 时间复杂度：$O(N)$
- 空间复杂度：$O(1)$

### 拓展

该方法不只能解决离散问题，也能拓展到连续问题。

例如，在一款游戏中，地图中有一块区域，当玩家进入这片区域时会同时获得一个buff和一个debuff：

- buff：增加玩家的HP，增加HP的速度是一个周期性变化的函数$f(t)$，周期为$T$。例如，在$t_1$时刻该buff每秒增加玩家$f(t_1)$点HP。同时，$f(t_1)=f(t_1+kT)$，其中$k$为整数。
- debuff：减少玩家的HP，减少HP的速度是一个周期性变化的函数$g(t)$，周期同样为$T$。例如，在$t_1$时刻该debuff每秒减少玩家$g(t_1)$点HP。同时，$g(t_1)=g(t_1+kT)$，其中$k$为整数。

玩家无HP上限，且当玩家的HP小于0时玩家死亡。假设玩家在进入该区域之前的HP为$HP_0$，那么玩家应该在什么时候进入该区域才能存活一个周期（$T$）的时间？

我们可以定义玩家在$t_0$时刻进入该区域时，在$t$时刻的HP为$h_{t_0}(t)$。不妨先令玩家在时刻$0$时就进入该区域，此时玩家在时刻$t$的HP为：

$$
h_0(t)=\begin{cases}
HP_0, &\text{if } t = 0 \\
h_0(0) +  \int_0^t f(t) - g(t) dt, &\text{if } t > 0 
\end{cases}
$$

此时可以判断一下$h_0(T)$是否小于$0$。如果$h_0(T)<0$，那么说明无论玩家在什么时刻进入这片区域都无法存活一个周期的时间。如果$h_0(T)\geq 0$，那么只需找到当$0\leq t \leq T$时，$h_0(t)$的最小值，这个$h_0(t)$的最小值对应的时刻就是该题的解。

如果希望玩家能在该区域中生存两个周期的时间，则需判断$h_0(T)$是否小于$\frac{1}{2}h_0(0)$。如果$h_0(T) < \frac{1}{2}h_0(0)$，那么无解。如果$h_0(T) \geq \frac{1}{2}h_0(0)$，那么找$h_0(t)$在$0\leq t \leq T$时的最小值。

一般的，如果希望玩家能在该区域中生存$n$个周期的时间，则需判断$h_0(T)$是否小于$\frac{n-1}{n}h_0(0)$。

如果希望玩家能一直在该区域中存活，则需判断$h_0(T)$是否小于$h_0(0)$。
