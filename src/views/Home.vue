<template>
  <div>
    <!-- header部分开始 -->
    <div id="header">
      <span style="margin-right: 100px;">多边形游戏</span>
      <i class="el-icon-question"
        style="font-size: 28px;padding-top: 0;cursor: pointer;"
        @click="showTips"
      ></i>
    </div>
    <!-- header部分结束 -->
    <!-- body部分开始 -->
    <div id="body">
      <!-- 左盒子开始 -->
      <div id="left">
        <div id="gamechoice">
          <ul>
            <li @click="randomGame">随机游戏</li>
            <li @click="drawer = true">自定义游戏</li>
          </ul>
        </div>
        <!-- 随机游戏开始 -->
        <div id="randomgame">
          <ul>
            <li>顶点个数：{{!this.points.length ? '随机' : this.points.length }}</li>
            <li>顶点数值：随机</li>
            <li>边运算符：随机</li>
          </ul>
        </div>
        <!-- 随机游戏结束 -->
        <!-- 自定义游戏 -->
        <!-- 自定义游戏结束 -->
        <div id="gamebutton">
          <ul>
            <li @click="startGame">开始游戏</li>
            <li @click="stopGame">结束游戏</li>
          </ul>
        </div>
      </div>
      <!-- 左盒子结束 -->
      <!-- 右盒子开始 -->
      <div id="right">
        <div id="photo">
          <canvas
            :id="canvasId"
            :width="width"
            :height="height"
            style="border:1px solid #c3c3c3;cursor: pointer;"
          >
            Your browser does not support the canvas element.
          </canvas>
        </div>
        <el-button type="info" icon="el-icon-back" round style="margin-top: 10px;" @click="withdraw">返回上一步</el-button>
        <!-- <div id="undo"><i class="el-icon-back"></i>返回上一步</div> -->
        <div id="answer" @click="showBestPath">最佳结果</div>
      </div>
      <!-- 右盒子结束 -->
    </div>
    <!-- body部分结束 -->

    <!-- 氪金通道 -->
    <el-badge value="hot" style="float: left;">
      <el-button size="small" @click="chargeMoney">双人游戏</el-button>
    </el-badge>

    <!-- 右侧自定义数据栏 -->
    <el-drawer
      title="自定义游戏数据"
      :visible.sync="drawer"
    >
      <div>
        <el-dropdown @command="handleSelectPointNum">
          <span class="el-dropdown-link">
            请选择点的个数<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-for="choose in pointNumChooses" :key="choose" :command="choose">{{choose}}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-input
          v-model="this.customPointNum"
          :disabled="true"
          style="margin-left: 30px;width: 60px;height: 100%;"
        >
        </el-input>
      </div>
      <div v-if="this.customPointNum !== 0" style="margin: 12px 20px;">
        <el-collapse v-model="drawerActiveNames">
          <el-collapse-item title="设置点的数值" name="1">
          <!-- <el-divider content-position="left">设置点的数值</el-divider> -->
            <div v-for="(value, index) in tempCustomPoints" :key="index" style="margin: 6px auto;">
              <span style="font-size: 14px;font-weight: 700;opacity: 0.4;margin-right: 10px;">点{{index+1}}</span>
              <el-input-number v-model="customPoints[index]" size="mini" :min="-10" :max="10"
              ></el-input-number>
            </div>
          </el-collapse-item>
          <el-collapse-item title="设置边的操作符" name="2">
          <!-- <el-divider content-position="left">设置边的操作符</el-divider> -->
            <div v-for="(value, index) in tempCustomPoints" :key="index+11" style="margin: 6px auto;">
              <span style="font-size: 14px;font-weight: 700;opacity: 0.4;margin-right: 10px;">边{{index+1}}</span>
              <el-radio v-model="customEdges[index]" label="＋">＋</el-radio>
              <el-radio v-model="customEdges[index]" label="×">×</el-radio>
            </div>
          </el-collapse-item>
        </el-collapse>
        <!-- <el-divider></el-divider> -->
        <div style="margin: 60px auto;">
          <el-button type="primary" round @click="customGame">确定</el-button>
          <el-button type="info" round @click="cancelCustomGame">清空</el-button>
        </div>
      </div>
    </el-drawer>
    <div class="tc" v-show="isAiPathShow">
      <span id="close" @click="closePathShowWindow">X</span>
      <div id="bk">
        <canvas
          id="bestpath"
          width="650px"
          height="370px"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>
      <div id="lastone" @click="showBestPathPrev">上一步</div>
      <div id="nextone" @click="showBestPathNext">下一步</div>
    </div>
  </div>
</template>

<script>
import Polygon from '../utils/polygon.js'
import { generateRandomData } from '../utils/base.js'
import ploygonAlgoAdapter from '../utils/algorithm'

export default {
  name: 'Home',
  data () {
    return {
      canvasId: 'game',
      width: 600,
      height: 400,
      drawer: false, // 右侧栏是否打开
      points: [],
      edges: [],
      polygon: null,
      pointNumChooses: [3, 4, 5, 6, 7, 8, 9, 10], // 可以选择的点的个数
      customPointNum: 0, // 自定义的点的个数
      tempCustomPoints: [], // 中间需要的
      customPoints: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 自定义的点集（要截取）
      customEdges: ['＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋'], // 自定义的边集（要截取）
      drawerActiveNames: ['1', '2'],
      /** 最佳路径相关的 */
      isAiPathShow: false,
      showPathPolygon: null, // 最佳路径多边形类
      maxScore: 0, // 最好分数
      bestPath: [], // 最佳路径
      showingPathIndex: 0, // 正在展示的路径的下标
      tmpEdges: [], // 临时边数组
      tmpDelEdges: [] // 临时的删边数组
    }
  },
  methods: {
    // 展示提示
    showTips () {
      this.$alert(`
        多边形游戏是一个单人玩的游戏，开始时有一个由 n 个顶点构成的多边形。<br/>
        每个顶点被赋予一个整数值（可能是正数也可能是负数），每条边被赋予一个运 算符“+”或“*”。<br/>
        所有边依次用整数从 1 到 n 编号。 游戏第 1 步，将一条边删除。<br/>
        随后 n-1 步按以下方式操作：<br/>
        (1)选择一条边 E 以及由 E 连接着的 2 个顶点 V1和 V2；<br/>
        (2)用一个新的顶点取代边 E 以及由 E 连接着的 2 个顶点 V1和 V2。<br/>
        将由顶点 V1和 V2的整数值通过边 E 上的运算得到的结果赋予新顶点。<br/>
        最后，所有边都被删除，游戏结束
      `,
      '游戏介绍',
      {
        dangerouslyUseHTMLString: true
      })
    },
    // 随机数据进行游戏
    randomGame () {
      const { points, edges } = generateRandomData()
      this.points = points
      this.edges = edges
      this.polygon = new Polygon({
        ele: this.canvasId,
        width: this.width,
        height: this.height,
        points: points,
        edges: edges
      })
    },
    // 处理选择点数 事件
    handleSelectPointNum (num) {
      this.customPointNum = num
      this.tempCustomPoints = []
      for (let i = 0; i < num; i++) {
        this.tempCustomPoints.push(0)
      }
    },
    // 自定义数据进行游戏
    customGame () {
      this.points = this.customPoints.slice(0, this.customPointNum)
      this.edges = this.customEdges.slice(0, this.customPointNum)
      this.polygon = new Polygon({
        ele: this.canvasId,
        width: this.width,
        height: this.height,
        points: this.points,
        edges: this.edges
      })
      this.drawer = false
    },
    // 取消自定义数据进行游戏
    cancelCustomGame () {
      this.customPointNum = 0
      this.customPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      this.customEdges = ['＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋', '＋']
      // this.drawer = false
    },
    // 返回一步
    withdraw () {
      if (this.polygon) {
        this.polygon.withdraw()
      }
    },
    // 开始游戏
    startGame () {
      this.$confirm('这是一个假的按钮')
    },
    // 停止游戏
    stopGame () {
      if (this.polygon) {
        this.polygon.delete()
        this.polygon = null
        this.points = []
        this.edges = []
      }
    },
    // 氪金通道
    chargeMoney () {
      // this.$alert(`
      //   <img src="http://111.230.147.75/payme.png" alt="支付二维码" style="width: 200px;height: 200px;"></img>
      // `,
      // '氪金通道',
      // {
      //   dangerouslyUseHTMLString: true
      // })
      // 跳转到双人游戏界面
      this.$router.push({ name: 'Double' })
    },
    // 展示最佳路径
    showBestPath () {
      // 生成最佳路径
      if (this.points.length !== 0) {
        const { score, order } = ploygonAlgoAdapter(this.points, this.edges)
        this.maxScore = score
        this.bestPath = order
        this.showPathPolygon = new Polygon({
          ele: 'bestpath',
          width: 650,
          height: 370,
          points: this.points,
          edges: this.edges,
          isListenClickEvent: false
        })
        // 展示
        this.isAiPathShow = true
        // 初始化
        this.showingPathIndex = 0
        this.tmpEdges = []
        this.edges.forEach((_, index) => this.tmpEdges.push(index))
      }
    },
    // 展示最佳路径上一步
    showBestPathPrev () {
      if (this.showingPathIndex !== 0) {
        // showBestPathNext back
        this.showPathPolygon.withdraw()
        const { val: delEdge, oldIndex } = this.tmpDelEdges.pop()
        this.tmpEdges.splice(oldIndex, 0, delEdge)
        this.showingPathIndex--
      }
    },
    // 展示最佳路径下一步
    showBestPathNext () {
      if (this.showingPathIndex !== this.bestPath.length) {
        for (let i = 0; i < this.bestPath.length; i++) {
          if (this.tmpEdges[i] === this.bestPath[this.showingPathIndex]) {
            this.showPathPolygon.deleteEdge(i, this.showingPathIndex === 0)
            const delEdge = this.tmpEdges[i]
            this.tmpEdges.splice(i, 1)
            this.tmpDelEdges.push({ val: delEdge, oldIndex: i })
            this.showingPathIndex++
            break
          }
        }
      }
    },
    // 关闭展示窗口
    closePathShowWindow () {
      this.isAiPathShow = false
      this.showPathPolygon.delete()
      this.showPathPolygon = null
    }
  }
}
</script>

<style scoped>
  /* header部分开始 */
  #header {
    font: normal 800 50px "宋体";
    text-align: center;
    margin-top: 30px;
  }
  /* header部分结束 */

  /* banner部分开始 */
  #body {
    margin: 0 auto;
    width: 1475px;
    height: 615px;
    border: 2px solid #fff;
    background: #fff url('../assets/background.png') no-repeat bottom center;
  }
  /* banner部分结束 */

  /* left部分开始 */
  #body #left {
    float: left;
    margin-top: 80px;
    margin-left: 250px;
    width: 280px;
    height: 470px;
    border: 3px solid #ccc;
  }
  #gamechoice {
    width: 280px;
    height: 100px;

  }
  #gamechoice li {
    display: inline-block;
    margin-top: 20px;
    margin-left: 12px;
    width: 110px;
    height: 40px;
    line-height: 40px;
    background-color: rgba(0, 0, 0, 0.1);
    border: 2px solid #000;
    border-radius: 10px;
    text-align: center;
    font-size: 18px;
    cursor: pointer;
  }
  #gamechoice li:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  #randomgame {
    width: 280px;
    height: 150px;
  }
  #randomgame li {
    font-size: 20px;
    text-align: center;
    margin-top: 15px;
  }
  #gamebutton {
    width: 280px;
    height: 200px;
  }
  #gamebutton li {
    display: inline-block;
    margin-top: 20px;
    margin-left: 85px;
    width: 110px;
    height: 40px;
    line-height: 40px;
    background-color: rgba(0, 0, 0, 0.1);
    border: 2px solid #000;
    border-radius: 10px;
    text-align: center;
    font-size: 18px;
    cursor: pointer;
  }
  /* left部分结束 */

  /* right部分开始 */
  #body #right {
    float: right;
    margin-right: 250px;
    margin-top: 80px;
    width: 686px;
    height: 470px;
    border: 3px solid #ccc;
    border-left: none;
  }
  #photo {
    margin-left: 40px;
    margin-top: 5px;
    width: 600px;
    height: 400px;
    border: 3px solid #ccc;
  }
  /* #undo {
    float: left;
    width: 100px;
    height: 30px;
    line-height: 30px;
    margin: 8px 70px;
    border: 2px solid #000;
    border-radius: 7px;
    padding-left: 40px;
    font-size: 16px;
    cursor: pointer;
  } */
  #answer {
    float: right;
    width: 100px;
    height: 30px;
    line-height: 30px;
    margin: 8px 70px;
    border: 2px solid #000;
    border-radius: 7px;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
  }
  /* right部分结束 */
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

  .bgbox {
    width: 1800px;
    height: 1800px;
    background-color: #ccc;
  }
  .tc {
    width: 730px;
    height: 510px;
    background: red;
    position: absolute;
    top: 100px;
    left: 50%;
    margin-left: -375px;
    background: #fff url("../assets/onbox.png") no-repeat left 19px;
    z-index: 10;
  }
  #close {
    position: absolute;
    right: 0;
    top: 0;
    width: 30px;
    color: #fff;
    text-align: center;
    font: normal 700 16px "微软雅黑";
    z-index: 100;
    background-color: rgba(0, 0, 0, 0.7);
    cursor: pointer;
  }
  #bk {
    width: 650px;
    height: 370px;
    margin-left: 38px;
    margin-top: 60px;
  }
  #lastone {
    float: left;
    width: 100px;
    height: 30px;
    line-height: 30px;
    margin-top: 2px;
    margin-left: 100px;
    border: 2px solid #000;
    border-radius: 7px;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
  }
  #nextone {
    float: right;
    width: 100px;
    height: 30px;
    line-height: 30px;
    margin-top: 2px;
    margin-right: 100px;
    border: 2px solid #000;
    border-radius: 7px;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
  }
</style>
