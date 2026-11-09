import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'accueil', component: () => import('@/views/AccueilView.vue') },
  { path: '/observer', name: 'observer', component: () => import('@/views/ObserverView.vue') },
  { path: '/observer/:specimenId', name: 'observer-specimen', component: () => import('@/views/ObserverView.vue'), props: true },
  { path: '/identifier', name: 'identifier', component: () => import('@/views/IdentifierView.vue') },
  { path: '/identifier/:specimenId', name: 'identifier-specimen', component: () => import('@/views/IdentifierView.vue'), props: true },
  { path: '/atlas', name: 'atlas', component: () => import('@/views/AtlasView.vue') },
  { path: '/atlas/:essenceId', name: 'essence', component: () => import('@/views/EssenceView.vue'), props: true },
  { path: '/defis', name: 'defis', component: () => import('@/views/DefisView.vue') },
  { path: '/defis/:defiId', name: 'defi', component: () => import('@/views/DefiView.vue'), props: true },
  { path: '/registre', name: 'registre', component: () => import('@/views/RegistreView.vue') },
  { path: '/carnet', name: 'carnet', component: () => import('@/views/CarnetView.vue') },
  { path: '/carnet/:specimenId', name: 'specimen', component: () => import('@/views/SpecimenView.vue'), props: true },
  { path: '/demo', name: 'demo', component: () => import('@/views/DemoView.vue') },
]

if (import.meta.env.DEV) {
  routes.push({ path: '/_styleguide', name: 'styleguide', component: () => import('@/views/StyleguideView.vue') })
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
