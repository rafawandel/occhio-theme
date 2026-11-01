<!-- Componente Vue 3 com script setup -->
<template>
  <section class="lista">
    <h2>{{ titulo }}</h2>
    <ul v-if="obras.length">
      <li v-for="obra in ordenadas" :key="obra.id" :class="{ rara: obra.ano < 1900 }" @click="abrir(obra)">
        {{ obra.titulo.toUpperCase() }}
      </li>
    </ul>
    <p v-else>Nenhuma obra</p>
    <input v-model.trim="filtro" placeholder="Buscar" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Obra { id: number; titulo: string; ano: number }

const props = defineProps<{ titulo: string; obras: Obra[] }>();
const emit = defineEmits<{ (e: 'abrir', id: number): void }>();
const filtro = ref('');

const ordenadas = computed(() =>
  props.obras.filter((o) => o.titulo.includes(filtro.value)).sort((a, b) => a.ano - b.ano),
);

function abrir(obra: Obra) {
  emit('abrir', obra.id);
}
</script>

<style scoped>
.lista { color: var(--destaque); }
.rara { font-style: italic; }
</style>
