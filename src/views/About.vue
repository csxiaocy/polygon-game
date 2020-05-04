<template>
  <div class="about">
    <canvas
      :id="canvasId"
      :width="width"
      :height="height"
      style="border:1px solid #c3c3c3;"
    >
      Your browser does not support the canvas element.
    </canvas>
    <button @click="destroy"></button>
  </div>
</template>

<script>
import Polygon from '../utils/polygon.js'

export default {
  name: 'About',
  data () {
    return {
      canvasId: 'game',
      width: 500,
      height: 300,
      polygon: null
    }
  },
  mounted () {
    this.polygon = new Polygon({
      ele: this.canvasId,
      width: this.width,
      height: this.height
    })
  },
  methods: {
    destroy () {
      if (this.polygon) {
        this.polygon.deleteEdge(0, true)
      }
    }
  }
}
</script>
