import { registerRootComponent } from 'expo';

// Registers the background location task. Must happen at module load, before
// App renders, so it's also registered in a headless relaunch (no screen
// mounted) when iOS wakes the app to deliver location updates.
import './lib/walkTask';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
