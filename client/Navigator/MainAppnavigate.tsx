import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Dashboard } from '../MainApp/DashboardScreen';
import {  domainadd} from "../MainApp/DomainAddEditScreen";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="DomainAddEdit" component={domainadd} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}