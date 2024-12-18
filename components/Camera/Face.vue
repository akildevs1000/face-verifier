<template>
  <div class="text-center">
    <v-dialog v-model="tempDialog" width="550px">
      <Close left="540" @click="close" />

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
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

export default {
  data() {
    return {
      photoSrc: null, // To hold captured photo data
      tempDialog: false,
    };
  },
  beforeDestroy() {
    // Dispose of BlazeFace model if applicable
    if (this.model) {
      this.model.dispose?.();
      this.model = null;
      console.log("BlazeFace model disposed.");
    }

    // Stop the video stream
    if (this.$refs.video && this.$refs.video.srcObject) {
      const stream = this.$refs.video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      this.$refs.video.srcObject = null;
      console.log("Video stream stopped.");
    }
  },
  mounted() {
    this.setupFaceDetection();
  },
  methods: {
    async setupFaceDetection() {
      // Load BlazeFace model and set up detection
      this.model = await blazeface.load();
      console.log("BlazeFace model loaded.");

      // Access the camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.$refs.video.addEventListener("loadeddata", () => {
            this.$refs.overlay.width = this.$refs.video.videoWidth;
            this.$refs.overlay.height = this.$refs.video.videoHeight;
            this.detectFace();
          });
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    },
    async detectFace() {
      if (!this.model) return;

      const ctx = this.$refs.overlay.getContext("2d");
      const predictions = await this.model.estimateFaces(
        this.$refs.video,
        false
      );

      // Clear the previous frame
      ctx.clearRect(0, 0, this.$refs.overlay.width, this.$refs.overlay.height);

      if (predictions.length > 0) {
        predictions.forEach((prediction) => {
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const padding = 50; // Increase this value to make the box larger
          const size = [
            end[0] - start[0] + padding * 2,
            end[1] - start[1] + padding * 2,
          ];

          // Apply padding to the starting coordinates
          const adjustedStart = [start[0] - padding, start[1] - padding];

          // Draw the bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            adjustedStart[0],
            adjustedStart[1] - 30,
            size[0],
            size[1]
          );
        });
      }

      requestAnimationFrame(this.detectFace);
    },
    captureFace() {
      if (!this.model) return;

      this.model.estimateFaces(this.$refs.video, false).then((predictions) => {
        if (predictions.length > 0) {
          const prediction = predictions[0]; // Use the first detected face
          const start = prediction.topLeft;
          const end = prediction.bottomRight;

          const padding = 50; // Increase this value to add more padding

          // Adjusted width and height with padding
          const width = end[0] - start[0] + padding * 2;
          const height = end[1] - start[1] + padding * 2;

          // Adjusted start coordinates with padding
          const adjustedStartX = Math.max(0, start[0] - padding);
          const adjustedStartY = Math.max(0, start[1] - padding);

          // Create a temporary canvas to extract the face
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = width;
          tempCanvas.height = height;

          tempCtx.drawImage(
            this.$refs.video,
            adjustedStartX,
            adjustedStartY - 30,
            width,
            height, // Source coordinates
            0,
            0,
            width,
            height // Destination coordinates
          );

          // Display the face
          this.photoSrc = tempCanvas.toDataURL("image/png");
          this.tempDialog = true;
        } else {
          alert("No face detected. Try again!");
        }
      });
    },
    close() {
      this.photoSrc = null;
      this.tempDialog = false;
      this.$emit("imageSrc", null);
    },
    submit() {
      this.tempDialog = false;
      this.$emit("imageSrc", this.photoSrc);
      this.photoSrc = null;
    },
  },
};
</script>
