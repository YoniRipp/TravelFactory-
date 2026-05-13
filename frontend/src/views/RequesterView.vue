<script setup lang="ts">
import { ref, onMounted } from "vue";
import { userService, requestService, type User, type VacationRequest } from "../services/api";
import RequestList from "../components/RequestList.vue";

const users = ref<User[]>([]);
const selectedUserId = ref("");
const requests = ref<VacationRequest[]>([]);

const form = ref({ start_date: "", end_date: "", reason: "" });
const formError = ref("");
const formSuccess = ref("");
const submitting = ref(false);
const loadingRequests = ref(false);

onMounted(async () => {
  users.value = await userService.getAll();
  const requesters = users.value.filter((u) => u.role === "Requester");
  if (requesters.length) {
    selectedUserId.value = requesters[0].id;
    await loadRequests();
  }
});

async function loadRequests() {
  if (!selectedUserId.value) return;
  loadingRequests.value = true;
  try {
    requests.value = await requestService.getByUser(selectedUserId.value);
  } finally {
    loadingRequests.value = false;
  }
}

async function submitRequest() {
  formError.value = "";
  formSuccess.value = "";

  if (!form.value.start_date || !form.value.end_date) {
    formError.value = "Start date and end date are required.";
    return;
  }
  if (form.value.end_date < form.value.start_date) {
    formError.value = "End date must be on or after start date.";
    return;
  }

  submitting.value = true;
  try {
    await requestService.create({
      user_id: selectedUserId.value,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      reason: form.value.reason || undefined,
    });
    formSuccess.value = "Request submitted successfully!";
    form.value = { start_date: "", end_date: "", reason: "" };
    await loadRequests();
  } catch (err: any) {
    formError.value = err.response?.data?.details?.join(", ") ?? err.response?.data?.error ?? "Failed to submit request.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="page">
    <!-- User selector -->
    <div class="user-bar card">
      <label for="user-select">Logged in as</label>
      <select id="user-select" v-model="selectedUserId" @change="loadRequests" style="max-width:220px">
        <option v-for="u in users.filter(u => u.role === 'Requester')" :key="u.id" :value="u.id">
          {{ u.name }}
        </option>
      </select>
    </div>

    <!-- Submit form -->
    <div class="card">
      <h2>New Vacation Request</h2>
      <form @submit.prevent="submitRequest" class="form-grid">
        <div class="field">
          <label for="start">Start Date *</label>
          <input id="start" type="date" v-model="form.start_date" required />
        </div>
        <div class="field">
          <label for="end">End Date *</label>
          <input id="end" type="date" v-model="form.end_date" :min="form.start_date" required />
        </div>
        <div class="field field-full">
          <label for="reason">Reason (optional)</label>
          <textarea id="reason" v-model="form.reason" rows="3" placeholder="Describe the reason for your request..." maxlength="500" />
        </div>
        <div class="field field-full">
          <p v-if="formError" class="error-msg">{{ formError }}</p>
          <p v-if="formSuccess" class="success-msg">{{ formSuccess }}</p>
          <button type="submit" class="btn-primary" :disabled="submitting || !selectedUserId">
            {{ submitting ? "Submitting…" : "Submit Request" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Request list -->
    <div class="card">
      <h2>My Requests</h2>
      <p v-if="loadingRequests" class="loading">Loading…</p>
      <RequestList v-else :requests="requests" />
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.user-bar { display: flex; align-items: center; gap: 12px; padding: 12px 20px; }
.user-bar label { margin: 0; white-space: nowrap; }
h2 { font-size: 17px; font-weight: 600; margin-bottom: 16px; color: var(--text); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field { display: flex; flex-direction: column; }
.field-full { grid-column: 1 / -1; }
.loading { color: var(--text-muted); }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
</style>
