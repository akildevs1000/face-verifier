<template>
  <v-container>
    <VueSignaturePad
      style="border: 1px solid #6946dd"
      ref="signaturePad"
      height="590px"
    />
    <v-row>
      <v-col class="text-center pa-10">
        <v-btn color="primary" @click="clear">
          <v-icon left>mdi-reload</v-icon> Retake
        </v-btn>
        <v-btn id="capture" color="primary" @click="save">
          <v-icon left>mdi-check</v-icon>Submit
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
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
