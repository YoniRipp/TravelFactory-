<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { requestService, type VacationRequest } from "../services/api";
import StatusBadge from "../components/StatusBadge.vue";

type Filter = "" | "Pending" | "Approved" | "Rejected";

const all = ref<VacationRequest[]>([]);
const filter = ref<Filter>("Pending");
const loading = ref(false);

const rejectTarget = ref<VacationRequest | null>(null);
const rejectComment = ref("");
const rejectError = ref("");
const actionError = ref("");
const processing = ref(false);

onMounted(loadRequests);

async function loadRequests() {
  loading.value = true;
  actionError.value = "";
  try {
    all.value = await requestService.getAll();
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() =>
  filter.value ? all.value.filter((r) => r.status === filter.value) : all.value
);

async function approve(req: VacationRequest) {
  processing.value = true;
  actionError.value = "";
  try {
    const updated = await requestService.updateStatus(req.id, { status: "Approved" });
    Object.assign(req, updated);
  } catch (err: any) {
    actionError.value = err.response?.data?.error ?? "Failed to approve.";
  } finally {
    processing.value = false;
  }
}

function openReject(req: VacationRequest) {
  rejectTarget.value = req;
  rejectComment.value = "";
  rejectError.value = "";
}

function closeReject() {
  rejectTarget.value = null;
}

async function confirmReject() {
  if (!rejectComment.value.trim()) {
    rejectError.value = "A comment is required when rejecting.";
    return;
  }
  processing.value = true;
  try {
    const updated = await requestService.updateStatus(rejectTarget.value!.id, {
      status: "Rejected",
      comments: rejectComment.value.trim(),
    });
    const idx = all.value.findIndex((r) => r.id === updated.id);
    if (idx !== -1) Object.assign(all.value[idx], updated);
    closeReject();
  } catch (err: any) {
    rejectError.value = err.response?.data?.error ?? "Failed to reject.";
  } finally {
    processing.value = false;
  }
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
</script>

<template>
  <div class="page">
    <!-- Filter bar -->
    <div class="card filter-bar">
      <span class="filter-label">Filter by status:</span>
      <div class="filter-buttons">
        <button
          v-for="f in (['', 'Pending', 'Approved', 'Rejected'] as Filter[])"
          :key="f"
          :class="['btn-outline', { active: filter === f }]"
          @click="filter = f"
        >
          {{ f || "All" }}
        </button>
      </div>
      <button class="btn-outline refresh" @click="loadRequests" :disabled="loading">
        ↻ Refresh
      </button>
    </div>

    <p v-if="actionError" class="error-msg action-error">{{ actionError }}</p>

    <!-- Requests table -->
    <div class="card">
      <p class="count">{{ filtered.length }} request{{ filtered.length !== 1 ? "s" : "" }}</p>
      <p v-if="loading" class="loading">Loading…</p>
      <div v-else-if="filtered.length === 0" class="empty">No requests found.</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Start</th>
              <th>End</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td class="name-cell">{{ r.user?.name ?? "—" }}</td>
              <td>{{ formatDate(r.start_date) }}</td>
              <td>{{ formatDate(r.end_date) }}</td>
              <td class="overflow-cell">{{ r.reason || "—" }}</td>
              <td><StatusBadge :status="r.status" /></td>
              <td class="overflow-cell">{{ r.comments || "—" }}</td>
              <td>{{ formatDate(r.created_at) }}</td>
              <td class="actions-cell">
                <template v-if="r.status === 'Pending'">
                  <button class="btn-success sm" @click="approve(r)" :disabled="processing">Approve</button>
                  <button class="btn-danger sm"  @click="openReject(r)" :disabled="processing">Reject</button>
                </template>
                <span v-else class="no-action">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Reject modal -->
  <Teleport to="body">
    <div v-if="rejectTarget" class="modal-backdrop" @click.self="closeReject">
      <div class="modal card">
        <h3>Reject Request</h3>
        <p class="modal-sub">
          Rejecting <strong>{{ rejectTarget.user?.name }}</strong>'s request
          ({{ formatDate(rejectTarget.start_date) }} → {{ formatDate(rejectTarget.end_date) }})
        </p>
        <label for="reject-comment">Comment (required)</label>
        <textarea
          id="reject-comment"
          v-model="rejectComment"
          rows="3"
          placeholder="Explain the reason for rejection…"
          autofocus
        />
        <p v-if="rejectError" class="error-msg">{{ rejectError }}</p>
        <div class="modal-actions">
          <button class="btn-outline" @click="closeReject" :disabled="processing">Cancel</button>
          <button class="btn-danger" @click="confirmReject" :disabled="processing">
            {{ processing ? "Rejecting…" : "Confirm Rejection" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.filter-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 14px 20px; }
.filter-label { font-size: 13px; color: var(--text-muted); white-space: nowrap; }
.filter-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-outline.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.refresh { margin-left: auto; }
.count { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; }
.loading, .empty { color: var(--text-muted); text-align: center; padding: 32px 0; }
.action-error { margin-bottom: -8px; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th {
  text-align: left; padding: 10px 12px; border-bottom: 2px solid var(--border);
  color: var(--text-muted); font-weight: 600; font-size: 12px;
  text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
}
td { padding: 12px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tr:last-child td { border-bottom: none; }
tr:hover td { background: #f8f9fa; }
.overflow-cell { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.name-cell { font-weight: 500; white-space: nowrap; }
.actions-cell { white-space: nowrap; display: flex; gap: 6px; align-items: center; }
.no-action { color: var(--text-muted); }
.sm { padding: 4px 12px; font-size: 13px; }

/* Modal */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 100;
}
.modal {
  width: 100%; max-width: 460px;
  display: flex; flex-direction: column; gap: 12px;
  animation: pop 0.15s ease;
}
@keyframes pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
h3 { font-size: 17px; font-weight: 600; }
.modal-sub { font-size: 14px; color: var(--text-muted); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
</style>
