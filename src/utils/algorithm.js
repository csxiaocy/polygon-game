// https://blog.csdn.net/qq_40588950/article/details/93373954

const ploygonAlgo = (A, V) => {
  // let A = []  // 点
  // let V = []  // 边
  const n = A.length // 点个数
  // dp[2][n+1][n+1]
  const dp = new Array(2) // 最大值、最小值
  for (let i = 0; i < 2; i++) {
    dp[i] = new Array(n + 1)
    for (let j = 0; j < n + 1; j++) {
      dp[i][j] = new Array(n + 1).fill(0)
    }
  }
  // com1[n+1][n+1][n+1]
  const com1 = new Array(n + 1) // 最小值分界点
  for (let i = 0; i < n + 1; i++) {
    com1[i] = new Array(n + 1)
    for (let j = 0; j < n + 1; j++) {
      com1[i][j] = new Array(n + 1)
    }
  }
  // com2[n+1][n+1][n+1]
  const com2 = new Array(n + 1) // 最大值分界点
  for (let i = 0; i < n + 1; i++) {
    com2[i] = new Array(n + 1)
    for (let j = 0; j < n + 1; j++) {
      com2[i][j] = new Array(n + 1)
    }
  }
  // commax[n+1][n+1][n+1][2]
  const commax = new Array(n + 1) // 最大值时左右两端
  for (let i = 0; i < n + 1; i++) {
    commax[i] = new Array(n + 1)
    for (let j = 0; j < n + 1; j++) {
      commax[i][j] = new Array(n + 1)
      for (let k = 0; k < n + 1; k++) {
        commax[i][j][k] = new Array(2)
      }
    }
  }
  // commin[n+1][n+1][n+1][2]
  const commin = new Array(n + 1) // 最小值时左右两端
  for (let i = 0; i < n + 1; i++) {
    commin[i] = new Array(n + 1)
    for (let j = 0; j < n + 1; j++) {
      commin[i][j] = new Array(n + 1)
      for (let k = 0; k < n + 1; k++) {
        commin[i][j][k] = new Array(2)
      }
    }
  }
  // 返回最大的分数
  let score
  // 第一个被删除的边
  let firstDelEdge
  // 输出的删边顺序
  const order = []

  // 根据运算符选择+、*
  const ca = (i, j, v) => v === 1 ? i * j : i + j

  // 初始化保存最大值和最小值的数组
  const initialize = () => {
    for (let k1 = 0; k1 < 2; k1++) {
      for (let k2 = 0; k2 < n; k2++) {
        for (let k3 = 0; k3 < n; k3++) {
          dp[k1][k2][k3] = -99
        }
      }
    }
  }

  // 切成两段，左（最大、最小）与右（最大、最小）运算值最大
  const maxl = (temp, i, j, min1, max1, min2, max2, v, left, right) => {
    if (v === 1) {
      let max = min1 * min2
      left = 0
      right = 0
      if (max < (min1 * max2)) {
        max = min1 * max2
        left = 0
        right = 1
      }
      if (max < (max1 * min2)) {
        max = max1 * min2
        left = 1
        right = 0
      }
      if (max < (max1 * max2)) {
        max = max1 * max2
        left = 1
        right = 1
      }
      return { left, right, max } // TODO
    } else {
      left = 1
      right = 1
      return { left, right, max: max1 + max2 } // TODO
    }
  }

  // 切成两段，左（最大、最小）与右（最大、最小）运算值最小
  const minl = (temp, i, j, min1, max1, min2, max2, v, left, right) => {
    if (v === 1) {
      let min = min1 * min2
      left = 0
      right = 0
      if (min > (min1 * max2)) {
        min = min1 * max2
        left = 0
        right = 1
      }
      if (min > (max1 * min2)) {
        min = max1 * min2
        left = 1
        right = 0
      }
      if (min > (max1 * max2)) {
        min = max1 * max2
        left = 1
        right = 1
      }
      return { left, right, min } // TODO
    } else {
      left = 0
      right = 0
      return { left, right, min: min1 + min2 } // TODO
    }
  }

  // 递归输出去边顺序
  const output = (maxmin, temp, x, y) => {
    if (x < y) {
      if (maxmin === 0) {
        const s1 = com1[temp][x][y] // 分界点
        const t1 = commin[temp][x][y][0] // 左边max or min
        const t2 = commin[temp][x][y][1] // 右边max or min
        output(t1, temp, x, s1)
        output(t2, temp, s1 + 1, y)
        // let pro = (s1 + temp) % n + 1
        // console.log('(', (s1 + temp) % n + 1, '->)')
        order.push((s1 + temp) % n + 1)
      } else {
        const s2 = com2[temp][x][y] // 分界点
        const t3 = commax[temp][x][y][0]
        const t4 = commax[temp][x][y][1]
        output(t3, temp, x, s2)
        output(t4, temp, s2 + 1, y)
        // let pro=(s2 + temp) % n + 1
        // console.log('(', (s2 + temp) % n + 1, '->)')
        order.push((s2 + temp) % n + 1)
      }
    }
  }

  // 递归计算（类似矩阵），同时求最大最小，避免覆盖（求路径时）
  const count = (temp, i, j) => {
    let t1, t2, max, min, m
    let left1, left2, right1, right2

    // 取余数（删除第一条边的不同情况）
    const p1 = (i + temp) % n
    const p2 = (j + temp) % n
    if (dp[0][i][j] !== -99 && dp[1][i][j] !== -99) {
      return 1
    }
    if (i === j) {
      com1[temp][i][j] = i
      com2[temp][i][j] = i
      dp[0][i][j] = A[p1]
      dp[1][i][j] = A[p1]
      return 1
    }
    if (i === j - 1) {
      com1[temp][i][j] = i
      com2[temp][i][j] = i
      const t = ca(A[p1], A[p2], V[p1])
      dp[0][i][j] = t
      dp[1][i][j] = t
      return 1
    }

    count(temp, i, i)
    count(temp, i + 1, j)
    // left1, right1, min = minl(temp, i, j, dp[0][i][i], dp[1][i][i], dp[0][i+1][j], dp[1][i+1][j], V[p1], left1, right1)
    const tm1 = minl(temp, i, j, dp[0][i][i], dp[1][i][i], dp[0][i + 1][j], dp[1][i + 1][j], V[p1], left1, right1)
    left1 = tm1.left
    right1 = tm1.right
    min = tm1.min
    // left2, right2, max = maxl(temp, i, j, dp[0][i][i], dp[1][i][i], dp[0][i+1][j], dp[1][i+1][j], V[p1], left2, right2)
    const tm2 = maxl(temp, i, j, dp[0][i][i], dp[1][i][i], dp[0][i + 1][j], dp[1][i + 1][j], V[p1], left2, right2)
    left2 = tm2.left
    right2 = tm2.right
    max = tm2.max

    commax[temp][i][j][0] = left2 // max记录左边计算最大还是最小
    commax[temp][i][j][1] = right2 // max记录右边计算最大还是最小
    commin[temp][i][j][0] = left1 // min记录左边计算最大还是最小
    commin[temp][i][j][1] = right1 // min右边计算最大还是最小

    com1[temp][i][j] = i // 记录分界点
    com2[temp][i][j] = i // 记录分界点

    for (let k = i + 1; k < j; k++) {
      m = (k + temp) % n
      count(temp, i, k)
      count(temp, k + 1, j)
      // left1, right1, t1 = minl(temp, i, j, dp[0][i][k], dp[1][i][k], dp[0][k+1][j], dp[1][k+1][j], V[m], left1, right1)
      const tm3 = minl(temp, i, j, dp[0][i][k], dp[1][i][k], dp[0][k + 1][j], dp[1][k + 1][j], V[m], left1, right1)
      left1 = tm3.left
      right1 = tm3.right
      t1 = tm3.min
      // left2, right2, t2 = maxl(temp, i, j, dp[0][i][k], dp[1][i][k], dp[0][k+1][j], dp[1][k+1][j], V[m], left2, right2)
      const tm4 = maxl(temp, i, j, dp[0][i][k], dp[1][i][k], dp[0][k + 1][j], dp[1][k + 1][j], V[m], left2, right2)
      left2 = tm4.left
      right2 = tm4.right
      t2 = tm4.max
      if (min > t1) {
        commin[temp][i][j][0] = left1 // min记录左边计算最大还是最小
        commin[temp][i][j][1] = right1 // min右边计算最大还是最小
        min = t1
        com1[temp][i][j] = k
      }
      if (max < t2) {
        commax[temp][i][j][0] = left2 // maxs记录左边计算最大还是最小
        commax[temp][i][j][1] = right2 // max记录右边计算最大还是最小
        max = t2
        com2[temp][i][j] = k
      }
    }
    dp[0][i][j] = min
    dp[1][i][j] = max

    return t1
  }

  // main
  const main = () => {
    initialize()
    count(0, 0, n - 1)
    let max = dp[1][0][n - 1]
    let maxl = 0
    for (let i = 1; i < n; i++) {
      initialize()
      count(i, 0, n - 1)
      if (dp[1][0][n - 1] > max) {
        max = dp[1][0][n - 1]
        maxl = i
      }
    }
    // console.log('首先删除的边是：', (maxl+n-1)%n+1)
    firstDelEdge = (maxl + n - 1) % n + 1
    // console.log('最大值为：', max)
    score = max
    // console.log('移走边的顺序是：')
    output(1, maxl, 0, n - 1)
  }
  main()
  order.unshift(firstDelEdge)
  return {
    score,
    order
  }
}

const ploygonAlgoAdapter = (points, edges) => {
  const opMap = {
    '＋': 0,
    '×': 1
  }
  const _points = [...points]
  const _edges = edges.map(v => opMap[v])
  const { score, order } = ploygonAlgo(_points, _edges)
  for (let i = 0; i < order.length; i++) {
    order[i] -= 1
  }
  return {
    score,
    order
  }
}

// test

// const points = [-6, -7, 0, 4, -2]
// const edges = ['＋', '×', '×', '＋', '×']

// const { score, order } = ploygonAlgoAdapter(points, edges)
// console.log(score)
// console.log(order)

export default ploygonAlgoAdapter
