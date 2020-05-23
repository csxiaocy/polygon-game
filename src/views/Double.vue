<template>
  <div>
    <h1>双人游戏</h1>
    <div v-if="!isGameOver">
      <div class="text-common">当前玩家: 玩家{{ isPlaying === 1 ? '一' : '二' }}</div>
      <div v-if="player1 === player2" class="text-common">玩家分数一致</div>
      <div v-else class="text-common">玩家{{ player1 > player2 ? '一' : '二' }} 领先</div>
    </div>
    <div v-else>
      <div v-if="player1 === player2" class="text-common">平手</div>
      <div v-else class="text-common">玩家{{ player1 > player2 ? '一' : '二' }} 获胜</div>
      <el-button type="info" @click="$router.back(-1)">返回</el-button>
      <el-button type="primary" @click="againGame">再来一局</el-button>
    </div>
    <!-- 玩家对战区 -->
    <div class="playground">
      <div class="player1" @click="getPlayer1Click">
        <div class="player-text">玩家一</div>
        <canvas
          id="player1"
          :width="width"
          :height="height"
          style="border:1px solid #c3c3c3;cursor: pointer;"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>
      <div class="player2" @click="getPlayer2Click">
        <div class="player-text">玩家二</div>
        <canvas
          id="player2"
          :width="width"
          :height="height"
          style="border:1px solid #c3c3c3;cursor: pointer;"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Polygon2 from '../utils/polygon2.js'
import { generateRandomData } from '../utils/base.js'

export default {
  name: 'Double',
  data () {
    return {
      width: 600,
      height: 600,
      player1: 0, // 玩家1分数
      player2: 0, // 玩家2分数
      isPlaying: 1, // 当前玩家
      isGameOver: false, // 当前游戏是否结束
      polygon1: null, // 玩家1多边形类
      polygon2: null // 玩家2多边形类
    }
  },
  mounted () {
    // 生成随机数据
    const { points, edges } = generateRandomData()
    this.polygon1 = new Polygon2({
      ele: 'player1',
      width: this.width,
      height: this.height,
      points: [...points],
      edges: [...edges]
    })
    this.polygon2 = new Polygon2({
      ele: 'player2',
      width: this.width,
      height: this.height,
      points: [...points],
      edges: [...edges],
      enableClick: false // 一开始玩家二无法操作
    })
    this.player1 = this.polygon1.getCurrentScore()
    this.player2 = this.polygon2.getCurrentScore()
  },
  methods: {
    getPlayer1Click () {
      this.player1 = this.polygon1.getCurrentScore()
      if (!this.player1.enableClick) {
        this.polygon2.setEnableClick()
        this.isPlaying = 2
      }
      this.isGameOver = (!this.polygon1.edges.length) && (!this.polygon2.edges.length)
    },
    getPlayer2Click () {
      this.player2 = this.polygon2.getCurrentScore()
      if (!this.player2.enableClick) {
        this.polygon1.setEnableClick()
        this.isPlaying = 1
      }
      this.isGameOver = (!this.polygon1.edges.length) && (!this.polygon2.edges.length)
    },
    // 再来一局
    againGame () {
      this.$router.go(0)
    }
  }
}
</script>

<style>
.text-common {
  width: 100%;
  height: 30px;
  text-align: center;
  line-height: 30px;
  font-size: 20px;
  font-weight: 600;
  opacity: 0.8;
}
.playground {
  display: flex;
  height: 650px;
}
.player1 {
  width: 50%;
}
.player2 {
  flex: 1;
}
.player-text {
  height: 50px;
  width: 100%;
  text-align: center;
  line-height: 50px;
  font-size: 28px;
  font-weight: bold;
  opacity: 0.6;
}
</style>
