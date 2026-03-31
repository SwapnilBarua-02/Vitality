import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ActiveScreen from './screens/active/ActiveScreen';
import SessionLog from './screens/active/SessionLog';
import Details from './screens/active/Details';
import ProdScreen from './screens/productive/ProdScreen';
import MethodScreen from './screens/productive/MethodScreen';
import TimerScreen from './screens/productive/TimerScreen';
import SelfCare from './screens/selfcare/SelfCare';
import Sleep from './screens/sleep/Sleep';
import BudgetScreen from './screens/budget/BudgetScreen';
import AddTransactionScreen from './screens/budget/AddTransactionScreen';
import SettingsScreen from './screens/settings/settingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />

        <Stack.Screen name="Active" component={ActiveScreen} />
        <Stack.Screen name="LogSession" component={SessionLog} />
        <Stack.Screen name="WorkoutDetail" component={Details} />

        <Stack.Screen name="Productive" component={ProdScreen} />
        <Stack.Screen name="Method" component={MethodScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />

        <Stack.Screen name="SelfCare" component={SelfCare} />
        <Stack.Screen name="Sleep" component={Sleep} />

        <Stack.Screen name="Budget" component={BudgetScreen} />
        <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />

        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}