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
          <v-col cols="12"> <div class="text-h6">Upload Face</div> </v-col>
          <v-col class="text-center pa-10">
            <img
              style="width: 70%"
              v-if="photoSrc"
              :src="photoSrc"
              alt="Captured Face"
            />
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

    <div id="video-container">
      <video id="video" ref="video" autoplay playsinline class="video"></video>
      <canvas id="overlay" ref="overlay" class="overlay"></canvas>
    </div>

    <v-row>
      <v-col cols="12" class="mb-1 text-center">
        <v-btn id="capture" color="primary" @click="captureFace" class="my-4">
          Capture Face
        </v-btn>
      </v-col>
    </v-row>
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
          const size = [end[0] - start[0], end[1] - start[1]];

          // Draw the bounding box
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(start[0], start[1], size[0], size[1]);
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

          const width = end[0] - start[0];
          const height = end[1] - start[1];

          // Create a temporary canvas to extract the face
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");
          tempCanvas.width = width;
          tempCanvas.height = height;

          tempCtx.drawImage(
            this.$refs.video,
            start[0],
            start[1],
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
