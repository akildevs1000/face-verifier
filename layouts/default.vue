<template>
  <v-app dark>
    <Nuxt />
  </v-app>
</template>
<style>
.v-dialog.v-dialog--active {
  box-shadow: none !important;
}
.camera-btn-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25%;
  height: 100vh;
  background: rgb(224, 224, 224);
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
  width: calc(85vw); /* Full width minus padding */
  height: calc(85vh); /* Full height minus padding */
}

video,
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* Fill the container width */
  height: 100vh; /* Fill the container height */
  object-fit: cover; /* Maintain proper aspect ratio */
}
</style>
