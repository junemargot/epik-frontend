<template>
  <div class="venue-modal" v-if="isOpen">
    <div class="venue-modal__overlay" @click="$emit('close')"></div>
    <div class="venue-modal__content">
      <div class="venue-modal__header">
        <h2>공연장 정보</h2>
        <button class="venue-modal__close" @click="$emit('close')">
          <i class='bx bx-x'></i>
        </button>
      </div>
      <div class="venue-modal__body">
        <!-- 시설명 (제목) -->
        <div class="venue-modal__title" v-if="venueName">
          <h3>{{ venueName }}</h3>
        </div>
        
        <!-- 전화번호 -->
        <div class="venue-modal__info" v-if="tel">
          <span class="label">전화번호 :&nbsp;</span>
          <span class="value">{{ tel }}</span>
        </div>
        
        <!-- 주소 -->
        <div class="venue-modal__info">
          <span class="label">주소 :&nbsp;</span>
          <span class="value">{{ address }}</span>
        </div>
        
        <!-- 홈페이지 -->
        <div class="venue-modal__info" v-if="url">
          <span class="label">홈페이지 :&nbsp;</span>
          <a :href="url" target="_blank" rel="noopener noreferrer" class="value link">
            {{ url }} <i class='bx bx-link-external'></i>
          </a>
        </div>
        
        <!-- 지도 -->
        <div id="kakao-map" class="venue-modal__map"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRuntimeConfig } from "nuxt/app";
import { useKakaoMap } from "~/composables/useKakaoMap";

const props = defineProps({
	isOpen: Boolean,
	venueName: String, // 시설명
	address: String, // 주소
	tel: String, // 전화번호
	url: String, // 홈페이지
});

defineEmits(["close"]);

const config = useRuntimeConfig();
const kakaoMapApiKey = config.public.kakaoMapApiKey;
const { loadKakaoMapScript, initKakaoMap } = useKakaoMap();

watch(
	() => props.isOpen,
	(newValue) => {
		if (newValue) {
			nextTick(() => {
				initializeMap();
			});
		}
	},
);

function initializeMap() {
	loadKakaoMapScript(kakaoMapApiKey, () => {
		const container = document.getElementById("kakao-map");
		if (container) {
			initKakaoMap(container, kakaoMapApiKey, props.address);
		} else {
			console.error("지도 컨테이너를 찾을 수 없습니다.");
		}
	});
}

onMounted(() => {
	if (props.isOpen) {
		nextTick(() => {
			initializeMap();
		});
	}
});
</script>

<style scoped>
.venue-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.venue-modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.venue-modal__content {
  position: relative;
  width: 90%;
  max-width: 700px;
  background-color: var(--white);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  overflow: hidden;
}

.venue-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--color-grey-3);
}

.venue-modal__header h2 {
  margin: 0;
  font-size: 20px;
  color: var(--black);
  font-weight: 600;
}

.venue-modal__close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-grey-9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: color 0.2s;
}

.venue-modal__close:hover {
  color: var(--black);
}

.venue-modal__body {
  padding: 20px;
}

/* 시설명 제목 스타일 */
.venue-modal__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.venue-modal__title h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--black);
}

/* 정보 항목 스타일 */
.venue-modal__info {
  display: flex;
  margin-bottom: 6px;
  font-size: 14px;
}

.venue-modal__info .label {
  color: var(--color-grey-9);
  flex-shrink: 0;
}

.venue-modal__info .value {
  flex: 1;
  color: var(--color-grey-9);
  word-break: break-word;
}

.venue-modal__info .value.link {
  color: #007bff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s;
}

.venue-modal__info .value.link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.venue-modal__info .value.link i {
  font-size: 16px;
  flex-shrink: 0;
}

/* 지도 스타일 */
.venue-modal__map {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 20px;
}
</style>
