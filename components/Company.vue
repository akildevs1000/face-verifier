<template>
  <v-dialog v-model="dialog" persistent max-width="400px">
    <v-card>
      <v-card-title class="headline"
        >Enter Hotel ID <v-spacer></v-spacer>
        <v-icon @click="dialog = false" color="primary">mdi-close</v-icon></v-card-title
      >
      <v-card-text>
        <v-text-field
          hide-details
          outlined
          dense
          v-model="company"
          label="Hotel ID"
          required
          :rules="[(v) => !!v || 'Company ID is required']"
        ></v-text-field>

        <div class="text-right mt-5">
          <v-btn color="grey white--text" @click="dialog = false">close</v-btn>
          <v-btn color="primary" @click="saveCompany">Save</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  data() {
    return {
      dialog: false,
      company: null,
    };
  },
  mounted() {
    // Check if we're in a client environment
    if (typeof window !== "undefined") {
      // Check if the company ID is already in local storage
      const storedCompany = localStorage.getItem("company_id");
      if (!storedCompany) {
        this.dialog = true;
      } else {
        this.company = storedCompany;
      }
    }
  },
  methods: {
    saveCompany() {
      if (this.company) {
        localStorage.setItem("company_id", this.company);
        this.dialog = false;
      }
    },
  },
};
</script>