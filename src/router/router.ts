import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Game from '../components/Game.vue';
import GameTDF from '../components/GameTDF.vue';


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
            path: '/game-tdf',
            name: 'game-tdf',
            component: GameTDF,
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