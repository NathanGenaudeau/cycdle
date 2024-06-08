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
            path: '/Game',
            name : 'Game',
            component: Game,
            props : true
        }
    ],
    history: createWebHistory(),
});

export default router;