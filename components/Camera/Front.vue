<template>
  <div class="text-center">
    <style scoped>
      body {
        margin: 15px;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .overlay {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        pointer-events: none;
      }

      #video-container {
        position: relative;
        width: calc(98vw - 15px); /* Full width minus padding */
        height: calc(85vh - 10px); /* Full height minus padding */
      }

      video,
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%; /* Fill the container width */
        height: 100%; /* Fill the container height */
        object-fit: cover; /* Maintain proper aspect ratio */
        border-radius: 10px; /* Optional: Rounded corners */
      }
    </style>
    <v-dialog v-model="tempDialog" width="700px">
      <Close left="690" @click="close" />
      <v-container class="white">
        <v-row no-gutters>
          <v-col cols="12">
            <div class="text-h6">Upload ID Card (Front)</div>
          </v-col>
          <v-col class="text-center pa-10">
            <img style="width: 70%" v-if="photoSrc" :src="photoSrc" alt="" />
            <br />
            <v-btn id="capture" color="primary" @click="close">
              <v-icon left>mdi-reload</v-icon> Retake
            </v-btn>
            <v-btn id="capture" color="primary" @click="submit">
              <v-icon left>mdi-check</v-icon>Confirm
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-dialog>

    <v-card-text>
      <v-row class="d-flex justify-center">
        <v-col cols="12" class="text-center">
          <div>
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
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </div>
</template>

<script>
import * as cocoSsd from "@tensorflow-models/coco-ssd";

export default {
  data() {
    return {
      photoSrc: null, // To hold captured photo data
      tempDialog: false,
      model: null, // Variable for object detection model
    };
  },
  mounted() {
    this.setupObjectDetection();
  },
  beforeDestroy() {
    // Dispose of COCO-SSD model if applicable
    if (this.model) {
      this.model.dispose?.();
      this.model = null;
      console.log("COCO-SSD model disposed.");
    }

    // Stop the video stream
    if (this.$refs.video && this.$refs.video.srcObject) {
      const stream = this.$refs.video.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      this.$refs.video.srcObject = null;
      console.log("Video stream stopped.");
    }
  },
  methods: {
    async setupObjectDetection() {
      // Load COCO-SSD model
      this.model = await cocoSsd.load();
      console.log("COCO-SSD model loaded.");

      // Access the camera
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.$refs.video.addEventListener("loadeddata", () => {
            this.$refs.overlay.width = this.$refs.video.videoWidth;
            this.$refs.overlay.height = this.$refs.video.videoHeight;
            this.detectObjects();
          });
        })
        .catch((err) => console.error("Error accessing camera: ", err));
    },
    async detectObjects() {
      if (!this.model) return;

      const ctx = this.$refs.overlay.getContext("2d");
      const predictions = await this.model.detect(this.$refs.video);

      // Clear the previous frame
      ctx.clearRect(0, 0, this.$refs.overlay.width, this.$refs.overlay.height);

      // Loop through each prediction
      predictions.forEach((prediction) => {
        // Draw the bounding box if the object is a "person" or other relevant label
        if (prediction.class === "cell phone" || prediction.class === "book") {
          // Replace "person" with your ID card label if needed
          const start = prediction.bbox.slice(0, 2);
          const end = [
            start[0] + prediction.bbox[2],
            start[1] + prediction.bbox[3],
          ];

          const size = [prediction.bbox[2], prediction.bbox[3]];

          // Draw the bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);

          // Automatically capture when an object is detected
          if (!this.photoSrc) {
            this.captureIDCard(prediction);
          }
        }
      });

      requestAnimationFrame(this.detectObjects);
    },
    captureIDCard(prediction) {
      const bbox = prediction.bbox;
      const [x, y, width, height] = bbox;

      // Create a temporary canvas to extract the ID card area
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = width;
      tempCanvas.height = height;

      tempCtx.drawImage(
        this.$refs.video,
        x,
        y,
        width,
        height, // Source coordinates
        0,
        0,
        width,
        height // Destination coordinates
      );

      // Display the extracted ID card image
      this.photoSrc = tempCanvas.toDataURL("image/png");
      this.tempDialog = true;
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
