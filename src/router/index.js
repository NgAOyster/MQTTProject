import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import MainPage from '../components/MainPage.vue';
import AboutPage from '../views/AboutView.vue'; // Update the path

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage,
    props: true, // Pass route params as props
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage,
    props: true, // Pass route params as props
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
