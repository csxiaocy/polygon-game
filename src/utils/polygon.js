import { drawCircle, getRandomColor } from './base'

// 绘制圆形的半径
const CIRCLE_RADIUS = 20
const CLICK_SCOPE = 10

// 多边形类
class Polygon {
  /**
   * ele: canvas元素的id
   * width: canvas元素的宽度
   * height: canvas元素的高度
   * number: 顶点的个数
   * points: Array 点集
   * edges: Array 边集
   */
  constructor ({ ele, width = 500, height = 300, points = null, edges = null }) {
    // 获取canvas元素和context
    this.canvas = document.getElementById(ele)
    this.canvas.width = width
    this.canvas.height = height
    this.context = this.canvas.getContext('2d')
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 游戏初始数据
    // this.number = number
    points = points || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    this.originalPoints = points // 保留原始数据
    this.number = this.originalPoints.length // 数组原始长度
    this.points = []
    points.forEach(ele => this.points.push({ value: ele, x: null, y: null, color: getRandomColor() }))
    // 边集 第0个表示第0个点和第1个点之间的边 ... 最后一个表示最后一个点和第0个点之间的边
    edges = edges || ['＋', '×', '＋', '×', '×', '＋', '＋', '×', '×', '＋']
    this.edges = []
    edges.forEach((operation, i) => this.edges.push({ start: i, end: (i + 1) % this.number, operation }))
    /**
     * points 点集  结构如下
     * { value 值    x x轴坐标    y y轴坐标 }
     * edges 边集  结构如下
     * { start 起始点    end 终点    operation 操作符 }
     */

    // 游戏中的数据
    this.delEdges = [] // 删除的边 集
    this.delPoints = [] // 删除的点 集

    // 渲染
    this.calculatePosition()
    this.draw()

    // 添加点击事件监听
    this.canvas.addEventListener('click', (event) => this.handleClickEvent(event, this.points, this.edges, this.number))
  }

  calculatePosition () {
    const { canvas, points, number } = this
    // 计算中心点的坐标和多边形的半径
    const centerX = parseInt(canvas.width / 2)
    const centerY = parseInt(canvas.height / 2)
    const radius = parseInt(Math.min(canvas.width, canvas.height) / 4)
    // 计算每个点的位置
    points.forEach((point, i) => {
      point.x = centerX + radius * Math.cos(2 * i * Math.PI / number)
      point.y = centerY + radius * Math.sin(2 * i * Math.PI / number)
    })
  }

  // 图形 绘制
  draw () {
    const { canvas, context, points, edges } = this
    context.clearRect(0, 0, canvas.width, canvas.height)
    // 绘制多边形
    context.fillStyle = '#000'
    edges.forEach(edge => {
      if (edge !== null) {
        context.moveTo(points[edge.start].x, points[edge.start].y)
        context.lineTo(points[edge.end].x, points[edge.end].y)
      }
    })
    context.stroke()
    // 绘制圆形
    points.forEach(point => point !== null && drawCircle(context, point.x, point.y, CIRCLE_RADIUS, point.color))
    // 绘制文字
    context.fillStyle = '#000'
    context.textAlign = 'center'
    context.font = 'bold 20px SimSun, Songti SC'
    points.forEach(point => { point !== null && context.fillText(point.value, point.x, point.y) })
    // 绘制符号
    edges.forEach(edge => {
      edge !== null &&
      context.fillText(edge.operation,
        (points[edge.start].x + points[edge.end].x) / 2,
        (points[edge.start].y + points[edge.end].y) / 2
      )
    })
  }

  // 点击事件处理
  handleClickEvent (event, points, edges, number) {
    // 获取点击位置
    const x = event.layerX
    const y = event.layerY
    let index = -1
    // 判断属于哪个index
    for (let i = 0; i < edges.length; i++) {
      const _centerX = (points[edges[i].start].x + points[edges[i].end].x) / 2
      const _centerY = (points[edges[i].start].y + points[edges[i].end].y) / 2
      if (x > _centerX - CLICK_SCOPE && x < _centerX + CLICK_SCOPE &&
        y > _centerY - CLICK_SCOPE && y < _centerY + CLICK_SCOPE) {
        index = i
        break
      }
    }
    // 事件处理
    if (index !== -1) {
      edges.length === number ? this.deleteEdge(index, true) : this.deleteEdge(index)
    }
  }

  // 删除边  index下标
  deleteEdge (index, isFirst = false) {
    const { points, edges, delEdges, delPoints } = this
    if (!edges.length) return
    const delEdge = edges[index]
    delEdges.push({ ...delEdge, oldIndex: index })
    edges.splice(index, 1)
    if (!isFirst) {
      points[delEdge.end].value = delEdge.operation === '＋'
        ? points[delEdge.start].value + points[delEdge.end].value
        : points[delEdge.start].value * points[delEdge.end].value
      delPoints.push({ ...(points[delEdge.start]), oldIndex: delEdge.start })
      points.splice(delEdge.start, 1, null)
      // 某些情况下需要修改边的指向
      edges.forEach(edge => {
        (edge.end === delEdge.start) && (edge.end = delEdge.end)
      })
    }
    this.draw()
  }

  // 撤回一步
  withdraw () {
    const { points, edges, delEdges, delPoints } = this
    if (delEdges.length === 0) return
    // this.deleteEdge的逆过程
    const { oldIndex, ...delEdge } = delEdges.pop()
    edges.forEach(edge => {
      (edge.end === delEdge.end) && (edge.end = delEdge.start)
    })
    edges.splice(oldIndex, 0, delEdge)
    if (delPoints.length !== 0) {
      // 还原
      const { oldIndex, ...point } = delPoints.pop()
      points[oldIndex] = point
      points[delEdge.end].value = delEdge.operation === '＋'
        ? parseInt(points[delEdge.end].value - point.value)
        : parseInt(points[delEdge.end].value / point.value)
      isNaN(points[delEdge.end].value) && (points[delEdge.end].value = this.originalPoints[delEdge.end])
    }
    this.draw()
  }

  // 销毁方法
  delete () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

export default Polygon
