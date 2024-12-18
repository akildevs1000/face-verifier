<template>
  <div class="text-center">
    <v-dialog v-model="tempDialog" width="750px">
      <Close left="740" @click="close" />
      <v-card style="overflow-y: hidden">
        <div
          class="white"
          style="
            display: flex;
            justify-content: space-between;
            overflow: hidden;
          "
        >
          <!-- Left Image Section -->
          <img
            style="width: 100%"
            v-if="photoSrc"
            :src="photoSrc"
            alt="Captured Face"
          />

          <!-- Right Controls Section -->
          <div
            class="grey lighten-2 px-2"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 10px;
            "
          >
            <v-avatar
              style="border: 3px solid #00b050"
              size="70"
              id="capture"
              @click="submit"
            >
              <v-icon class="white" size="40" color="green"
                >mdi-thumb-up</v-icon
              >
            </v-avatar>
            <v-avatar
              style="border: 3px solid"
              size="70"
              color="red"
              @click="close"
            >
              <v-icon class="white" size="40" color="red">mdi-camera</v-icon>
            </v-avatar>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <div style="display: flex">
      <div id="video-container">
        <video
          id="video"
          ref="video"
          autoplay
          playsinline
          class="video"
        ></video>
        <canvas id="overlay" ref="overlay" class="overlay"></canvas>
      </div>

      <!-- origin from #76a2a0  -->
      <div class="camera-btn-container">
        <v-avatar
          style="border: 3px solid"
          size="100"
          id="capture"
          color="primary"
          @click="captureFace"
          class="my-4"
        >
          <v-icon class="white" color="primary" size="40">mdi-camera</v-icon>
        </v-avatar>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      photoSrc: null, // To hold captured photo data
      tempDialog: false,
    };
  },
  beforeDestroy() {
    // Stop the video stream
    if (this.$refs.video && this.$refs.video.srcObject) {
      const stream = this.$refs.video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      this.$refs.video.srcObject = null;
      console.log("Video stream stopped.");
    }
  },
  mounted() {
    this.setupVideoStream();
    this.drawStaticBoundingBox();
  },
  methods: {
    setupVideoStream() {
      // Access the camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    },
    drawStaticBoundingBox() {
      const ctx = this.$refs.overlay.getContext("2d");
      const overlay = this.$refs.overlay;

      // Set overlay dimensions
      overlay.width = this.$refs.video.videoWidth || 640;
      overlay.height = this.$refs.video.videoHeight || 480;

      const boxWidth = (overlay.width / 1.2) * 0.95; // Reduced width by 20%
      const boxHeight = (overlay.height / 1.2) * 0.78; // Reduced height by 20%
      const boxX = (overlay.width - boxWidth) / 2;
      const boxY = (overlay.height - boxHeight) / 2;

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX + 40, boxY + 55, boxWidth, boxHeight);
    },

    captureFace() {
      // Create a temporary canvas to capture the box area
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");

      // Reference the overlay and video elements
      const overlay = this.$refs.overlay;
      const video = this.$refs.video;

      // Set the dimensions for the capture canvas (half the size of the overlay)
      tempCanvas.width = (overlay.width / 1.2) * 0.95;
      tempCanvas.height = (overlay.height / 1.2) * 0.78;

      // Adjust the starting position based on the static bounding box area
      const startX = (overlay.width - tempCanvas.width) / 2;
      const startY = (overlay.height - tempCanvas.height) / 2;

      // Draw the video frame on the temporary canvas, capturing the specified region
      tempCtx.drawImage(
        video,
        startX + 40,
        startY + 55,
        tempCanvas.width,
        tempCanvas.height,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height
      );

      // Convert the captured canvas to a data URL and display it
      this.photoSrc = tempCanvas.toDataURL("image/png");
      this.tempDialog = true;
    },
    close() {
      this.photoSrc = null;
      this.tempDialog = false;
    },
    submit() {
      this.tempDialog = false;
      this.$emit("imageSrc", this.photoSrc);
      this.photoSrc = null;
    },
  },
};
</script>
