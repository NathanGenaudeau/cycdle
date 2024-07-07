import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Game from '../components/Game.vue';


const router = createRouter({
    routes: [
        {
            path: '/cycdle',
            component: Home
        },
        {
            path: '/cycdle/game',
            name: 'game',
            component: Game,
            props: true
        },
        {
            path: '/pathMatch(.*)*',
            redirect: '/cycdle'
        }
    ],
    history: createWebHistory(),
});

export default router;