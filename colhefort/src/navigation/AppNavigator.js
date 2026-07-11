import { Ionicons as Icon } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { AppTheme as theme } from '../theme';

import AccountsReceivable from '../screens/AccountsReceivable';
import AllocationDetail from '../screens/AllocationDetail';
import Allocations from '../screens/Allocations';
import ApprovalScreen from '../screens/ApprovalScreen';
import CashFlow from '../screens/CashFlow';
import Categories from '../screens/Categories';
import ClientsFarms from '../screens/ClientsFarms';
import Dashboard from '../screens/Dashboard';
import Expenses from '../screens/Expenses';
import FinancialReports from '../screens/FinancialReports';
import FinancialSummary from '../screens/FinancialSummary';
import FirstLoginPassword from '../screens/FirstLoginPassword';
import Login from '../screens/Login';
import MachineDetail from '../screens/MachineDetail';
import Machines from '../screens/Machines';
import More from '../screens/More';
import MachineUsageReport from '../screens/MachineUsageReport';
import MachineCheckup from '../screens/MachineCheckup';
import NewAllocation from '../screens/NewAllocation';
import NewMachine from '../screens/NewMachine';
import ProducerDashboard from '../screens/ProducerDashboard';
import Profile from '../screens/Profile';
import ServiceOrders from '../screens/ServiceOrders';
import ServiceRequest from '../screens/ServiceRequest';
import Suppliers from '../screens/Suppliers';
import Units from '../screens/Units';
import UserManagement from '../screens/UserManagement';
import MyAllocations from '../screens/MyAllocations';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: theme.colors.primary },
  headerTintColor: theme.colors.secondary,
  headerTitleStyle: { fontWeight: 'bold' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Máquinas') iconName = focused ? 'leaf' : 'leaf-outline';
          else if (route.name === 'Alocações') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Mais') iconName = focused ? 'apps' : 'apps-outline';
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.7)',
        tabBarStyle: { backgroundColor: theme.colors.primary, borderTopColor: 'transparent', height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard', headerShown: false }} />
      <Tab.Screen name="Máquinas" component={Machines} options={{ headerShown: false }} />
      <Tab.Screen name="Alocações" component={Allocations} options={{ headerShown: false }} />
      <Tab.Screen name="Mais" component={More} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, userRole, isFirstLogin } = useContext(AppContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Group>
          {isFirstLogin ? (
            <Stack.Screen name="FirstLoginPassword" component={FirstLoginPassword} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
          
          {/* Screens available for all authenticated users */}
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Machines" component={Machines} options={{ headerShown: false }} />
          <Stack.Screen name="MachineDetail" component={MachineDetail} options={{ headerShown: false, title: 'Detalhe da Máquina' }} />
          
          {/* Producer-only screens */}
          {userRole === 'producer' && (
            <>
              <Stack.Screen name="ServiceRequest" component={ServiceRequest} options={{ headerShown: false, title: 'Solicitar Serviço' }} />
              <Stack.Screen name="ProducerDashboard" component={ProducerDashboard} options={{ headerShown: false, title: 'Meus Serviços' }} />
              <Stack.Screen name="MyAllocations" component={MyAllocations} options={{ headerShown: false, title: 'Minhas Alocações' }} />
              <Stack.Screen name="Allocations" component={Allocations} options={{ headerShown: false }} />
              <Stack.Screen name="AllocationDetail" component={AllocationDetail} options={{ headerShown: false, title: 'Detalhe da Alocação' }} />
              <Stack.Screen name="FinancialReports" component={FinancialReports} options={{ headerShown: false }} />
            </>
          )}
          
          {/* Manager and Admin screens */}
          {(userRole === 'manager' || userRole === 'admin') && (
            <>
              <Stack.Screen name="NewAllocation" component={NewAllocation} options={{ headerShown: false }} />
              <Stack.Screen name="ServiceOrders" component={ServiceOrders} options={{ headerShown: false }} />
              <Stack.Screen name="Expenses" component={Expenses} options={{ headerShown: false }} />
              <Stack.Screen name="AccountsReceivable" component={AccountsReceivable} options={{ headerShown: false }} />
              <Stack.Screen name="CashFlow" component={CashFlow} options={{ headerShown: false }} />
              <Stack.Screen name="Allocations" component={Allocations} options={{ headerShown: false }} />
              <Stack.Screen name="AllocationDetail" component={AllocationDetail} options={{ headerShown: false, title: 'Detalhe da Alocação' }} />
              <Stack.Screen name="FinancialReports" component={FinancialReports} options={{ headerShown: false }} />
              <Stack.Screen name="MachineUsageReport" component={MachineUsageReport} options={{ headerShown: false }} />
              <Stack.Screen name="MachineCheckup" component={MachineCheckup} options={{ headerShown: false }} />
              <Stack.Screen name="ClientsFarms" component={ClientsFarms} options={{ headerShown: false, title: 'Clientes / Fazendas' }} />
            </>
          )}
          
          {/* Admin-only screens */}
          {userRole === 'admin' && (
            <>
              <Stack.Screen name="NewMachine" component={NewMachine} options={{ headerShown: false, title: 'Nova Máquina' }} />
              <Stack.Screen name="Suppliers" component={Suppliers} options={{ headerShown: false, title: 'Fornecedores' }} />
              <Stack.Screen name="Categories" component={Categories} options={{ headerShown: false, title: 'Categorias' }} />
              <Stack.Screen name="UserManagement" component={UserManagement} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Group>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}
