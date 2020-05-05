<template>
  <div class="about">
    <button>玩法说明</button>
    <br>
    <canvas
      :id="canvasId"
      :width="width"
      :height="height"
      style="border:1px solid #c3c3c3;cursor: pointer"
    >
      Your browser does not support the canvas element.
    </canvas>
    <br>
    <button @click="playAgain">再来一局</button>
    <button @click="withdraw">撤回一步</button>
  </div>
</template>

<script>
import Polygon from '../utils/polygon.js'
import { generateRandomData } from '../utils/base.js'

export default {
  name: 'About',
  data () {
    return {
      canvasId: 'game',
      width: 960,
      height: 720,
      points: [],
      edges: [],
      polygon: null
    }
  },
  mounted () {
    this.play()
  },
  methods: {
    play () {
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
    withdraw () {
      if (this.polygon) {
        this.polygon.withdraw()
      }
    },
    playAgain () {
      this.play()
    }
  }
}
</script>
