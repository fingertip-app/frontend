import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";

import { RootNavigator } from "../navigation/RootNavigator";
import { navigationRef } from "../navigation/navigationRef";
import { saveLastMasterRoute } from "../navigation/masterRoutePersistence";
import { ThemeProvider } from "../theme/ThemeContext";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer
          ref={navigationRef}
          onStateChange={() => {
            void saveLastMasterRoute(navigationRef.getCurrentRoute()?.name);
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
