<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title class="text-h5 text-center">ID Card Detection & Capture</v-card-title>
          <v-card-subtitle class="text-center">
            <v-btn color="primary" @click="retakePhoto" :disabled="!photoSrc">
              Retake Photo
            </v-btn>
          </v-card-subtitle>

          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" class="text-center">
                <video ref="video" autoplay playsinline class="video" />
                <canvas ref="overlay" class="overlay"></canvas>
              </v-col>
            </v-row>

            <v-row v-if="photoSrc" justify="center">
              <v-col cols="12" class="text-center">
                <v-img :src="photoSrc" alt="Captured ID Card" />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row>
              <v-col cols="12">
                <v-card-title class="text-h6">Log Messages</v-card-title>
                <v-container class="log-container" style="max-height: 200px; overflow-y: auto;">
                  <v-row v-for="(log, index) in logs" :key="index">
                    <v-col cols="12">
                      <v-chip class="ma-2" color="light-blue" text-color="black">
                        {{ log }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

export default {
  data() {
    return {
      model: null,
      detectionActive: true,
      photoSrc: null,
      logs: [],
    };
  },
  mounted() {
    this.setupCamera();
  },
  methods: {
    async setupCamera() {
      const video = this.$refs.video;
      const overlay = this.$refs.overlay;
      const ctx = overlay.getContext("2d");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        video.srcObject = stream;

        video.addEventListener("loadeddata", () => {
          overlay.width = video.videoWidth;
          overlay.height = video.videoHeight;
          this.setupCardDetection();
        });
      } catch (err) {
        this.logToScreen("Error accessing camera: " + err);
        console.error("Error accessing camera: ", err);
      }
    },
    async setupCardDetection() {
      this.model = await cocoSsd.load();
      this.detectCard();
    },
    async detectCard() {
      if (!this.model || !this.detectionActive) return;

      const video = this.$refs.video;
      const overlay = this.$refs.overlay;
      const ctx = overlay.getContext("2d");

      const predictions = await this.model.detect(video);

      // Clear the previous frame
      ctx.clearRect(0, 0, overlay.width, overlay.height);

      let cardDetected = false;

      predictions.forEach((prediction) => {
        if (
          prediction.class === "cell phone" ||
          prediction.class === "book"
        ) {
          const [startX, startY, width, height] = prediction.bbox;

          // Draw the bounding box for the detected card
          ctx.strokeStyle = "blue";
          ctx.lineWidth = 2;
          ctx.strokeRect(startX, startY, width, height);

          this.logToScreen(
            `Detected ${prediction.class} with bounding box at ${startX}, ${startY}, ${width}, ${height}`
          );

          // Capture the card image when detected
          this.captureCardImage(startX, startY, width, height);

          cardDetected = true;
        }
      });

      if (!cardDetected) {
        requestAnimationFrame(this.detectCard);
      }
    },
    captureCardImage(startX, startY, width, height) {
      // Stop further detection
      this.detectionActive = false;

      // Create a temporary canvas to extract the card
      const video = this.$refs.video;
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = width;
      tempCanvas.height = height;

      tempCtx.drawImage(video, startX, startY, width, height, 0, 0, width, height);

      // Display the captured ID card
      this.photoSrc = tempCanvas.toDataURL("image/png");
      this.logToScreen("Captured ID card image.");
    },
    retakePhoto() {
      this.logToScreen("Retaking photo...");
      this.photoSrc = null; // Clear the previous photo
      this.detectionActive = true; // Restart detection
      this.detectCard(); // Resume detection
    },
    logToScreen(message) {
      this.logs.push(message);
      // Automatically scroll to the latest log message
      this.$nextTick(() => {
        const logContainer = this.$el.querySelector(".log-container");
        logContainer.scrollTop = logContainer.scrollHeight;
      });
    },
  },
};
</script>