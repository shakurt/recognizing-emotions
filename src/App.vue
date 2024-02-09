<script setup>
import Header from './components/Header.vue';
import { ref, provide } from 'vue';
import Sentiment from 'sentiment';
import { useDebounceFn } from '@vueuse/core';
// CHART
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	ToolboxComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';

// E-CHARTS
use([
	BarChart,
	GridComponent,
	CanvasRenderer,
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	ToolboxComponent,
]);
provide(THEME_KEY);

const showChart = ref(false);
const chartOption = ref({
	tooltip: {
		trigger: 'axis',
		axisPointer: {
			type: 'shadow',
		},
	},
	toolbox: {
		show: true,
		feature: {
			mark: { show: true },
			saveAsImage: { show: true },
		},
	},
	legend: {},
	xAxis: {
		type: 'category',
		data: [],
		axisPointer: {
			show: true,
		},
		name: 'WORDS',
	},
	yAxis: {
		type: 'value',
		name: 'SCORE',
	},
	series: [
		{
			data: [],
			type: 'bar',
			showBackground: true,
			backgroundStyle: {
				color: 'rgba(180, 180, 180, 0.2)',
			},
		},
	],
});

const sentiment = new Sentiment();

const ICONS = [
	{
		icon: 'mdi-emoticon-sad',
		color: 'red-lighten-2',
	},

	{ icon: 'mdi-emoticon-cry', color: 'red-accent-3' },

	{
		icon: 'mdi-emoticon-neutral',
		color: 'white',
	},

	{
		icon: 'mdi-emoticon-happy',
		color: 'green-lighten-2',
	},

	{
		icon: 'mdi-emoticon-excited',
		color: 'green-accent-4',
	},
];
const iconIndex = ref(2);

const loadingCard = ref(false);

const userText = ref('');
const sumScores = ref(0);

const negativeWords = ref([]);
const positiveWords = ref([]);
const scores = ref(0);
const comparative = ref(0);

const chartWords = ref([]);
const chartScores = ref([]);

const analyzeText = useDebounceFn(() => {
	// RESET
	chartWords.value = [];
	chartScores.value = [];

	const analyzedText = sentiment.analyze(userText.value);

	// FOR INFORMATION SECTION
	negativeWords.value = analyzedText.negative;
	positiveWords.value = analyzedText.positive;
	scores.value = analyzedText.score;
	comparative.value = analyzedText.comparative;

	// FOR CHANGING ICON OF TEXT BOX
	sumScores.value = Number(analyzedText.score);
	if (sumScores.value === 0) {
		iconIndex.value = 2;
	} else if (sumScores.value < 0 && sumScores.value >= -3) {
		iconIndex.value = 0;
	} else if (sumScores.value < -3) {
		iconIndex.value = 1;
	} else if (sumScores.value > 0 && sumScores.value <= 3) {
		iconIndex.value = 3;
	} else if (sumScores.value > 3) {
		iconIndex.value = 4;
	}

	// UPDATING CHART VALUES
	analyzedText.calculation.forEach((wordAndScore) => {
		for (const [key, value] of Object.entries(wordAndScore)) {
			if (!chartWords.value.includes(key)) {
				chartWords.value.push(key);

				chartScores.value.push({
					value: value,
					itemStyle: {
						color: value > 0 ? '#00C853' : '#D50000',
					},
				});
			}
		}
	});

	chartOption.value.xAxis.data = chartWords.value.toReversed();
	chartOption.value.series[0].data = chartScores.value.toReversed();
	showChart.value = true;

	loadingCard.value = false;
}, 1000);

const updateUserText = () => {
	if (!loadingCard.value) {
		loadingCard.value = true;
	}
	analyzeText();
};
</script>

<template>
	<Header />
	<main>
		<v-container>
			<v-textarea
				v-model="userText"
				@update:modelValue="updateUserText"
				autofocus
				clearable
				placeholder="This is a good new!"
				variant="solo"
				auto-grow
				bg-color="primary"
				color="white"
				class="text-area"
			>
				<template v-slot:prepend-inner>
					<v-icon
						:icon="ICONS[iconIndex].icon"
						:color="ICONS[iconIndex].color"
					/>
				</template>
			</v-textarea>
			<v-card v-if="showChart" class="mb-5">
				<v-container
					v-motion
					:initial="{ opacity: 0, x: 100 }"
					:enter="{ opacity: 1, x: 0, scale: 1 }"
					:delay="200"
				>
					<section>
						<pre>Negative Words : {{ negativeWords }}</pre>
					</section>
					<br />
					<section>
						<pre>Positive Words : {{ positiveWords }}</pre>
					</section>
					<br />
					<section>
						<pre>Score : {{ scores }}</pre>
					</section>
					<br />
					<section>
						<pre>Comparative : {{ comparative }}</pre>
					</section>
				</v-container>
			</v-card>
			<v-card v-if="showChart">
				<v-container
					v-motion
					:initial="{ opacity: 0, x: 100 }"
					:enter="{ opacity: 1, x: 0, scale: 1 }"
					:delay="200"
				>
					<v-chart class="chart" :option="chartOption" autoresize />
				</v-container>
			</v-card>
		</v-container>
	</main>
</template>

<style scoped lang="css">
.chart {
	height: 100vh;
}
</style>
