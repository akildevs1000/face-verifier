<template>
  <div class="text-center d-flex">
    <div id="video-container">
      <VueSignaturePad ref="signaturePad" />
    </div>
    <div
      class="camera-btn-container"
      style="
        flex-direction: column;
        gap: 10px;
        width: 25%;
        height: 100vh;
        background: rgb(224, 224, 224);
        position: relative;
      "
    >
      <v-avatar
        v-if="!$store.state.isDone"
        style="border: 3px solid"
        size="90"
        color="green"
        @click="save"
      >
        <v-icon class="white" color="green" size="40">mdi-thumb-up</v-icon>
      </v-avatar>

      <v-avatar v-else style="border: 3px solid" size="90" color="grey">
        <v-icon class="white" color="grey" size="40">mdi-thumb-up</v-icon>
      </v-avatar>

      <v-avatar
        style="border: 3px solid"
        size="90"
        color="primary"
        @click="clear"
      >
        <v-icon class="white" color="primary" size="40">mdi-reload</v-icon>
      </v-avatar>

      <v-btn
        style="position: absolute; bottom: 10px"
        size="90"
        class="blue white--text"
        rounded
        @click="refresh"
      >
        Refresh
      </v-btn>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "Signature",
    },
  },
  data: () => ({
    isDone: false,
    tempDialog: false,
    dialog: false,
    sign: false,
  }),
  methods: {
    refresh() {
      window.location.reload();
    },
    clear() {
      this.$store.commit(`SET_IS_DONE`, false);
      this.$refs.signaturePad.clearSignature();
      this.sign = null;
    },
    save() {
      const { data } = this.$refs.signaturePad.saveSignature();
      if (!data) {
        alert(`Signature is required`);
        return;
      }
      this.$emit("sign", data);
      this.$refs.signaturePad.clearSignature();
      this.sign = null;
      this.dialog = false;
    },
  },
};
</script>
