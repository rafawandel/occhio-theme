// Tela React Native em JavaScript
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from 'react-native';

const CORES = { fundo: '#080c10', destaque: '#00d4ff' };

export default function TelaConsulente({ navigation, route }) {
  const [itens, setItens] = useState(route.params?.itens ?? []);
  const ehAndroid = Platform.OS === 'android';

  async function atualizar() {
    const resposta = await fetch('https://api.example.com/itens?limite=10');
    if (!resposta.ok) throw new Error(`Falha: ${resposta.status}`);
    setItens(await resposta.json());
  }

  return (
    <View style={estilos.tela}>
      <Text style={[estilos.titulo, ehAndroid && { fontWeight: 'bold' }]}>Leituras</Text>
      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('Detalhe', { id: item.id })}>
            <Text style={estilos.item}>{item.nome}</Text>
          </Pressable>
        )}
        onRefresh={atualizar}
        refreshing={false}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: CORES.fundo, padding: 16 },
  titulo: { fontSize: 22, color: CORES.destaque },
  item: { paddingVertical: 8, color: '#c8d8e8' },
});
