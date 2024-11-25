<template>
  <div
    style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    "
    class="pa-5"
  >
    <div
      class="text-h6"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      "
    >
      Sign Here
      <VueSignaturePad
        style="border: 1px solid #6946dd; flex: 1; width: calc(80vw - 15px)"
        ref="signaturePad"
        height="550px"
      />
    </div>

    <div
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 10px;
      "
    >
      <v-avatar
        style="border: 3px solid"
        size="90"
        color="primary"
        @click="clear"
      >
        <v-icon class="white" color="primary" size="40">mdi-reload</v-icon>
      </v-avatar>

      <v-avatar style="border: 3px solid" size="90" color="green" @click="save">
        <v-icon class="white" color="green" size="40">mdi-thumb-up</v-icon>
      </v-avatar>
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
    tempDialog: false,
    dialog: false,
    sign: false,
  }),
  methods: {
    clear() {
      this.$refs.signaturePad.clearSignature();
      this.sign = null;
    },
    save() {
      const { data } = this.$refs.signaturePad.saveSignature();
      if (!data) {
        alert(`Signature is required`);
        return;
      }
      this.sign = data;
      this.$emit("sign", data);
      this.dialog = false;
    },
  },
};
</script>
