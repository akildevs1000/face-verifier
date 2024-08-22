<template>
  <span>
    <video
      class="mt-12"
      ref="videoElement"
      autoplay
      style="position: relative"
    ></video>
    <div
      style="
        width: 550px;
        background: red;
        color: white;
        position: absolute;
        top: 90px;
        left: 280px;
      "
    >
      {{ boxProps.title }}
    </div>
    <div ref="box" :style="boxProps"></div>
    <v-toolbar class="text-center mx-auto" style="width: 640px" dense>
      <v-row>
        <v-col cols="4" class="text-left">
          <v-icon large color="primary" @click="clear">mdi-sync</v-icon>
          <v-icon
            large
            v-if="isBack"
            color="primary"
            @click="$emit('prev')"
            right
            >mdi-chevron-left-circle</v-icon
          >
        </v-col>
        <v-col cols="4" class="mb-1 text-center">
          <v-btn v-if="side" class="primary" @click="captureImage"
          >Front &nbsp; <v-icon>mdi-camera-outline</v-icon>
        </v-btn>
        <v-btn v-else class="primary" @click="captureImage"
          >Back&nbsp; <v-icon>mdi-camera-outline</v-icon>
        </v-btn>
        </v-col>
        <v-col cols="4" class="text-right">
          <v-icon
            large
            :disabled="!imageSrc"
            color="primary"
            @click="$emit('next')"
            right
            >mdi-chevron-right-circle</v-icon
          >
        </v-col>
      </v-row>
    </v-toolbar>

    <canvas ref="captureCanvas" style="display: none"></canvas>
  </span>
</template>

<script>
export default {
  props: {
    isBack: {
      default: false,
    },

    facingMode: {
      default: "environment",
    },
    boxProps: {
      default: () => ({
        title: `Face must be in the box`,
        position: "absolute",
        border: "2px solid red",
        width: "320px",
        height: "320px",
        top: "115px",
        left: "350px",
      }),
    },
  },
  data() {
    return {
      imageSrc: null,
      side: true,
    };
  },
  async mounted() {
    await this.accessCamera();
  },
  methods: {
    clear() {
      this.imageSrc = null;
      this.$emit("imageSrc", null);
      const video = this.$refs.videoElement;
      video.play();
    },
    async accessCamera() {
      const video = this.$refs.videoElement;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: this.facingMode },
          });
          video.srcObject = stream;
        } catch (err) {
          console.error("Error accessing the camera: " + err);
        }
      } else {
        console.error("getUserMedia is not supported in this browser.");
      }
    },
    captureImage() {
      const canvas = this.$refs.captureCanvas;
      const video = this.$refs.videoElement;
      const context = canvas.getContext("2d");
      const box = this.$refs.box;

      const boxRect = box.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();

      // Calculate the box position relative to the video element
      const sx = boxRect.left - videoRect.left;
      const sy = boxRect.top - videoRect.top;
      const sWidth = boxRect.width;
      const sHeight = boxRect.height;

      // Set the canvas size to the box size
      canvas.width = sWidth;
      canvas.height = sHeight;

      // Draw the video frame within the specified box area onto the canvas
      context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

      // Create an image element and append it to the gallery
      this.imageSrc = canvas.toDataURL("image/png");

      this.$emit(this.side ? "front" : "back", this.imageSrc);

      this.side = !this.side;

      //   video.pause();
    },

    beforeDestroy() {
      const video = this.$refs.videoElement;
      if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    },
  },
};
</script>