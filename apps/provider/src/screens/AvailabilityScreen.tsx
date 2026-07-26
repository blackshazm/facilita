import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react-native';

interface DaySchedule {
  dayIndex: number; // 0=Dom, 6=Sáb
  dayName: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { dayIndex: 1, dayName: 'Segunda-feira', isAvailable: true, startTime: '08:00', endTime: '18:00' },
  { dayIndex: 2, dayName: 'Terça-feira', isAvailable: true, startTime: '08:00', endTime: '18:00' },
  { dayIndex: 3, dayName: 'Quarta-feira', isAvailable: true, startTime: '08:00', endTime: '18:00' },
  { dayIndex: 4, dayName: 'Quinta-feira', isAvailable: true, startTime: '08:00', endTime: '18:00' },
  { dayIndex: 5, dayName: 'Sexta-feira', isAvailable: true, startTime: '08:00', endTime: '18:00' },
  { dayIndex: 6, dayName: 'Sábado', isAvailable: true, startTime: '08:00', endTime: '14:00' },
  { dayIndex: 0, dayName: 'Domingo', isAvailable: false, startTime: '08:00', endTime: '12:00' },
];

export const AvailabilityScreen: React.FC = () => {
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);

  const toggleDay = (dayIndex: number) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayIndex === dayIndex ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleSave = () => {
    Alert.alert('Sucesso! ⏰', 'Seus horários de atendimento foram atualizados.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Clock color="#10b981" size={36} />
        <Text style={styles.title}>Horários de Atendimento</Text>
        <Text style={styles.subtitle}>
          Marque os dias da semana em que você está disponível para receber novos chamados.
        </Text>
      </View>

      <View style={styles.list}>
        {schedule.map((item) => (
          <View key={item.dayIndex} style={styles.card}>
            <View style={styles.cardMain}>
              <Calendar color={item.isAvailable ? '#064e3b' : '#9ca3af'} size={20} />
              <Text style={[styles.dayName, !item.isAvailable && styles.dayDisabled]}>
                {item.dayName}
              </Text>

              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleDay(item.dayIndex)}
                trackColor={{ false: '#d1d5db', true: '#10b981' }}
              />
            </View>

            {item.isAvailable && (
              <View style={styles.hoursRow}>
                <Text style={styles.hoursText}>
                  Das <Text style={{ fontWeight: 'bold' }}>{item.startTime}</Text> às{' '}
                  <Text style={{ fontWeight: 'bold' }}>{item.endTime}</Text>
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <CheckCircle2 color="#ffffff" size={20} style={{ marginRight: 8 }} />
        <Text style={styles.saveButtonText}>Salvar Horários</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
  list: {
    gap: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
  },
  dayDisabled: {
    color: '#9ca3af',
    fontWeight: 'normal',
  },
  hoursRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  hoursText: {
    fontSize: 12,
    color: '#059669',
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
