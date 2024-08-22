<template>
  <div>
    <VueSignaturePad style="border: 1px solid #6946dd" ref="signaturePad"  height="590px" />
    <v-toolbar  class="mb-5">
      <v-row>
        <v-col cols="4" class="text-left">
          <v-icon large color="primary" @click="clear">mdi-reload</v-icon>
        </v-col>
        <v-col cols="4" class="text-center">
          <v-icon large color="primary" @click="save">mdi-floppy</v-icon>
        </v-col>
        <v-col class="text-right">
          <v-icon large color="primary" @click="$emit(`prev`)"
            >mdi-chevron-left-circle</v-icon
          >
        </v-col>
      </v-row>
    </v-toolbar>
   
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
      if(!data) {
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
