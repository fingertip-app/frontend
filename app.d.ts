import 'react-native';

// NativeWind(Tailwind) 사용 시 className 속성에 대한 TypeScript 에러 방지
declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ScrollViewProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    className?: string;
  }
}