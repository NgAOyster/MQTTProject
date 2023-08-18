import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import MainPage from '../components/MainPage.vue';
import HomeView from '../views/HomeView.vue'; // Update the path
import AboutPage from '../views/AboutView.vue'; // Update the path

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/main',
    name: 'Main',
    component: MainPage,
  },
  {
    path: '/home', // Update the path
    name: 'Home',
    component: HomeView,
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
