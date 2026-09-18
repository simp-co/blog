---
createDate: 2026-09-15
lastUpdateDate: 2026-09-15
---

# 分发糖果

## 问题

::: info
该问题为力扣上的[135.分发糖果](https://leetcode.cn/problems/candy/description/)。
:::

### 描述

`n`个孩子站成一排。

给你一个整数数组`ratings`表示每个孩子的评分。

你需要按照以下要求，给这些孩子分发糖果：

- 每个孩子**至少**分配到`1`个糖果。
- 相邻两个孩子中，评分**更高**的那个会获得更多的糖果。

请你给每个孩子分发糖果，计算并返回需要准备的**最少**糖果数目。

### 输入约束

- `1 <= n == ratings.length <= 5 * 10⁴`
- `0 <= ratings[i] <= 5 * 10⁴`

### 示例

#### 示例 1

> **输入：**ratings = [1,0,2]
>
> **输出：**5
>
> **解释：**你可以分别给第一个、第二个、第三个孩子分发 2、1、2 颗糖果。

#### 示例 2

> **输入：**ratings = [1,2,2]
>
> **输出：**4
>
> **解释：**你可以分别给第一个、第二个、第三个孩子分发 1、2、1 颗糖果。第三个孩子只得到 1 颗糖果，这满足题面中的两个条件。

## 题解

> ***分发糖果：分治，附两次遍历方法较严格证明***

写了个分治算法，看完官解之后我愿称之为小丑算法。代码贴在最后了，也就图一乐。以下对两次遍历方法进行介绍和证明：

### 两次遍历方法

原问题要求相邻的两个孩子中，评分高的需要获得更多的糖果。将该约束条件拆分，可以得到两个约束条件（假设$candyNum[i]$为第$i$个孩子获得的糖果数）：

- **左规则：**若$ratings[i]>ratings[i-1]$，则$candyNum[i]>candyNum[i-1]$。
- **右规则：**若$ratings[i]>ratings[i+1]$，则$candyNum[i]>candyNum[i+1]$。

因此，首先从左向右遍历并只关注**左规则**，得到满足**左规则**的数组$left$，其中$left[i]$表示在仅考虑**左规则**的情况下，第$i$个孩子所能得到的最少的糖果数。具体流程如下：

- $left[0]=1$，表示最左边的孩子所能得到的最少的糖果数。
- 对于$left[i]$，如果$ratings[i]>ratings[i-1]$，则$left[i]=left[i-1]+1$。否则$left[i]=1$。

然后再从右向左遍历并只关注**右规则**，得到满足**右规则**的数组$right$，其中$right[i]$表示在仅考虑**右规则**的情况下，第$i$个孩子所能得到的最少的糖果数。具体流程同上：

- $right[n-1]=1$，表示最右边的孩子所能得到的最少的糖果数。
- 对于$right[i]$，如果$ratings[i]>ratings[i+1]$，则$right[i]=right[i+1]+1$。否则$right[i]=1$。

最后使$candyNum[i]=max(left[i],right[i])$即可，其中$candyNum[i]$表示第$i$个孩子在同时满足**左规则**和**右规则**的情况下所能获得的最少的糖果数。

### 两次遍历方法证明

#### 证明$candyNum[i]=max(left[i],right[i])$满足左规则

证明$candyNum[i]$满足**左规则**即证明当$ratings[i]>ratings[i-1]$时，$candyNum[i]>candyNum[i-1]$。

1. 因为$ratings[i]>ratings[i-1]$，所以有$left[i] = left[i-1]+1$。
2. 同时因为$ratings[i]>ratings[i-1]$，所以$right[i-1]=1$。
3. 因此

    $$
    \begin{aligned}
    candyNum[i-1]&=max(left[i-1],right[i-1]) \\
    &=max(left[i-1],1) \\
    &=left[i-1]
    \end{aligned}
    $$

4. 因此

    $$
    \begin{aligned}
    candyNum[i]&=max(left[i],right[i]) \\
    &\geq left[i] \\
    &=left[i-1]+1 \\
    &>left[i-1] \\
    &=candyNum[i-1]
    \end{aligned}
    $$

5. 得证。

#### 同理可证$candyNum[i]=max(left[i],right[i])$满足右规则

#### 证明$candyNum[i]=max(left[i],right[i])$为最优解

设满足**左规则**和**右规则**的数组$num$，且其满足“每个孩子最少需要获得一颗糖”的规则：

- 若$candyNum[i]=1$，则由于每个孩子最少需要获得一颗糖，因此$num[i]$不能小于$1$，所以$num[i] \geq 1=candyNum[i]$。
- 若$candyNum[i] \ne 1$，则必定存在：
  - $ratings[i]>ratings[i-1]$且$candyNum[i]=candyNum[i-1]+1$，或
  - $ratings[i]>ratings[i+1]$且$candyNum[i]=candyNum[i+1]+1$。
  - 因此如果$num[i]<candyNum[i]$，则必定会破坏**左规则**或**右规则**，因此$num[i] \geq candyNum[i]$。
- 所以$num[i] \geq candyNum[i]$。
- 假设存在$better$数组，其各元素之和小于$candyNum$的各元素之和，那么必定存在$better[i] < candyNum[i]$。
- 得证。

### 分治算法代码

```java
class Solution {
    public int candy(int[] ratings) {
        int n = ratings.length;
        if (n == 0) return 0;
        int[] candyNum = new int[n];
        candy(ratings, candyNum, 0, n);
        int result = 0;
        for (int cn: candyNum) {
            result += cn;
        }
        return result;
    }

    public void candy(int[] ratings, int[] candyNum, int l, int r) {
        if (l >= r) return;
        if (r - l == 1) {
            candyNum[l] = 1;
            return;
        }
        int m = (l + r) / 2;
        candy(ratings, candyNum, l, m);
        candy(ratings, candyNum, m, r);
        merge(ratings, candyNum, l, m, r);
    }

    public void merge(int[] ratings, int[] candyNum, int l, int m, int r) {
        if (l == m || m == r) return;
        if (ratings[m - 1] < ratings[m] && candyNum[m - 1] >= candyNum[m]) {
            int i = m;
            while (i < r && ratings[i] > ratings[i - 1]) {
                candyNum[i] = Math.max(candyNum[i], candyNum[i-1] + 1);
                i++;
            }
        } else if (ratings[m - 1] > ratings[m] && candyNum[m - 1] <= candyNum[m]) {
            int i = m - 1;
            while (i >= l && ratings[i] > ratings[i + 1]) {
                candyNum[i] = Math.max(candyNum[i], candyNum[i + 1] + 1);
                i--;
            }
        }
    }
}
```
