import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Wrench, Zap, Droplet, Hammer, Paintbrush, Check, ChevronRight } from 'lucide-react-native';

interface CategoriesScreenProps {
  onComplete?: () => void;
  navigation?: any;
}

interface CategoryOption {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'eletrical', name: 'Eletricista', description: 'Instalações, chuveiros, tomadas, fiação', icon: Zap },
  { id: 'plumbing', name: 'Encanador', description: 'Vazamentos, torneiras, desentupimento', icon: Droplet },
  { id: 'repairs', name: 'Pequenos Reparos', description: 'Montagem de móveis, suportes de TV, quadros', icon: Hammer },
  { id: 'painting', name: 'Pintura', description: 'Paredes internas, portas, pequenos retoques', icon: Paintbrush },
  { id: 'maintenance', name: 'Manutenção Geral', description: 'Limpeza de calhas, fechaduras, portas', icon: Wrench },
];

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  onComplete,
  navigation,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['eletrical']);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Atenção', 'Selecione pelo menos uma categoria de serviço.');
      return;
    }

    if (onComplete) onComplete();
    else if (navigation) navigation.navigate('ServiceArea');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>O que você faz de melhor?</Text>
        <Text style={styles.subtitle}>
          Selecione as categorias de serviços que você deseja atender no Facilita.
        </Text>
      </View>

      <View style={styles.list}>
        {CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isSelected = selectedCategories.includes(cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleCategory(cat.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                <IconComponent color={isSelected ? '#ffffff' : '#064e3b'} size={24} />
              </View>

              <View style={styles.info}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryDesc}>{cat.description}</Text>
              </View>

              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Check color="#ffffff" size={16} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Continuar ({selectedCategories.length} selecionadas)</Text>
        <ChevronRight color="#ffffff" size={20} />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#a7f3d0',
    marginTop: 6,
  },
  list: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: '#10b981',
  },
  info: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  nextButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
});
