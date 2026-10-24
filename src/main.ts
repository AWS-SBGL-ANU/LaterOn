import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './styles.css';
import './immersive.css';
import './kawaii.css';
createApp(App).use(createPinia()).mount('#app');
