import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lalganjeats.hotelpartner',
  appName: 'Restaurant Partner LalganjEats',
  webDir: 'dist/hotel-partner-app/browser',
  server: {
    androidScheme: 'https',
    hostname: 'hotel.lalganjeats.com',
  },
  android: {
    backgroundColor: '#ffffff',
  },
};

export default config;
