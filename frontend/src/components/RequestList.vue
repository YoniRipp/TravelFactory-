<script setup lang="ts">
import type { VacationRequest } from "../services/api";
import StatusBadge from "./StatusBadge.vue";

defineProps<{
  requests: VacationRequest[];
  showUser?: boolean;
}>();

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
</script>

<template>
  <div v-if="requests.length === 0" class="empty">No requests found.</div>
  <div v-else class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-if="showUser">Employee</th>
          <th>Start</th>
          <th>End</th>
          <th>Reason</th>
          <th>Status</th>
          <th v-if="showUser">Comments</th>
          <th>Submitted</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in requests" :key="r.id">
          <td v-if="showUser">{{ r.user?.name ?? "—" }}</td>
          <td>{{ formatDate(r.start_date) }}</td>
          <td>{{ formatDate(r.end_date) }}</td>
          <td class="reason-cell">{{ r.reason || "—" }}</td>
          <td><StatusBadge :status="r.status" /></td>
          <td v-if="showUser" class="comment-cell">{{ r.comments || "—" }}</td>
          <td>{{ formatDate(r.created_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.empty { color: var(--text-muted); text-align: center; padding: 32px 0; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 2px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}
td {
  padding: 12px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
tr:last-child td { border-bottom: none; }
tr:hover td { background: #f8f9fa; }
.reason-cell, .comment-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
