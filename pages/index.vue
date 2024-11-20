<template>
  <div>
    <Company />
    <v-card elevation="0">
      <v-tabs
        v-model="tab"
        background-color="deep-purple accent-4"
        centered
        dark
        dense
        flat
      >
        <v-tab @click="getNewKey()" href="#tab-1"> Face </v-tab>

        <v-tab @click="getNewKey()" href="#tab-2"> ID </v-tab>

        <v-tab @click="getNewKey()" href="#tab-3"> Sign</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" touchless>
        <v-tab-item :value="'tab-1'">
          <CameraFace
            v-if="tab == 'tab-1'"
            ref="cameraBox"
            :key="compId"
            @imageSrc="
              (e) => {
                captured_photo = e;
                if ((captured_photo = e)) {
                  tab = `tab-2`;
                }
              }
            "
          >
          </CameraFace>
        </v-tab-item>
        <v-tab-item :value="'tab-2'">
          <CameraFront
            v-if="tab == 'tab-2'"
            ref="cameraBox"
            :key="compId"
            @imageSrc="
              (e) => {
                captured_photo = e;
                if ((captured_photo = e)) {
                  tab = `tab-3`;
                }
              }
            "
          >
          </CameraFront>
        </v-tab-item>
        <v-tab-item :value="'tab-3'">
          <CameraFace
            v-if="tab == 'tab-3'"
            ref="cameraBox"
            :key="compId"
            @imageSrc="
              (e) => {
                captured_photo = e;
                if ((captured_photo = e)) {
                  tab = `tab-4`;
                }
              }
            "
          >
          </CameraFace>
        </v-tab-item>
        <v-tab-item :value="'tab-3'">
          <v-container fluid class="mt-12">
            <v-row>
              <v-col cols="8">
                <SignSignaturePad
                  ref="signPad"
                  @prev="tab = `tab-2`"
                  @sign="handleSign"
                />
              </v-col>
              <v-col cols="4">
                <v-row>
                  <v-col cols="12">
                    <v-img :src="captured_photo"></v-img>
                  </v-col>
                  <v-col cols="12">
                    <v-img :src="frontSrc"></v-img>
                  </v-col>
                  <v-col cols="12">
                    <v-img :src="backSrc"></v-img>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-dialog v-model="errorResponseDialog">
      <pre>{{ errorResponse }}</pre>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    endpoint: `https://backend.myhotel2cloud.com/api/update-pic-and-sign`,
    // endpoint: `https://hms-backend.test/api/update-pic-and-sign`,
    errorResponse: null,
    errorResponseDialog: false,
    compId: null,
    frontSrc: null,
    backSrc: null,
    tab: null,
    captured_photo: null,
    sign: null,
    loading: false,
    key: 1,
  }),
  methods: {
    triggerChildMethod() {
      this.$refs["cameraBox"].captureFace();
    },
    getNewKey() {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const length = 16; // Length of the random key
      let randomKey = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomKey += characters[randomIndex];
      }

      this.compId = randomKey;
      return randomKey;
    },
    handleSign(e) {
      this.sign = e;
      this.submit(e);
    },
    submit(sign) {
      this.loading = true;
      if (!this.captured_photo) {
        alert("Face Image is required");
        return;
      }
      if (!this.frontSrc) {
        alert("ID Photo is required (front)");
        return;
      }
      if (!this.backSrc) {
        alert("ID Photo is required (back)");
        return;
      }
      let payload = {
        captured_photo: this.captured_photo,
        sign: sign,
        id_frontend_side: this.frontSrc,
        id_backend_side: this.backSrc,
        company_id: parseInt(localStorage.getItem("company_id")) || 0,
      };
      this.$axios
        .post(this.endpoint, payload)
        .then((res) => {
          this.loading = false;
          alert("success");
          this.captured_photo = null;
          this.sign = null;
          this.frontSrc = null;
          this.backSrc = null;
          this.$refs["signPad"].clear();
          this.tab = "tab-1";
        })
        .catch((e) => {
          this.loading = false;
          this.errorResponse = e;
          this.errorResponseDialog = true;
        });
    },
  },
};
</script>
