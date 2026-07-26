import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';
import { DocumentUploadScreen } from '../screens/DocumentUploadScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { ServiceAreaScreen } from '../screens/ServiceAreaScreen';
import { BankDataScreen } from '../screens/BankDataScreen';

import { HomeScreen } from '../screens/HomeScreen';
import { JobQueueScreen } from '../screens/JobQueueScreen';
import ActiveJobScreen from '../screens/ActiveJobScreen';
import NewJobAlertScreen from '../screens/NewJobAlertScreen';
import { AdditionalRequestScreen } from '../screens/AdditionalRequestScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { PerformanceScreen } from '../screens/PerformanceScreen';
import { AvailabilityScreen } from '../screens/AvailabilityScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyOtp: { phone: string };
  DocumentUpload: undefined;
  Categories: undefined;
  ServiceArea: undefined;
  BankData: undefined;

  Home: undefined;
  JobQueue: undefined;
  ActiveJob: undefined;
  NewJobAlert: { order: any };
  AdditionalRequest: { orderId?: string };
  Wallet: undefined;
  Performance: undefined;
  Availability: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#064e3b',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Onboarding & Auth Stack */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Cadastro de Prestador' }}
        />
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
          options={{ title: 'Verificação SMS' }}
        />
        <Stack.Screen
          name="DocumentUpload"
          component={DocumentUploadScreen}
          options={{ title: 'Verificação de Identidade' }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Suas Especialidades' }}
        />
        <Stack.Screen
          name="ServiceArea"
          component={ServiceAreaScreen}
          options={{ title: 'Região de Atendimento' }}
        />
        <Stack.Screen
          name="BankData"
          component={BankDataScreen}
          options={{ title: 'Dados Bancários (Pagar.me)' }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Facilita Prestador', headerLeft: () => null }}
        />
        <Stack.Screen
          name="JobQueue"
          component={JobQueueScreen}
          options={{ title: 'Oportunidades' }}
        />
        <Stack.Screen
          name="ActiveJob"
          component={ActiveJobScreen}
          options={{ title: 'Chamado em Andamento' }}
        />
        <Stack.Screen
          name="NewJobAlert"
          component={NewJobAlertScreen}
          options={{ title: 'Novo Chamado!', presentation: 'modal' }}
        />
        <Stack.Screen
          name="AdditionalRequest"
          component={AdditionalRequestScreen}
          options={{ title: 'Solicitar Adicional' }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ title: 'Minha Carteira' }}
        />
        <Stack.Screen
          name="Performance"
          component={PerformanceScreen}
          options={{ title: 'Meu Score e Nível' }}
        />
        <Stack.Screen
          name="Availability"
          component={AvailabilityScreen}
          options={{ title: 'Horários de Atendimento' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
