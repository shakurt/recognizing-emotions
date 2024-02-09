import './assets/base.css';

import { createApp } from 'vue';
import App from './App.vue';

// Vuetify
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { MotionPlugin } from '@vueuse/motion';

const vuetify = createVuetify({
	components,
	directives,
	theme: {
		themes: {
			light: {
				colors: {
					primary: '#424874',
					secondary: '#a6b1e1',
					light: '#dcd6f7',
					lighter: '#f4eeff',
					gray: '#393e46',
				},
			},
		},
	},
});

createApp(App).use(vuetify).use(MotionPlugin).mount('#app');
