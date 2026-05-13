<script setup lang="ts">
defineProps<{ status: "Pending" | "Approved" | "Rejected" }>();
</script>

<template>
  <span class="badge" :class="status.toLowerCase()">{{ status }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.badge.pending  { background: #fff3cd; color: #856404; }
.badge.approved { background: #d1e7dd; color: #0a3622; }
.badge.rejected { background: #f8d7da; color: #58151c; }
</style>
