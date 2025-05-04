<template>
  <div v-if="show" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">&times;</button>
      <div class="modal-header">
        <h2 class="title title-bold color-dark">{{ event.title || event.name }}</h2>
        <div v-if="event.image || event.poster" class="modal-image">
          <img :src="event.image || event.poster" :alt="event.title || event.name" />
        </div>
      </div>
      <div class="modal-body">
        <p v-if="event.description">{{ event.description }}</p>
        <p v-else-if="event.shortDescription">{{ event.shortDescription }}</p>
        <ul class="event-meta">
          <li v-if="event.date"><b>Дата:</b> {{ formatDate(event.date) }}</li>
          <li v-if="event.venue"><b>Место:</b> {{ event.venue }}</li>
          <li v-if="event.city"><b>Город:</b> {{ event.city }}</li>
        </ul>
      </div>
      <div class="modal-sessions" v-if="sessions && sessions.length">
        <div class="container">
          <h3 class="title-bold color-dark title-bar">Ближайшие сеансы</h3>
          <div class="row">
            <div v-for="(session, idx) in sessions.slice(0, 3)" :key="idx" class="col-lg-4 col-md-12 col-sm-12">
              <div class="profile-event">
                <h3 class="title title-bold color-dark">{{ session.day || `Day_${idx+1}` }}</h3>
                <div class="profile-event-date">{{ session.dateTime || session.date }}</div>
                <div class="profile-event-place">{{ session.place || session.venue }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue';
const props = defineProps({
  show: Boolean,
  event: { type: Object, default: () => ({}) },
  sessions: { type: Array, default: () => [] },
});
const emit = defineEmits(['close']);
const close = () => emit('close');
function formatDate(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('ru-RU');
  } catch {
    return date;
  }
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 10px;
  max-width: 700px;
  width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
}
.modal-header {
  margin-bottom: 1.5rem;
}
.modal-image img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 1rem;
}
.event-meta {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}
.event-meta li {
  margin-bottom: 0.5rem;
}
.profile-event {
  background: #f7f7f7;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1rem;
  text-align: left;
}
.title-bar {
  margin-bottom: 1rem;
}
</style>
