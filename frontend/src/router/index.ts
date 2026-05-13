import { createRouter, createWebHistory } from "vue-router";
import RequesterView from "../views/RequesterView.vue";
import ValidatorView from "../views/ValidatorView.vue";

const routes = [
  { path: "/", component: RequesterView, meta: { title: "My Requests" } },
  { path: "/validator", component: ValidatorView, meta: { title: "Validator Dashboard" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = `${to.meta.title ?? "Vacation Manager"}`;
});

export default router;
