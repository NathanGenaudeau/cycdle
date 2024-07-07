import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Game from '../components/Game.vue';


const router = createRouter({
    routes: [
        {
            path: '/',
            component: Home
        },
        {
            path: '/game',
            name: 'game',
            component: Game,
            props: true
        },
        {
            path: '/pathMatch(.*)*',
            redirect: '/'
        }
    ],
    history: createWebHistory(),
});

export default router;