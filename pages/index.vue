<template>
  <div>
    <style>
      .v-dialog.v-dialog--active {
        box-shadow: none !important;
      }
    </style>
    <!-- <Company /> -->
    <v-dialog v-model="tempDialog" width="550px">
      <Close left="370" @click="tempDialog = false" />
      <div
        class="none lighten-2 px-2"
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        "
      >
        <v-card>
          <v-container>
            <v-card-text>
              <div class="text-center">
                <v-avatar
                  v-if="isSuccess"
                  class="green"
                  style="border: 3px solid"
                  size="100"
                  id="capture"
                >
                  <v-icon class="white" size="40" color="green"
                    >mdi-thumb-up</v-icon
                  >
                </v-avatar>
                <v-avatar
                  v-else
                  class="red"
                  style="border: 3px solid"
                  size="100"
                  id="capture"
                >
                  <v-icon class="white" size="40" color="red"
                    >mdi-thumb-up</v-icon
                  >
                </v-avatar>
                <div class="mt-5">
                  Your ref number is: <b>{{ code }}</b>
                </div>
              </div>
            </v-card-text>
          </v-container>
        </v-card>
      </div>
    </v-dialog>
    <v-card elevation="0">
      <v-tabs
        style="display: none"
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

        <v-tab @click="getNewKey()" href="#tab-4"> Sign</v-tab>
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
                frontSrc = e;
                if ((frontSrc = e)) {
                  tab = `tab-3`;
                }
              }
            "
          >
          </CameraFront>
        </v-tab-item>
        <v-tab-item :value="'tab-3'">
          <CameraBack
            v-if="tab == 'tab-3'"
            ref="cameraBox"
            :key="compId"
            @imageSrc="
              (e) => {
                backSrc = e;
                if ((backSrc = e)) {
                  tab = `tab-4`;
                }
              }
            "
          >
          </CameraBack>
        </v-tab-item>
        <v-tab-item :value="'tab-4'">
          <SignSignaturePad
            ref="signPad"
            @prev="tab = `tab-3`"
            @sign="handleSign"
          />

          <!-- <v-row>
            <v-col cols="12">
              <v-img :src="captured_photo"></v-img>
            </v-col>
            <v-col cols="12">
              <v-img :src="frontSrc"></v-img>
            </v-col>
            <v-col cols="12">
              <v-img :src="backSrc"></v-img>
            </v-col>
          </v-row> -->
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
    isSuccess: false,
    tempDialog: false,
    endpoint: `https://backend.myhotel2cloud.com/api/update-pic-and-sign`,
    // endpoint: `http://192.168.2.8:8000/api/update-pic-and-sign`,
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
    code: null,
  }),
  methods: {
    testSuccess() {
      this.generateRandomCode();
    },
    generateRandomCode() {
      this.code = Math.floor(1000 + Math.random() * 9000);

      return this.code;
    },
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
        company_id: 3,
        code: this.generateRandomCode(),
      };
      this.$axios
        .post(this.endpoint, payload)
        .then((res) => {
          this.tempDialog = true;
          this.loading = false;
          this.isSuccess = true;
          this.captured_photo = null;
          this.sign = null;
          this.frontSrc = null;
          this.backSrc = null;

          // setTimeout(() => {
          //   this.tempDialog = false;
          //   this.code = null;
          // }, 3000);

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
