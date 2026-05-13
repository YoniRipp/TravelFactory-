<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <span class="logo">Vacation Manager</span>
      <nav>
        <RouterLink to="/" class="nav-link" active-class="active">My Requests</RouterLink>
        <RouterLink to="/validator" class="nav-link" active-class="active">Validator Dashboard</RouterLink>
      </nav>
    </div>
  </header>

  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  background: var(--primary);
  color: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.logo {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
  color: #fff;
}
nav { display: flex; gap: 4px; }
.nav-link {
  color: rgba(255,255,255,0.85);
  padding: 6px 14px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover, .nav-link.active {
  background: rgba(255,255,255,0.15);
  color: #fff;
}
.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
  width: 100%;
}
</style>
