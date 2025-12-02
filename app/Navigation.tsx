import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from 'react-native-vector-icons/Ionicons';
import QR from "./QRSCREEN";
import Setti from "./Settings";
import Vote from "./Vote";

export default function Navigate(){
    const Tabs = createBottomTabNavigator();
    return(
        <Tabs.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = 'alert-circle'; 
            
            // Determine the icon name based on the route
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'SETTINGS') iconName = focused ? 'ellipse-outline' : 'settings-outline';
            else if (route.name === 'QR CODE') iconName = focused ? 'ellipse-outline' : 'qr-code-outline';
            else if (route.name === 'GENERATE FOR OTHER') iconName = focused ? 'ellipse-outline' : 'checkbox-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#383535ff', // Dark background for the tab bar
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: '#bbb1b1ff',
        })}
        > 
            <Tabs.Screen name="QR CODE" component={ QR }/>
            <Tabs.Screen name="SETTINGS" component={ Setti }/>
            <Tabs.Screen name="GENERATE FOR OTHER" component={ Vote }/>
        </Tabs.Navigator>
    );
}
